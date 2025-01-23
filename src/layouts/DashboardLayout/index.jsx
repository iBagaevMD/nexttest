import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/router';

import LeftBar from 'components/LeftBar';
import { useRequest } from 'helpers/hooks/useRequest';
import { UserRepository } from 'connectors/repositories/user';
import { useWallet } from 'contexts/wallet';
import { setDailyMemesLeft } from 'store/userSlice';
import { UserInfo } from 'components/Headers/UserInfo';

export const DashboardLayout = ({ children }) => {
  const { route } = useRouter();
  const { userAddress } = useWallet();
  const dispatch = useDispatch();
  const { call, data } = useRequest(UserRepository.getUserDetails);
  const isSolanaChain = route.includes('solana');

  useEffect(() => {
    if (userAddress && isSolanaChain) {
      call([{ account: userAddress }]);
    }
  }, [userAddress, isSolanaChain]);

  useEffect(() => {
    if (data?.error === 'Daily meme generation limit reached') {
      dispatch(setDailyMemesLeft(0));
    }
    if (data?.result) {
      dispatch(setDailyMemesLeft(data?.result?.dailyMemesLeft));
    }
  }, [data]);

  return (
    <div id="blurId" className="flex flex-col items-center min-h-screen">
      <div className="sm:flex z-10 header-bg sticky top-0 left-0 w-full h-[92px] sm:h-[72px] px-10 py-6 sm:px-[16px] sm:py-[14px] flex items-center justify-between">
        <img className="h-[38px] sm:h-[32px]" src="/logoWithText.svg" alt="header logo" />
        <UserInfo />
      </div>
      <div className="flex w-full h-full flex-1 justify-center">
        <LeftBar />
        <div className="max-w-[1112px] sm:max-w-full w-full bg-[#080808] rounded-[16px] overflow-auto flex flex-col flex-1 p-6 sm:p-2">
          {children}
        </div>
      </div>
    </div>
  );
};
