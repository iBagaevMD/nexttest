import React from 'react';
import clsx from 'clsx';

import Typography from 'components/Typography';
import { TYPOGRAPHY_VARIANTS } from 'components/Typography/constants';
import Tips from 'components/Tips';

const TextInput = ({
  className,
  title,
  tip,
  min = 1,
  max = 1000000000,
  id = null,
  value,
  handleChange,
  placeholder,
  subtitle,
  unit,
  unitClassName,
  isError,
  onBlur
}) => {
  return (
    <div
      className={clsx(
        `flex flex-col items-start relative justify-center space-y-[10px] w-full`,
        className
      )}>
      <div className="flex items-center">
        <Typography
          className="text-white pl-[24px]"
          text={title}
          variant={TYPOGRAPHY_VARIANTS.HEADER_H4}
        />
        {!!tip && <Tips id={id} text={tip} />}
      </div>
      <div className="relative w-full">
        <input
          inputMode="numeric"
          type="number"
          min={min}
          max={max}
          id={id}
          name={id}
          autoComplete="off"
          value={value}
          className={`bg-transparent text-white rounded-[100px] py-[20px] px-[24px] sm:py-[16px] sm:px-[20px] border ${isError ? 'border-red' : 'border-white-100'} w-full`}
          onChange={(e) => handleChange(e)}
          placeholder={placeholder}
          onBlur={onBlur || undefined}
        />
        {unit && (
          <Typography
            className={`text-white absolute opacity-50 ml-[30px] right-[28px] !mt-0 top-1/2 -translate-y-1/2  ${unitClassName}`}
            variant={TYPOGRAPHY_VARIANTS.BODY_S}
            text={unit}
          />
        )}
      </div>
      {subtitle && (
        <Typography
          className="text-white opacity-50 ml-[30px]"
          variant={TYPOGRAPHY_VARIANTS.CAPTION}
          text={subtitle}
        />
      )}
    </div>
  );
};

export default TextInput;
