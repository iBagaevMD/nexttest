import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';

import Typography from 'components/Typography';
import { TYPOGRAPHY_VARIANTS } from 'components/Typography/constants';
import { autoResizeTextarea } from 'helpers/autoResizeTextare';
import Tips from 'components/Tips';

const TextAreaInput = ({
  className,
  title,
  maxLength = 256,
  id = null,
  value,
  handleChange,
  placeholder,
  tip
}) => {
  const ref = useRef();

  useEffect(() => {
    // Расширяет textarea в зависимости от введенного количества символов
    const autoResize = () => autoResizeTextarea(ref.current);
    ref?.current?.addEventListener('input', autoResize);

    return () => ref?.current?.removeEventListener('input', autoResize);
  }, []);

  return (
    <div
      className={clsx(`flex flex-col items-start justify-center space-y-[10px] w-full`, className)}>
      <div className="flex items-center">
        <Typography
          className="text-white pl-[24px]"
          text={title}
          variant={TYPOGRAPHY_VARIANTS.HEADER_H4}
        />
        {!!tip && <Tips id={id} text={tip} />}
      </div>

      <textarea
        ref={ref}
        maxLength={maxLength}
        id={id}
        name={id}
        autoComplete="off"
        value={value}
        className="bg-transparent text-white rounded-[50px] resize-none py-[20px] px-[24px] sm:py-[16px] sm:px-[20px] border border-white-100 w-full overflow-hidden"
        onChange={(e) => handleChange(e)}
        placeholder={placeholder}
      />
    </div>
  );
};

export default TextAreaInput;
