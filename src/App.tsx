import './App.css';

// Hooks
import { useCurrencies } from './hooks/useCurrencies';

// Components
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import type { SelectChangeEvent } from '@mui/material/Select';

function App() {
  const {
    mainCurrency,
    sideCurrencies,
    allCurrencies,
    currencyRateByDate,
    setMainCurrency,
    setSideCurrency
  } = useCurrencies();

  const handleMainCurrencyChange = ({ target }: SelectChangeEvent) => {
    const { value } = target;
    setMainCurrency(value);
  };

  const handleSideCurrencyChange = (currencyRow: string, currencyCode: string) => {
    setSideCurrency(currencyRow, currencyCode);
  };

  const mapCurrencyToMenuItem = (items: Record<string, string>) =>
    Object.entries(items).map(([code, name]) => (
      <MenuItem key={code} value={code}>
        {code.toUpperCase()} {name ? `(${name})` : ''}
      </MenuItem>
    ));

  const mainCurrencySelect = (
    <FormControl fullWidth>
      <InputLabel id="select-main-currency-label">Selected Currency</InputLabel>
      <Select
        style={{ fontSize: "1.4rem", fontWeight: 500, marginBottom: "36px" }}
        labelId="select-main-currency-label"
        id="select"
        value={mainCurrency}
        label="Selected Currency"
        onChange={handleMainCurrencyChange}
      >
        {allCurrencies
          ? mapCurrencyToMenuItem(allCurrencies)
          : <MenuItem value="" disabled>Loading...</MenuItem>
        }
      </Select>
    </FormControl>
  );

  const sideCurrencyRows = (selectedCurrency: string, rowNumber: string, currencyCode: string) => {
    if (!mainCurrency || !allCurrencies || !currencyRateByDate?.[selectedCurrency]) return null;

    const rate = currencyRateByDate[selectedCurrency]?.[currencyCode];
    const selectedSideCurrencies = Object.values(sideCurrencies);
    const filteredCurrencies = Object.fromEntries(
      Object.entries(allCurrencies).filter(([code]) => 
        code !== selectedCurrency &&
        (!selectedSideCurrencies.includes(code) || code === currencyCode)
      )
    );
    return (
      <FormControl
        fullWidth
        key={currencyCode}
        style={{ marginBottom: '16px', flexDirection: 'row', justifyContent: 'space-between' }}
        variant='standard'
      >
        <InputLabel id={`select-compare-currency-label-${currencyCode}`}>Compare</InputLabel>
        <Select
          style={{ width: "30%", fontSize: "1.1rem", fontWeight: 500 }}
          labelId={`select-compare-currency-label-${currencyCode}`}
          id={`select-compare-currency-${currencyCode}`}
          value={currencyCode}
          label="Compare"
          onChange={({ target }) => handleSideCurrencyChange(rowNumber, target.value)}
        >
          {allCurrencies
            ? mapCurrencyToMenuItem(filteredCurrencies)
            : <MenuItem value="" disabled>Loading...</MenuItem>
          }
        </Select>
        <p style={{ fontSize: "1.2rem", fontWeight: 400 }}>{rate?.toFixed(4) || 0}</p>
      </FormControl>
    );
  };

  const sideCurrenciesRates = Object.entries(sideCurrencies)
    .map(([rowNumber , code]) => sideCurrencyRows(mainCurrency,rowNumber, code));

  return (
    <>
      <h1>Currency Exchange Rates</h1>
      <div className="card">
        <p>
          <b>Welcome!</b> Please choose your <b>main currency</b> from the dropdown below.
        </p>
      </div>

      {mainCurrencySelect}
      {sideCurrenciesRates}

      <p className="info">
        Learn more
      </p>
    </>
  );
}

export default App;
