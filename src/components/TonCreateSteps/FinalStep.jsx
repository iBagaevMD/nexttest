import React from 'react';

import Typography from 'components/Typography';
import Button from 'components/Button';
import { TYPOGRAPHY_VARIANTS } from 'components/Typography/constants';
import { BUTTON_VARIANTS } from 'components/Button/constants';

const FinalStep = ({ tokenImage = '', setTokenImage, setStep, tonviewerUrl }) => {
  const avatarBg = tokenImage
    ? {
        backgroundImage: `url(${typeof tokenImage === 'string' ? tokenImage : URL.createObjectURL(tokenImage)})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    : {};

  return (
    <div className="flex flex-col items-center mx-auto sm:mx-0 overflow-auto mt-16 sm:mt-6 w-full">
      <div className="h-[120px] mx-auto w-[120px] p-[1px] flex logo-btn-gradient rounded-full mt-[48px]">
        <div style={avatarBg} className="w-full h-full bg-white rounded-full" />
      </div>
      <div className="flex flex-col items-center justify-center space-y-[12px] mt-[24px] max-w-[487px]">
        <Typography
          className="text-white"
          text="You made a token"
          variant={TYPOGRAPHY_VARIANTS.HEADER_H2}
        />
        <Typography
          className="text-white opacity-[0.5] text-center w-[400px]"
          text="The time of the launch depends on how busy the network is, but it shouldn’t be more than 5 minutes."
          variant={TYPOGRAPHY_VARIANTS.BODY_M}
        />
      </div>
      <div className="flex items-center sm:flex-col justify-center max-w-[460px] sm:max-w-full w-full py-[48px] space-x-4 sm:space-x-0 sm:space-y-4">
        <Button
          onClick={() => {
            setTokenImage(null);
            setStep(1);
          }}
          className="w-[220px] sm:w-full sm:h-[58px]"
          text="New token"
          variant={BUTTON_VARIANTS.LARGE}
        />
        <a
          href={`https://tonviewer.com/${tonviewerUrl}`}
          target="_blank"
          rel="nofollow"
          className={`flex-1 h-[56px] sm:h-[58px] w-[220px] sm:w-full flex-shrink-0 hover:brightness-110 active:brightness-110 border border-white p-[1px] rounded-[100px] flex items-center justify-center`}>
          <div className=" px-[30px] py-[14px] rounded-[100px] w-full h-full flex items-center justify-center bg-black-1000">
            <Typography
              className="text-white"
              text="Token information"
              variant={TYPOGRAPHY_VARIANTS.BUTTON_M}
            />
          </div>
        </a>
      </div>
    </div>
  );
};

export default FinalStep;
