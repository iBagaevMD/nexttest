import React from 'react';
import clsx from 'clsx';

import { TYPOGRAPHY_VARIANTS } from 'components/Typography/constants';
import Typography from 'components/Typography';

const Radio = ({
  text,
  className,
  onClick,
  title,
  subText = '',
  id,
  options = [],
  value,
  ...props
}) => {
  const btnContent = (item, subText, isActive, icon) => {
    return (
      <div className="rounded-[100px] px-[31px] py-4 bg-[#0B0B0B] flex items-center justify-center">
        {icon && <img className="w-[20px] h-[20px] rounded-[100px]" src={icon} alt="radio icon" />}
        <span className={`${!isActive && 'opacity-[0.5]'} text-white ml-2`}>
          {item}
          {subText}
        </span>
      </div>
    );
  };

  return (
    <div
      className={clsx(`flex flex-col items-start justify-center space-y-[12px] w-full`, className)}>
      <Typography
        className="text-white pl-[24px]"
        text={title}
        variant={TYPOGRAPHY_VARIANTS.HEADER_H4}
      />
      <div className="flex max-w-[460px] bg-[#0B0B0B] rounded-[100px] sm:w-full">
        {options.map((item) => {
          const isActive = item.value === value;
          return (
            <button
              id={id}
              name={id}
              onClick={() =>
                onClick({
                  target: {
                    name: id,
                    value: item.value
                  }
                })
              }
              key={item.value}
              className="rounded-[100px] w-[224px] sm:w-full flex flex-1 items-center justify-center"
              {...props}>
              {isActive ? (
                <div className="w-full h-full btn-gradient rounded-[100px] p-[1px]">
                  {btnContent(item.value, subText, isActive, item.icon)}
                </div>
              ) : (
                btnContent(item.value, subText, isActive, item.icon)
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Radio;
