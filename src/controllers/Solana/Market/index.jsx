import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useRequest } from 'helpers/hooks/useRequest';
import { SolanaRepository } from 'connectors/repositories/solana';
import { PAGE_SIZE } from './constants';
import CreateMemeModal from 'components/Modals/CreateMemeModal';
import { useBlurBackground } from 'helpers/hooks/useBlurBackground';
import {
  getCreateMemeData,
  getIsGenerateCoinFromHomePage,
  getIsNeedUpdateMemes
} from 'store/userSlice/selectors';
import { delay } from 'helpers/delay';
import { setIsNeedUpdateMemes } from 'store/userSlice';
import MemeList from 'components/MemeList';

const MarketController = () => {
  const isNeedMapper = useRef(true);
  const dispatch = useDispatch();
  const currentPage = useRef(0);
  const [queryParams, setQueryParams] = useState(`page=${currentPage.current}&size=${PAGE_SIZE}`);
  const [isShowLoadingButton, setIsShowLoadingButton] = useState(true);
  const [isOpenMemeModal, setIsOpenMemeModal] = useState(false);
  const { setBlurBackground } = useBlurBackground();
  const isNeedUpdateMemes = useSelector(getIsNeedUpdateMemes);
  const createMemeData = useSelector(getCreateMemeData);
  const isGenerateCoinFromHomePage = useSelector(getIsGenerateCoinFromHomePage);

  //@fixme Bagaev
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
    SolanaRepository.getTokens,
    [queryParams],
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

  useEffect(() => {
    async function handleMemeData() {
      if (createMemeData.image || isGenerateCoinFromHomePage) {
        await delay(250);
        setBlurBackground();
        setIsOpenMemeModal(true);
      }
    }

    handleMemeData();
  }, [createMemeData]);

  return (
    <React.Fragment>
      <MemeList
        data={data}
        onLoadMore={onLoadMore}
        isShowLoadingButton={isShowLoadingButton}
        isLoading={isLoading}
      />
      {isOpenMemeModal && (
        <CreateMemeModal isOpened={isOpenMemeModal} setIsOpened={setIsOpenMemeModal} />
      )}
    </React.Fragment>
  );
};

export default MarketController;
