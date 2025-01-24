import * as web3 from '@solana/web3.js';
import { Fraction } from '@raydium-io/raydium-sdk';
import JSBI from 'jsbi';
import BN from 'bn.js';
import Decimal from 'decimal.js';
import { Keypair, PublicKey } from '@solana/web3.js';
import { blob, bool, publicKey, s32, seq, struct, u128, u32, u64, u8 } from 'marshmallow';
import { sha256 } from '@noble/hashes/sha256';
import { TOKEN_DECIMALS } from 'config';

export const ONE = new BN(1);
export const MIN_SQRT_PRICE_X64 = new BN('4295048016');
export const MAX_SQRT_PRICE_X64 = new BN('79226673521066979257578248091');

const Q128 = new BN(1).shln(128);
const MaxUint128 = Q128.subn(1);
const MIN_TICK = -443636;
const MAX_TICK = -MIN_TICK;
const BIT_PRECISION = 16;
const LOG_B_2_X32 = '59543866431248';
const LOG_B_P_ERR_MARGIN_LOWER_X64 = '184467440737095516';
const LOG_B_P_ERR_MARGIN_UPPER_X64 = '15793534762490258745';

const TICK_ARRAY_SIZE = 60;

const E10_JSBI = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(10));

export function stringToDecimals(n, decimalLength = 15) {
  return fractionToDecimal(toFraction(n), decimalLength);
}

export function toFraction(value) {
  if (value instanceof Fraction) return value;
  const n = String(value);
  const details = parseNumberInfo(n);
  return new Fraction(details.numerator, details.denominator);
}

export function fractionToDecimal(n, decimalLength = 12) {
  return new Decimal(n.toFixed(decimalLength));
}

function parseNumberInfo(n) {
  if (n === undefined) return { denominator: '1', numerator: '0' };
  const s = String(n);

  if (s.match(/^\d+$/)) return { denominator: '1', numerator: s };

  const [, sign = '', int = '', dec = '', expN] =
    s.replace(',', '').match(/(-?)(\d*)\.?(\d*)(?:e(-?\d+))?/) ?? [];
  if (expN) {
    // have scientific notion part
    const n = offsetDecimalDot(`${sign}${int}.${dec}`, Number(expN));
    return parseNumberInfo(n);
  } else {
    const denominator = '1' + '0'.repeat(dec.length);
    const numerator = sign + (int === '0' ? '' : int) + dec || '0';
    return { denominator, numerator, sign, int, dec };
  }
}

/** offset:  negative is more padding start zero */
function offsetDecimalDot(s, offset) {
  const [, sign = '', int = '', dec = ''] =
    s.replace(',', '').match(/(-?)(\d*)\.?(\d*)(?:e(-?\d+))?/) ?? [];
  const oldDecLength = dec.length;
  const newDecLength = oldDecLength - offset;
  if (newDecLength > int.length + dec.length) {
    return `${sign}0.${(int + dec).padStart(newDecLength, '0')}`;
  } else {
    return `${sign}${(int + dec).slice(0, -newDecLength)}.${(int + dec).slice(-newDecLength)}`;
  }
}

// SqrtMath and MathUtil methods:

export function add(a, b) {
  if (a == null || b == null) return undefined;
  const fa = toFraction(a);
  const fb = toFraction(b);
  return fa.add(fb);
}

export function sub(a, b) {
  if (a == null || b == null) return undefined;
  const fa = toFraction(a);
  const fb = toFraction(b);
  return fa.sub(fb);
}

export function mul(a, b) {
  if (a == null || b == null) return undefined;
  const fa = toFraction(a);
  const fb = toFraction(b);
  return fa.mul(fb);
}

function decimalToX64(num) {
  return new BN(num.mul(Decimal.pow(2, 64)).floor().toFixed());
}

function priceToSqrtPriceX64(price, decimalsA, decimalsB) {
  return decimalToX64(price.mul(Decimal.pow(10, decimalsB - decimalsA)).sqrt());
}

function signedLeftShift(n0, shiftBy, bitWidth) {
  const twosN0 = n0.toTwos(bitWidth).shln(shiftBy);
  twosN0.imaskn(bitWidth + 1);
  return twosN0.fromTwos(bitWidth);
}

