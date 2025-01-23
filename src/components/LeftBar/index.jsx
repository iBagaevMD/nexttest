import React from 'react';

import { Menu } from 'components/Menu';
import { SocialList } from 'components/SocialList';

const LeftBar = () => {
  return (
    <div className="z-50 sm:hidden sticky top-0 h-screen flex-shrink-0 w-[280px] flex flex-col justify-between items-center text-white pt-6 px-6 py-10 space-y-9">
      <div className="w-full flex flex-col items-center justify-start">
        <Menu />
      </div>
      <div className="w-full flex flex-col items-center justify-end space-y-8">
        <SocialList />
      </div>
    </div>
  );
};

export default LeftBar;
