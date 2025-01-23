export const getCreateMemeData = (state) => state?.user?.createMemeData || {};
export const getIsGenerateCoinFromHomePage = (state) =>
  state?.user?.generateCoinFromHomePage || false;
export const getDailyMemesLeft = (state) => state.user.dailyMemesLeft;
export const getIsNeedUpdateMemes = (state) => state.user.isNeedUpdateMemes;
