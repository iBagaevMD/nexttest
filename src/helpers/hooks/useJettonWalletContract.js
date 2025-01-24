import { Address } from '@ton/core';
import { JettonWallet } from 'contracts/JettonWallet';
import { JettonMinter } from 'contracts/JettonMinter';
import Pool from 'contracts/Pool';
import { useTonClient } from './useTonClient';
import { useAsyncInitialize } from './useAsyncInitialize';
import { useWallet } from 'contexts/wallet';

const jettonWalletContractCache = {};

export function useJettonWalletContract(poolAddress, minterAddress) {
  const client = useTonClient();
  const { tonConnector, userAddress } = useWallet();

  const cacheKey = `${poolAddress}-${minterAddress}`;

  const jettonWalletContract = useAsyncInitialize(async () => {
    if (!client || !userAddress) return;

    if (minterAddress && userAddress) {
      if (jettonWalletContractCache[cacheKey]) {
        return jettonWalletContractCache[cacheKey];
      }

      const JettonMinterContract = client.open(
        JettonMinter.createFromAddress(Address.parse(minterAddress))
      );

      const senderWalletAddress = await JettonMinterContract.getWalletAddress(
        Address.parse(userAddress)
      );
      const contract = await client.open(JettonWallet.createFromAddress(senderWalletAddress));
      jettonWalletContractCache[cacheKey] = contract;
      return contract;
    }
  }, [client, minterAddress, userAddress, cacheKey]);

  return {
    address: jettonWalletContract?.address.toString(),
    // TODO: ensure sender.address is truthy
    sendSellJetton: (jettonAmount) => {
      if (!userAddress) {
        alert(`sender.address is ${userAddress}, please reload the page as a workaround`);
        return;
      }

      jettonWalletContract?.sendTransfer(
        {
          send: (args) => {
            const stateInit =
              args.init?.code && args.init?.data
                ? beginCell()
                    .storeUint(6, 5)
                    .storeRef(args.init.code)
                    .storeRef(args.init.data)
                    .endCell()
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
          }
        },
        Pool.estimatedMinimalValueToSend_sellJetton,
        jettonAmount,
        Address.parse(poolAddress),
        Address.parse(userAddress),
        null,
        Pool.estimatedFixedFee_sellJetton,
        null
      );
    },

    getBalance: () => jettonWalletContract?.getJettonBalance()
  };
}
