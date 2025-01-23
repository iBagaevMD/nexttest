import React, { useRef } from 'react';

import ReactPortal from 'components/Portal';
import Typography from 'components/Typography';
import { useClickOutside } from 'helpers/hooks/useClickOutside';
import { TYPOGRAPHY_VARIANTS } from 'components/Typography/constants';
import { BUTTON_VARIANTS } from 'components/Button/constants';
import Button from 'components/Button';
import { useLogOut } from 'helpers/hooks/useLogOut';
import { useBlurBackground } from 'helpers/hooks/useBlurBackground';

const LogOutModal = ({ isOpened, setIsOpened }) => {
  const ref = useRef(null);
  const { resetBlurBackground } = useBlurBackground();
  const { logOut } = useLogOut();

  const handleCloseModal = () => {
    resetBlurBackground();
    setIsOpened(false);
  };

  useClickOutside(ref, () => {
    handleCloseModal();
  });

  return (
    <ReactPortal isOpen={isOpened}>
      <div
        ref={ref}
        className="flex w-[600px] modal text-white fixed top-0 pt-[36px] left-0 z-[999999] sm:p-8">
        <div className="w-full flex justify-center relative py-[50px] overflow-auto  bg-black-1000 px-[60px] pt-[80px] pb-[48px] rounded-[48px]">
          <div
            onClick={handleCloseModal}
            className="z-[2] cursor-pointer absolute top-[30px] right-[30px] bg-transparent flex items-center justify-center rounded-full w-[44px] h-[44px]">
            <img className="w-[24px] h-[24px]" src="/icons/closeIcon.svg" alt="close icon" />
          </div>

          <img
            className="z-0 absolute top-5 left-1/2 -translate-x-1/2 h-auto"
            src="/icons/gradientBgOrange.png"
            alt=""
          />

          <div className="z-[2] flex flex-col justify-end sm:justify-center sm:px-6 w-[600px]">
            <div className="flex flex-col items-center justify-center space-y-3 mt-[100px] sm:mt-0">
              <Typography variant={TYPOGRAPHY_VARIANTS.HEADER_H2} text="Log out" />
              <Typography
                className={'text-white-500 font-light text-center'}
                variant={TYPOGRAPHY_VARIANTS.BODY_M}
                text="Are you sure you want to log out or switch networks?"
              />
            </div>
            <div className="flex flex-col items-center justify-center mt-4">
              <Button
                onClick={handleCloseModal}
                className="h-[58px] w-full"
                variant={BUTTON_VARIANTS.LARGE}
                text="Cancel"
              />
              <Button
                onClick={logOut}
                className="h-[58px] w-full mt-4"
                variant={BUTTON_VARIANTS.SMALL_WHITE}
                text="Log out"
              />
            </div>
          </div>
        </div>
      </div>
    </ReactPortal>
  );
};

export default LogOutModal;
