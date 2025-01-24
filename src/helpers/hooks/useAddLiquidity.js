import { useCallback, useState } from 'react';
import JSBI from 'jsbi';
import BN from 'bn.js';
import * as web3 from '@solana/web3.js';
import * as token from '@solana/spl-token';
import { Clmm, InstructionType } from '@raydium-io/raydium-sdk';

import useMemeStatus from 'helpers/hooks/useMemeStatus';
import useSolanaTxConfirmation from 'helpers/hooks/useSolanaTxConfirmation';
import { SOLANA_ERRORS } from 'helpers/hooks/constants';
import { useWallet } from 'contexts/wallet';
import { SOLANA_ENDPOINT } from 'config';
import {
  buildComputeBudgetInstructions,
  decodeOpenPositionData,
  getATAAddress,
  getPdaExBitmapAccount,
  getPdaMetadataKey,
  getPdaObservationStateAddress,
  getPdaPersonalPositionAddress,
  getPdaPoolId,
  getPdaPoolVaultId,
  getPdaProtocolPositionAddress,
  getPdaTickArrayAddress,
  getTickArrayStartIndexByTick,
  findProgramAddress,
  stringToDecimals,
  computeLiquidityPoolParams,
  sqrtPriceX64ToPrice
} from 'utils/raydium-utils';
import { add, sub, mul } from 'utils/raydium-utils';
import { buildInstructionFromIDL, isUserRejectedError } from 'utils/utils';
import { ammConfig10000 } from 'utils/amm-configs';
import TOKEN_DEPLOYER_IDL from 'idls/token_deployer.json';
import {
  PROGRAM_ID,
  CLMM_PROGRAM_ID,
  LOOKUP_TABLE_ADDRESS,
  TOKEN_DECIMALS,
  FEE_RECEIVER
} from 'config';
import useSolanaPrice from './useSolanaPrice';
import { COMPUTE_BUDGET_CONFIG } from './constants';

