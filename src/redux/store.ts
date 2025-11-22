import { configureStore } from '@reduxjs/toolkit';
import { createLogger } from 'redux-logger';

// Slices
import selectedCurrenciesReducer from './slices/selectedCurrenciesSlice';
import { currenciesApi } from './services/currencies';

// Configure logger middleware (only for development)
const logger = createLogger({
  collapsed: true,
  diff: true,
});

export const store = configureStore({
  reducer: {
    selectedCurrencies: selectedCurrenciesReducer,
    [currenciesApi.reducerPath]: currenciesApi.reducer,
  },
  devTools: true,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(logger)
      .concat(currenciesApi.middleware),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
