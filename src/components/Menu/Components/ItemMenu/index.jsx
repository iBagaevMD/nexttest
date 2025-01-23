import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import Typography from 'components/Typography';
import LogOutModal from 'components/Modals/LogOutModal';
import { TYPOGRAPHY_VARIANTS } from 'components/Typography/constants';
import { useBlurBackground } from 'helpers/hooks/useBlurBackground';
import CreateMemeModal from 'components/Modals/CreateMemeModal';

export const ItemMenu = ({ icon, title = '', link }) => {
  const { route } = useRouter();
  const [isOpenLogOutModal, setIsOpenLogOutModal] = useState(false);
  const [isOpenMemeModal, setIsOpenMemeModal] = useState(false);
  const { setBlurBackground } = useBlurBackground();

  const isLogOut = link === '/logout';
  const isCreateMemecoin = link === '/createToken' && route.includes('solana');

  const onClickHandler = () => {
    if (isLogOut) {
      setBlurBackground();
      setIsOpenLogOutModal(true);
    }

    if (isCreateMemecoin) {
      setBlurBackground();
      setIsOpenMemeModal(true);
    }
  };

  const isActive = route.includes(link);
  return (
    <React.Fragment>
      <Link
        onClick={onClickHandler}
        href={isLogOut || isCreateMemecoin ? '' : link}
        className={`${isLogOut && 'hidden sm:flex'} flex mt-1 items-center justify-start px-4 py-3 rounded-2xl space-x-3 ${isActive ? 'bg-gradient-to-r from-orange to-red' : ''}`}>
        <img src={icon} className={`w-6 h-6 ${isActive ? '' : 'opacity-30'}`} alt="" />
        <Typography
          className={`${isActive ? 'text-white' : 'text-white-300'}`}
          variant={TYPOGRAPHY_VARIANTS.BODY_M}
          text={title}
        />
      </Link>
      {isOpenLogOutModal && (
        <LogOutModal isOpened={isOpenLogOutModal} setIsOpened={setIsOpenLogOutModal} />
      )}
      {isOpenMemeModal && (
        <CreateMemeModal isOpened={isOpenMemeModal} setIsOpened={setIsOpenMemeModal} />
      )}
    </React.Fragment>
  );
};
