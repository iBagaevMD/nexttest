import React from 'react';
import clsx from 'clsx';
import copyToClipBoard from 'copy-to-clipboard';

import Typography from 'components/Typography';
import { TYPOGRAPHY_VARIANTS } from 'components/Typography/constants';
import Tips from 'components/Tips';
import { useNotifications } from 'contexts/notifications';

const CopyInput = ({ className = '', title = '', id = null, value, tip = null }) => {
  const { showSuccessNotification } = useNotifications();

  const onCopyHandler = () => {
    copyToClipBoard(value);
    showSuccessNotification(`${title} \"${value}\" copied to clipboard!`);
  };

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
      <div className="relative w-full">
        <input
          value={value}
          className={`bg-transparent text-white rounded-[100px] py-[20px] px-[24px] sm:py-[16px] sm:px-[20px] border border-white-100 w-full`}
          readOnly
        />
        <button onClick={onCopyHandler} className="absolute right-[24px] top-1/2 -translate-y-1/2">
          <img className="w-6 h-6" src="/icons/copyIcon.svg" alt="" />
        </button>
      </div>
    </div>
  );
};

export default CopyInput;
