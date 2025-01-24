import { router } from 'next/client';

import { useWallet } from 'contexts/wallet';
import { useBlurBackground } from './useBlurBackground';
import { WALLET_NAMES_TO_TYPES } from 'contexts/constants';

export const useLogOut = () => {
  const { disconnectWallet, network, userAddress } = useWallet();
  const { resetBlurBackground } = useBlurBackground();

  const logOut = () => {
    if (typeof window === 'undefined') return;

    if (userAddress) {
      disconnectWallet(WALLET_NAMES_TO_TYPES[network]);
    }

    resetBlurBackground();
    router.replace('/');
  };

  return {
    logOut
  };
};
