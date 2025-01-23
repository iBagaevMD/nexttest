import { useState, useCallback, useRef, useEffect } from 'react';

const usePolling = (pollingFunction, timeout = 60000, interval = 5000) => {
  const [pollingResult, setPollingResult] = useState(null);
  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const startPolling = useCallback(
    (params) => {
      stopPolling();

      const poll = async () => {
        const result = await pollingFunction(params);
        if (result) {
          setPollingResult(result);
          stopPolling();
        }
      };

      intervalRef.current = setInterval(poll, interval);
      timeoutRef.current = setTimeout(() => {
        stopPolling();
        setPollingResult({ error: 'Polling timed out' });
      }, timeout);

      poll(); // Initial poll
    },
    [pollingFunction, interval, timeout, stopPolling]
  );

  useEffect(() => {
    return () => stopPolling(); // Clean up on unmount
  }, [stopPolling]);

  return { startPolling, stopPolling, pollingResult };
};

export default usePolling;
