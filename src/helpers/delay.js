export const delay = (delayMS) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, delayMS);
  });
};
