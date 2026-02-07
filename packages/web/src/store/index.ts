import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import nodeReducer from './slices/nodeSlice';
import { setupInterceptors } from '../api/axiosConfig';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    nodes: nodeReducer,
  },
});

// Initialize interceptors with store
setupInterceptors(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
