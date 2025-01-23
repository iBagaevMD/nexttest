import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useRequest } from 'helpers/hooks/useRequest';
import { useWallet } from 'contexts/wallet';
import { UserRepository } from 'connectors/repositories/user';
import { PAGE_SIZE } from './constants';
import { getIsNeedUpdateMemes } from 'store/userSlice/selectors';
import { setIsNeedUpdateMemes } from 'store/userSlice';
import MemeList from 'components/MemeList';

const TokensController = () => {
  const isNeedMapper = useRef(true);
  const dispatch = useDispatch();
  const { userAddress } = useWallet();
  const currentPage = useRef(0);
  const [queryParams, setQueryParams] = useState(`page=${currentPage.current}&size=${PAGE_SIZE}`);
  const [isShowLoadingButton, setIsShowLoadingButton] = useState(true);
  const isNeedUpdateMemes = useSelector(getIsNeedUpdateMemes);

  const requestMapper = (prev, data) => {
    if (data?.result?.length < PAGE_SIZE) setIsShowLoadingButton(false);
    if (Object.keys(prev)?.length) {
      if (isNeedMapper.current) {
        return { result: [...prev.result, ...data.result] };
      } else {
        isNeedMapper.current = true;
        return { result: [...data.result] };
      }
    }

    return data;
  };

  const { data, call, isLoading } = useRequest(
    UserRepository.getUserTokens,
    [userAddress, queryParams],
    requestMapper
  );

  useEffect(() => {
    call();
  }, [queryParams]);

  useEffect(() => {
    if (isNeedUpdateMemes) {
      isNeedMapper.current = false;
      currentPage.current = 0;
      setQueryParams(`page=0&size=${PAGE_SIZE}`);
      dispatch(setIsNeedUpdateMemes(false));
    }
  }, [isNeedUpdateMemes]);

  const onLoadMore = useCallback(async () => {
    currentPage.current += 1;
    setQueryParams(`page=${currentPage.current}&size=${PAGE_SIZE}`);
  }, []);

  return (
    <MemeList
      data={data}
      onLoadMore={onLoadMore}
      isShowLoadingButton={isShowLoadingButton}
      isLoading={isLoading}
    />
  );
};

export default TokensController;
