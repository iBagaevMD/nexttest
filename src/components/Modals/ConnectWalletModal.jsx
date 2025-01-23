import React, { useRef, useState } from 'react';

import ReactPortal from 'components/Portal';
import Typography from 'components/Typography';
import Radio from 'components/Radio';
import { TYPOGRAPHY_VARIANTS } from 'components/Typography/constants';
import { useClickOutside } from 'helpers/hooks/useClickOutside';
import { useBlurBackground } from 'helpers/hooks/useBlurBackground';
import ConnectSolanaWallets from 'components/Modals/ConnectSolanaWallets';
import ConnectTonWallets from './ConnectTonWallets';

const ConnectWalletModal = ({ isOpened, setOpened, isOnlySolana }) => {
  const [currentWallet, setCurrentWallet] = useState('SOLANA');
  const { resetBlurBackground } = useBlurBackground();
  const ref = useRef(null);

  const onCloseWalletModal = () => {
    resetBlurBackground();
    setOpened(false);
  };

  useClickOutside(ref, () => {
    onCloseWalletModal();
  });

  const handleChangeRadio = (e) => {
    setCurrentWallet(e.target.value);
  };

  return (
    <ReactPortal isOpen={isOpened}>
      <div
        ref={ref}
        className="flex w-[600px] modal text-white fixed top-0 sm:top-auto sm:bottom-0 pt-[36px] left-0 z-[999999] h-[614px]">
        <div className="w-full flex justify-center relative py-[50px] overflow-auto  bg-black-1000 px-[60px] pt-[80px] pb-[48px] rounded-[48px]">
          <div
            onClick={onCloseWalletModal}
            className="cursor-pointer absolute top-[30px] right-[30px] sm:top-[16px] sm:right-[130px] bg-white-100 flex items-center justify-center rounded-full w-[44px] h-[44px]">
            <img className="w-[24px] h-[24px]" src="/icons/closeIcon.svg" alt="close icon" />
          </div>

          <div className="flex flex-col sm:h-full">
            <div className="flex flex-col items-center space-y-6 max-w-[460px] sm:max-w-full w-full">
              <div className="flex flex-col items-center justify-center space-y-3 sm:space-y-1">
                <Typography
                  className="text-white"
                  text="Connect your wallet"
                  variant={TYPOGRAPHY_VARIANTS.BODY_H2}
                />
                <Typography
                  className="text-white-500 sm:max-w-[200px] text-center"
                  text="Select your favourite wallet to log in Rocket Launcher."
                  variant={TYPOGRAPHY_VARIANTS.BODY_S}
                />
              </div>
              <div className="flex flex-col space-y-[24px] max-w-[460px] sm:max-w-full w-full">
                {!isOnlySolana && (
                  <Radio
                    onClick={handleChangeRadio}
                    value={currentWallet}
                    id="walletRadio"
                    title=""
                    options={[
                      { value: 'SOLANA', icon: '/icons/solanaIcon.png' },
                      { value: 'TON', icon: '/icons/tonIcon.png' }
                    ]}
                  />
                )}
                {currentWallet === 'SOLANA' && <ConnectSolanaWallets setOpened={setOpened} />}
                {currentWallet === 'TON' && <ConnectTonWallets setOpened={setOpened} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ReactPortal>
  );
};

export default ConnectWalletModal;
