import React, { useState } from 'react';

import Typography from 'components/Typography';
import { TYPOGRAPHY_VARIANTS } from 'components/Typography/constants';

const SwapInfo = ({ tokenFromName, tokenToName, price, transactionFee, priceImpact }) => {
  const [isOpened, setIsOpened] = useState(false);

  return (
    <div
      onClick={() => setIsOpened((prev) => !prev)}
      className="flex flex-col cursor-pointer w-[460px] sm:w-full bg-white-100 px-4 py-8 mt-4 rounded-[16px]">
      <div className="justify-between flex items-center">
        <Typography
          className="text-white"
          variant={TYPOGRAPHY_VARIANTS.BODY_M}
          text={`1 ${tokenFromName} = ${price} ${tokenToName}`}
        />
        <img
          className={`transition-all ${isOpened && 'rotate-180'}`}
          src="/icons/arrowDown.svg"
          alt="arrowDown"
        />
      </div>
      {isOpened && (
        <div className="flex flex-col">
          <div className="flex justify-between items-center mt-4">
            <Typography
              className="text-white"
              variant={TYPOGRAPHY_VARIANTS.BODY_S}
              text="Exchange Fee"
            />
            <Typography
              className="text-white opacity-50"
              variant={TYPOGRAPHY_VARIANTS.BODY_S}
              text="1 %"
            />
          </div>
          <div className="flex justify-between items-center mt-4">
            <Typography
              className="text-white"
              variant={TYPOGRAPHY_VARIANTS.BODY_S}
              text="Transaction Fee"
            />
            <Typography
              className="text-white opacity-50"
              variant={TYPOGRAPHY_VARIANTS.BODY_S}
              text={`${transactionFee} TON`}
            />
          </div>
          {priceImpact && (
            <div className="flex justify-between items-center mt-4">
              <Typography
                className="text-white"
                variant={TYPOGRAPHY_VARIANTS.BODY_S}
                text="Price Impact"
              />
              <Typography
                className="text-white opacity-50"
                variant={TYPOGRAPHY_VARIANTS.BODY_S}
                text={`${priceImpact ? `${priceImpact?.toFixed(4)} %` : ''}`}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SwapInfo;
