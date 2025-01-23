import { createSlice } from '@reduxjs/toolkit';

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    createMemeData: {},
    generateCoinFromHomePage: false,
    isNeedUpdateMemes: false,
    dailyMemesLeft: 0
  },
  reducers: {
    setCreateMemeData(state, action) {
      state.createMemeData = { ...action.payload };
    },
    removeCreateMemeData(state) {
      state.createMemeData = {};
    },
    setGenerateCoinFromHomePage(state, action) {
      state.generateCoinFromHomePage = action.payload;
    },
    setDailyMemesLeft(state, action) {
      state.dailyMemesLeft = action.payload;
    },
    setIsNeedUpdateMemes(state, action) {
      state.isNeedUpdateMemes = action.payload;
    }
  }
});

export const userReducer = userSlice.reducer;

export const {
  setCreateMemeData,
  removeCreateMemeData,
  setGenerateCoinFromHomePage,
  setDailyMemesLeft,
  setIsNeedUpdateMemes
} = userSlice.actions;