const useAddLiquidity = () => {
  const solPrice = useSolanaPrice();
  const [isAdding, setIsAdding] = useState(false);
  const { userAddress, signer } = useWallet();
  const { updateMemeStatus } = useMemeStatus();
  const { waitForConfirmation } = useSolanaTxConfirmation();

  async function buildCreatePoolInstruction(
    connection,
    payer,
    coinMint,
    coinDecimals,
    initialPriceStr
  ) {
    const clmmProgramId = new web3.PublicKey(CLMM_PROGRAM_ID);
    const mintTokenProgramId = token.TOKEN_PROGRAM_ID;
    const solMint = new web3.PublicKey('So11111111111111111111111111111111111111112');
    const solDecimals = 9;
    const startTime = new BN(0);
    const txVersion = 1; // 1 - not versioned, 0 - versioned

    const initialPrice = stringToDecimals(initialPriceStr);
    const ammConfig = ammConfig10000; // 1% fee pool
    const { innerTransactions, address } = await Clmm.makeCreatePoolInstructionSimple({
      connection: connection,
      programId: clmmProgramId,
      mint1: { programId: mintTokenProgramId, mint: coinMint, decimals: coinDecimals },
      mint2: { programId: token.TOKEN_PROGRAM_ID, mint: solMint, decimals: solDecimals },
      ammConfig: ammConfig,
      initialPrice: initialPrice,
      owner: payer,
      payer: payer,
      computeBudgetConfig: COMPUTE_BUDGET_CONFIG,
      startTime: startTime,
      lookupTableCache: null,
      makeTxVersion: txVersion
    });
    const mockedPoolInfo = Clmm.makeMockPoolInfo({
      ammConfig: ammConfig,
      mint1: { programId: mintTokenProgramId, mint: coinMint, decimals: coinDecimals },
      mint2: { programId: token.TOKEN_PROGRAM_ID, mint: solMint, decimals: solDecimals },
      owner: payer,
      programId: clmmProgramId,
      createPoolInstructionSimpleAddress: address,
      initialPrice: initialPrice,
      startTime: startTime
    });
    return { mockedPoolInfo, makePoolInstruction: innerTransactions[0] };
  }

  async function buildMintLiquidityInstruction(
    connection,
    payer,
    mockedPoolInfo,
    tickLower,
    tickUpper,
    initialSupplyBN,
    tokenAccountMint,
    liquidityPct
  ) {
    const txVersion = 1; // 1 - not versioned, 0 - versioned
    const epochInfo = await connection.getEpochInfo();
    const token2022Infos = {};

    let liquidityMin = null;
    let coin1MaxAmount = null;
    let coin2MaxAmount = null;
    let inputAmountMinBN = initialSupplyBN.mul(new BN(95)).div(new BN(100));
    let inputAmountBN = liquidityPct.eq(new BN(100)) ? initialSupplyBN : new BN(inputAmountMinBN);
    // Calculate amounts and liquidity:
    while (true) {
      const { liquidity, amountSlippageA, amountSlippageB } =
        Clmm.getLiquidityAmountOutFromAmountIn({
          poolInfo: mockedPoolInfo,
          slippage: 0,
          inputA: true,
          tickLower: tickLower,
          tickUpper: tickUpper,
          amount: inputAmountBN,
          add: true,
          epochInfo,
          token2022Infos,
          amountHasFee: true
        });
      const slippageTolerance = 0;
      liquidityMin = new BN(mul(liquidity, sub(1, slippageTolerance)).toFixed(0));
      coin1MaxAmount = amountSlippageA.amount;
      coin2MaxAmount = new BN(mul(amountSlippageB.amount, add(1, slippageTolerance)).toFixed(0));
      if (coin1MaxAmount.gte(inputAmountMinBN)) {
        console.log(
          `liquidity: ${liquidityMin.toString()}, coin1MaxAmount: ${coin1MaxAmount.toString()}, coin2MaxAmount: ${coin2MaxAmount.toString()}`
        );
        break;
      }
      inputAmountBN = inputAmountBN.add(new BN(10));
    }

    // Initialize tokenAccountRawInfos:
    let tokenAccountRawInfos = [];
    tokenAccountRawInfos.push({
      pubkey: tokenAccountMint,
      accountInfo: {
        amount: inputAmountBN,
        closeAuthority: new web3.PublicKey('11111111111111111111111111111111'),
        closeAuthorityOption: 0,
        delegate: new web3.PublicKey('11111111111111111111111111111111'),
        delegateOption: 0,
        delegatedAmount: new BN(0),
        isNative: new BN(0),
        isNativeOption: 0,
        mint: mockedPoolInfo.mintA.mint,
        owner: payer,
        state: 1
      },
      programId: mockedPoolInfo.mintA.programId
    });

    const { innerTransactions, address } =
      await Clmm.makeOpenPositionFromLiquidityInstructionSimple({
        connection: connection,
        liquidity: liquidityMin,
        poolInfo: mockedPoolInfo,
        ownerInfo: {
          feePayer: payer,
          wallet: payer,
          tokenAccounts: tokenAccountRawInfos,
          useSOLBalance: true
        },
        tickLower: tickLower,
        tickUpper: tickUpper,
        amountMaxA: coin1MaxAmount,
        amountMaxB: coin2MaxAmount,
        computeBudgetConfig: COMPUTE_BUDGET_CONFIG,
        checkCreateATAOwner: true,
        makeTxVersion: txVersion,
        lookupTableCache: null,
        getEphemeralSigners: false
      });
    return { mintLiquidityInstruction: innerTransactions[0], nftAddress: String(address.nftMint) };
  }

  async function buildClmmInstructions(
    tokenMint,
    initialSupplyBN,
    sqrtPriceX64,
    tickLower,
    tickUpper,
    liquidityPct
  ) {
    const publicKey = new web3.PublicKey(userAddress);
    const connection = new web3.Connection(SOLANA_ENDPOINT, 'confirmed');
    const tokenAccount = await token.getAssociatedTokenAddress(tokenMint, publicKey, false);
    // Get initial price:
    const initialPrice = sqrtPriceX64ToPrice(sqrtPriceX64);
    const initialPriceStr = initialPrice.toFixed(9);

    // 1. Build create pool instructions:
    const { mockedPoolInfo, makePoolInstruction } = await buildCreatePoolInstruction(
      connection,
      publicKey,
      tokenMint,
      TOKEN_DECIMALS,
      initialPriceStr
    );
    mockedPoolInfo.sqrtPriceX64 = sqrtPriceX64;
    mockedPoolInfo.currentPrice = initialPrice;
    // 2. Build mint liquidity instructions:
    const { mintLiquidityInstruction, nftAddress } = await buildMintLiquidityInstruction(
      connection,
      publicKey,
      mockedPoolInfo,
      tickLower,
      tickUpper,
      initialSupplyBN,
      tokenAccount,
      liquidityPct
    );
    return {
      mockedPoolInfo: mockedPoolInfo,
      makePoolInstruction: makePoolInstruction,
      mintLiquidityInstruction: mintLiquidityInstruction,
      nftAddress: nftAddress
    };
  }

  const extractAndVerifyProgramArgs = async (clmmData) => {
    const openPosIdx = clmmData.mintLiquidityInstruction.instructionTypes.indexOf(
      InstructionType.clmmOpenPosition
    );
    if (openPosIdx < 0) throw Error(`Open position instruction not found`);
    const openPosInstruction = clmmData.mintLiquidityInstruction.instructions[openPosIdx];
    if (openPosInstruction.keys.length > 22) throw Error(`Expected remaining accounts to be empty`);
    const openPosData = openPosInstruction.data;
    const openPosArgs = decodeOpenPositionData(openPosData);
    if (openPosArgs.baseFlag !== false) throw Error(`Expected baseFlag to be false`);
    if (openPosArgs.optionBaseFlag !== 0) throw Error(`Expected optionBaseFlag to be 0`);
    if (openPosArgs.withMetadata !== true) throw Error(`Expected withMetadata to be true`);
    return {
      sqrtPriceX64: clmmData.mockedPoolInfo.sqrtPriceX64,
      tickLowerIndex: openPosArgs.tickLowerIndex,
      tickUpperIndex: openPosArgs.tickUpperIndex,
      tickArrayLowerStartIndex: openPosArgs.tickArrayLowerStartIndex,
      tickArrayUpperStartIndex: openPosArgs.tickArrayUpperStartIndex,
      liquidity: openPosArgs.liquidity,
      amountMaxA: openPosArgs.amountMaxA,
      amountMaxB: openPosArgs.amountMaxB
    };
  };

  async function prepareAddRaydiumLiquidityTx(
    tokenMint,
    initialSupplyBN,
    sqrtPriceX64,
    tickLower,
    tickUpper,
    liquidityPct
  ) {
    const payer = new web3.PublicKey(userAddress);
    const connection = new web3.Connection(SOLANA_ENDPOINT, 'confirmed');
    const clmmProgramId = new web3.PublicKey(CLMM_PROGRAM_ID);
    const ammConfig = ammConfig10000;
    // Defer token account:
    const tokenAccount = await token.getAssociatedTokenAddress(tokenMint, payer, false);
    // Create temporary WSOL account:
    const tokenAccountBKeyPair = web3.Keypair.generate();
    const tokenAccountB = tokenAccountBKeyPair.publicKey;
    // Extract program arguments:
    const clmmData = await buildClmmInstructions(
      tokenMint,
      initialSupplyBN,
      sqrtPriceX64,
      tickLower,
      tickUpper,
      liquidityPct
    );
    const args = await extractAndVerifyProgramArgs(clmmData);
    // Compute addresses for createPool instruction:
    const mintA = tokenMint;
    const mintB = new web3.PublicKey('So11111111111111111111111111111111111111112');
    const poolId = getPdaPoolId(clmmProgramId, ammConfig.id, mintA, mintB).publicKey;
    const mintAVault = getPdaPoolVaultId(clmmProgramId, poolId, mintA).publicKey;
    const mintBVault = getPdaPoolVaultId(clmmProgramId, poolId, mintB).publicKey;
    const exTickArrayBitmap = getPdaExBitmapAccount(clmmProgramId, poolId).publicKey;
    // Compute addresses for openPosition instruction:
    const tokenDeployerProgram = new web3.PublicKey(PROGRAM_ID);
    const POSITION_NFT_OWNER_SEEDS = Buffer.from('position_nft_owner_pda', 'utf8');
    const positionNftOwnerPda = findProgramAddress(
      [POSITION_NFT_OWNER_SEEDS],
      tokenDeployerProgram
    ).publicKey;
    const positionNftMintKeypair = web3.Keypair.generate();
    const positionNftMint = positionNftMintKeypair.publicKey;
    const positionNftAccount = getATAAddress(
      positionNftOwnerPda,
      positionNftMint,
      token.TOKEN_PROGRAM_ID
    ).publicKey;
    const tickArrayLowerStartIndex = getTickArrayStartIndexByTick(tickLower, ammConfig.tickSpacing);
    const tickArrayUpperStartIndex = getTickArrayStartIndexByTick(tickUpper, ammConfig.tickSpacing);
    const tickArrayLower = getPdaTickArrayAddress(
      clmmProgramId,
      poolId,
      tickArrayLowerStartIndex
    ).publicKey;
    const tickArrayUpper = getPdaTickArrayAddress(
      clmmProgramId,
      poolId,
      tickArrayUpperStartIndex
    ).publicKey;
    const metadataAccount = getPdaMetadataKey(positionNftMint).publicKey;
    const personalPosition = getPdaPersonalPositionAddress(
      clmmProgramId,
      positionNftMint
    ).publicKey;
    const protocolPosition = getPdaProtocolPositionAddress(
      clmmProgramId,
      poolId,
      tickLower,
      tickUpper
    ).publicKey;
    const observationId = getPdaObservationStateAddress(clmmProgramId, poolId).publicKey;
    // 1. Build compute budget instructions:
    const computeBudgetInstructions = buildComputeBudgetInstructions(COMPUTE_BUDGET_CONFIG);
    // 2. Build program instruction:
    const programInstruction = buildInstructionFromIDL(
      TOKEN_DEPLOYER_IDL,
      'add_to_raydium',
      {
        payer: payer,
        token_mint: tokenMint,
        token_account: tokenAccount,

        amm_config_id: ammConfig.id,
        pool_id: poolId,
        wsol_mint: mintB,
        token_vault: mintAVault,
        wsol_vault: mintBVault,
        observation_id: observationId,
        ex_tick_array_bitmap: exTickArrayBitmap,

        position_nft_owner_pda: positionNftOwnerPda,
        position_nft_mint: positionNftMint,
        position_nft_account: positionNftAccount,
        metadata_account: metadataAccount,
        protocol_position: protocolPosition,
        tick_array_lower: tickArrayLower,
        tick_array_upper: tickArrayUpper,
        personal_position: personalPosition,
        wsol_account: tokenAccountB,
        fee_receiver: new web3.PublicKey(FEE_RECEIVER),

        clmm_program: clmmProgramId,
        system_program: new web3.PublicKey('11111111111111111111111111111111'),
        token_program: new web3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
        associated_token_program: new web3.PublicKey(
          'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'
        ),
        token_2022_program: new web3.PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'),
        metadata_program: new web3.PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'),
        rent_program: new web3.PublicKey('SysvarRent111111111111111111111111111111111')
      },
      {
        sqrt_price_x64: args.sqrtPriceX64,
        tick_lower_index: args.tickLowerIndex,
        tick_upper_index: args.tickUpperIndex,
        tick_array_lower_start_index: args.tickArrayLowerStartIndex,
        tick_array_upper_start_index: args.tickArrayUpperStartIndex,
        liquidity: args.liquidity,
        token_amount_max: args.amountMaxA,
        wsol_amount_max: args.amountMaxB
      },
      PROGRAM_ID
    );
    // All instructions:
    const instructions = [];
    instructions.push(...computeBudgetInstructions);
    instructions.push(programInstruction);

    console.log('payer', payer.toString());
    console.log('tokenMint', tokenMint.toString());
    console.log('tokenAccount', tokenAccount.toString());
    console.log('ammConfig.id', ammConfig.id.toString());
    console.log('poolId', poolId.toString());
    console.log('mintB', mintB.toString());
    console.log('tokenVault', mintAVault.toString());
    console.log('wsolVault', mintBVault.toString());
    console.log('observationId', observationId.toString());
    console.log('exTickArrayBitmap', exTickArrayBitmap.toString());
    console.log('positionNftOwnerPda', positionNftOwnerPda.toString());
    console.log('positionNftMint', positionNftMint.toString());
    console.log('positionNftAccount', positionNftAccount.toString());
    console.log('metadataAccount', metadataAccount.toString());
    console.log('protocolPosition', protocolPosition.toString());
    console.log('tickArrayLower', tickArrayLower.toString());
    console.log('tickArrayUpper', tickArrayUpper.toString());
    console.log('personalPosition', personalPosition.toString());
    console.log('wsolAccount', tokenAccountB.toString());
    console.log('clmmProgramId', clmmProgramId.toString());
    console.log('sqrt_price_x64', args.sqrtPriceX64.toString());
    console.log('tick_lower_index', args.tickLowerIndex);
    console.log('tick_upper_index', args.tickUpperIndex);
    console.log('tick_array_lower_start_index', args.tickArrayLowerStartIndex);
    console.log('tick_array_upper_start_index', args.tickArrayUpperStartIndex);
    console.log('liquidity', args.liquidity.toString());
    console.log('token_amount_max', args.amountMaxA.toString());
    console.log('wsol_amount_max', args.amountMaxB.toString());

    // Getting Lookup Table Account:
    const lookupTableAddress = new web3.PublicKey(LOOKUP_TABLE_ADDRESS);
    const lookupTableAccount = (await connection.getAddressLookupTable(lookupTableAddress)).value;

    // Building transaction:
    const latestBlockhash = (await connection.getLatestBlockhash('finalized')).blockhash;
    const messageV0 = new web3.TransactionMessage({
      payerKey: payer,
      recentBlockhash: latestBlockhash,
      instructions: instructions
    }).compileToV0Message([lookupTableAccount]);
    const transactionV0 = new web3.VersionedTransaction(messageV0);
    transactionV0.sign([positionNftMintKeypair, tokenAccountBKeyPair]);
    return transactionV0;
  }

  const sendAddRaydiumLiquidityTx = async ({
    tokenMint,
    initialSupplyInTokens, // number
    marketCap, // number
    liquidityPoolPercent // number (95 or 100)
  }) => {
    // 95% or 100% of initial supply are provided into liquidity pool:
    const liquidityPct = liquidityPoolPercent === 100 ? new BN(100) : new BN(95);
    const tokenMintPubkey = new web3.PublicKey(tokenMint);
    const initialSupplyInTokensJSBI = JSBI.BigInt(initialSupplyInTokens);
    const marketCapJSBI = JSBI.BigInt(marketCap);
    const eDecimalsJSBI = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(TOKEN_DECIMALS));
    const initialSupplyJSBI = JSBI.multiply(initialSupplyInTokensJSBI, eDecimalsJSBI);
    const initialSupplyBN = new BN(initialSupplyJSBI.toString());

    // Calculate pool address:
    const poolAddress = getPdaPoolId(
      new web3.PublicKey(CLMM_PROGRAM_ID),
      ammConfig10000.id,
      tokenMintPubkey,
      new web3.PublicKey('So11111111111111111111111111111111111111112')
    ).publicKey;

    // Calculate add_to_raydium parameters:
    const { sqrtPriceX64, tickLower, tickUpper } = computeLiquidityPoolParams(
      initialSupplyInTokensJSBI,
      marketCapJSBI,
      solPrice
    );

    // Prepare and send transaction:
    const transactionV0 = await prepareAddRaydiumLiquidityTx(
      tokenMintPubkey,
      initialSupplyBN,
      sqrtPriceX64,
      tickLower,
      tickUpper,
      liquidityPct
    );
    const { signature } = await signer.signAndSendTransaction(transactionV0);
    return { poolAddress, signature };
  };

  const addLiquidity = useCallback(
    async (tokenId, tokenMint, initialSupplyInTokens, onTxSent) => {
      if (!userAddress || !signer) throw Error('Wallet is not connected');
      setIsAdding(true);
      try {
        // Send add liquidity transaction:
        let result = null;
        try {
          result = await sendAddRaydiumLiquidityTx({
            tokenMint: new web3.PublicKey(tokenMint),
            initialSupplyInTokens,
            marketCap: 40_000,
            liquidityPoolPercent: 95
          });
        } catch (e) {
          if (isUserRejectedError(e)) {
            throw Error(SOLANA_ERRORS.USER_REJECTED);
          }
          console.error(`Failed to send add liquidity transaction: ${e}`);
          throw Error(`Failed to send transaction`);
        }
        const { poolAddress, signature } = result;
        onTxSent && onTxSent(signature);

        // Wait for confirmation:
        const { confirmed, error } = await waitForConfirmation(signature);
        if (!confirmed) throw Error(error);
        if (confirmed && error) {
          return {
            signature,
            raydiumPool: null,
            error
          };
        }

        // Update meme status:
        await updateMemeStatus({
          id: tokenId,
          status: 'launched',
          raydiumPool: poolAddress.toString(),
          addLiquidityTx: signature
        });

        return {
          signature,
          raydiumPool: poolAddress.toString(),
          error: null
        };
      } finally {
        setIsAdding(false);
      }
    },
    [userAddress, signer]
  );

  return {
    isAdding,
    addLiquidity
  };
};

export default useAddLiquidity;
