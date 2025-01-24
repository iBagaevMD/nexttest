import React, { useState, useEffect } from 'react';

import Typography from 'components/Typography';
import { TYPOGRAPHY_VARIANTS } from 'components/Typography/constants';
import TradeMenu from 'components//TradeMenu';
import { useWallet } from 'contexts/wallet';

const TradeController = () => {
  const { userAddress } = useWallet();
  const [tonBalance, setTonBalance] = useState(null);

  const [tokenFrom, setTokenFrom] = useState({
    name: 'TON',
    imageUrl: '/tokens/ton.png',
    inputValue: 0,
    poolAddress: null,
    balance: tonBalance
  });
  const [tokenTo, setTokenTo] = useState({
    name: '',
    imageUrl: '',
    inputValue: 0,
    poolAddress: null,
    balance: 0
  });
  const tonPositionIsFrom = tokenFrom.name === 'TON';

  const fetchTonBalance = async () => {
    const response = await fetch(
      `https://toncenter.com/api/v2/getAddressBalance?address=${userAddress}`
    );
    return response.json().then((res) => setTonBalance(parseInt(res.result) / Math.pow(10, 9)));
  };

  useEffect(() => {
    fetchTonBalance();
  }, []);

  useEffect(() => {
    if (tonPositionIsFrom) {
      setTokenFrom((prev) => ({
        ...prev,
        balance: tonBalance
      }));
    }
  }, [tonBalance]);

  useEffect(() => {
    // Т.к Sdk кидает runtime error который не перехватывается, создан данный костыль;
    const oldWindowErrorFunc = window.Error;
    let isHandlingError = false;

    window.Error = function (...args) {
      if (isHandlingError) {
        return oldWindowErrorFunc.apply(this, args); // Избегаем рекурсии
      }

      isHandlingError = true;
      try {
        if (args[0] && typeof args[0] === 'string' && args[0].includes('TON_CONNECT_SDK')) {
          console.warn('Suppressed TON_CONNECT_SDK error:', args[0]);
          return; // Подавляем ошибку
        }
        return oldWindowErrorFunc.apply(this, args); // Обработка остальных ошибок
      } finally {
        isHandlingError = false; // Сбрасываем флаг после обработки
      }
    };

    return () => {
      window.Error = oldWindowErrorFunc;
    };
  }, []);

  return (
    <div className="flex flex-col mx-auto overflow-auto mt-16 sm:mt-6">
      <div className="flex flex-col items-center justify-center w-[460px] sm:w-full">
        <Typography className="text-white" text="Trade" variant={TYPOGRAPHY_VARIANTS.HEADER_H2} />
        <Typography
          className="text-white text-center opacity-[0.5] mt-[12px]"
          text="Swap tokens in TON network."
          variant={TYPOGRAPHY_VARIANTS.BODY_M}
        />
      </div>
      <TradeMenu
        tonBalance={tonBalance}
        tokenFrom={tokenFrom}
        setTokenFrom={setTokenFrom}
        tokenTo={tokenTo}
        setTokenTo={setTokenTo}
      />
    </div>
  );
};

export default TradeController;
