import { WALLET_NAMES } from 'contexts/constants';

export const getCurrentChain = (network) => {
  const SOLANA_WALLETS = [WALLET_NAMES.SOLANA, WALLET_NAMES.COINBASE_SOLANA];
  const TON_WALLETS = [WALLET_NAMES.TONKEEPER];

  if (SOLANA_WALLETS.includes(network)) {
    return 'SOLANA';
  }

  if (TON_WALLETS.includes(network)) {
    return 'TON';
  }

  return null;
};
