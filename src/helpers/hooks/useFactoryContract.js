import { Address, beginCell } from '@ton/core';

import { JettonFactory } from 'contracts/JettonFactory';
import { useTonClient } from './useTonClient';
import { useAsyncInitialize } from './useAsyncInitialize';
import { useWallet } from 'contexts/wallet';
import { TON_CONTRACT_ADDRESS } from 'config';

export function useFactoryContract() {
  const { tonConnector, userAddress } = useWallet();
  const client = useTonClient();

  const sender = {
    send: async (args) => {
      const stateInit =
        args.init?.code && args.init?.data
          ? beginCell().storeUint(6, 5).storeRef(args.init.code).storeRef(args.init.data).endCell()
          : null;

      tonConnector.sendTransaction({
        messages: [
          {
            address: args.to.toString(),
            amount: args.value.toString(),
            payload: args.body?.toBoc().toString('base64'),
            stateInit: stateInit?.toBoc().toString('base64')
          }
        ],
        // 5 minutes for user to approve
        validUntil: Date.now() + 5 * 60 * 1000
      });
    },
    address: userAddress
  };

  const factoryContract = useAsyncInitialize(async () => {
    if (!client) return;

    return client.open(JettonFactory.createFromAddress(Address.parse(TON_CONTRACT_ADDRESS)));
  }, [client]);

  return {
    address: factoryContract?.address.toString(),
    sendInitiateNew: (config) => {
      factoryContract?.sendInitiateNew(
        sender,
        JettonFactory.sendInitiateNew_estimatedValue,
        config
      );
    },
    sendInitiateNew_estimatedValue: JettonFactory.sendInitiateNew_estimatedValue
  };
}
