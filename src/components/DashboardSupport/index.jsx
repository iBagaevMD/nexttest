import React from 'react';

import Typography from 'components/Typography';
import { TYPOGRAPHY_VARIANTS } from 'components/Typography/constants';
import Button from 'components/Button';
import { BUTTON_VARIANTS } from 'components/Button/constants';

const DashboardSupport = ({ onClick }) => {
  return (
    <div className="flex flex-col items-center mx-auto justify-center w-[460px] mt-16 sm:mt-6 sm:w-full">
      <Typography className="text-white" text="Support" variant={TYPOGRAPHY_VARIANTS.HEADER_H2} />
      <Typography
        className="text-white opacity-[0.3] mt-3 w-[370px] text-center"
        text="You can write to us in telegram. We will resolve any issue as soon as possible."
        variant={TYPOGRAPHY_VARIANTS.BODY_M}
      />
      <Button
        onClick={onClick}
        className="mt-[48px] w-[236px] h-[58px]"
        text="Contact"
        variant={BUTTON_VARIANTS.LARGE}
      />
    </div>
  );
};

export default DashboardSupport;
