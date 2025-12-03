import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import counterReducer from './slices/counterSlice';
import userReducer from './slices/userSlice';
import caseReducer  from './slices/caseSlice';
import  setLaydata  from './slices/overlaySlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    user: userReducer,
    caser:caseReducer,
    laydata:setLaydata
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;