import React, { useRef, useState } from 'react';
import clsx from 'clsx';

import Typography from 'components/Typography';
import { TYPOGRAPHY_VARIANTS } from 'components/Typography/constants';
import { useClickOutside } from 'helpers/hooks/useClickOutside';
import Tips from 'components/Tips';

const SelectInput = ({
  className,
  title,
  id = null,
  value,
  onOptionsClick,
  options,
  disabled,
  placeholder,
  tip
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  const handleCloseOptions = () => {
    setIsOpen((prev) => !prev);
  };

  useClickOutside(ref, () => {
    setIsOpen(false);
  });

  return (
    <div
      ref={ref}
      onClick={handleCloseOptions}
      className={clsx(`flex flex-col items-start justify-center space-y-[10px] w-full`, className)}>
      <div className="flex items-center">
        <Typography
          className="text-white pl-[24px]"
          text={title}
          variant={TYPOGRAPHY_VARIANTS.HEADER_H4}
        />
        {!!tip && <Tips id={id} text={tip} />}
      </div>

      <div
        id={id}
        className={`${value ? 'text-white' : 'text-white-300'} overflow-hidden text-ellipsis text-nowrap relative bg-transparent text-white rounded-[100px] min-h-[58px] py-[20px] px-[24px] sm:py-[16px] sm:px-[20px] border border-white-100 w-full ${disabled && 'text-white-200'}`}>
        <Typography
          className={`${value ? 'text-white' : 'text-white-300'}`}
          variant={TYPOGRAPHY_VARIANTS.BODY_S}
          text={value || placeholder}
        />
        <img
          className={`h-5 w-5 absolute right-[10px] top-[22px] ${isOpen && 'rotate-180'}`}
          src="/icons/arrowUp.svg"
          alt="arrow up"
        />
      </div>
      {isOpen && (
        <div className="z-20 absolute top-[400px] sm:top-[320px] sm:w-[96%] rounded-[24px] opacityBackgroundBlurClass">
          {options.map((option, index) => (
            <div
              onClick={() => onOptionsClick({ ...option })}
              key={index}
              className="cursor-pointer px-4 py-3 text-white-300 hover:text-white">
              <div>{option.name}</div>
              <div className="overflow-hidden text-ellipsis">{option.mint}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SelectInput;
