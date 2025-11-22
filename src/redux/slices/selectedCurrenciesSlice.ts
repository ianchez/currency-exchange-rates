import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { MIN_SIDE_CURRENCIES, MAX_SIDE_CURRENCIES } from '../../constants/currency';

export interface CurrenciesState {
  main: string
  side: Record<number, string>
}

const initialState: CurrenciesState = {
  main: '',
  side: {
    1: '',
    2: '',
    3: '',
    4: '',
    5: '',
    6: '',
    7: '',
  }
};

export const selectedCurrenciesSlice = createSlice({
  name: 'selectedCurrencies',
  initialState,
  reducers: {
    setMainCurrency: (state, action: PayloadAction<string>) => {
      state.main = action.payload;
    },
    setSideCurrency: (state, action: PayloadAction<{ position: number; code: string }>) => {
      const { position, code } = action.payload;
      state.side[position] = code;
    },
    addSideCurrency: (state) => {
      const positions = Object.keys(state.side).map(Number);
      const maxPosition = positions.length > 0 ? Math.max(...positions) : 0;
      if (positions.length < MAX_SIDE_CURRENCIES) {
        const nextPosition = maxPosition + 1;
        state.side[nextPosition] = '';
      }
    },
    removeSideCurrency: (state, action: PayloadAction<number>) => {
      const position = action.payload;
      const positions = Object.keys(state.side).map(Number);
      if (positions.length > MIN_SIDE_CURRENCIES) {
        delete state.side[position];
      }
    },
  },
});

export const { setMainCurrency, setSideCurrency, addSideCurrency, removeSideCurrency } = selectedCurrenciesSlice.actions;

export default selectedCurrenciesSlice.reducer;