import BN from 'bn.js';
import Decimal from 'decimal.js';
import { ARG_DECIMAL_PLACES, IS_DEV, NUM_WALLETS } from 'config';

const DEV_INITIAL_REAL_TOKEN_RESERVES = new BN('50100000000000');
const PROD_INITIAL_REAL_TOKEN_RESERVES = new BN('793100000000000');
const INITIAL_VIRTUAL_SOL_RESERVES = new BN('30000000000');
const INITIAL_VIRTUAL_TOKEN_RESERVES = new BN('1073000000000000');
const INITIAL_REAL_TOKEN_RESERVES = IS_DEV
  ? DEV_INITIAL_REAL_TOKEN_RESERVES
  : PROD_INITIAL_REAL_TOKEN_RESERVES;
const INITIAL_REAL_SOL_RESERVES = new BN(0);
const TOTAL_TOKEN_SUPPLY = new BN('1000000000000000');
const FEE_BASIS_POINTS = new BN('100');

const MIN_TRANSFER_SOL_AMOUNT = new BN(1_000_000);
const LAMPORTS_PER_SOL = 1_000_000_000;

export const MAX_SUPPLY_PERCENTAGE = IS_DEV ? 5.01 : 79.31;

export function calculateCurvePercentage(supplyPercentage) {
  const supplyDecimal = new Decimal(TOTAL_TOKEN_SUPPLY.toString());
  const percentageDecimal = new Decimal(supplyPercentage);
  const tokensAmountDecimal = supplyDecimal.mul(percentageDecimal).div(new Decimal(100));
  const totalCurveAmountDecimal = new Decimal(INITIAL_REAL_TOKEN_RESERVES.toString());
  const percentage = tokensAmountDecimal.div(totalCurveAmountDecimal).mul(new Decimal(100));
  return percentage.toFixed(2);
}

export function estimateSolAmountForSupplyPercentage(percentage) {
  try {
    const supplyDecimal = new Decimal(TOTAL_TOKEN_SUPPLY.toString());
    const tokensAmountDecimal = supplyDecimal.mul(percentage).div(100);
    const tokensAmountBN = new BN(tokensAmountDecimal.toFixed(0));
    const curve = new BondingCurveAccount();
    let solAmountBN = curve.calculateSolAmountIn(tokensAmountBN, true);
    solAmountBN = solAmountBN.div(new BN(1e5)).add(new BN(1)).mul(new BN(1e5));
    return solAmountBN;
  } catch (_) {
    return null;
  }
}

export function calculateSupplyPercentageBySolAmount(solAmount) {
  try {
    const supplyDecimal = new Decimal(TOTAL_TOKEN_SUPPLY.toString());
    const curve = new BondingCurveAccount();
    const tokensAmountBN = curve.calculateTokensForSol(solAmount);
    const tokensAmountDecimal = new Decimal(tokensAmountBN.toString());
    const percentageDecimal = tokensAmountDecimal.div(supplyDecimal).mul(100);
    return percentageDecimal.toFixed(6);
  } catch (_) {
    return null;
  }
}

class BondingCurveAccount {
  constructor(
    virtualTokenReserves,
    virtualSolReserves,
    realTokenReserves,
    realSolReserves,
    tokenTotalSupply
  ) {
    this.virtualTokenReserves = virtualTokenReserves || new BN(INITIAL_VIRTUAL_TOKEN_RESERVES);
    this.virtualSolReserves = virtualSolReserves || new BN(INITIAL_VIRTUAL_SOL_RESERVES);
    this.realTokenReserves = realTokenReserves || new BN(INITIAL_REAL_TOKEN_RESERVES);
    this.realSolReserves = realSolReserves || new BN(INITIAL_REAL_SOL_RESERVES);
    this.tokenTotalSupply = tokenTotalSupply || new BN(TOTAL_TOKEN_SUPPLY);
    this.feeBasisPoints = new BN(FEE_BASIS_POINTS);
  }

  // tokenAmount: BN
  // returns Decimal
  static calculateSupplyPercentage(tokenAmount) {
    const supplyDecimal = new Decimal(TOTAL_TOKEN_SUPPLY.toString());
    const tokenAmountDecimal = new Decimal(tokenAmount.toString());
    return tokenAmountDecimal.div(supplyDecimal).mul(100);
  }

  calculateFeeAmount(solAmount) {
    return solAmount.mul(this.feeBasisPoints).div(new BN(10000));
  }

