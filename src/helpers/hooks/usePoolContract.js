import { beginCell, Address } from '@ton/core';

import Pool from 'contracts/Pool';
import { useTonClient } from './useTonClient';
import { useAsyncInitialize } from './useAsyncInitialize';
import { useWallet } from 'contexts/wallet';

const poolContractCache = {};

export function usePoolContract(poolAddress) {
  const client = useTonClient();
  const { tonConnector, userAddress } = useWallet();

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

  const poolContract = useAsyncInitialize(async () => {
    if (!client) return;

    if (poolAddress) {
      if (poolContractCache[poolAddress]) {
        return poolContractCache[poolAddress];
      }

      const contract = await client.open(Pool.createFromAddress(Address.parse(poolAddress)));
      poolContractCache[poolAddress] = contract;
      return contract;
    }
  }, [client, poolAddress]);

  return {
    address: poolContract?.address.toString(),

    getFixedBuyFee: async () => poolContract?.getBuyJettonFixedFee(),
    getEstimatedJettonForTon: async (tonAmountToSwap) =>
      poolContract?.getEstimatedJettonForTon(tonAmountToSwap),
    getEstimatedRequiredTonForJetton: async (expectedJettonAmount) =>
      poolContract?.getEstimatedRequiredTonForJetton(expectedJettonAmount),

    estimatedMinimalValueToSend_sellJetton: Pool.estimatedMinimalValueToSend_sellJetton,
    getSoldJettonsAmount: async () => poolContract?.getSoldJettonsAmount(),
    getEstimatedTonForJetton: async (jettonAmountToSwap) =>
      poolContract?.getEstimatedTonForJetton(jettonAmountToSwap),
    getEstimatedRequiredJettonForTon: async (expectedTonAmount) =>
      poolContract?.getEstimatedRequiredJettonForTon(expectedTonAmount),

    sendBuyJetton: (value) => {
      poolContract?.sendBuyJetton(sender, value);
    },
    getEstimatedPriceImpact: (value) => poolContract?.getEstimatedPriceImpact(sender, value)
  };
}
