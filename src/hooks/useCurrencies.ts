import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { setMainCurrency, setSideCurrency, addSideCurrency, removeSideCurrency } from '../redux/slices/selectedCurrenciesSlice';
import { useGetCurrenciesQuery, useGetCurrencyRateByDateQuery } from '../redux/services/currencies';
import { getYesterday } from '../utils/dateUtils';
import { DATE_DEBOUNCE_MS, DEFAULT_CURRENCY, DEFAULT_SIDE_CURRENCIES } from '../constants/currency';

export const useCurrencies = () => {
  const dispatch = useAppDispatch();
  const { main, side } = useAppSelector((state) => state.selectedCurrencies);

  // Setting yesterday to ensure we have data available
  // (sometimes today's data might not be available yet)
  const [selectedDate, setSelectedDate] = useState<Date>(getYesterday());
  const [debouncedDate, setDebouncedDate] = useState<Date>(getYesterday());

  // Debounce date changes to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedDate(selectedDate);
    }, DATE_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [selectedDate]);

  const { data: allCurrencies, isSuccess } = useGetCurrenciesQuery();
  const { data: currencyRateByDate, isLoading, isFetching } = useGetCurrencyRateByDateQuery({
    year: debouncedDate.getFullYear().toString(),
    month: (debouncedDate.getMonth() + 1).toString(),
    day: debouncedDate.getDate().toString(),
    currencyCode: main || DEFAULT_CURRENCY
  });

  useEffect(() => {
    if (isSuccess && allCurrencies && Object.keys(allCurrencies).length > 0) {
      if (!main) {
        dispatch(setMainCurrency(DEFAULT_CURRENCY));
      }

      if (!side?.[1]) {
        // Set default side currencies
        Object.entries(side).forEach(([position]) => {
          const posNum = Number(position);
          const defaultCode = DEFAULT_SIDE_CURRENCIES[posNum];
          dispatch(setSideCurrency({ position: posNum, code: defaultCode }));
        });
      }
    }
  }, [isSuccess, allCurrencies, main, side, dispatch]);

  const setMainCurrencyHandler = (value: string) => {
    dispatch(setMainCurrency(value));
  };

  const setSideCurrencyHandler = (position: string, code: string) => {
    dispatch(setSideCurrency({ position: parseInt(position), code }));
  };

  const addSideCurrencyHandler = () => {
    dispatch(addSideCurrency());
  };

  const removeSideCurrencyHandler = (position: number) => {
    dispatch(removeSideCurrency(position));
  };

  return {
    mainCurrency: main,
    sideCurrencies: side,
    allCurrencies,
    currencyRateByDate,
    selectedDate,
    setSelectedDate,
    isLoadingRates: isLoading || isFetching,
    setMainCurrency: setMainCurrencyHandler,
    setSideCurrency: setSideCurrencyHandler,
    addSideCurrency: addSideCurrencyHandler,
    removeSideCurrency: removeSideCurrencyHandler
  };
};