  calculateSolAmountIn(tokensAmountOut, includeFees = false) {
    if (tokensAmountOut.lte(new BN(0))) {
      return new BN(0);
    }
    if (tokensAmountOut.gt(this.realTokenReserves)) {
      throw new Error('Not enough real token reserves to fulfill the purchase.');
    }
    // Calculate the amount of SOL needed to buy tokens
    let numerator = this.virtualSolReserves.mul(tokensAmountOut);
    let denominator = this.virtualTokenReserves.sub(tokensAmountOut);
    let solAmountIn = numerator.div(denominator).add(new BN(1)); // Add 1 to round up
    if (includeFees) {
      solAmountIn = solAmountIn.add(this.calculateFeeAmount(solAmountIn));
    }
    return solAmountIn;
  }

  // Includes fee
  calculateSolAmountOut(tokensAmountIn) {
    if (tokensAmountIn.lte(new BN(0))) {
      return new BN(0);
    }
    // Calculate the amount of SOL to receive before fee
    let numerator = tokensAmountIn.mul(this.virtualSolReserves);
    let denominator = this.virtualTokenReserves.add(tokensAmountIn);
    let solAmountOut = numerator.div(denominator);
    // Calculate fee
    let solAmountOutAfterFee = solAmountOut.sub(this.calculateFeeAmount(solAmountOut));
    if (solAmountOutAfterFee.gt(this.realSolReserves)) {
      throw new Error('Not enough real SOL reserves to fulfill the sale.');
    }
    return solAmountOutAfterFee;
  }

  buy(amount) {
    if (amount.lte(new BN(0))) {
      return new BN(0);
    }
    // Calculate the amount of SOL needed
    let solAmountIn = this.calculateSolAmountIn(amount);
    // Check if enough real tokens are available
    if (amount.gt(this.realTokenReserves)) {
      throw new Error('Not enough real token reserves to fulfill the purchase.');
    }
    // Update virtual reserves
    this.virtualSolReserves = this.virtualSolReserves.add(solAmountIn);
    this.virtualTokenReserves = this.virtualTokenReserves.sub(amount);
    // Update real reserves
    this.realSolReserves = this.realSolReserves.add(solAmountIn);
    this.realTokenReserves = this.realTokenReserves.sub(amount);
    // Return the amount of SOL required for the purchase
    return solAmountIn;
  }

  sell(amount) {
    if (amount.lte(new BN(0))) {
      return new BN(0);
    }
    // Calculate the amount of SOL to receive before fee
    let numerator = amount.mul(this.virtualSolReserves);
    let denominator = this.virtualTokenReserves.add(amount);
    let solAmountOut = numerator.div(denominator);
    // Calculate fee
    let fee = this.calculateFeeAmount(solAmountOut);
    let solAmountOutAfterFee = solAmountOut.sub(fee);
    // Ensure there are enough real SOL reserves
    if (solAmountOutAfterFee.gt(this.realSolReserves)) {
      throw new Error('Not enough real SOL reserves to fulfill the sale.');
    }
    // Update virtual reserves
    this.virtualSolReserves = this.virtualSolReserves.sub(solAmountOut);
    this.virtualTokenReserves = this.virtualTokenReserves.add(amount);
    // Update real reserves
    this.realSolReserves = this.realSolReserves.sub(solAmountOut);
    this.realTokenReserves = this.realTokenReserves.add(amount);
    // Return the net SOL amount after fee
    return solAmountOutAfterFee;
  }

  calculateTokensForSol(solAmount) {
    if (solAmount.lte(new BN(0))) {
      return new BN(0);
    }

    // Ensure we have enough real token reserves
    if (this.realTokenReserves.isZero()) {
      throw new Error('No real token reserves available for purchase.');
    }

    // Calculate the amount of tokens that can be bought with 'solAmount'
    let V_S = this.virtualSolReserves;
    let V_T = this.virtualTokenReserves;
    let N = solAmount;

    // Calculate the new virtual SOL reserves after the purchase
    let new_V_S = V_S.add(N);

    // Calculate the new virtual token reserves using the constant product formula
    let numerator = V_S.mul(V_T);
    let new_V_T = numerator.div(new_V_S);

    // Calculate the amount of tokens received
    let tokensReceived = V_T.sub(new_V_T);

    // Ensure we don't exceed the real token reserves
    tokensReceived = BN.min(tokensReceived, this.realTokenReserves);

    return tokensReceived;
  }
}

// supplyPercentageDecimal: Decimal
// returns BN
export function calculateFundingAmount(supplyPercentageDecimal) {
  const fundingAmounts = generateFundingAmounts(supplyPercentageDecimal);
  let fundingAmount = new BN(0);
  for (const [_, amount] of fundingAmounts) {
    fundingAmount = fundingAmount.add(amount);
  }
  return fundingAmount;
}

