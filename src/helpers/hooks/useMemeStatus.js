import { useCallback } from 'react';
import { SOLANA_ROCKET_API_URL } from 'config';

const useMemeStatus = () => {
  async function doUpdateMemeStatus(data) {
    return await fetch(`${SOLANA_ROCKET_API_URL}/meme/updateStatus`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  const updateMemeStatus = useCallback(
    async ({ id, status, mint, createTx, raydiumPool, addLiquidityTx }) => {
      try {
        const data = {
          id,
          status,
          mint: mint || '',
          createTx: createTx || '',
          raydiumPool: raydiumPool || '',
          addLiquidityTx: addLiquidityTx || ''
        };
        const response = await doUpdateMemeStatus(data);
        if (!response.ok) {
          throw new Error('Response is not ok');
        }
        return true;
      } catch (e) {
        console.warn('Failed to update meme status', e);
        return false;
      }
    },
    []
  );

  return {
    updateMemeStatus
  };
};

export default useMemeStatus;
