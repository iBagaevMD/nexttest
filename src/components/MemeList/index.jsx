import React from 'react';

import Button from 'components/Button';
import { BUTTON_VARIANTS } from 'components/Button/constants';
import { MemeCard } from 'components/MemeCard';

const MemeList = ({ data, onLoadMore, isShowLoadingButton, isLoading }) => {
  const handleButtonClick = (item) => () => {
    let link = null;
    if (item?.raydiumPool) {
      link = `https://www.geckoterminal.com/solana/pools/${item?.raydiumPool}`;
    } else if (item?.pumpfunCurve) {
      link = `https://www.pump.fun/coin/${item?.mint}`;
    }
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
      return;
    }
  };

  if (isLoading) {
    return (
      <React.Fragment>
        <div className="w-full grid grid-cols-4 justify-items-center xl:grid-cols-3 sm:grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-2 sm:gap-y-2">
          {new Array(8).fill({}).map((item, index) => {
            return <MemeCard key={index} cardStyle="w-[254px]" isLoadingMock />;
          })}
        </div>
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
        <div className="w-full grid grid-cols-4 justify-items-center xl:grid-cols-3 sm:grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-2 sm:gap-y-2">
          {data?.result?.map((item, index) => {
            return (
              <MemeCard
                cardStyle="w-[254px]"
                key={index}
                {...item}
                buttonText="View the token"
                buttonVariant={BUTTON_VARIANTS.LARGE_WHITE_100}
                buttonHandler={handleButtonClick(item)}
                isShowButton={!!item?.raydiumPool?.length || !!item?.pumpfunCurve?.length}
              />
            );
          })}
        </div>
        {isShowLoadingButton && (
          <Button
            className="mt-3"
            onClick={onLoadMore}
            variant={BUTTON_VARIANTS.TABLE_MORE}
            text="More"
          />
        )}
    </React.Fragment>
  );
};

export default MemeList;
