import React from 'react';

import { SOCIALS } from './constants';

export const SocialList = () => {
  return (
    <div className="flex mt-auto items-center my-5 space-x-6">
      {SOCIALS.map((item) => {
        return (
          <a
            className="hover:opacity-60"
            href={item?.link}
            target="_blank"
            key={item.link}
            rel="noreferrer">
            <img src={item?.image} alt="social image" />
          </a>
        );
      })}
    </div>
  );
};
