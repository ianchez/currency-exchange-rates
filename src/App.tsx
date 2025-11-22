import './App.css';
import { useMemo } from 'react';

// Hooks
import { useCurrencies } from './hooks/useCurrencies';

// Components
import { SideCurrencyRow } from './components/SideCurrencyRow';
import { MainCurrencySelect } from './components/MainCurrencySelect';
import { DatePicker } from './components/DatePicker';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';

// Constants
import { MIN_SIDE_CURRENCIES, MAX_SIDE_CURRENCIES } from './constants/currency';

function App() {
  const {
    mainCurrency,
    sideCurrencies,
    allCurrencies,
    currencyRateByDate,
    selectedDate,
    setSelectedDate,
    isLoadingRates,
    setMainCurrency,
    setSideCurrency,
    addSideCurrency,
    removeSideCurrency
  } = useCurrencies();

  const sideCurrenciesRates = useMemo(() => {
    return Object.entries(sideCurrencies).map(([rowNumber, code]) => {
      const position = Number(rowNumber);
      const sideCurrenciesLength = Object.keys(sideCurrencies).length;
      const canRemove = sideCurrenciesLength > MIN_SIDE_CURRENCIES && position === sideCurrenciesLength;

      return (
        <SideCurrencyRow
          key={position}
          position={position}
          currencyCode={code}
          selectedCurrency={mainCurrency}
          mainCurrency={mainCurrency}
          allCurrencies={allCurrencies}
          currencyRateByDate={currencyRateByDate}
          sideCurrencies={sideCurrencies}
          canRemove={canRemove}
          isLoadingRates={isLoadingRates}
          onRemove={removeSideCurrency}
          onChange={setSideCurrency}
        />
      );
    });
  }, [
    sideCurrencies,
    mainCurrency,
    allCurrencies,
    currencyRateByDate,
    isLoadingRates,
    removeSideCurrency,
    setSideCurrency
  ]);

  const canAddMore = Object.keys(sideCurrencies).length < MAX_SIDE_CURRENCIES;

  return (
    <>
      <h1 id="main-heading">Currency Exchange Rates</h1>
      <div className="card">
        <p>
          <b>Welcome!</b> Please choose your <b>main currency</b> from the dropdown below.
        </p>
      </div>

      <MainCurrencySelect
        mainCurrency={mainCurrency}
        allCurrencies={allCurrencies}
        isLoadingRates={isLoadingRates}
        onChange={setMainCurrency}
      />
      <DatePicker
        selectedDate={selectedDate}
        onChange={setSelectedDate}
      />
      {sideCurrenciesRates}
      
      {canAddMore && (
        <Button
          fullWidth
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={addSideCurrency}
          className="add-currency-button"
          disabled={isLoadingRates}
        >
          Add Currency
        </Button>
      )}

      <p className="info">
        Learn more
      </p>
    </>
  );
}

export default App;
