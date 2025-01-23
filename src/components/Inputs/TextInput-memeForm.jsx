import React from 'react';
import clsx from 'clsx';

import Typography from 'components/Typography';
import { TYPOGRAPHY_VARIANTS } from 'components/Typography/constants';
import Tips from 'components/Tips';

const TextInput = ({
  className,
  title,
  maxLength = 256,
  minLength = 0,
  id = null,
  value,
  handleChange,
  placeholder,
  disabled,
  tip,
  onBlur,
  iconSrc
}) => {
  return (
    <div
      className={clsx(`flex flex-col items-start justify-center space-y-[10px] w-full`, className)}>
      <div className="flex items-center">
        <Typography className="text-white-500" text={title} variant={TYPOGRAPHY_VARIANTS.BODY_M} />
        {!!tip && <Tips id={id} text={tip} />}
      </div>
      {iconSrc && <img className="absolute ml-[20px] opacity-50" src={iconSrc} alt="input icon" />}
      <input
        disabled={disabled}
        maxLength={maxLength}
        minLength={minLength}
        id={id}
        name={id}
        autoComplete="off"
        value={value}
        className={`${iconSrc && '!pl-[60px]'} text-[24px] font-semibold bg-transparent focus:bg-transparent hover:bg-transparent text-white w-full placeholder:text-white-500 ${disabled && 'text-white-200'}`}
        onChange={(e) => handleChange(e)}
        onBlur={onBlur || undefined}
        placeholder={placeholder}
      />
    </div>
  );
};

export default TextInput;
