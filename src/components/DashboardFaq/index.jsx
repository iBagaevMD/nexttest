import React from 'react';

import Typography from 'components/Typography';
import { TYPOGRAPHY_VARIANTS } from 'components/Typography/constants';
import { Accordion } from 'react-accessible-accordion';
import { INFO } from 'components/Faq/constants';
import FaqItem from 'components/Faq/FaqItem';

const DashboardFaq = () => {
  return (
    <div className="flex justify-center sm:w-full text-white h-full mt-16 sm:mt-6">
      <div className="flex flex-col sm:px-6">
        <div className="flex flex-col items-center space-y-6 w-[460px] sm:w-full">
          <Typography className="text-white" text="FAQ" variant={TYPOGRAPHY_VARIANTS.HEADER_H2} />
          <Accordion allowZeroExpanded allowMultipleExpanded className="w-full space-y-3 ">
            {INFO.map((item) => {
              return <FaqItem {...item} key={item.title} />;
            })}
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default DashboardFaq;
