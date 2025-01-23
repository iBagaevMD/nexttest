import React, { useEffect } from 'react';

import { Menu } from 'components/Menu';

export const Burger = ({ isOpened = false }) => {
  useEffect(() => {
    if (isOpened) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpened]);

  return (
    <div
      className={`bg-[#080808] z-[999] hidden sm:flex flex-col justify-between items-center w-full h-screen fixed top-[72px] left-0 px-4 ${isOpened ? 'translate-x-0' : 'translate-x-[-120%]'}`}>
      <Menu />
    </div>
  );
};
