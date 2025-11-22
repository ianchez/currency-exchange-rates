import { useMemo, useCallback } from 'react';
import { FormControl, InputLabel, Select, MenuItem, IconButton, Skeleton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { SelectChangeEvent } from '@mui/material/Select';
import { mapCurrencyToMenuItem } from '../utils/currencySelectorUtils';
import { formatRate } from '../utils/formatUtils';

interface SideCurrencyRowProps {
  position: number;
  currencyCode: string;
  selectedCurrency: string;
  mainCurrency: string;
  allCurrencies: Record<string, string> | undefined;
  currencyRatesByDate: Record<string, Record<string, Record<string, number>>>;
  loadingByDate: Record<string, boolean>;
  sideCurrencies: Record<number, string>;
  canRemove: boolean;
  isLoadingRates: boolean;
  last7Days: Date[];
  onRemove: (position: number) => void;
  onChange: (rowNumber: string, currencyCode: string) => void;
}

export const SideCurrencyRow = ({
  position,
  currencyCode,
  selectedCurrency,
  mainCurrency,
  allCurrencies,
  currencyRatesByDate,
  loadingByDate,
  sideCurrencies,
  canRemove,
  isLoadingRates,
  last7Days,
  onRemove,
  onChange
}: SideCurrencyRowProps) => {
  const selectedSideCurrencies = Object.values(sideCurrencies);
  
  const filteredCurrencies = useMemo(() => {
    if (!allCurrencies) return {};
    return Object.fromEntries(
      Object.entries(allCurrencies).filter(([code]) => 
        code !== selectedCurrency &&
        (!selectedSideCurrencies.includes(code) || code === currencyCode)
      )
    );
  }, [allCurrencies, selectedCurrency, selectedSideCurrencies, currencyCode]);

  const handleChange = useCallback(({ target }: SelectChangeEvent) => {
    onChange(position.toString(), target.value);
  }, [onChange, position]);

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
          <SkeletonComponent width={100} />
          {last7Days.map((_, index) => (
            <SkeletonComponent key={index} width={80} />
          ))}
        </FormControl>
      </div>
    );
  }

  const deleteIconButton = canRemove ? (
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
  ) : null;

  return (
    <div key={position} className="currency-row">
      {deleteIconButton}
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
        {last7Days.map((date, index) => {
          const dateKey = date.toISOString().split('T')[0];
          const rateForDate = currencyRatesByDate[dateKey]?.[selectedCurrency]?.[currencyCode];
          const formattedRate = rateForDate ? formatRate(rateForDate) : 'N/A';
          const isLoadingThisDate = loadingByDate[dateKey] ?? false;
          
          return (
            <div key={index} className="rate-cell">
              {isLoadingThisDate || !currencyRatesByDate[dateKey]?.[selectedCurrency] ? (
                <SkeletonComponent width={80} />
              ) : (
                <p className="currency-rate">{currencyCode ? formattedRate : null}</p>
              )}
            </div>
          );
        })}
      </FormControl>
    </div>
  );
};

const SkeletonComponent = ({width = 15}) =>
  <Skeleton variant="text" width={`${width}%`} height={30} sx={{ bgcolor: "#c681db07" }} />;