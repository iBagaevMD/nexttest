import { useState } from 'react';

export const useRequest = (callback, args = [], mapper) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [data, setData] = useState([]);

  const resetData = (defaultValue = {}) => {
    setData(defaultValue);
  };

  const getData = async (params) => {
    setIsLoading(true);
    setIsError(false);
    setIsDone(false);

    try {
      const result = await callback(...(params ? params : args));

      setIsLoading(false);
      if (mapper) {
        return setData((prev) => mapper(prev, result));
      }

      setData(result);

      return result;
    } catch (e) {
      setIsError(true);
    } finally {
      setIsDone(true);
      setIsLoading(false);
    }
  };

  const call = async (params) => {
    if (!isLoading) {
      return await getData(params);
    }
  };

  return {
    isLoading,
    data,
    call,
    isDone,
    isError,
    resetData
  };
};