// supplyPercentageDecimal: Decimal
// returns Map<string, BN>
function generateFundingAmounts(supplyPercentageDecimal) {
  const supplyPercentage = supplyPercentageDecimal.toDecimalPlaces(ARG_DECIMAL_PLACES);
  const totalSupplyDecimal = new Decimal(TOTAL_TOKEN_SUPPLY.toString());
  const tokensAmountDecimal = Decimal.div(totalSupplyDecimal.mul(supplyPercentage), 100);
  const tokensAmount = new BN(tokensAmountDecimal.toFixed(0));

  let wallets = [];
  for (let i = 0; i < NUM_WALLETS; i++) {
    wallets.push(i.toString());
  }
  const tokenAmounts = generateBuyAmounts(wallets, tokensAmount);
  const buyAmountsInfo = buildBuyInfoByTokenAmounts(wallets, tokenAmounts);
  const fundingAmounts = buildFundingAmounts(wallets, buyAmountsInfo);
  // debugPrint(buyAmountsInfo, fundingAmounts);
  // let est = estimateSolAmountForSupplyPercentage(supplyPercentageDecimal);
  // console.log(Decimal.div(est.toString(), 1e9).toString());
  return fundingAmounts;
}

// wallets: []string
// amount: BN
// returns Map<string, BN>
function generateBuyAmounts(wallets, amount) {
  // minPct should be in [0...1/N]
  // maxPct should be in [1/N...1]
  const amountDecimal = new Decimal(amount.toString());
  const minTransferDecimal = new Decimal(MIN_TRANSFER_SOL_AMOUNT.toString());
  if (amountDecimal.div(new Decimal(wallets.length)).lessThan(minTransferDecimal)) {
    throw Error('Transfer is too small to cover rent price');
  }
  const n = wallets.length;
  const minRequiredPct = minTransferDecimal.div(amountDecimal);
  const minPct = Decimal.max(minRequiredPct, new Decimal(0.5 / n));
  const maxPct = new Decimal(Math.max(2.0 / n, 1));

  const buyAmounts = generateRandomBuyAmountsInRange(wallets, amount, minPct, maxPct);
  return buyAmounts;
}

// wallets: []string
// amount: BN
// minPct: Decimal
// maxPct: Decimal
// returns Map<string, BN>
function generateRandomBuyAmountsInRange(wallets, amount, minPct, maxPct) {
  const amountDecimal = new Decimal(amount.toString());
  const minAmountDecimal = minPct.mul(amountDecimal);
  const maxAmountDecimal = maxPct.mul(amountDecimal);
  const totalMinAmountDecimal = minAmountDecimal.mul(new Decimal(wallets.length));
  const totalMaxAmountDecimal = maxAmountDecimal.mul(new Decimal(wallets.length));
  if (totalMinAmountDecimal.gt(amountDecimal) || totalMaxAmountDecimal.lt(amountDecimal)) {
    throw new Error('Unable to distribute with given parameters');
  }

  let remainingAmountDecimal = amountDecimal.sub(totalMinAmountDecimal);
  const buyAmounts = new Map(); // string => BN
  const maxDecimalExtras = wallets.map(() => maxAmountDecimal.sub(minAmountDecimal));

  // Generate random weights
  let weights = wallets.map(() => new Decimal(Math.random().toFixed(9)));
  const totalWeight = weights.reduce((sum, w) => sum.add(w), new Decimal(0));
  weights = weights.map((w) => w.div(totalWeight));

  // Distribute the remaining amount based on weights and constraints
  wallets.forEach((wallet, index) => {
    let extraAmountDecimal = weights[index].mul(remainingAmountDecimal);
    extraAmountDecimal = Decimal.min(extraAmountDecimal, maxDecimalExtras[index]);
    const walletAmountDecimal = minAmountDecimal.add(extraAmountDecimal);
    buyAmounts.set(wallet.toString(), new BN(walletAmountDecimal.toFixed(0)));
  });

  // Recalculate last amount so that sum exactly matches
  const currentTotal = Array.from(buyAmounts.values()).reduce((sum, bn) => sum.add(bn), new BN(0));
  const difference = amount.sub(currentTotal);
  if (!difference.isZero()) {
    const lastWallet = wallets[wallets.length - 1].toString();
    const lastAmount = buyAmounts.get(lastWallet);
    const newLastAmount = lastAmount.add(difference);
    const minAmountBN = new BN(minAmountDecimal.toFixed(0));
    const maxAmountBN = new BN(maxAmountDecimal.toFixed(0));
    if (newLastAmount.lt(new BN(minAmountBN)) || newLastAmount.gt(new BN(maxAmountBN))) {
      throw new Error('Unable to distribute exactly with given parameters');
    }
    buyAmounts.set(lastWallet.toString(), newLastAmount);
  }
  return buyAmounts;
}

