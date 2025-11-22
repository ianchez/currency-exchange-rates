import './App.css';
import { useMemo } from 'react';

// Hooks
import { useCurrencies } from './hooks/useCurrencies';

// Components
import { SideCurrencyRow } from './components/SideCurrencyRow';
import { MainCurrencySelect } from './components/MainCurrencySelect';
import { DatePicker } from './components/DatePicker';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';

// Constants
import { MIN_SIDE_CURRENCIES, MAX_SIDE_CURRENCIES } from './constants/currency';

// Utils
import { getLast7Days } from './utils/dateUtils';

function App() {
  const {
    mainCurrency,
    sideCurrencies,
    allCurrencies,
    currencyRatesByDate,
    loadingByDate,
    selectedDate,
    setSelectedDate,
    isLoadingRates,
    setMainCurrency,
    setSideCurrency,
    addSideCurrency,
    removeSideCurrency
  } = useCurrencies();

  const last7Days = useMemo(() => getLast7Days(selectedDate), [selectedDate]);

  const sideCurrenciesHeader = (
    <div className="date-header-row">
      <div className="empty-header-cell"></div> {/* Empty cell for alignment */}
      <div className="date-header-cell">Trend</div>
      {last7Days.map((date, index) => (
        <div key={index} className="date-header-cell">
          {date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric'
          })}
        </div>
      ))}
    </div>
  );  

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
          currencyRatesByDate={currencyRatesByDate}
          loadingByDate={loadingByDate}
          sideCurrencies={sideCurrencies}
          canRemove={canRemove}
          isLoadingRates={isLoadingRates}
          last7Days={last7Days}
          onRemove={removeSideCurrency}
          onChange={setSideCurrency}
        />
      );
    });
  }, [
    sideCurrencies,
    mainCurrency,
    allCurrencies,
    currencyRatesByDate,
    loadingByDate,
    isLoadingRates,
    last7Days,
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

      {sideCurrenciesHeader}
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

      <Typography className="info">
        Historical data available for the last <b>90 days.</b> <br />
        Select an end date to view exchange rates for that day plus the previous 6 days <b>(7 days total).</b>
      </Typography>
    </>
  );
}

export default App;
