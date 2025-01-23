import { useState, useCallback } from 'react';
import JSBI from 'jsbi';
import BN from 'bn.js';
import * as web3 from '@solana/web3.js';
import * as token from '@solana/spl-token';

import useMemeStatus from 'helpers/hooks/useMemeStatus';
import useSolanaTxConfirmation from 'helpers/hooks/useSolanaTxConfirmation';
import { useWallet } from 'contexts/wallet';
import { SOLANA_ERRORS } from 'helpers/hooks/constants';
import { LOOKUP_TABLE_ADDRESS, PROGRAM_ID, SOLANA_ENDPOINT, TOKEN_DECIMALS } from 'config';
import {
  buildComputeBudgetInstructions,
  generateBaseTokenKeypair,
  getPdaMetadataKey
} from 'utils/raydium-utils';
import { buildInstructionFromIDL, isUserRejectedError } from 'utils/utils';
import TOKEN_DEPLOYER_IDL from 'idls/token_deployer.json';
import { COMPUTE_BUDGET_CONFIG } from './constants';

const useCreateToken = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { userAddress, signer } = useWallet();
  const { updateMemeStatus } = useMemeStatus();
  const { waitForConfirmation } = useSolanaTxConfirmation();

  const prepareCreateTokenTx = async (
    tokenMintKeypair,
    tokenName,
    tokenSymbol,
    tokenMetadataURI,
    initialSupplyInTokensJSBI
  ) => {
    const payer = new web3.PublicKey(userAddress);
    const connection = new web3.Connection(SOLANA_ENDPOINT, 'confirmed');
    // Convert initial supply:
    const eDecimalsJSBI = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(TOKEN_DECIMALS));
    const initialSupplyJSBI = JSBI.toNumber(
      JSBI.multiply(initialSupplyInTokensJSBI, eDecimalsJSBI)
    );
    const initialSupplyBN = new BN(initialSupplyJSBI.toString());
    const initialSupply = initialSupplyJSBI.toString();
    // Extract token mint and token account:
    const tokenMint = tokenMintKeypair.publicKey;
    const tokenAccount = await token.getAssociatedTokenAddress(tokenMint, payer, false);
    const tokenMetadataAccount = getPdaMetadataKey(tokenMint).publicKey;
    console.log('Deploying token:', tokenName, tokenSymbol, initialSupply);
    console.log('Token mint:', tokenMint.toString());
    console.log('Token ATA:', tokenAccount.toString());
    // 1. Build compute budget instructions:
    const computeBudgetInstructions = buildComputeBudgetInstructions(COMPUTE_BUDGET_CONFIG);
    // 2. Build program instruction:
    const programInstruction = buildInstructionFromIDL(
      TOKEN_DEPLOYER_IDL,
      'create_token',
      {
        payer: payer,
        token_mint: tokenMint,
        token_account: tokenAccount,
        token_metadata_account: tokenMetadataAccount,

        system_program: new web3.PublicKey('11111111111111111111111111111111'),
        token_program: new web3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
        associated_token_program: new web3.PublicKey(
          'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'
        ),
        metadata_program: new web3.PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'),
        rent_program: new web3.PublicKey('SysvarRent111111111111111111111111111111111')
      },
      {
        amount: initialSupplyBN,
        name: tokenName,
        symbol: tokenSymbol,
        uri: tokenMetadataURI
      },
      PROGRAM_ID
    );
    // All instructions:
    const instructions = [];
    instructions.push(...computeBudgetInstructions);
    instructions.push(programInstruction);

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
    transactionV0.sign([tokenMintKeypair]);
    return transactionV0;
  };

  const sendCreateTokenTx = async ({
    tokenName,
    tokenSymbol,
    tokenMetadataURI,
    initialSupplyInTokens
  }) => {
    const tokenMintKeypair = generateBaseTokenKeypair();
    const transactionV0 = await prepareCreateTokenTx(
      tokenMintKeypair,
      tokenName,
      tokenSymbol,
      tokenMetadataURI,
      JSBI.BigInt(initialSupplyInTokens)
    );
    const { signature } = await signer.signAndSendTransaction(transactionV0);
    return {
      tokenMint: tokenMintKeypair.publicKey,
      signature
    };
  };

  const createToken = useCallback(
    async (tokenId, tokenName, tokenSymbol, tokenMetadataURI, initialSupplyInTokens, onTxSent) => {
      if (!userAddress || !signer) throw Error('Wallet is not connected');
      setIsCreating(true);

      try {
        // Send create token transaction:
        let result = null;
        try {
          result = await sendCreateTokenTx({
            tokenName,
            tokenSymbol,
            tokenMetadataURI,
            initialSupplyInTokens
          });
        } catch (e) {
          if (isUserRejectedError(e)) {
            throw Error(SOLANA_ERRORS.USER_REJECTED);
          }
          console.error(`Failed to send create token transaction: ${e}`);
          throw Error(`Failed to send transaction`);
        }
        const { tokenMint, signature } = result;
        onTxSent && onTxSent(signature);

        // Wait for confirmation:
        const { confirmed, error } = await waitForConfirmation(signature);
        if (!confirmed) throw Error(error);
        if (confirmed && error) {
          return {
            signature,
            tokenMint: null,
            error
          };
        }

        // Update meme status:
        await updateMemeStatus({
          id: tokenId,
          status: 'created',
          mint: tokenMint.toString(),
          createTx: signature
        });

        return {
          signature,
          tokenMint: tokenMint.toString(),
          error: null
        };
      } finally {
        setIsCreating(false);
      }
    },
    [userAddress, signer]
  );

  return {
    isCreating,
    createToken
  };
};

export default useCreateToken;
