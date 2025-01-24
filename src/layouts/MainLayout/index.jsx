import React from 'react';
import Image from 'next/image';

import HeaderMain from 'components/Headers';
import Footer from 'components/Footer';

export const MainLayout = ({ isAvailable = true, pageType = '', children }) => {
  const disabledContent = () => {
    return (
      <div className="flex-1 w-full h-full text-[22px] text-white font-bold">
        <span>BLOGS 404</span>
      </div>
    );
  };

  return (
    <React.Fragment>
      <main
        id="blurId"
        className="min-h-screen relative pt-[92px] flex flex-col items-center justify-center bg-[#080808] overflow-x-hidden px-2">
        {pageType !== 'blogPage' && (
          <Image
            priority={true}
            className="absolute top-[2%] sm:top-[1%] sm:left-[1%] left-[5%] z-[0]"
            src="/main-shadow.png"
            alt=""
            quality={25}
            height={900}
            width={900}
            loading="eager"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        )}
        <HeaderMain />
        <div className="max-w-[1116px] w-full flex flex-col items-center justify-start z-[1] space-y-[120px] sm:space-y-[80px]">
          {isAvailable ? children : disabledContent()}
        </div>
        <Footer />
      </main>
    </React.Fragment>
  );
};