function signedRightShift(n0, shiftBy, bitWidth) {
  const twoN0 = n0.toTwos(bitWidth).shrn(shiftBy);
  twoN0.imaskn(bitWidth - shiftBy + 1);
  return twoN0.fromTwos(bitWidth - shiftBy);
}

function mulRightShift(val, mulBy) {
  return signedRightShift(val.mul(mulBy), 64, 256);
}

export function getSqrtPriceX64FromTick(tick) {
  if (!Number.isInteger(tick)) {
    throw new Error('tick must be integer');
  }
  if (tick < MIN_TICK || tick > MAX_TICK) {
    throw new Error('tick must be in MIN_TICK and MAX_TICK');
  }
  const tickAbs = tick < 0 ? tick * -1 : tick;
  let ratio =
    (tickAbs & 0x1) != 0 ? new BN('18445821805675395072') : new BN('18446744073709551616');
  if ((tickAbs & 0x2) != 0) ratio = mulRightShift(ratio, new BN('18444899583751176192'));
  if ((tickAbs & 0x4) != 0) ratio = mulRightShift(ratio, new BN('18443055278223355904'));
  if ((tickAbs & 0x8) != 0) ratio = mulRightShift(ratio, new BN('18439367220385607680'));
  if ((tickAbs & 0x10) != 0) ratio = mulRightShift(ratio, new BN('18431993317065453568'));
  if ((tickAbs & 0x20) != 0) ratio = mulRightShift(ratio, new BN('18417254355718170624'));
  if ((tickAbs & 0x40) != 0) ratio = mulRightShift(ratio, new BN('18387811781193609216'));
  if ((tickAbs & 0x80) != 0) ratio = mulRightShift(ratio, new BN('18329067761203558400'));
  if ((tickAbs & 0x100) != 0) ratio = mulRightShift(ratio, new BN('18212142134806163456'));
  if ((tickAbs & 0x200) != 0) ratio = mulRightShift(ratio, new BN('17980523815641700352'));
  if ((tickAbs & 0x400) != 0) ratio = mulRightShift(ratio, new BN('17526086738831433728'));
  if ((tickAbs & 0x800) != 0) ratio = mulRightShift(ratio, new BN('16651378430235570176'));
  if ((tickAbs & 0x1000) != 0) ratio = mulRightShift(ratio, new BN('15030750278694412288'));
  if ((tickAbs & 0x2000) != 0) ratio = mulRightShift(ratio, new BN('12247334978884435968'));
  if ((tickAbs & 0x4000) != 0) ratio = mulRightShift(ratio, new BN('8131365268886854656'));
  if ((tickAbs & 0x8000) != 0) ratio = mulRightShift(ratio, new BN('3584323654725218816'));
  if ((tickAbs & 0x10000) != 0) ratio = mulRightShift(ratio, new BN('696457651848324352'));
  if ((tickAbs & 0x20000) != 0) ratio = mulRightShift(ratio, new BN('26294789957507116'));
  if ((tickAbs & 0x40000) != 0) ratio = mulRightShift(ratio, new BN('37481735321082'));
  if (tick > 0) ratio = MaxUint128.div(ratio);
  return ratio;
}

