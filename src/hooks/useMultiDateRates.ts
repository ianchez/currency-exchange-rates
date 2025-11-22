import { useMemo } from 'react';
import { useGetCurrencyRateByDateQuery } from '../redux/services/currencies';

// Helper to create query parameters for a specific date
const getQueryParams = (date: Date, currencyCode: string) => ({
  year: date.getFullYear().toString(),
  month: (date.getMonth() + 1).toString(),
  day: date.getDate().toString(),
  currencyCode
});

/**
 * Custom hook to fetch currency rates for exactly 7 dates
 * Each date gets its own query with independent caching
 */
export const useMultiDateRates = (dates: Date[], currencyCode: string) => {
  const rates0 = useGetCurrencyRateByDateQuery(getQueryParams(dates[0], currencyCode));
  const rates1 = useGetCurrencyRateByDateQuery(getQueryParams(dates[1], currencyCode));
  const rates2 = useGetCurrencyRateByDateQuery(getQueryParams(dates[2], currencyCode));
  const rates3 = useGetCurrencyRateByDateQuery(getQueryParams(dates[3], currencyCode));
  const rates4 = useGetCurrencyRateByDateQuery(getQueryParams(dates[4], currencyCode));
  const rates5 = useGetCurrencyRateByDateQuery(getQueryParams(dates[5], currencyCode));
  const rates6 = useGetCurrencyRateByDateQuery(getQueryParams(dates[6], currencyCode));

  const queries = useMemo(
    () => [rates0, rates1, rates2, rates3, rates4, rates5, rates6],
    [rates0, rates1, rates2, rates3, rates4, rates5, rates6]
  );

  const ratesByDate: Record<string, Record<string, Record<string, number>>> = useMemo(() => {
    const rates: Record<string, Record<string, Record<string, number>>> = {};

    dates.forEach((date, index) => {
      const dateKey = date.toISOString().split('T')[0];
      if (queries[index].data) {
        rates[dateKey] = queries[index].data as Record<string, Record<string, number>>;
      }
    });

    return rates;
  }, [dates, queries]);

  const loadingByDate: Record<string, boolean> = useMemo(() => {
    const loading: Record<string, boolean> = {};

    dates.forEach((date, index) => {
      const dateKey = date.toISOString().split('T')[0];
      loading[dateKey] = queries[index].isLoading || queries[index].isFetching;
    });

    return loading;
  }, [dates, queries]);

  const isLoading = queries.some(query => query.isLoading);
  const isFetching = queries.some(query => query.isFetching);

  return {
    ratesByDate,
    loadingByDate,
    isLoading,
    isFetching,
    queries
  };
};
