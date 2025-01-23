import React from 'react';
import Image from 'next/image';

import Typography from 'components/Typography';
import { TYPOGRAPHY_VARIANTS } from 'components/Typography/constants';
import Button from 'components/Button';
import { BUTTON_VARIANTS } from 'components/Button/constants';

export const MemeCard = ({
  name,
  symbol,
  imageUri,
  buttonText = '',
  cardStyle,
  buttonVariant = BUTTON_VARIANTS.LARGE,
  buttonHandler,
  isShowButton = true,
  isButtonDisabled = false,
  isLoadingMock = false
}) => {
  const styleBg = {
    backgroundImage: `url(${imageUri})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  };

  if (isLoadingMock) {
    return (
      <div
        className={`relative overflow-hidden bg-white-30 rounded-[30px] sm:rounded-[20px] min-h-[344px] sm:min-h-[224px] space-y-5 sm:space-y-3 p-[10px] pb-[16px] sm:p-[6px] sm:pb-3 sm:w-[168px] ${cardStyle ? cardStyle : 'w-[266px]'}`}>
        <div className="animate-pulse	relative z-[2] bg-white-50 h-[286px] sm:h-[156px] w-full rounded-[20px] sm:rounded-[14px]" />
        <div className="z-[3] flex flex-col space-y-2">
          <div className="animate-pulse	bg-white-50 rounded-[20px] h-[28px] sm:h-[24px]"></div>
          <div className="animate-pulse	bg-white-50 rounded-[20px] h-[18px] sm:h-[14px]"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden bg-white-30 rounded-[30px] sm:rounded-[20px] min-h-[344px] sm:min-h-[224px] space-y-5 sm:space-y-3 p-[10px] pb-[16px] sm:p-[6px] sm:pb-3 sm:w-[168px] ${cardStyle ? cardStyle : 'w-[266px]'}`}>
      <div
        style={styleBg}
        className="relative z-[2] bg-white-100 h-[286px] sm:h-[156px] w-full rounded-[20px] sm:rounded-[14px]"
      />
      <div className="z-[3] flex flex-col space-y-2">
        <Typography
          className="text-white whitespace-nowrap overflow-ellipsis overflow-hidden"
          variant={TYPOGRAPHY_VARIANTS.BODY_L}
          text={name}
        />
        <Typography className="text-white-500" variant={TYPOGRAPHY_VARIANTS.BODY_S} text={symbol} />
      </div>
      <Image
        priority
        className="!mt-0 z-[0] absolute top-0 left-0 blur-lg scale-125 h-[286px] sm:h-[156px] w-full"
        src={imageUri}
        quality={50}
        width={246}
        height={286}
        loading="eager"
        alt=""
      />
      {isShowButton && (
        <Button
          onClick={buttonHandler}
          className="w-full"
          variant={buttonVariant}
          text={buttonText}
          isDisabled={isButtonDisabled}
        />
      )}
    </div>
  );
};
