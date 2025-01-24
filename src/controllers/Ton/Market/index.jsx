import React, { useState, useCallback, useEffect, useRef } from 'react';

import { useRequest } from 'helpers/hooks/useRequest';
import { PAGE_SIZE } from './constants';
import { TonRepository } from 'connectors/repositories/ton';
import TonMemeList from 'components/TonMemeList';

const MarketController = () => {
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

  const { data, call, isLoading } = useRequest(
    TonRepository.getTokens,
    [queryParams],
    requestMapper
  );

  useEffect(() => {
    call();
  }, [queryParams]);

  const onLoadMore = useCallback(async () => {
    currentPage.current += 1;
    setQueryParams(`page=${currentPage.current}&size=${PAGE_SIZE}`);
  }, []);

  return (
    <TonMemeList
      data={data}
      onLoadMore={onLoadMore}
      isShowLoadingButton={isShowLoadingButton}
      isLoading={isLoading}
    />
  );
};

export default MarketController;
