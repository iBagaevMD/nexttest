import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import Link from 'next/link';

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
    <div id="blurId" className="flex justify-center min-h-screen w-full">
      <div className="flex justify-center max-w-[1440px] w-full">
        <LeftBar />
        <div className="max-w-[1112px] sm:max-w-full w-full bg-[#080808] rounded-[16px] overflow-auto flex flex-col flex-1 p-6 sm:p-2 space-y-6">
          <div className="flex z-10 header-bg w-full h-[44] pb-6 sm:pb-[14px] flex items-center justify-end smjustify-end w-full">
            <Link className="flex flex-shrink-0 items-center hover:opacity-80" href="/">
              <img className="hidden sm:block h-[32px]" src="/logoWithText.svg" alt="header logo" />
            </Link>
            <UserInfo />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};
