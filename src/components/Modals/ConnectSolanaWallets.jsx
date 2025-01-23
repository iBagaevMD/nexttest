import React from 'react';

import Typography from 'components/Typography';
import { TYPOGRAPHY_VARIANTS } from 'components/Typography/constants';
import { getSolanaWalletsForConnect } from 'components/Modals/constants';
import { useWallet } from 'contexts/wallet';
import { useBlurBackground } from 'helpers/hooks/useBlurBackground';

const ConnectSolanaWallets = ({ setOpened }) => {
  const { connectWallet, disconnectWallet } = useWallet();
  const { resetBlurBackground } = useBlurBackground();

  return getSolanaWalletsForConnect(connectWallet, disconnectWallet).map((item, itemIndex) => {
    const connectHandler = () => {
      setOpened(false);
      item?.func();
      resetBlurBackground();
    };

    return (
      <button
        onClick={connectHandler}
        className={`flex items-center justify-between p-2 border border-white-100 rounded-[100px] ${item?.isEnabled ? '' : 'opacity-50'}`}
        disabled={!item?.isEnabled}
        key={itemIndex}>
        <div className="flex items-center justify-center space-x-4">
          <img
            className="rounded-full w-[60px] h-[60px] sm:w-[44px] sm:h-[44px]"
            src={item?.image}
            alt="wallet image"
          />
          <div className="flex flex-col justify-center items-start">
            <Typography
              className="text-white"
              text={item.title}
              variant={TYPOGRAPHY_VARIANTS.HEADER_H4}
            />
            <Typography
              className="text-white-500 mt-2"
              text={item.desc}
              variant={TYPOGRAPHY_VARIANTS.BODY_M}
            />
          </div>
        </div>
        {item?.isEnabled && !item?.isNeedDownload && (
          <div className="h-[60px] sm:h-[44px] min-w-[80px] rounded-[166px] flex items-center justify-center border border-green-200 bg-green-50">
            <Typography
              className="text-light-green"
              text={item?.isConnected ? 'Disconnect' : 'Connect'}
              variant={TYPOGRAPHY_VARIANTS.XS}
            />
          </div>
        )}
        {item?.isEnabled && item?.isNeedDownload && (
          <a href={item.downloadUrl} target="_blank" className="" rel="noreferrer">
            <div className="h-[60px] sm:h-[44px] min-w-[80px] rounded-[166px] text-orange text-[12px] leading-[14px] text-light flex items-center justify-center border border-orange-200 bg-orange-50">
              {'Download'}
            </div>
          </a>
        )}
      </button>
    );
  });
};

export default ConnectSolanaWallets;
