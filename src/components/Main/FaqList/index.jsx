import React from 'react';
import { Accordion } from 'react-accessible-accordion';

import FaqItem from 'components/Faq/FaqItem';
import Typography from 'components/Typography';
import { TYPOGRAPHY_VARIANTS } from 'components/Typography/constants';
import { INFO } from 'components/Faq/constants';

export const FaqList = () => {
  return (
    <div className="flex flex-col w-full text-white">
      <div className="flex items-center justify-center w-full mb-[60px]">
        <Typography variant={TYPOGRAPHY_VARIANTS.HEADER_H2} text="FAQ" />
      </div>
      <Accordion allowZeroExpanded allowMultipleExpanded className="w-full space-y-3 ">
        {INFO.map((item) => {
          return <FaqItem {...item} key={item.title} />;
        })}
      </Accordion>
    </div>
  );
};
