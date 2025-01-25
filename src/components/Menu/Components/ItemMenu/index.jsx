import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import Typography from 'components/Typography';
import { TYPOGRAPHY_VARIANTS } from 'components/Typography/constants';
import { useBlurBackground } from 'helpers/hooks/useBlurBackground';
import CreateMemeModal from 'components/Modals/CreateMemeModal';
import LogOutModal from 'components/Modals/LogOutModal';

export const ItemMenu = ({ icon, title = '', link }) => {
  const [isOpenMemeModal, setIsOpenMemeModal] = useState(false);
  const [isOpenLogOutModal, setIsOpenLogOutModal] = useState(false);

  const { route } = useRouter();
  const { setBlurBackground } = useBlurBackground();

  const isCreateMemecoin = link === '/solana/create' && route.includes('solana');
  const isLogOut = link === '/logout';

  const onClickHandler = () => {
    if (isCreateMemecoin) {
      setBlurBackground();
      setIsOpenMemeModal(true);
    }

    if (isLogOut) {
      setBlurBackground();
      setIsOpenLogOutModal(true);
    }
  };

  const isActive = route.includes(link);

  return (
    <React.Fragment>
      <Link
        onClick={onClickHandler}
        href={isCreateMemecoin || isLogOut ? '' : link}
        className={`${isLogOut && 'hidden sm:flex'} flex mt-1 items-center justify-start px-4 py-3 rounded-2xl space-x-3 ${isActive ? 'bg-gradient-to-r from-orange to-red' : ''}`}>
        <img src={icon} className={`w-6 h-6 ${isActive ? '' : 'opacity-30'}`} alt="" />
        <Typography
          className={`${isActive ? 'text-white' : 'text-white-300'}`}
          variant={TYPOGRAPHY_VARIANTS.BODY_M}
          text={title}
        />
      </Link>
      {isOpenMemeModal && (
        <CreateMemeModal isOpened={isOpenMemeModal} setIsOpened={setIsOpenMemeModal} />
      )}
      {isOpenLogOutModal && (
        <LogOutModal isOpened={isOpenLogOutModal} setIsOpened={setIsOpenLogOutModal} />
      )}
    </React.Fragment>
  );
};
