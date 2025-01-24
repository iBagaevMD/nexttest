import React, { useMemo, useRef, useState } from 'react';

import Typography from 'components/Typography';
import { TYPOGRAPHY_VARIANTS } from 'components/Typography/constants';
import { useWallet } from 'contexts/wallet';
import { formatUserAddress } from 'helpers/string';
import { Burger } from 'components/Burger';
import LogOutModal from 'components/Modals/LogOutModal';
import { useBlurBackground } from 'helpers/hooks/useBlurBackground';
import ConnectWalletModal from 'components/Modals/ConnectWalletModal';
import { BUTTON_VARIANTS } from 'components/Button/constants';
import Button from 'components/Button';
import { WALLET_NAMES } from 'contexts/constants';
import { useClickOutside } from 'helpers/hooks/useClickOutside';
import Divider from 'components/Divider';
import { useRouter } from 'next/router';

export const UserInfo = () => {
  const [isOpenLogOutModal, setIsOpenLogOutModal] = useState(false);
  const [isOpenedConnectWallet, setIsOpenedConnectWallet] = useState(false);
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const { userAddress, network } = useWallet();
  const { setBlurBackground } = useBlurBackground();
  const ref = useRef(null);
  const router = useRouter();

  const onDisconnectClick = () => {
    setBlurBackground();
    setIsOpenLogOutModal(true);
  };

  const headerAvatar = useMemo(() => {
    if (network === WALLET_NAMES.SOLANA) return '/wallets/phantom.png';
    if (network === WALLET_NAMES.COINBASE_SOLANA) return '/wallets/coinbase.png';
    if (network === WALLET_NAMES.SOLFLARE) return '/wallets/solflare.png';
    if (network === WALLET_NAMES.TONKEEPER) return '/wallets/tonkeeper.png';

    return '/logo.svg';
  }, [network]);

  const onConnectWallet = () => {
    setBlurBackground();
    setIsOpenedConnectWallet(true);
  };

  useClickOutside(ref, () => {
    setIsOpenMenu(false);
  });

  const onDashboardClick = () => {
    if (network === WALLET_NAMES.TONKEEPER) {
      router.push('/ton/market');
    } else {
      router.push('/solana/market');
    }
  };

  return (
    <div ref={ref} className="w-full flex relative items-center justify-end text-white">
      {userAddress ? (
        <div
          onClick={() => setIsOpenMenu((prev) => !prev)}
          className="min-w-[162px] w-fit p-1 pr-2 flex items-center rounded-[100px] bg-white-100 cursor-pointer hover:opacity-60 sm:hidden">
          <img
            className="h-[36px] w-[36px] mr-1 rounded-[20px]"
            src={headerAvatar}
            alt="header wallet icon"
          />
          <Typography
            className="text-white"
            text={`ID ${formatUserAddress(userAddress)}`}
            variant={TYPOGRAPHY_VARIANTS.BODY_S}
          />
        </div>
      ) : (
        <Button
          className="sm:hidden h-[44px]"
          text="Connect wallet"
          variant={BUTTON_VARIANTS.SMALL_WHITE}
          onClick={onConnectWallet}
        />
      )}

      <div
        onClick={() => setIsOpenMenu((prev) => !prev)}
        className="hidden sm:flex cursor-pointer flex ml-1 p-1 items-center justify-center rounded-[100px] bg-white-100  hover:opacity-60">
        {isOpenMenu ? (
          <img className="h-[36px] w-[36px]" src="/icons/closeIcon.svg" alt="header menu icon" />
        ) : (
          <img className="h-[36px] w-[36px]" src="/icons/menuIcon.png" alt="header menu icon" />
        )}
      </div>
      {isOpenMenu && (
        <div  
          className="absolute z-50 top-16 right-0 rounded-[24px] w-[232px] opacityBackgroundBlurClass py-5 px-4 flex flex-col">
          {router.pathname.split('/')[2] !== 'market' && (
            <div onClick={onDashboardClick} className="flex mt-2 mb-6 cursor-pointer items-center">
              <img className="h-[24px] w-[24px]" src="/icons/logOutIcon.png" alt="logout icon" />
              <Typography
                className="ml-3 text-white"
                text="To Dashboard"
                variant={TYPOGRAPHY_VARIANTS.BODY_M}
              />
            </div>
          )}
          <div className="flex cursor-not-allowed  items-center">
            <img
              className="h-[24px] w-[24px] opacity-[0.3]"
              src="/icons/settingsIcon.png"
              alt="settings icon"
            />
            <Typography
              className="text-white ml-3 opacity-[0.3]"
              text="Settings"
              variant={TYPOGRAPHY_VARIANTS.BODY_M}
            />
          </div>
          <Divider className="mt-6 mb-6" />
          <div onClick={onDisconnectClick} className="flex cursor-pointer items-center">
            <img className="h-[24px] w-[24px]" src="/icons/logOutIcon.png" alt="logout icon" />
            <Typography
              className="ml-3 text-white"
              text="Log out"
              variant={TYPOGRAPHY_VARIANTS.BODY_M}
            />
          </div>
        </div>
      )}

      {isOpenLogOutModal && (
        <LogOutModal isOpened={isOpenLogOutModal} setIsOpened={setIsOpenLogOutModal} />
      )}
      {/*{isOpenedConnectWallet && (*/}
      {/*  <ConnectWalletModal isOpened={isOpenedConnectWallet} setOpened={setIsOpenedConnectWallet} />*/}
      {/*)}*/}
      <Burger isOpened={isOpenMenu} />
    </div>
  );
};
