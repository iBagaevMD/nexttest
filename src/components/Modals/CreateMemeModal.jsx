import React, { useRef } from 'react';
import { useDispatch } from 'react-redux';

import ReactPortal from 'components/Portal';
import { useClickOutside } from 'helpers/hooks/useClickOutside';
import { useBlurBackground } from 'helpers/hooks/useBlurBackground';
import { MemeForm } from 'components/MemeForm';
import { removeCreateMemeData, setGenerateCoinFromHomePage } from 'store/userSlice';

const CreateMemeModal = ({ isOpened, setIsOpened }) => {
  const ref = useRef(null);
  const dispatch = useDispatch();
  const { resetBlurBackground } = useBlurBackground();

  const handleCloseModal = () => {
    resetBlurBackground();
    setIsOpened(false);
    dispatch(removeCreateMemeData());
    dispatch(setGenerateCoinFromHomePage(false));
  };

  useClickOutside(ref, () => {
    handleCloseModal();
  });

  return (
    <ReactPortal isOpen={isOpened}>
      <div
        ref={ref}
        className="flex w-[1120px] sm:w-full modal text-white fixed top-0 pt-[36px] left-0 z-[999999] sm:p-8">
        <MemeForm handleCloseModal={handleCloseModal} />
      </div>
    </ReactPortal>
  );
};

export default CreateMemeModal;
