import React from 'react';

import { ItemMenu } from '../ItemMenu';
import Typography from 'components/Typography';
import { TYPOGRAPHY_VARIANTS } from 'components/Typography/constants';

export const GroupMenu = ({ groupTitle = '', list }) => {
  return (
    <div className="flex flex-col w-full">
      <Typography
        className="text-white-500 pl-4"
        text={groupTitle}
        variant={TYPOGRAPHY_VARIANTS.BODY_XS}
      />
      <div className="w-full flex flex-col">
        {list?.map((item, itemIndex) => (
          <ItemMenu {...item} key={itemIndex} />
        ))}
      </div>
    </div>
  );
};
