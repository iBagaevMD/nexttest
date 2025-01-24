import React from 'react';
import clsx from 'clsx';

import { BUTTON_VARIANTS } from './constants';

const BUTTON_VARIANT = {
  [BUTTON_VARIANTS.LARGE]:
    'border border-transparent btn-gradient px-[32px] py-[16px] sm:px-6 rounded-[100px] flex items-center justify-center text-white font-semibold text-[20px] leading-[24px] sm:text-[16px] sm:leading-[19.5px]',
  [BUTTON_VARIANTS.LARGE_TRANSPARENT]:
    'border border-transparent px-[32px] py-[16px] sm:px-6 rounded-[100px] flex items-center justify-center text-white font-semibold text-[20px] leading-[24px] sm:text-[16px] sm:leading-[19.5px]',
  [BUTTON_VARIANTS.LARGE_WHITE]:
    'border border-white px-[32px] py-[16px] sm:px-6 rounded-[100px] flex items-center justify-center text-white font-semibold text-[20px] leading-[24px] sm:text-[14px] sm:leading-[19.5px]',
  [BUTTON_VARIANTS.LARGE_WHITE_100]:
    'border border-transparent px-[32px] py-[16px] bg-white-100 sm:px-6 sm:py-3 rounded-[100px] flex items-center justify-center text-white font-semibold text-[20px] leading-[24px] sm:text-[14px] sm:leading-[19.5px]',
  [BUTTON_VARIANTS.SMALL_WHITE]:
    'border border-white flex items-center justify-center rounded-[100px] p-4 text-white text-4 font-medium bg-black-1000 hover:border-white-100 active:brightness-110',
  [BUTTON_VARIANTS.TABLE_MORE]:
    'px-[32px] py-[16px] rounded-2xl flex items-center justify-center text-white text-[14px] leading-[18px] sm:text-[16px] sm:leading-[19.5px] w-full border border-white-100'
};

const Button = ({ text, isLoading, variant, className, isDisabled, type, ...props }) => {
  return (
    <button
      disabled={isDisabled}
      type={type}
      className={clsx(
        className,
        BUTTON_VARIANT[variant],
        `${isDisabled && 'opacity-50 border border-white-300'} hover:opacity-60`
      )}
      {...props}>
      {isLoading ? (
        <img className="animate-spin" src="/icons/loadingIcon.png" alt="loading button icon" />
      ) : (
        <span>{text}</span>
      )}
    </button>
  );
};

export default Button;
