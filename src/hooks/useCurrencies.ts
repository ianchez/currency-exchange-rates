import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { setMainCurrency, setSideCurrency, DEFAULT_CURRENCY, DEFAULT_SIDE_CURRENCIES } from '../redux/slices/selectedCurrenciesSlice'
import { useGetCurrenciesQuery, useGetCurrencyRateByDateQuery } from '../redux/services/currencies'

export const useCurrencies = () => {
  const dispatch = useAppDispatch()
  const { main, side } = useAppSelector((state) => state.selectedCurrencies)

  // Setting yesterday to ensure we have data available
  // (sometimes today's data might not be available yet)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  const { data: allCurrencies, isSuccess } = useGetCurrenciesQuery()
  const { data: currencyRateByDate } = useGetCurrencyRateByDateQuery({
    year: yesterday.getFullYear().toString(),
    month: (yesterday.getMonth() + 1).toString(),
    day: yesterday.getDate().toString(),
    currencyCode: main || DEFAULT_CURRENCY
  })

  useEffect(() => {
    if (isSuccess && allCurrencies && Object.keys(allCurrencies).length > 0) {
      if (!main) {
        dispatch(setMainCurrency(DEFAULT_CURRENCY))
      }

      if (!side?.[1]) {
        // Set default side currencies
        Object.entries(side).forEach(([position]) => {
          const posNum = Number(position)
          const defaultCode = DEFAULT_SIDE_CURRENCIES[posNum]
          dispatch(setSideCurrency({ position: posNum, code: defaultCode }))
        })
      }
    }
  }, [isSuccess, allCurrencies, main, side, dispatch])

  const setMainCurrencyHandler = (value: string) => {
    dispatch(setMainCurrency(value))
  }

  const setSideCurrencyHandler = (position: string, code: string) => {
    dispatch(setSideCurrency({ position: parseInt(position), code }))
  }

  return {
    mainCurrency: main,
    sideCurrencies: side,
    allCurrencies,
    currencyRateByDate,
    setMainCurrency: setMainCurrencyHandler,
    setSideCurrency: setSideCurrencyHandler
  }
}