function getTickFromSqrtPriceX64(sqrtPriceX64) {
  if (sqrtPriceX64.gt(MAX_SQRT_PRICE_X64) || sqrtPriceX64.lt(MIN_SQRT_PRICE_X64)) {
    throw new Error('Provided sqrtPrice is not within the supported sqrtPrice range.');
  }
  const msb = sqrtPriceX64.bitLength() - 1;
  const adjustedMsb = new BN(msb - 64);
  const log2pIntegerX32 = signedLeftShift(adjustedMsb, 32, 128);
  let bit = new BN('8000000000000000', 'hex');
  let precision = 0;
  let log2pFractionX64 = new BN(0);
  let r = msb >= 64 ? sqrtPriceX64.shrn(msb - 63) : sqrtPriceX64.shln(63 - msb);
  while (bit.gt(new BN(0)) && precision < BIT_PRECISION) {
    r = r.mul(r);
    const rMoreThanTwo = r.shrn(127);
    r = r.shrn(63 + rMoreThanTwo.toNumber());
    log2pFractionX64 = log2pFractionX64.add(bit.mul(rMoreThanTwo));
    bit = bit.shrn(1);
    precision += 1;
  }
  const log2pFractionX32 = log2pFractionX64.shrn(32);
  const log2pX32 = log2pIntegerX32.add(log2pFractionX32);
  const logbpX64 = log2pX32.mul(new BN(LOG_B_2_X32));
  const tickLow = signedRightShift(
    logbpX64.sub(new BN(LOG_B_P_ERR_MARGIN_LOWER_X64)),
    64,
    128
  ).toNumber();
  const tickHigh = signedRightShift(
    logbpX64.add(new BN(LOG_B_P_ERR_MARGIN_UPPER_X64)),
    64,
    128
  ).toNumber();
  if (tickLow == tickHigh) {
    return tickLow;
  } else {
    const derivedTickHighSqrtPriceX64 = getSqrtPriceX64FromTick(tickHigh);
    return derivedTickHighSqrtPriceX64.lte(sqrtPriceX64) ? tickHigh : tickLow;
  }
}

function x64ToDecimal(num, decimalPlaces) {
  return new Decimal(num.toString()).div(Decimal.pow(2, 64)).toDecimalPlaces(decimalPlaces);
}

export function sqrtPriceX64ToPrice(sqrtPriceX64, decimalsA = TOKEN_DECIMALS, decimalsB = 9) {
  return x64ToDecimal(sqrtPriceX64)
    .pow(2)
    .mul(Decimal.pow(10, decimalsA - decimalsB));
}

export function roundPriceToClosestTickPrice(priceStr, tickSpacing = 120) {
  const initialPrice = stringToDecimals(priceStr);
  const mintADecimals = TOKEN_DECIMALS;
  const mintBDecimals = 9;
  const sqrtPriceX96 = priceToSqrtPriceX64(initialPrice, mintADecimals, mintBDecimals);
  const tick = getTickFromSqrtPriceX64(sqrtPriceX96);
  let newTick = tick / tickSpacing;
  newTick = (newTick < 0 ? Math.floor(newTick) : Math.ceil(newTick)) * tickSpacing;
  const newSqrtPriceX96 = getSqrtPriceX64FromTick(newTick);
  const roundedPriceDecimal = sqrtPriceX64ToPrice(newSqrtPriceX96, mintADecimals, mintBDecimals);
  return {
    tick: newTick, // number
    roundedPriceDecimal: roundedPriceDecimal, // Decimal
    sqrtPriceX64: newSqrtPriceX96 // BN
  };
}

export function roundToClosestTickPrice(priceStr, tickSpacing) {
  const mintADecimals = TOKEN_DECIMALS;
  const mintBDecimals = 9;
  let { tick: newTick } = roundPriceToClosestTickPrice(priceStr, tickSpacing);
  while (true) {
    // Calculate new price with new tick:
    const newSqrtPriceX96 = getSqrtPriceX64FromTick(newTick);
    const roundedPriceDecimal = sqrtPriceX64ToPrice(newSqrtPriceX96, mintADecimals, mintBDecimals);
    const roundedPrice = roundedPriceDecimal.toFixed(11);
    // Validate the price will be in range:
    const poolSqrtPriceX96 = priceToSqrtPriceX64(
      stringToDecimals(roundedPrice),
      mintADecimals,
      mintBDecimals
    );
    const sqrtAX64Price = getSqrtPriceX64FromTick(newTick);
    const sqrtBX64Price = getSqrtPriceX64FromTick(upperSpacingTick(tickSpacing));
    const isInRange = sqrtAX64Price.lte(poolSqrtPriceX96) && sqrtBX64Price.gte(poolSqrtPriceX96);
    if (isInRange) {
      console.log('newTick', newTick);
      console.log('roundedPrice', roundedPriceDecimal.toFixed(11));
      console.log(
        `[!] In Range: ${sqrtAX64Price.toString()} <= ${poolSqrtPriceX96.toString()} <= ${sqrtBX64Price.toString()}`
      );
      return { roundedPrice, tick: newTick, sqrtPriceX64: sqrtAX64Price };
    }
    newTick += tickSpacing;
  }
}

