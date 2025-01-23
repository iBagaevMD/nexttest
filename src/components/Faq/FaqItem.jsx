import React, { useState } from 'react';
import {
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel
} from 'react-accessible-accordion';
import 'react-accessible-accordion/dist/fancy-example.css';

import Typography from 'components/Typography';
import { TYPOGRAPHY_VARIANTS } from '../Typography/constants';

const FaqItem = ({ title, desc }) => {
  const [isActive, setIsActive] = useState(false);

  return (
    <AccordionItem className="border-[1px] border-white-100 rounded-[24px] backdrop-blur-xl sm:w-full sm:rounded-2xl ">
      <AccordionItemHeading className="w-full">
        <AccordionItemButton className="flex items-center justify-between ">
          <div
            onClick={() => setIsActive(!isActive)}
            className="cursor-pointer flex items-center justify-between w-full space-x-2.5 p-6 sm:p-4">
            <Typography className="text-left" text={title} variant={TYPOGRAPHY_VARIANTS.BODY_M} />
            <img
              alt="open or close accordion image"
              className={`w-[24px] h-[24px] sm:w-[20px] sm:h-[20px] transition-all ease-out`}
              src={isActive ? '/icons/accordionClose.svg' : '/icons/accordionOpen.svg'}
            />
          </div>
        </AccordionItemButton>
      </AccordionItemHeading>
      <AccordionItemPanel className="accordion__panel px-6 pb-6 sm:pb-4 sm:px-4">
        <Typography className="text-white-500" text={desc} variant={TYPOGRAPHY_VARIANTS.BODY_S} />
      </AccordionItemPanel>
    </AccordionItem>
  );
};

export default FaqItem;
