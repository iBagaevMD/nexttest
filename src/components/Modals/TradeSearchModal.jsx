import React, { useEffect, useRef, useState } from 'react';
import copyToClipBoard from 'copy-to-clipboard';

import ReactPortal from 'components/Portal';
import Typography from 'components/Typography';
import { TYPOGRAPHY_VARIANTS } from 'components/Typography/constants';
import { useClickOutside } from 'helpers/hooks/useClickOutside';
import { useBlurBackground } from 'helpers/hooks/useBlurBackground';
import TextInput from 'components/Inputs/TextInput';
import { BUTTON_VARIANTS } from 'components/Button/constants';
import Button from 'components/Button';
import { TonRepository } from 'connectors/repositories/ton';
import { useRequest } from 'helpers/hooks/useRequest';
import { formatUserAddress } from 'helpers/string';
import { debounce } from 'helpers/debounce';
import { useNotifications } from 'contexts/notifications';

const TradeSearchModal = ({
  isOpened,
  setOpened,
  tokenFrom,
  setTokenTo,
  setTokenFrom,
  setIsNeedGetBalance
}) => {
  const { resetBlurBackground } = useBlurBackground();
  const { showSuccessNotification } = useNotifications();
  const [searchInputText, setSearchInputText] = useState('');
  const ref = useRef(null);

  const { call, data, isLoading } = useRequest(TonRepository.getTokens);

  const debouncedCall = useRef(
    debounce((query) => call([`&search=${query}&excludeMetrics=true`]), 1000)
  ).current;

  useEffect(() => {
    debouncedCall(searchInputText);
  }, [searchInputText]);

  const onChangeInput = (e) => {
    const value = e.target.value;
    setSearchInputText(value);
  };

  const tokensList = data?.result || [];

  const onCloseWalletModal = () => {
    const isTonTokenFrom = tokenFrom.name === 'TON';
    if (!isTonTokenFrom) {
      setIsNeedGetBalance(true);
    }
    resetBlurBackground();
    setOpened(false);
  };

  useClickOutside(ref, () => {
    onCloseWalletModal();
  });

  const onTokenClick = (item, event) => {
    if (event?.target?.className?.includes('dc')) return;
    const isTonTokenFrom = tokenFrom.name === 'TON';

    if (isTonTokenFrom) {
      setTokenTo({ ...item, inputValue: 0, balance: 0 });
    } else {
      setTokenFrom({ ...item, inputValue: 0, balance: 0 });
    }

    onCloseWalletModal();
  };

  const onCopyHandler = (value) => {
    copyToClipBoard(value);
    showSuccessNotification(`Address \"${value}\" copied to clipboard!`);
  };

  return (
    <ReactPortal isOpen={isOpened}>
      <div
        ref={ref}
        className="flex w-[600px] sm:w-full modal text-white fixed top-0 pt-[36px] left-0 h-full z-[999999]">
        <div className="scrollable-list w-full relative py-[50px] overflow-auto  bg-black-1000 px-[60px] sm:px-4 pt-[80px] pb-[48px] rounded-[48px]">
          <div
            onClick={onCloseWalletModal}
            className="cursor-pointer absolute top-[30px] right-[30px] sm:top-[16px] bg-white-100 flex items-center justify-center rounded-full w-[44px] h-[44px]">
            <img className="w-[24px] h-[24px]" src="/icons/closeIcon.svg" alt="close icon" />
          </div>

          <div className="flex flex-col sm:h-full">
            <div className="flex flex-col items-center space-y-6 max-w-[460px] sm:max-w-full w-full">
              <div className="flex flex-col items-center justify-center space-y-3 sm:space-y-1">
                <Typography
                  className="text-white"
                  text="Select a token"
                  variant={TYPOGRAPHY_VARIANTS.BODY_H2}
                />
                <Typography
                  className="text-white-500 sm:max-w-[200px] text-center"
                  text="Choose the token you want to interact with"
                  variant={TYPOGRAPHY_VARIANTS.BODY_S}
                />
              </div>
              <TextInput
                iconSrc="/icons/loop.svg"
                className="!max-w-full"
                disabled={isLoading}
                handleChange={(e) => onChangeInput(e)}
                placeholder="Search by token or paste address"
              />
              {isLoading && (
                <img
                  src="/rocket_gif.gif"
                  alt="Looping GIF"
                  className="w-[80px] h-[80px] ml-auto mr-auto !mt-[100px] !mb-[100px]"
                />
              )}
              {!tokensList.length && !isLoading && (
                <div className="flex !mt-[100px] !mb-[100px] ml-auto mr-auto items-center justify-center flex-col w-[460px] sm:w-full">
                  <img className="w-[48px] h-[48px]" src="/icons/smileIcon.png" alt="smile Icon" />
                  <Typography
                    className="text-white opacity-[0.5] w-[78%] text-center mt-3"
                    text="You have no tokens for sale."
                    variant={TYPOGRAPHY_VARIANTS.BODY_M}
                  />
                </div>
              )}
              {!!tokensList.length && !isLoading && (
                <div className="flex flex-col w-[460px] sm:w-full">
                  <div className="flex w-[460px] sm:w-full items-center justify-between">
                    <Typography
                      className="text-white opacity-50"
                      variant={TYPOGRAPHY_VARIANTS.BODY_XS}
                      text="TOKEN"
                    />
                    <Typography
                      className="text-white opacity-50"
                      variant={TYPOGRAPHY_VARIANTS.BODY_XS}
                      text="Address"
                    />
                  </div>
                  {tokensList?.map((item, index) => (
                    <div
                      onClick={(e) => onTokenClick(item, e)}
                      key={index}
                      className="cursor-pointer mt-6 flex w-[460px] sm:w-full justify-between">
                      <div className="flex items-center">
                        <img
                          className="w-[44px] h-[44px] rounded-[100px] mr-2"
                          src={item.imageUrl}
                          alt="token icon"
                        />
                        <div className="flex flex-col">
                          <Typography
                            className="text-white"
                            text={item.name}
                            variant={TYPOGRAPHY_VARIANTS.BODY_M}
                          />
                          <Typography
                            className="text-white opacity-50"
                            text={item.symbol}
                            variant={TYPOGRAPHY_VARIANTS.BODY_S}
                          />
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Typography
                          className="text-white opacity-50 mr-4"
                          text={formatUserAddress(item.minterAddress)}
                          variant={TYPOGRAPHY_VARIANTS.BODY_S}
                        />
                        <img
                          onClick={() => onCopyHandler(item.minterAddress)}
                          className="w-6 h-6 mr-4 dc"
                          src="/icons/copyIcon.svg"
                          alt=""
                        />
                        <a
                          className="rounded-[100px]"
                          rel="nofollow"
                          target="_blank"
                          href={`https://tonviewer.com/${item.minterAddress}`}>
                          <img
                            className="w-6 h-6 rounded-[100px] dc"
                            src="/dex/tonviewer.jpg"
                            alt=""
                          />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Button
                onClick={onCloseWalletModal}
                className="mt-[24px] w-[460px] sm:w-full h-[58px]"
                text="Continue"
                variant={BUTTON_VARIANTS.LARGE}
              />
            </div>
          </div>
        </div>
      </div>
    </ReactPortal>
  );
};

export default TradeSearchModal;
