import { useCallback, useState } from 'react';
import * as web3 from '@solana/web3.js';

import { buildComputeBudgetInstructions } from 'utils/raydium-utils';
import { useNotifications } from 'contexts/notifications';
import { useWallet } from 'contexts/wallet';
import { SOLANA_ENDPOINT } from 'config';

export const useTransfer = () => {
  const { signer, userAddress } = useWallet();
  const { tx } = useNotifications();
  const [isRequesting, setIsRequesting] = useState(false);

  const sendTransfer = useCallback(
    async (payer, receiver, amount) => {
      const computeIxs = buildComputeBudgetInstructions({ units: 500, microLamports: 20_000_000 });
      const transferIx = web3.SystemProgram.transfer({
        fromPubkey: payer,
        toPubkey: receiver,
        lamports: amount
      });
      let ixs = [...computeIxs, transferIx];
      const connection = new web3.Connection(SOLANA_ENDPOINT, 'confirmed');
      const latestBlockhash = (await connection.getLatestBlockhash('finalized')).blockhash;
      const messageV0 = new web3.TransactionMessage({
        payerKey: payer,
        recentBlockhash: latestBlockhash,
        instructions: ixs
      }).compileToV0Message();
      const transactionV0 = new web3.VersionedTransaction(messageV0);
      return await signer.signAndSendTransaction(transactionV0);
    },
    [userAddress, signer, tx]
  );

  const makeTransfer = useCallback(
    async (payer, receiver, amount) => {
      try {
        setIsRequesting(true);
        const txHash = await tx('Making transfer...', 'Transfer confirmed!', () =>
          sendTransfer(payer, receiver, amount)
        );
        return txHash;
      } catch (e) {
        console.warn(e);
      } finally {
        setIsRequesting(false);
      }
    },
    [tx, sendTransfer]
  );

  return { makeTransfer, isRequesting };
};
