import { FormControl, InputLabel, Select, MenuItem, IconButton, Skeleton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { SelectChangeEvent } from '@mui/material/Select';
import { RATE_DECIMAL_PLACES } from '../constants/currency';

interface SideCurrencyRowProps {
  position: number;
  currencyCode: string;
  selectedCurrency: string;
  mainCurrency: string;
  allCurrencies: Record<string, string> | undefined;
  currencyRateByDate: Record<string, Record<string, number>> | undefined;
  sideCurrencies: Record<number, string>;
  canRemove: boolean;
  isLoadingRates: boolean;
  onRemove: (position: number) => void;
  onChange: (rowNumber: string, currencyCode: string) => void;
}

export const SideCurrencyRow = ({
  position,
  currencyCode,
  selectedCurrency,
  mainCurrency,
  allCurrencies,
  currencyRateByDate,
  sideCurrencies,
  canRemove,
  isLoadingRates,
  onRemove,
  onChange
}: SideCurrencyRowProps) => {
  const mapCurrencyToMenuItem = (items: Record<string, string>) =>
    Object.entries(items).map(([code, name]) => (
      <MenuItem key={code} value={code}>
        {code.toUpperCase()} {name ? `(${name})` : ''}
      </MenuItem>
    ));

  // Show skeleton when data is loading (only when currencies list is not available)
  if (!mainCurrency || !allCurrencies) {
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
          <SkeletonComponent width={30} />
          <SkeletonComponent width={15} />
        </FormControl>
      </div>
    );
  }

  const rate = currencyRateByDate?.[selectedCurrency]?.[currencyCode];
  const selectedSideCurrencies = Object.values(sideCurrencies);
  const filteredCurrencies = Object.fromEntries(
    Object.entries(allCurrencies).filter(([code]) => 
      code !== selectedCurrency &&
      (!selectedSideCurrencies.includes(code) || code === currencyCode)
    )
  );

  const handleChange = ({ target }: SelectChangeEvent) => {
    onChange(position.toString(), target.value);
  };

  return (
    <div 
      key={position}
      className="currency-row"
    >
      {canRemove && (
        <IconButton 
          aria-label="delete" 
          size="medium" 
          onClick={() => onRemove(position)}
          color="error"
          className="delete-icon"
          disabled={isLoadingRates}
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
          color="success"
        >
          {currencyCode ? "Comparing with:" : "Select a Currency"}
        </InputLabel>
        <Select
          labelId={`select-compare-currency-label-${currencyCode}`}
          id={`select-compare-currency-${currencyCode}`}
          className="side-currency-select"
          value={currencyCode}
          label="Compare"
          onChange={handleChange}
          color="success"
          disabled={isLoadingRates}
        >
          {allCurrencies
            ? mapCurrencyToMenuItem(filteredCurrencies)
            : <MenuItem value="" disabled>Loading...</MenuItem>
          }
        </Select>
        {isLoadingRates || !currencyRateByDate?.[selectedCurrency] ? (
          <SkeletonComponent />
        ) : (
          <p className="currency-rate">{currencyCode ? rate?.toFixed(RATE_DECIMAL_PLACES) ?? 0 : null}</p>
        )}
      </FormControl>
    </div>
  );
};

const SkeletonComponent = ({width = 15}) =>
  <Skeleton variant="text" width={`${width}%`} height={30} sx={{ bgcolor: "#c681db07" }} />;