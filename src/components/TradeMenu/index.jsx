import React, { useState, useMemo, useEffect } from 'react';
import { debounce } from 'lodash';

import Typography from 'components/Typography';
import { TYPOGRAPHY_VARIANTS } from 'components/Typography/constants';
import { BUTTON_VARIANTS } from 'components/Button/constants';
import Button from 'components/Button';
import SwapInfo from 'components//SwapInfo';
import TradeSearchModal from 'components/Modals/TradeSearchModal';
import { useBlurBackground } from 'helpers/hooks/useBlurBackground';
import { usePoolContract } from 'helpers/hooks/usePoolContract';
import { toNanoton, toTon } from 'helpers/ton';
import { useJettonWalletContract } from 'helpers/hooks/useJettonWalletContract';
import { useNotifications } from 'contexts/notifications';
const TradeMenu = ({ tokenFrom, tokenTo, setTokenFrom, setTokenTo, tonBalance }) => {
  const { showSuccessNotification, showErrorNotification, showInfoNotification } =
    useNotifications();
  const [isOpenedModal, setIsOpenedModal] = useState(false);
  const { setBlurBackground } = useBlurBackground();
  const [fixedBuyFeeCache, setFixedBuyFeeCache] = useState(null);
  const [isLoadingSwap, setIsLoadingSwap] = useState(false);
  const [userJettonBalance, setUserJettonBalance] = useState(null);
  const [isNeedGetBalance, setIsNeedGetBalance] = useState(true);
  const [price, setPrice] = useState(0);
  const [inputFocused, setInputFocused] = useState(false);
  const [blurTimeout, setBlurTimeout] = useState(null);
  const [transactionFee, setTransactionFee] = useState(null);
  const [priceImpact, setPriceImpact] = useState(null);
  const [soldAmount, setSoldAmount] = useState(0);

  useEffect(() => {
    let timer;
    if (isLoadingSwap) {
      timer = setTimeout(() => {
        setIsLoadingSwap(false);
      }, 40000);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [isLoadingSwap]);

  const tonPositionIsFrom = tokenFrom.name === 'TON';
  const poolAddress = tonPositionIsFrom ? tokenTo.poolAddress : tokenFrom.poolAddress;
  const minterAddress = tonPositionIsFrom ? tokenTo.minterAddress : tokenFrom.minterAddress;

  const pool = usePoolContract(poolAddress);
  const userJettonWallet = useJettonWalletContract(poolAddress, minterAddress);

  const allTokensSelected = useMemo(() => {
    return tokenFrom.name && tokenTo.name;
  }, [tokenFrom, tokenTo]);

  const getSoldJettonAmount = async () => {
    const soldJettonsAmount = await pool.getSoldJettonsAmount();
    const tonSoldJettonsAmount = toTon(soldJettonsAmount);
    return Math.min(tonSoldJettonsAmount, tokenFrom.balance);
  };

  useEffect(() => {
    // Количество жетонов, которые можно продать из-за liquidity pool
    if (pool.address && !tonPositionIsFrom) {
      getSoldJettonAmount().then((res) => {
        setSoldAmount(res);
      });
    } else {
      setSoldAmount(0);
    }
  }, [tokenFrom.balance, pool.address, tonPositionIsFrom]);

  useEffect(() => {
    if (tonPositionIsFrom && pool.address) {
      Promise.resolve(pool.getFixedBuyFee()).then((fee) => {
        if (fee) {
          setTransactionFee(toTon(fee).toFixed(2));
        } else {
          setTransactionFee('');
        }
      });
    } else if (!tonPositionIsFrom && pool.address) {
      const result = parseFloat(
        toTon(pool?.estimatedMinimalValueToSend_sellJetton.toString()).toFixed(1)
      );
      setTransactionFee(result);
    }
  }, [pool.address, tokenFrom.name]);

  useEffect(() => {
    if (isNeedGetBalance && pool?.address && allTokensSelected && userJettonWallet.address) {
      // Тянет данные о цене выбранного пользовательского токена (НЕ ТОН)
      Promise.resolve(userJettonWallet.getBalance()).then((balance) => {
        setUserJettonBalance(toTon(balance));
        setIsNeedGetBalance(false);
      });
      // Тянет данные о цене выбранного токена за 1 ТОН
      if (tonPositionIsFrom) {
        Promise.resolve(pool.getEstimatedJettonForTon(toNanoton(1))).then((result) => {
          setPrice(toTon(result));
        });
      } else {
        Promise.resolve(pool.getEstimatedTonForJetton(toNanoton(1))).then((result) => {
          setPrice(toTon(result));
        });
      }
    }
  }, [
    tonPositionIsFrom,
    isNeedGetBalance,
    pool.address,
    allTokensSelected,
    userJettonWallet.address
  ]);

  useEffect(() => {
    const fetchEstimatedTokens = async () => {
      try {
        if (pool?.address && tonPositionIsFrom) {
          const result = await pool.getEstimatedJettonForTon(toNanoton(tokenFrom.inputValue));
          setTokenTo((prev) => ({
            ...prev,
            inputValue: toTon(result)
          }));
        } else if (pool?.address && !tonPositionIsFrom) {
          const result = await pool.getEstimatedTonForJetton(toNanoton(tokenFrom.inputValue));
          setTokenTo((prev) => ({
            ...prev,
            inputValue: toTon(result)
          }));
        }
      } catch (error) {
        console.error('Error fetching estimated tokens:', error);
      }
    };

    const debouncedFetch = debounce(fetchEstimatedTokens, 500);
    debouncedFetch();

    return () => {
      debouncedFetch.cancel();
    };
  }, [tokenTo.name, pool?.address, tokenFrom.inputValue, tonPositionIsFrom]);

  useEffect(() => {
    if (tonPositionIsFrom) {
      setTokenTo((prev) => ({
        ...prev,
        balance: userJettonBalance || 0
      }));
    } else {
      setTokenFrom((prev) => ({
        ...prev,
        balance: userJettonBalance || 0
      }));
    }
  }, [userJettonBalance]);

  const transactionSentHandler = () => {
    showInfoNotification('Confirm the transaction', 'check your wallet');
  };

  const transactionSignedHandler = () => {
    showSuccessNotification('Transaction sent, monitor the status in the wallet');
    setIsLoadingSwap(false);
  };

  const transactionFailedHandler = () => {
    showErrorNotification('Transaction failed.', 'check your wallet');
    setIsLoadingSwap(false);
  };

  useEffect(() => {
    window.addEventListener('ton-connect-transaction-sent-for-signature', transactionSentHandler);

    window.addEventListener('ton-connect-transaction-signed', transactionSignedHandler);

    window.addEventListener('ton-connect-transaction-signing-failed', transactionFailedHandler);

    return () => {
      window.removeEventListener(
        'ton-connect-transaction-sent-for-signature',
        transactionSentHandler
      );

      window.removeEventListener('ton-connect-transaction-signed', transactionSignedHandler);

      window.removeEventListener(
        'ton-connect-transaction-signing-failed',
        transactionFailedHandler
      );
    };
  }, []);

  useEffect(() => {
    if (pool.address) {
      pool.getFixedBuyFee().then((fee) => (fee ? setFixedBuyFeeCache(fee) : ''));
    }
  }, [pool.address]);

  const onOpenModalHandler = () => {
    if (isLoadingSwap) return;

    setBlurBackground();
    setIsOpenedModal((prev) => !prev);
  };

  const onSwapHandler = async () => {
    setIsLoadingSwap(true);
    if (tonPositionIsFrom) {
      await pool.sendBuyJetton(fixedBuyFeeCache + toNanoton(tokenFrom.inputValue));
    } else {
      userJettonWallet.sendSellJetton(toNanoton(tokenFrom.inputValue));
    }
  };

  const onSwapClick = () => {
    if (isLoadingSwap) return;

    setTokenFrom({
      ...tokenTo,
      inputValue: 0
    });
    setTokenTo({
      ...tokenFrom,
      inputValue: 0
    });
    setIsNeedGetBalance(true);
  };

  const onInputChange = (e) => {
    const value = e?.target?.value;

    setTokenFrom((prev) => ({
      ...prev,
      inputValue: value
    }));
  };

  const isNotEnoughBalance = useMemo(() => {
    // Проверка на количество баланса токена в "from"
    if (tonPositionIsFrom) {
      return tonBalance < tokenFrom.inputValue;
    }
    return userJettonBalance < Number(tokenFrom.inputValue);
  }, [tokenFrom.inputValue, tonPositionIsFrom]);

  const isNotEnoughLiquidity = useMemo(() => {
    if (tonPositionIsFrom) return false;
    return soldAmount < Number(tokenFrom.inputValue);
  }, [tokenFrom.inputValue, tonPositionIsFrom]);

  const onSetInput = (divider) => {
    // Обработчик устанавливающий текст в инпут в зависимости от нажатия на кнопки 25/50/max
    const value = tonPositionIsFrom ? tokenFrom.balance / divider : soldAmount / divider;
    setTokenFrom((prev) => ({
      ...prev,
      inputValue: value
    }));
  };

  const handleInputBlur = () => {
    // Нужен для клика по кнопкам 25/50/max чтоб onBlur срабатывал раньше и событие по button проходило
    setBlurTimeout(
      setTimeout(() => {
        setInputFocused(false);
      }, 300)
    );
  };

  const handleInputFocus = () => {
    if (blurTimeout) {
      clearTimeout(blurTimeout);
    }
    setInputFocused(true);
  };

  useEffect(() => {
    setPriceImpact(null);

    const fetchPriceImpact = async () => {
      try {
        if (pool?.address && tokenFrom.inputValue && tonPositionIsFrom) {
          const res = await pool.getEstimatedPriceImpact({
            tonSendAmountForBuy: toNanoton(tokenFrom.inputValue)
          });
          setPriceImpact(res * 100);
        } else if (pool?.address && tokenFrom.inputValue && !tonPositionIsFrom) {
          const res = await pool.getEstimatedPriceImpact({
            jettonAmountForSell: toNanoton(tokenFrom.inputValue)
          });
          setPriceImpact(res * 100);
        }
      } catch (error) {
        console.error('Error fetching price impact:', error);
      }
    };

    const debouncedFetch = debounce(fetchPriceImpact, 500);
    debouncedFetch();

    return () => {
      debouncedFetch.cancel();
    };
  }, [pool?.address, tokenFrom.inputValue, tonPositionIsFrom]);

  return (
    <div className="mt-8 relative">
      <div className="flex flex-col relative">
        <div className="mb-2 flex flex-col space-y-3 rounded-[16px] bg-white-10 border border-white-100 w-[460px] sm:w-full p-4">
          <div className="w-full flex items-center justify-between">
            <Typography
              className="text-white opacity-50"
              variant={TYPOGRAPHY_VARIANTS.BODY_S}
              text="From"
            />
            {!inputFocused ? (
              <div className="flex items-center h-[24px] justify-end space-x-1">
                <img className="opacity-50" src="/icons/wallet.svg" alt="" />
                <Typography
                  className="text-white opacity-50"
                  variant={TYPOGRAPHY_VARIANTS.BODY_S}
                  text={tokenFrom.balance}
                />
              </div>
            ) : (
              <div className="flex items-center h-[24px] justify-end space-x-2">
                <button onClick={() => onSetInput(4)}>
                  <Typography
                    className="text-transparent bg-clip-text bg-[linear-gradient(90deg,#E58947_0%,#F14444_100%)]"
                    variant={TYPOGRAPHY_VARIANTS.BODY_S}
                    text="25%"
                  />
                </button>
                <button onClick={() => onSetInput(2)}>
                  <Typography
                    className="text-transparent bg-clip-text bg-[linear-gradient(90deg,#E58947_0%,#F14444_100%)]"
                    variant={TYPOGRAPHY_VARIANTS.BODY_S}
                    text="50%"
                  />
                </button>
                <button onClick={() => onSetInput(1)}>
                  <Typography
                    className="text-transparent bg-clip-text bg-[linear-gradient(90deg,#E58947_0%,#F14444_100%)]"
                    variant={TYPOGRAPHY_VARIANTS.BODY_S}
                    text="MAX%"
                  />
                </button>
              </div>
            )}
          </div>
          {isNotEnoughLiquidity && tokenFrom.balance > 0 && (
            <div className="px-[34px] flex justify-center text-center items-center py-3 rounded-[12px] bg-blood-red">
              <Typography
                text={`You can't sell more than ${soldAmount} coins due to insufficient liquidity.`}
                variant={TYPOGRAPHY_VARIANTS.CAPTION}
                className="text-dark-red"
              />
            </div>
          )}
          <div className="min-h-[68px] p-3 rounded-[12px] bg-white-10 w-full flex items-center justify-between">
            <div
              onClick={() => {
                if (!tonPositionIsFrom) {
                  onOpenModalHandler();
                }
              }}
              className={`${!tonPositionIsFrom && 'cursor-pointer'} flex items-center h-full pr-3`}>
              <div className="flex items-center">
                {tokenFrom.name && (
                  <img
                    className="h-[28px] w-[28px] mr-2 rounded-[20px]"
                    src={tokenFrom.imageUrl}
                    alt="header wallet icon"
                  />
                )}
                <Typography
                  className="text-white font-bold"
                  variant={TYPOGRAPHY_VARIANTS.BODY_M}
                  text={tokenFrom.name || 'Select token'}
                />
                {!tonPositionIsFrom && (
                  <img className="ml-2" src="/icons/arrowDown.svg" alt="arrowDown" />
                )}
              </div>
            </div>
            <input
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder="0"
              disabled={isLoadingSwap || !tokenFrom.name || !tokenTo.name}
              onChange={(e) => onInputChange(e)}
              value={tokenFrom.inputValue}
              type="number"
              className={`flex-1 text-right h-[40px] !bg-transparent ${isNotEnoughBalance || isNotEnoughLiquidity ? 'text-red' : 'text-white'} opacity-50 focus:opacity-100 focus:outline-none focus:border-indigo-500`}
            />
          </div>
        </div>
        {!isLoadingSwap && (
          <div
            onClick={onSwapClick}
            className={`z-50 cursor-pointer w-[48px] h-[48px] flex items-center px-3 py-[10px] ${isNotEnoughLiquidity ? 'top-[60%]' : 'top-1/2'} left-1/2 -translate-x-1/2 -translate-y-1/2 absolute bg-[#171717] rounded-full`}>
            <img src="/icons/swapArrows.svg" alt="swapArrowsSvg" />
          </div>
        )}
        <div className="mb-2 relative flex flex-col space-y-3 rounded-[16px] bg-white-10 border border-white-100 w-[460px] sm:w-full p-4">
          <div className="w-full flex items-center justify-between">
            <Typography
              className="text-white opacity-50"
              variant={TYPOGRAPHY_VARIANTS.BODY_S}
              text="To"
            />
            <div className="flex items-center justify-end space-x-1 opacity-50">
              <img src="/icons/wallet.svg" alt="" />
              <Typography
                className="text-white"
                variant={TYPOGRAPHY_VARIANTS.BODY_S}
                text={tokenTo.balance}
              />
            </div>
          </div>
          <div className="min-h-[68px] p-3 rounded-[12px] bg-white-10 w-full flex items-center justify-between">
            <div
              onClick={() => {
                if (tonPositionIsFrom) {
                  onOpenModalHandler();
                }
              }}
              className={`${tonPositionIsFrom && 'cursor-pointer'} flex items-center pr-3`}>
              <div className="flex items-center">
                {tokenTo.name && (
                  <img
                    className="h-[28px] w-[28px] mr-2 rounded-[20px]"
                    src={tokenTo.imageUrl}
                    alt="header wallet icon"
                  />
                )}
                <Typography
                  className="text-white font-bold"
                  variant={TYPOGRAPHY_VARIANTS.BODY_M}
                  text={tokenTo.name || 'Select token'}
                />
                {!isLoadingSwap && tonPositionIsFrom && (
                  <img className="ml-2" src="/icons/arrowDown.svg" alt="arrowDown" />
                )}
              </div>
            </div>
            <input
              placeholder="0"
              disabled
              value={tokenTo.inputValue}
              type="number"
              className="flex-1 text-right h-[40px] !bg-transparent text-white opacity-50 focus:opacity-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>
      {allTokensSelected && (
        <React.Fragment>
          <SwapInfo
            priceImpact={priceImpact}
            transactionFee={transactionFee}
            price={price}
            tokenFromName={tokenFrom.name}
            tokenToName={tokenTo.name}
            pool={pool}
          />
          {isNotEnoughBalance && (
            <div className="mt-4 items-center flex border border-dark-red px-4 py-6 bg-red-100 rounded-[16px] w-[460px] sm:w-full">
              <img src="/icons/redHandAlert.svg" alt="not enough balance icon" />
              <Typography
                className="ml-[10px] text-dark-red"
                variant={TYPOGRAPHY_VARIANTS.BODY_M}
                text={`Not enough ${tokenFrom.name} on the wallet`}
              />
            </div>
          )}
          <Button
            onClick={onSwapHandler}
            className="mt-4 w-[460px] h-[58px] sm:w-full"
            text="Swap"
            isLoading={isLoadingSwap}
            isDisabled={isLoadingSwap || isNotEnoughBalance || isNotEnoughLiquidity}
            variant={BUTTON_VARIANTS.LARGE}
          />
        </React.Fragment>
      )}
      {isOpenedModal && (
        <TradeSearchModal
          setIsNeedGetBalance={setIsNeedGetBalance}
          isOpened={isOpenedModal}
          setOpened={setIsOpenedModal}
          tokenFrom={tokenFrom}
          setTokenTo={setTokenTo}
          setTokenFrom={setTokenFrom}
        />
      )}
    </div>
  );
};

export default TradeMenu;