// wallets: []string
// tokenAmounts: Map<string, BN>
// returns Map<string, {solAmount: BN, feeAmount: BN}>
function buildBuyInfoByTokenAmounts(wallets, tokenAmounts) {
  const curve = new BondingCurveAccount();
  const buyAmountsInfo = new Map();
  for (let i = 0; i < wallets.length; i++) {
    const tokensAmount = tokenAmounts.get(wallets[i].toString()) || new BN(0);
    const solAmount = curve.calculateSolAmountIn(tokensAmount);
    const feeAmount = curve.calculateFeeAmount(solAmount);
    curve.buy(tokensAmount);
    // Buy Info
    const buyInfo = {
      solAmount: solAmount,
      tokenAmount: tokensAmount,
      feeAmount: feeAmount
    };
    buyAmountsInfo.set(wallets[i].toString(), buyInfo);
  }
  return buyAmountsInfo;
}

// wallets: []string
// tokenAmounts: Map<string, BN>
// returns Map<string, BN>
function buildFundingAmounts(wallets, buyAmountsInfo) {
  const ADJUST_ADD = new Decimal(0.0025 * LAMPORTS_PER_SOL);
  const ADJUST_ADD_DEPLOYER = new Decimal(0.0225 * LAMPORTS_PER_SOL);
  const ADJUST_MUL = new Decimal(1.015);
  const ADJUST_MUL_DEPLOYER = new Decimal(1.1);
  const fundingAmounts = new Map();
  for (let i = 0; i < wallets.length; i++) {
    const adjustMul = i == 0 ? ADJUST_MUL_DEPLOYER : ADJUST_MUL;
    const adjustAdd = i == 0 ? ADJUST_ADD_DEPLOYER : ADJUST_ADD;
    const wallet = wallets[i];
    if (!buyAmountsInfo.has(wallet.toString())) {
      throw Error(`Missing buy info for ${wallet.toString()}`);
    }
    const buyInfo = buyAmountsInfo.get(wallet.toString());
    const solAmount = buyInfo.solAmount.add(buyInfo.feeAmount);
    const solAmountDecimal = new Decimal(solAmount.toString());
    const adjustedSolAmount = new BN(solAmountDecimal.mul(adjustMul).add(adjustAdd).toFixed(0));
    fundingAmounts.set(wallet.toString(), adjustedSolAmount);
  }
  return fundingAmounts;
}

function debugPrint(buyAmountsInfo, fundingAmounts) {
  let totalTokenAmount = new BN(0);
  let totalSol = new BN(0);
  let totalPct = new Decimal(0);
  let totalFunding = new BN(0);
  const e6 = new Decimal(1e6);
  const e9 = new Decimal(1e9);
  console.log('Funding infromation');
  for (const [address, info] of buyAmountsInfo) {
    const supplyPct = BondingCurveAccount.calculateSupplyPercentage(info.tokenAmount);
    const fundingAmount = fundingAmounts.get(address);
    const solAmount = info.solAmount.add(info.feeAmount);
    totalTokenAmount = totalTokenAmount.add(info.tokenAmount);
    totalSol = totalSol.add(solAmount);
    totalPct = totalPct.add(supplyPct);
    totalFunding = totalFunding.add(fundingAmount);
    // Print:
    const solAmountDec = new Decimal(solAmount.toString());
    const fundingAmountDec = new Decimal(fundingAmount.toString());
    const tokenAmountDec = new Decimal(info.tokenAmount.toString());
    console.log(
      `${address} | Sol: ${solAmountDec.div(e9).toFixed(9)} | ` +
        `Token: ${tokenAmountDec.div(e6).toFixed(6)} | ` +
        `Pct: ${supplyPct.toFixed(2)}% | Fund: ${fundingAmountDec.div(e9).toFixed(9)}`
    );
  }
  const totalSolDec = new Decimal(totalSol.toString());
  const totalTokenAmountDec = new Decimal(totalTokenAmount.toString());
  const totalFundingDec = new Decimal(totalFunding.toString());
  console.log(
    `TotaSol: ${totalSolDec.div(e9).toFixed(9)} | ` +
      `Token: ${totalTokenAmountDec.div(e6).toFixed(6)} | ` +
      `Pct: ${totalPct.toFixed(2)}% | TotalFund: ${totalFundingDec.div(e9).toFixed(9)}`
  );
  let curve = new BondingCurveAccount();
  const bulkSolIn = new Decimal(curve.calculateSolAmountIn(totalTokenAmount, true).toString());
  console.log(`Compare: ${bulkSolIn.div(e9).toFixed(9)}`);
}
