import { useCallback, useRef, useState, useEffect } from 'react';

const CACHE_DURATION = 30_000; // 30 seconds

export const useJitoTip = () => {
  const [jitoTips, setJitoTips] = useState(null);

  const fetchJitoTips = async () => {
    const rpcEndpoint = 'http://bundles-api-rest.jito.wtf/api/v1/bundles/tip_floor';
    try {
      console.log('Fetching Jito tips information...');
      const response = await fetch(url);
      const data = await response.json();
      return {
        p25: data['landed_tips_25th_percentile'],
        p50: data['landed_tips_50th_percentile'],
        p75: data['landed_tips_75th_percentile'],
        p95: data['landed_tips_95th_percentile'],
        p99: data['landed_tips_99th_percentile']
      };
    } catch (error) {
      console.error(`Failed to fetch Jito tips info from ${rpcEndpoint}:`, error);
    }
    // If all endpoints fail, return default jito tip:
    // TODO: replace with fallback logic
    return {
      p25: 0.01,
      p50: 0.01,
      p75: 0.01,
      p95: 0.01,
      p99: 0.01
    };
  };

  useEffect(() => {
    const cachedTips = sessionStorage.getItem('jitoTips');
    const cacheTime = sessionStorage.getItem('jitoTipsCacheTime');

    if (cachedTips && new Date().getTime() - cacheTime < CACHE_DURATION) {
      setJitoTips(cachedTips);
    } else {
      fetchJitoTips()
        .then((fetchedJitoTips) => {
          setJitoTips(fetchedJitoTips);
          sessionStorage.setItem('jitoTips', fetchedJitoTips);
          sessionStorage.setItem('jitoTipsCacheTime', new Date().getTime());
        })
        .catch((_) => {});
    }
  }, []);

  return jitoTips;
};

export const useBundleConfirmation = () => {
  const [bundleStatus, setBundleStatus] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const abortControllerRef = useRef(null);

  const getBundleStatuses = async (bundleIds) => {
    const rpcEndpoint = `https://mainnet.block-engine.jito.wtf/api/v1/bundles`;
    const payload = {
      jsonrpc: '2.0',
      id: Math.floor(Math.random() * 1e9),
      method: 'getBundleStatuses',
      params: [bundleIds]
    };
    try {
      const response = await fetch(rpcEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error(`HTTP error: status: ${response.status}`);
      }
      const json = await response.json();
      if (json.error) {
        throw new Error(`RPC error: ${JSON.stringify(json.error)}`);
      }
      return json.result;
    } catch (error) {
      console.error('Error fetching bundle statuses:', error);
      throw error;
    }
  };

  const waitForBundleConfirmation = useCallback(
    async (bundleId, timeout = 60_000, interval = 5_000) => {
      setBundleStatus(null);
      setIsConfirming(true);
      let attemptsLeft = 3;
      const startTime = Date.now();
      abortControllerRef.current = new AbortController();

      try {
        while (!abortControllerRef.current.signal.aborted) {
          if (Date.now() - startTime > timeout) {
            throw new Error('Timeout reached: bundle is not confirmed after 1 minute');
          }
          try {
            const result = await getBundleStatuses([bundleId]);
            const status = result && result.value[0];
            const confirmationStatus = status?.confirmation_status;
            if (confirmationStatus === 'confirmed' || confirmationStatus === 'finalized') {
              console.log(`Bundle ${bundleId} is confirmed!`);
              const confirmedStatus = {
                bundleId: status['bundle_id'],
                transactions: status['transactions'],
                slot: Number(status['slot']),
                confirmationStatus: status['confirmation_status'],
                err: status['err']
              };
              setBundleStatus(confirmedStatus);
              return confirmedStatus;
            }
            console.log(`Bundle ${bundleId} is not confirmed. Waiting...`);
          } catch (e) {
            attemptsLeft--;
            console.log(`Error during bundle status request. Attempts left: ${attemptsLeft}`, e);
            if (attemptsLeft === 0) {
              throw new Error('Failed to get bundle status. Attempts limit reached');
            }
          }
          await new Promise((resolve) => setTimeout(resolve, interval));
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          setBundleStatus({ error: error.message });
          throw error;
        }
      } finally {
        setIsConfirming(false);
      }
    },
    []
  );

  const stopConfirmation = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsConfirming(false);
      setBundleStatus(null);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { waitForBundleConfirmation, bundleStatus, isConfirming, stopConfirmation };
};