export function upperSpacingTick(tickSpacing) /* Decimal */ {
  return MAX_TICK - (MAX_TICK % tickSpacing);
}

function tickCount(tickSpacing) {
  return TICK_ARRAY_SIZE * tickSpacing;
}

function getTickArrayBitIndex(tickIndex, tickSpacing) {
  const ticksInArray = tickCount(tickSpacing);
  let startIndex = tickIndex / ticksInArray;
  if (tickIndex < 0 && tickIndex % ticksInArray != 0) {
    startIndex = Math.ceil(startIndex) - 1;
  } else {
    startIndex = Math.floor(startIndex);
  }
  return startIndex;
}

export function getTickArrayStartIndexByTick(tickIndex, tickSpacing) {
  return getTickArrayBitIndex(tickIndex, tickSpacing) * tickCount(tickSpacing);
}

/* ========= RAYDIUM PDA UTILS ======== */

export const METADATA_PROGRAM_ID = new web3.PublicKey(
  'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
);

const AMM_CONFIG_SEED = Buffer.from('amm_config', 'utf8');
const POOL_SEED = Buffer.from('pool', 'utf8');
const POOL_VAULT_SEED = Buffer.from('pool_vault', 'utf8');
const POSITION_SEED = Buffer.from('position', 'utf8');
const TICK_ARRAY_SEED = Buffer.from('tick_array', 'utf8');
const OPERATION_SEED = Buffer.from('operation', 'utf8');
const POOL_TICK_ARRAY_BITMAP_SEED = Buffer.from('pool_tick_array_bitmap_extension', 'utf8');
const OBSERVATION_SEED = Buffer.from('observation', 'utf8');

export function generatePubKey(fromPublicKey, programId) {
  const seed = web3.Keypair.generate().publicKey.toBase58().slice(0, 32);
  const publicKey = createWithSeed(fromPublicKey, seed, programId);
  return { publicKey, seed };
}

function createWithSeed(fromPublicKey, seed /* string */, programId) {
  const buffer = Buffer.concat([fromPublicKey.toBuffer(), Buffer.from(seed), programId.toBuffer()]);
  const publicKeyBytes = sha256(buffer);
  return new web3.PublicKey(publicKeyBytes);
}

function u16ToBytes(num) {
  const arr = new ArrayBuffer(2);
  const view = new DataView(arr);
  view.setUint16(0, num, false);
  return new Uint8Array(arr);
}

function i32ToBytes(num) {
  const arr = new ArrayBuffer(4);
  const view = new DataView(arr);
  view.setInt32(0, num, false);
  return new Uint8Array(arr);
}

export function findProgramAddress(seeds, programId) {
  const [publicKey, nonce] = web3.PublicKey.findProgramAddressSync(seeds, programId);
  return { publicKey, nonce };
}

export function getPdaAmmConfigId(programId, index) {
  return findProgramAddress([AMM_CONFIG_SEED, u16ToBytes(index)], programId);
}

export function getPdaPoolId(programId, ammConfigId, mintA, mintB) {
  return findProgramAddress(
    [POOL_SEED, ammConfigId.toBuffer(), mintA.toBuffer(), mintB.toBuffer()],
    programId
  );
}

export function getPdaPoolVaultId(programId, poolId, vaultMint) {
  return findProgramAddress([POOL_VAULT_SEED, poolId.toBuffer(), vaultMint.toBuffer()], programId);
}

export function getPdaTickArrayAddress(programId, poolId, startIndex) {
  return findProgramAddress(
    [TICK_ARRAY_SEED, poolId.toBuffer(), i32ToBytes(startIndex)],
    programId
  );
}

export function getPdaProtocolPositionAddress(programId, poolId, tickLower, tickUpper) {
  return findProgramAddress(
    [POSITION_SEED, poolId.toBuffer(), i32ToBytes(tickLower), i32ToBytes(tickUpper)],
    programId
  );
}

export function getPdaPersonalPositionAddress(programId, nftMint) {
  return findProgramAddress([POSITION_SEED, nftMint.toBuffer()], programId);
}

