import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

import ConnectWalletModal from 'components/Modals/ConnectWalletModal';
import Button from 'components/Button';
import { BUTTON_VARIANTS } from 'components/Button/constants';
import { useBlurBackground } from 'helpers/hooks/useBlurBackground';
import Typography from 'components/Typography';
import { TYPOGRAPHY_VARIANTS } from 'components/Typography/constants';
import { useWallet } from 'contexts/wallet';
import { UserInfo } from 'components/Headers/UserInfo';

const HeaderMain = () => {
  const [isOpened, setIsOpened] = useState(false);
  const { setBlurBackground } = useBlurBackground();
  const { network } = useWallet();
  const router = useRouter();

  const onConnectWallet = () => {
    setBlurBackground();
    setIsOpened(true);
  };

  const menu = [
    {
      title: 'Home',
      key: 'home',
      url: '/'
    },
    {
      title: 'Blog',
      key: 'blog',
      url: '/blog'
    }
  ];

  const onLogoClick = () => {
    router.push('/');
  };

  return (
    <React.Fragment>
      <header className="fixed z-50 top-0 left-0 w-full h-[92px] sm:h-[72px] flex items-center justify-center backdrop-blur-md">
        <div className="max-w-[1360px] sm:max-w-full w-full flex items-center justify-between py-5 px-[40px] sm:px-4">
          <img
            onClick={onLogoClick}
            className="h-[35px] cursor-pointer sm:h-[32px]"
            src="/logoWithText.svg"
            alt="header logo"
          />
          <div className="sm:hidden flex items-center justify-center p-1 border border-solid border-white-40 bg-dark-gray-100 rounded-[16px] backdrop-blur-[16px]">
            {menu.map((item) => {
              const activeClass =
                router.route === item.url || (item.key === 'home' && router.route === '/')
                  ? 'bg-white-80 backdrop-blur-[20px]'
                  : 'bg-transparent';
              if (!item?.url) {
                return null;
              }
              return (
                <Link
                  key={item.key}
                  href={item.url}
                  passHref
                  className={`px-[14px] py-3 flex items-center justify-center rounded-[12px] ${activeClass}`}>
                  <Typography
                    className="text-white !font-light"
                    variant={TYPOGRAPHY_VARIANTS.BUTTON_M}
                    text={item?.title}
                  />
                </Link>
              );
            })}
          </div>
          <div className="flex items-center justify-end w-[240px]">
            {!!network ? (
              <UserInfo />
            ) : (
              <Button
                className="border-white-100 py-[14px]"
                text="Connect wallet"
                variant={BUTTON_VARIANTS.SMALL_WHITE}
                onClick={onConnectWallet}
              />
            )}
          </div>
        </div>
      </header>
      {isOpened && <ConnectWalletModal isOpened={isOpened} setOpened={setIsOpened} />}
    </React.Fragment>
  );
};

export default HeaderMain;
