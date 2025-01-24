import { useCallback } from 'react';
import * as web3 from '@solana/web3.js';

import { SOLANA_ENDPOINT } from 'config';

const DEFAULT_TIMEOUT_MS = 60_000; // 60s
const DEFAULT_POLL_INTERVAL_MS = 5_000; // 5s

const makeResult = (confirmed, error) => ({
  confirmed,
  error
});

export default function useSolanaTxConfirmation() {
  const _waitForConfirmation = async (
    signature,
    opts = {
      timeout: DEFAULT_TIMEOUT_MS,
      pollInterval: DEFAULT_POLL_INTERVAL_MS
    }
  ) => {
    try {
      const connection = new web3.Connection(SOLANA_ENDPOINT, 'confirmed');
      const startTime = Date.now();
      while (true) {
        if (Date.now() - startTime > opts.timeout) {
          return makeResult(false, 'Transaction was not confirmed: timeout reached');
        }
        const status = await connection.getSignatureStatuses([signature]);
        const confirmationStatus = status && status.value[0];
        if (confirmationStatus) {
          const { confirmationStatus: level, err } = confirmationStatus;
          if (err) {
            if (err.InsufficientFundsForRent) {
              return makeResult(true, 'Transaction failed: insufficient funds');
            }
            if (err.InstructionError) {
              const [_, errorDetails] = err.InstructionError;
              if (errorDetails.Custom === 1) {
                return makeResult(true, 'Transaction failed: insufficient funds');
              }
            }
            return makeResult(true, 'Transaction failed on-chain');
          }
          if (level === 'confirmed' || level === 'finalized') {
            return makeResult(true, null);
          }
        }
        await new Promise((resolve) => setTimeout(resolve, opts.pollInterval));
      }
    } catch (error) {
      console.error(`Failed to confirm tx ${signature}: ${error}`);
      return makeResult(false, 'Transaction was not confirmed');
    }
  };

  const waitForConfirmation = useCallback(
    async (
      signature,
      opts = {
        timeout: DEFAULT_TIMEOUT_MS,
        pollInterval: DEFAULT_POLL_INTERVAL_MS
      }
    ) => {
      const { confirmed, error } = await _waitForConfirmation(signature, opts);
      return {
        signature,
        confirmed,
        error
      };
    },
    []
  );

  return {
    waitForConfirmation
  };
}
