import React from 'react';
import Link from 'next/link';
import { Menu } from 'components/Menu';
import { SocialList } from 'components/SocialList';

const LeftBar = () => {
  return (
    <div className="z-50 sm:hidden sticky top-0 h-[100vh] flex-shrink-0 w-[280px] flex flex-col justify-between items-center text-white pt-6 px-6 py-10 space-y-9">
      <Link className='flex flex-shrink-0 items-center hover:opacity-80' href="/">
        <img className="h-[35px] sm:h-[32px]" src="/logoWithText.svg" alt="header logo" />
      </Link>
      <div className="flex-1 flex flex-col justify-between items-center w-full">
        <div className="w-full flex flex-col items-center justify-start !mt-0">
          <Menu />
        </div>
        <div className="w-full flex flex-col items-center justify-end space-y-8">
          <SocialList />
        </div>
      </div>
    </div>
  );
};

export default LeftBar;
