import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { createWrapper } from 'next-redux-wrapper';
import { userReducer } from './userSlice';

const rootReducer = combineReducers({
  user: userReducer
});

const makeStore = () => {
  return configureStore({
    reducer: rootReducer
  });
};

// debug=true для режима отладки
export const wrapper = createWrapper(makeStore, { debug: false });
