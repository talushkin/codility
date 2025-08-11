// External modules
import { configureStore } from '@reduxjs/toolkit';

// Store
import dataReducer from './dataSlice';

const store = configureStore({
  reducer: {
    data: dataReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export default store;
