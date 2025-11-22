import { useMemo, useCallback, useState } from 'react';
import { FormControl, InputLabel, Select, MenuItem, IconButton, Skeleton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { SelectChangeEvent } from '@mui/material/Select';
import { mapCurrencyToMenuItem } from '../utils/currencySelectorUtils';
import { formatRate } from '../utils/formatUtils';
import { RateSparkline } from './RateSparkline';

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

const getFontSizeClass = (rate: string): string => {
  if (rate === 'N/A') return '';
  if (rate.length > 10) return 'rate-tiny';
  if (rate.length > 8) return 'rate-small';
  return '';
};

const SkeletonComponent = ({ width = 15 }: { width?: number }) => (
  <Skeleton variant="text" width={`${width}%`} height={30} sx={{ bgcolor: "#c681db07" }} />
);

const LoadingSkeleton = ({ position, last7Days }: { position: number; last7Days: Date[] }) => (
  <div key={position} className="currency-row">
    <div className="side-currency-form-control">
      <SkeletonComponent width={100} />
      <SkeletonComponent width={100} />
      {last7Days.map((_, index) => (
        <SkeletonComponent key={index} width={80} />
      ))}
    </div>
  </div>
);

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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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

  const sparklineData = useMemo(() => {
    return last7Days.map(date => {
      const dateKey = date.toISOString().split('T')[0];
      const rate = currencyRatesByDate[dateKey]?.[selectedCurrency]?.[currencyCode] || 0;
      return { date: dateKey, rate };
    });
  }, [last7Days, currencyRatesByDate, selectedCurrency, currencyCode]);

  const isAnyDateLoading = useMemo(
    () => Object.values(loadingByDate).some(loading => loading),
    [loadingByDate]
  );

  const validSparklineData = useMemo(
    () => sparklineData.filter(d => d.rate > 0),
    [sparklineData]
  );

  // Event handlers
  const handleChange = useCallback(({ target }: SelectChangeEvent) => {
    onChange(position.toString(), target.value);
  }, [onChange, position]);

  const handleMouseEnter = useCallback((index: number) => {
    setHoveredIndex(index);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(null);
  }, []);

  // Early return for loading state
  if (!mainCurrency || !allCurrencies) {
    return <LoadingSkeleton position={position} last7Days={last7Days} />;
  }

  // Render components
  const renderDeleteButton = () => {
    if (!canRemove) return null;
    
    return (
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
    );
  };

  const renderCurrencySelect = () => (
    <FormControl fullWidth variant='standard'>
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
    </FormControl>
  );

  const renderSparkline = () => {
    const shouldShowSparkline = currencyCode && !isAnyDateLoading && validSparklineData.length > 0;

    return (
      <div className="sparkline-cell">
        {shouldShowSparkline && (
          <RateSparkline 
            data={validSparklineData} 
            color="#bc75d2" 
            hoveredIndex={hoveredIndex}
            onHover={setHoveredIndex}
          />
        )}
      </div>
    );
  };

  const renderDailyRate = (date: Date, index: number) => {
    const dateKey = date.toISOString().split('T')[0];
    const rateForDate = currencyRatesByDate[dateKey]?.[selectedCurrency]?.[currencyCode];
    const formattedRate = rateForDate ? formatRate(rateForDate) : 'N/A';
    const isLoadingThisDate = loadingByDate[dateKey] ?? false;
    const isHovered = hoveredIndex === index;
    
    return (
      <div 
        key={dateKey} 
        className={`rate-cell ${isHovered ? 'hovered' : ''}`}
        onMouseEnter={() => handleMouseEnter(index)}
        onMouseLeave={handleMouseLeave}
      >
        {isLoadingThisDate || !currencyRatesByDate[dateKey]?.[selectedCurrency] ? (
          <SkeletonComponent width={80} />
        ) : (
          <p className={`currency-rate ${getFontSizeClass(formattedRate)}`}>
            {currencyCode ? formattedRate : null}
          </p>
        )}
      </div>
    );
  };

  return (
    <div key={position} className="currency-row">
      {renderDeleteButton()}
      <div className="side-currency-form-control">
        {renderCurrencySelect()}
        {renderSparkline()}
        {last7Days.map(renderDailyRate)}
      </div>
    </div>
  );
};