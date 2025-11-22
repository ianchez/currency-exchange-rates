import { vi } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import selectedCurrenciesReducer from '../../redux/slices/selectedCurrenciesSlice';
import { currenciesApi } from '../../redux/services/currencies';

// Mock data reused across tests
export const mockCurrencies = {
  usd: 'US Dollar',
  eur: 'Euro',
  gbp: 'British Pound',
  jpy: 'Japanese Yen',
  cad: 'Canadian Dollar'
};

export const mockCurrencyRates = {
  gbp: {
    usd: 1.2567,
    eur: 1.1834,
    jpy: 188.45,
    cad: 1.7234
  }
};

export const mockSideCurrencies = {
  1: 'usd',
  2: 'eur',
  3: 'jpy'
};

// Redux test wrapper factory
export const createReduxWrapper = () => {
  const store = configureStore({
    reducer: {
      selectedCurrencies: selectedCurrenciesReducer,
      [currenciesApi.reducerPath]: currenciesApi.reducer
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(currenciesApi.middleware)
  });

  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
};

// Common mock props factory
export const createMockProps = (overrides = {}) => ({
  mainCurrency: 'usd',
  allCurrencies: mockCurrencies,
  isLoadingRates: false,
  onChange: vi.fn(),
  ...overrides
});
