import React, { useCallback, useEffect, useRef, useState } from 'react';

import { MemeCard } from 'components/MemeCard';
import Typography from 'components/Typography';
import { TYPOGRAPHY_VARIANTS } from 'components/Typography/constants';
import { useRequest } from 'helpers/hooks/useRequest';
import { SolanaRepository } from 'connectors/repositories/solana';
import { PAGE_SIZE } from './constants';
import Button from 'components/Button';
import { BUTTON_VARIANTS } from 'components/Button/constants';

export const MemeList = () => {
  const currentPage = useRef(0);
  const [queryParams, setQueryParams] = useState(`page=${currentPage.current}&size=${PAGE_SIZE}`);
  const [isShowLoadingButton, setIsShowLoadingButton] = useState(true);

  const requestMapper = (prev, data) => {
    if (data?.result?.length < PAGE_SIZE) setIsShowLoadingButton(false);
    if (Object.keys(prev)?.length) {
      return { result: [...prev.result, ...data.result] };
    }

    return data;
  };

  const { data, call } = useRequest(SolanaRepository.getTokens, [queryParams], requestMapper);

  useEffect(() => {
    call();
  }, [queryParams]);

  const onLoadMore = useCallback(async () => {
    currentPage.current += 1;
    setQueryParams(`page=${currentPage.current}&size=${PAGE_SIZE}`);
  }, []);

  const handleButtonClick = (mint) => () => {
    window.open(
      `https://www.geckoterminal.com/solana/tokens/${mint}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <div className="pt-[120px] sm:pt-[80px] pb-[64px] sm:pb-[80px] flex flex-col items-center justify-center w-full">
      <div className="flex flex-col items-center mb-[60px] sm:nb-[24px] w-full">
        <div className="text-center text-white flex flex-col items-center justify-center max-w-[686px] w-full">
          <Typography
            className="relative z-10"
            text="Generation history"
            variant={TYPOGRAPHY_VARIANTS.HEADER_H1}
          />
        </div>
        <Typography
          className="!mt-4 sm:!mt-2 text-center opacity-50 text-white-1000 !font-light max-w-[750px] sm:max-w-[90%] w-full"
          text="People vote - we launch"
          variant={TYPOGRAPHY_VARIANTS.BODY_L}
        />
      </div>
      <div className="w-full grid grid-cols-4 justify-items-center xl:grid-cols-3 sm:grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-2 sm:gap-y-2">
        {data?.result?.map((item, index) => {
          return <MemeCard key={index} {...item} isShowButton={false} />;
        })}
      </div>
      {isShowLoadingButton && (
        <Button
          className="mt-6"
          onClick={onLoadMore}
          variant={BUTTON_VARIANTS.TABLE_MORE}
          text="More"
        />
      )}
    </div>
  );
};
