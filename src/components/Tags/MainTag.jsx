import React from 'react';
import clsx from 'clsx';

import Typography from 'components/Typography';
import { TYPOGRAPHY_VARIANTS } from 'components/Typography/constants';

const MainTag = ({ text, className, ...props }) => {
  return (
    <div
      className={clsx(`flex items-center w-fit bg-white-100 rounded-[100px] py-2 px-4`, className)}
      {...props}>
      <Typography className="text-white-1000" variant={TYPOGRAPHY_VARIANTS.BODY_L} text={text} />
    </div>
  );
};

export default MainTag;
