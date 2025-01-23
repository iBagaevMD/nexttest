import React from 'react';
import { Tooltip } from 'react-tooltip';

import Typography from 'src/components/Typography';
import { TYPOGRAPHY_VARIANTS } from 'src/components/Typography/constants';

const Tips = ({ id, text = '1234' }) => {
  return (
    <>
      <Tooltip
        style={{
          backgroundColor: '#212121',
          color: '#ffffff',
          maxWidth: '263px',
          borderRadius: '16px',
          padding: '12px 16px'
        }}
        id={id}
        anchorSelect={`.tooltip-trigger-${id}`}
        place="top"
        render={() => <Typography variant={TYPOGRAPHY_VARIANTS.BODY_S} text={text} />}></Tooltip>
      <div className="flex items-center justify-center px-1">
        <img
          className={`flex-shrink-0 tooltip-trigger-${id} w-6 h-6 opacity-50 hover:opacity-100 transition-all cursor-pointer`}
          src="/icons/tooltip-white.svg"
          alt=""
        />
      </div>
    </>
  );
};

export default Tips;
