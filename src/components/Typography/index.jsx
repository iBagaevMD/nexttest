import React from 'react';
import clsx from 'clsx';

import { TYPOGRAPHY_VARIANTS } from './constants';
import Tips from 'src/components/Tips';

const TYPOGRAPHY_VARIANT = {
  [TYPOGRAPHY_VARIANTS.HEADER_H1]:
    'text-[60px] leading-[65px] font-semibold sm:text-[32px] sm:leading-[36px]',
  [TYPOGRAPHY_VARIANTS.HEADER_H2]:
    'text-[40px] leading-[48px] font-semibold sm:text-[24px] sm:leading-[28px]',
  [TYPOGRAPHY_VARIANTS.HEADER_H3]:
    'text-[24px] leading-normal font-semibold sm:text-[20px] sm:leading-[24px]',
  [TYPOGRAPHY_VARIANTS.HEADER_H4]:
    'text-[20px] leading-[18px] font-semibold sm:text-[16px] sm:leading-[14px]',
  [TYPOGRAPHY_VARIANTS.BODY_H2]:
    'text-[40px] leading-[48px] font-semibold sm:text-[24px] sm:leading-[28px]',
  [TYPOGRAPHY_VARIANTS.BODY_L]:
    'text-[20px] leading-[28px] font-normal sm:text-[16px] sm:leading-[24px] sm:font-light',
  [TYPOGRAPHY_VARIANTS.BODY_X]:
    'text-[16px] leading-[20px] font-normal sm:text-[14px] sm:leading-[20px]',
  [TYPOGRAPHY_VARIANTS.BODY_M]:
    'text-[16px] leading-[20px] font-normal sm:text-[14px] sm:leading-[20px]',
  [TYPOGRAPHY_VARIANTS.BODY_S]:
    'text-[14px] leading-[18px] font-normal sm:text-[12px] sm:leading-[14px]',
  [TYPOGRAPHY_VARIANTS.XS]: 'text-[12px] leading-normal font-normal',
  [TYPOGRAPHY_VARIANTS.BODY_XS]: 'text-[12px] leading-normal font-light uppercase',
  [TYPOGRAPHY_VARIANTS.BUTTON_L]:
    'text-[20px] leading-normal font-semibold sm:text-[16px] sm:font-medium',
  [TYPOGRAPHY_VARIANTS.BUTTON_M]: 'text-[16px] leading-normal font-semibold sm:text-[16px]',
  [TYPOGRAPHY_VARIANTS.CAPTION]: 'text-[12px] leading-[16px] font-light'
};

const Typography = ({
  type = 'p',
  className,
  text,
  variant = TYPOGRAPHY_VARIANTS.BODY_S,
  id,
  tip,
  ...props
}) => {
  if (type === 'p') {
    return tip ? (
      <div className="flex">
        <p className={clsx(className, TYPOGRAPHY_VARIANT[variant])} {...props}>
          {text}
        </p>
        <Tips id={id} text={tip} />
      </div>
    ) : (
      <p className={clsx(className, TYPOGRAPHY_VARIANT[variant])} {...props}>
        {text}
      </p>
    );
  } else if (type === 'h1') {
    return tip ? (
      <div className="flex">
        <h1 className={clsx(className, TYPOGRAPHY_VARIANT[variant])} {...props}>
          {text}
        </h1>
        <Tips id={id} text={tip} />
      </div>
    ) : (
      <h1 className={clsx(className, TYPOGRAPHY_VARIANT[variant])} {...props}>
        {text}
      </h1>
    );
  } else if (type === 'h2') {
    return tip ? (
      <div className="flex">
        <h2 className={clsx(className, TYPOGRAPHY_VARIANT[variant])} {...props}>
          {text}
        </h2>
        <Tips id={id} text={tip} />
      </div>
    ) : (
      <h2 className={clsx(className, TYPOGRAPHY_VARIANT[variant])} {...props}>
        {text}
      </h2>
    );
  }
};

export default Typography;
