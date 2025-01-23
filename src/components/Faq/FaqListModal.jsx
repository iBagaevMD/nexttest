import React, { useRef } from 'react';
import { Accordion } from 'react-accessible-accordion';
import 'react-accessible-accordion/dist/fancy-example.css';

import FaqItem from './FaqItem';
import { INFO } from './constants';
import ReactPortal from 'components/Portal';
import Typography from 'components/Typography';
import { TYPOGRAPHY_VARIANTS } from '../Typography/constants';
import { useClickOutside } from 'helpers/hooks/useClickOutside';
import { useBlurBackground } from 'helpers/hooks/useBlurBackground';

const FaqListModal = ({ isOpened, setOpened }) => {
  const ref = useRef(null);
  const { resetBlurBackground } = useBlurBackground();

  const onCloseFq = () => {
    resetBlurBackground();
    setOpened(false);
  };

  useClickOutside(ref, () => {
    onCloseFq();
  });

  return (
    <ReactPortal isOpen={isOpened}>
      <div
        ref={ref}
        className="flex w-[600px] sm:w-full modal text-white fixed top-0 pt-[36px] left-0 h-full z-[999999]">
        <div className="w-full h-full flex items-start justify-center relative py-[50px] overflow-auto  bg-black-1000 rounded-[48px] sm:rounded-tl-[32px] sm:rounded-tr-[32px]">
          <div
            onClick={onCloseFq}
            className="absolute cursor-pointer top-[30px] right-[30px] bg-white-100 flex items-center justify-center rounded-full w-[44px] h-[44px]">
            <img className="w-[24px] h-[24px]" src="/closeIcon.svg" alt="close icon" />
          </div>

          <div className="flex flex-col sm:px-6">
            <div className="flex flex-col items-center space-y-6 w-[460px] sm:w-full">
              <Typography
                className="text-white"
                text="FAQ"
                variant={TYPOGRAPHY_VARIANTS.HEADER_H2}
              />
              <Accordion allowZeroExpanded allowMultipleExpanded className="w-full space-y-3">
                {INFO.map((item) => {
                  return <FaqItem {...item} key={item.title} />;
                })}
              </Accordion>
            </div>
          </div>
        </div>
      </div>
    </ReactPortal>
  );
};

export default FaqListModal;
