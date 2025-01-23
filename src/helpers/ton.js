const DECIMALS_9 = 1000000000n;

export const toNanoton = (num) => BigInt(Math.round(num * Number(DECIMALS_9)));

export const toTon = (bigintNum) => Number(bigintNum) / Number(DECIMALS_9);
