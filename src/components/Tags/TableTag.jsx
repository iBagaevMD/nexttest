import React from 'react';
import clsx from 'clsx';

import Typography from 'components/Typography';
import { TYPOGRAPHY_VARIANTS } from 'components/Typography/constants';

const TableTag = ({ text, className, ...props }) => {
  const withArrowUp = text > 0;
  const withArrowDown = text < 0;
  return (
    <div
      className={clsx(
        `flex items-center w-fit rounded-[8px] px-2 py-1.5 ${withArrowUp && 'bg-green-100'}  ${withArrowDown && 'bg-red-100'} ${!withArrowDown && !withArrowUp && 'bg-white-100'}`,
        className
      )}
      {...props}>
      <Typography
        className={`${withArrowUp && 'text-green-1000'}  ${withArrowDown && 'text-red-1000'} ${!withArrowDown && !withArrowUp && 'text-white-1000'}`}
        variant={TYPOGRAPHY_VARIANTS.BODY_S}
        text={`${text}%`}
      />
      {withArrowUp && <img className="h-5 w-5" src="/icons/arrowUpGreen.svg" alt="arrow up" />}
      {withArrowDown && <img className="h-5 w-5" src="/icons/arrowDownRed.svg" alt="arrow down" />}
    </div>
  );
};

export default TableTag;