export function getPdaMetadataKey(mint) {
  return findProgramAddress(
    [Buffer.from('metadata', 'utf8'), METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    METADATA_PROGRAM_ID
  );
}

export function getPdaOperationAccount(programId) {
  return findProgramAddress([OPERATION_SEED], programId);
}

export function getPdaExBitmapAccount(programId, poolId) {
  return findProgramAddress([POOL_TICK_ARRAY_BITMAP_SEED, poolId.toBuffer()], programId);
}

export function getPdaObservationStateAddress(programId, poolId) {
  return findProgramAddress([OBSERVATION_SEED, poolId.toBuffer()], programId);
}

export function getATAAddress(owner, mint, programId) {
  return findProgramAddress(
    [owner.toBuffer(), programId.toBuffer(), mint.toBuffer()],
    new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
  );
}

/* ========= RAYDIUM DATA UTILS ======== */
export function decodeOpenPositionData(data) {
  const dataLayout = struct([
    s32('tickLowerIndex'),
    s32('tickUpperIndex'),
    s32('tickArrayLowerStartIndex'),
    s32('tickArrayUpperStartIndex'),
    u128('liquidity'),
    u64('amountMaxA'),
    u64('amountMaxB'),
    bool('withMetadata'),
    u8('optionBaseFlag'),
    bool('baseFlag')
  ]);
  return dataLayout.decode(data, 8);
}

/* ========= VARIOUS ======== */

export function generateBaseTokenKeypair() {
  const solMint = new PublicKey('So11111111111111111111111111111111111111112');
  let tokenMintKeypair = null;
  while (true) {
    tokenMintKeypair = Keypair.generate();
    const tokenMint = tokenMintKeypair.publicKey;
    const shouldSwap = new BN(tokenMint.toBuffer()).gt(new BN(solMint.toBuffer()));
    if (!shouldSwap) break;
  }
  return tokenMintKeypair;
}

export function buildComputeBudgetInstructions(config) {
  const instructions = [];
  if (config.microLamports) {
    instructions.push(
      web3.ComputeBudgetProgram.setComputeUnitPrice({ microLamports: config.microLamports })
    );
  }
  if (config.units) {
    instructions.push(web3.ComputeBudgetProgram.setComputeUnitLimit({ units: config.units }));
  }
  return instructions;
}

export function computeLiquidityPoolParams(tokenSupplyJSBI, marketCapJSBI, solPrice) {
  const marketCapDecimal = new Decimal(marketCapJSBI.toString());
  const tokenSupplyDecimal = new Decimal(tokenSupplyJSBI.toString());
  const solPriceDecimal = new Decimal(solPrice);

  // Calculate initial token price:
  const initialPriceDecimal = marketCapDecimal.div(tokenSupplyDecimal).div(solPriceDecimal);
  if (initialPriceDecimal.lt(new Decimal(1e-9)))
    throw Error('Error occurred. Try different parameters.');
  if (initialPriceDecimal.gt(new Decimal(1e9)))
    throw Error('Error occurred. Try different parameters.');

  // Calculate lower price for liquidirt position:
  const {
    tick: tickLower,
    roundedPriceDecimal: roundedLowerPriceDecimal,
    sqrtPriceX64
  } = roundPriceToClosestTickPrice(initialPriceDecimal.toFixed(9));

  if (roundedLowerPriceDecimal.lt(new Decimal(1e-9)))
    throw Error('Error occurred. Try different parameters.');

  // Calculate upper price for liquidity position:
  const upperPriceDecimal = new Decimal(JSBI.divide(E10_JSBI, tokenSupplyJSBI).toString());
  const { tick: tickUpper, roundedPriceDecimal: roundedUpperPriceDecimal } =
    roundPriceToClosestTickPrice(upperPriceDecimal.toFixed(9));
  if (roundedLowerPriceDecimal.gt(roundedUpperPriceDecimal))
    throw Error('Error occurred. Try different parameters.');

  // Log:
  console.log(
    `Supply: ${tokenSupplyJSBI.toString()}, MarketCap: ${marketCapJSBI.toString()}, SolPrice: ${solPrice}`
  );
  console.log(
    `Position between: [${roundedLowerPriceDecimal.toString()} - ${roundedUpperPriceDecimal.toString()}]`
  );

  return {
    tickLower,
    tickUpper,
    sqrtPriceX64
  };
}
