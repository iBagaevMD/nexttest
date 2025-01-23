import { useRouter } from 'next/router';

import { useWallet } from 'contexts/wallet';
import { useBlurBackground } from './useBlurBackground';
import { WALLET_TYPES } from 'contexts/constants';

export const useLogOut = () => {
  const { disconnectWallet, network, userAddress } = useWallet();
  const { resetBlurBackground } = useBlurBackground();
  const { router } = useRouter();

  //@fixme Bagaev

  const logOut = () => {
    if (!userAddress) {
      resetBlurBackground();
      router.push('/');
      return;
    }
    resetBlurBackground();
    if (!window) return;
    if (window.solana?.isConnected) {
      disconnectWallet(WALLET_TYPES.PHANTOM);
    } else if (window.coinbaseSolana?.isConnected) {
      disconnectWallet(WALLET_TYPES.COINBASE);
    } else if (window.solflare?.isConnected) {
      disconnectWallet(WALLET_TYPES.SOLFLARE);
    } else if (network === WALLET_TYPES.TONKEEPER) {
      disconnectWallet(WALLET_TYPES.TONKEEPER);
    }
  };

  return {
    logOut
  };
};
