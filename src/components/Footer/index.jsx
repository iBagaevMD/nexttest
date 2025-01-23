import React from 'react';

import Typography from 'components/Typography';
import { SocialList } from 'components/SocialList';
import { TYPOGRAPHY_VARIANTS } from 'components/Typography/constants';

const Footer = () => {
  return (
    <React.Fragment>
      <div className="bg-black-1000 p-5 w-full flex flex-col items-center justify-center px-[40px]">
        <div className=" mt-[40px] mb-[24px] flex flex-col text-center justify-center items-center">
          <Typography
            style={{ lineHeight: '2rem' }}
            className="text-white"
            text="Need help?"
            variant={TYPOGRAPHY_VARIANTS.HEADER_H3}
          />
          <Typography
            style={{ lineHeight: '2rem' }}
            className="text-white"
            text="We are here for you"
            variant={TYPOGRAPHY_VARIANTS.HEADER_H3}
          />
        </div>
        <div className="flex items-center justify-center space-x-4">
          <a
            href="https://t.me/suppport_rl"
            target="_blank"
            className="btn-gradient flex items-center justify-center border border-white-200 p-[0.5px] rounded-[100px] min-w-[62px]"
            rel="noreferrer">
            <div className="w-full h-full bg-black-1000 rounded-[100px] py-2 px-3">
              <Typography
                className="text-white"
                text="Support"
                variant={TYPOGRAPHY_VARIANTS.BUTTON_L}
              />
            </div>
          </a>
          {/* <div
            onClick={onOpenFaq}
            className="cursor-pointer flex items-center justify-center border border-white rounded-[100px] py-2 px-3 min-w-[62px]">
            <Typography className="text-white" text="Faq" variant={TYPOGRAPHY_VARIANTS.BUTTON_L} />
          </div> */}
        </div>
        <div className="mt-10">
          <SocialList />
        </div>
      </div>
      {/* {isOpenedFaq && <FaqListModal setOpened={setIsOpenedFaq} isOpened={isOpenedFaq} />} */}
    </React.Fragment>
  );
};

export default Footer;
