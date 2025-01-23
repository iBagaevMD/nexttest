import React from 'react';

import Typography from 'components/Typography';
import { TYPOGRAPHY_VARIANTS } from 'components/Typography/constants';
import MainTag from 'components/Tags/MainTag';

export const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full space-y-4 sm:space-y-3 py-[60px] sm:pt-[52px]">
      <MainTag text="Meme Generator" />
      <div className="text-center text-white flex flex-col items-center justify-center max-w-[686px] w-full">
        <Typography
          className="relative z-10"
          text="Generate and launch your own memecoin"
          variant={TYPOGRAPHY_VARIANTS.HEADER_H1}
        />
      </div>
      <Typography
        className="!mt-3 sm:!mt-2 text-center opacity-50 text-white-1000 !font-light max-w-[750px] sm:max-w-[90%] w-full"
        text="A couple of clicks and you're on trend"
        variant={TYPOGRAPHY_VARIANTS.BODY_L}
      />
    </div>
  );
};
