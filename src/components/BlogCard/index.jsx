import React from 'react';
import Link from 'next/link';

import Typography from 'components/Typography';
import { TYPOGRAPHY_VARIANTS } from 'components/Typography/constants';

export const BlogCard = ({ url, info }) => {
  const styleBg = {
    backgroundImage: `url(${info.imgUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  };

  const fullUrl = `/blog/${url || info?.url}`;

  return (
    <Link
      href={fullUrl}
      className="sm:flex-shrink-0 w-full max-w-[362px] sm:w-[320px] h-[420px] flex-1 flex flex-col items-start space-y-6 p-5 rounded-[32px] bg-white-10 border border-solid border-white-100">
      <div style={styleBg} className="flex-shrink-0 rounded-[12px] h-[220px] w-full"></div>
      <div className="flex-1 flex flex-col text-white space-y-2">
        <Typography
          className="text-[20px] leading-[24px]"
          variant={TYPOGRAPHY_VARIANTS.HEADER_H4}
          text={info.title}
        />
        <div className="flex flex-col flex-1 opacity-50 ">
          {info.desc.map((item, itemIndex) => {
            return (
              <Typography
                className="font-light leading-[140%] text-ellipsis overflow-hidden"
                variant={TYPOGRAPHY_VARIANTS.BODY_S}
                text={item}
                key={itemIndex}
              />
            );
          })}
        </div>
      </div>
    </Link>
  );
};
