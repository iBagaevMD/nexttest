import React, { useMemo } from 'react';
import { useRouter } from 'next/router';

import { SOLANA_MENU_LIST, TON_MENU_LIST } from './constants';
import { GroupMenu } from './Components/GroupMenu';

export const Menu = () => {
  const { route } = useRouter();
  const isSolanaChain = route.includes('solana');

  const menuList = useMemo(() => {
    if (isSolanaChain) {
      return SOLANA_MENU_LIST;
    }
    return TON_MENU_LIST;
  }, [isSolanaChain]);

  return (
    <React.Fragment>
      <div className="flex flex-col w-full space-y-9">
        {Object.keys(menuList)?.map((itemGroup, index) => (
          <GroupMenu groupTitle={itemGroup} list={Object.values(menuList[itemGroup])} key={index} />
        ))}
      </div>
    </React.Fragment>
  );
};
