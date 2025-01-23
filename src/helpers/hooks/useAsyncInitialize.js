import { useEffect, useState } from 'react';

// allows to use results of async functions without using await (i.e. state is value, not promise)
export function useAsyncInitialize(func, deps = []) {
  const [state, setState] = useState();

  useEffect(() => {
    func().then((result) => setState(result));
  }, deps);

  return state;
}
