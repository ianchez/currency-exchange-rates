import './App.css';

// Hooks
import { useCurrencies } from './hooks/useCurrencies';

// Components
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import type { SelectChangeEvent } from '@mui/material/Select';

function App() {
  const {
    mainCurrency,
    sideCurrencies,
    allCurrencies,
    currencyRateByDate,
    setMainCurrency,
    setSideCurrency,
    addSideCurrency,
    removeSideCurrency
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
        labelId="select-main-currency-label"
        id="select"
        className="main-currency-select"
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
    const position = Number(rowNumber);
    const sideCurrenciesLength = Object.keys(sideCurrencies).length;
    // Only allow removing the last currency to avoid gaps if multiple are removed
    const canRemove = sideCurrenciesLength > 3 && position === sideCurrenciesLength;
    
    // Show skeleton when data is loading
    if (!mainCurrency || !allCurrencies || !currencyRateByDate?.[selectedCurrency]) {
      return (
        <div 
          key={position}
          className="currency-row"
        >
          <FormControl
            fullWidth
            className="side-currency-form-control"
            variant='standard'
          >
            <Skeleton variant="text" width="30%" height={40} />
            <Skeleton variant="text" width="15%" height={40} />
          </FormControl>
        </div>
      );
    }

    const rate = currencyRateByDate[selectedCurrency]?.[currencyCode];
    const selectedSideCurrencies = Object.values(sideCurrencies);
    const filteredCurrencies = Object.fromEntries(
      Object.entries(allCurrencies).filter(([code]) => 
        code !== selectedCurrency &&
        (!selectedSideCurrencies.includes(code) || code === currencyCode)
      )
    );

    return (
      <div 
        key={position}
        className="currency-row"
      >
        {canRemove && (
          <IconButton 
            aria-label="delete" 
            size="medium" 
            onClick={() => removeSideCurrency(position)}
            color="error"
            className="delete-icon"
          >
            <DeleteIcon fontSize="medium" />
          </IconButton>
        )}
        <FormControl
          fullWidth
          className="side-currency-form-control"
          variant='standard'
        >
          <InputLabel
            id={`select-compare-currency-label-${currencyCode}`}
          >
            {currencyCode ? "Comparing with:" : "Select a Currency"}
          </InputLabel>
          <Select
            labelId={`select-compare-currency-label-${currencyCode}`}
            id={`select-compare-currency-${currencyCode}`}
            className="side-currency-select"
            value={currencyCode}
            label="Compare"
            onChange={({ target }) => handleSideCurrencyChange(rowNumber, target.value)}
          >
            {allCurrencies
              ? mapCurrencyToMenuItem(filteredCurrencies)
              : <MenuItem value="" disabled>Loading...</MenuItem>
            }
          </Select>
          <p className="currency-rate">{currencyCode ? rate?.toFixed(4) || 0 : null}</p>
        </FormControl>
      </div>
    );
  };

  const sideCurrenciesRates = Object.entries(sideCurrencies)
    .map(([rowNumber , code]) => sideCurrencyRows(mainCurrency,rowNumber, code));

  const canAddMore = Object.keys(sideCurrencies).length < 7;

  return (
    <>
      <h1 id="main-heading">Currency Exchange Rates</h1>
      <div className="card">
        <p>
          <b>Welcome!</b> Please choose your <b>main currency</b> from the dropdown below.
        </p>
      </div>

      {mainCurrencySelect}
      {sideCurrenciesRates}
      
      {canAddMore && (
        <Button
          fullWidth
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={addSideCurrency}
          className="add-currency-button"
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
