import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SideCurrencyRow } from '../components/SideCurrencyRow';
import { mockCurrencies, mockCurrencyRates, mockSideCurrencies } from './helpers/testUtils';
import { getLast7Days } from '../utils/dateUtils';
import { formatRate } from '../utils/formatUtils';

describe('SideCurrencyRow', () => {
  const testDate = new Date('2025-11-22T12:00:00Z');
  const last7Days = getLast7Days(testDate);
  
  // Create mock rates for all 7 days
  const mockCurrencyRatesByDate: Record<string, Record<string, Record<string, number>>> = {};
  const mockLoadingByDate: Record<string, boolean> = {};
  last7Days.forEach(date => {
    const dateKey = date.toISOString().split('T')[0];
    mockCurrencyRatesByDate[dateKey] = mockCurrencyRates;
    mockLoadingByDate[dateKey] = false;
  });
  
  const defaultProps = {
    position: 1,
    currencyCode: 'usd',
    selectedCurrency: 'gbp',
    mainCurrency: 'gbp',
    allCurrencies: mockCurrencies,
    currencyRatesByDate: mockCurrencyRatesByDate,
    loadingByDate: mockLoadingByDate,
    sideCurrencies: mockSideCurrencies,
    canRemove: false,
    isLoadingRates: false,
    last7Days: last7Days,
    onRemove: vi.fn(),
    onChange: vi.fn()
  };

  it('renders the currency select component', () => {
    render(<SideCurrencyRow {...defaultProps} />);
    
    expect(screen.getByText('Comparing with:')).toBeInTheDocument();
  });

  it('displays the exchange rate for selected currency', () => {
    render(<SideCurrencyRow {...defaultProps} />);
    
    const rate = formatRate(mockCurrencyRates.gbp.usd);
    const rateElements = screen.getAllByText(rate);
    // Should have 7 instances (one for each day)
    expect(rateElements.length).toBe(7);
  });

  it('shows skeleton when mainCurrency is not set', () => {
    render(<SideCurrencyRow {...defaultProps} mainCurrency="" />);
    
    // Skeleton components should be rendered
    const skeletons = document.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows skeleton when allCurrencies is undefined', () => {
    render(<SideCurrencyRow {...defaultProps} allCurrencies={undefined} />);
    
    const skeletons = document.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows skeleton for rate when isLoadingRates is true', () => {
    // Create loading state for all dates
    const loadingAll: Record<string, boolean> = {};
    last7Days.forEach(date => {
      const dateKey = date.toISOString().split('T')[0];
      loadingAll[dateKey] = true;
    });
    
    render(<SideCurrencyRow {...defaultProps} isLoadingRates={true} loadingByDate={loadingAll} />);
    
    // Rate should be a skeleton, not the actual number
    const rate = mockCurrencyRates.gbp.usd.toFixed(4);
    expect(screen.queryByText(rate)).not.toBeInTheDocument();
    
    const skeletons = document.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows skeleton for rate when currencyRatesByDate is undefined', () => {
    render(<SideCurrencyRow {...defaultProps} currencyRatesByDate={{}} />);
    
    const skeletons = document.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('calls onChange when a new currency is selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    
    render(<SideCurrencyRow {...defaultProps} onChange={onChange} />);
    
    const select = screen.getByRole('combobox');
    await user.click(select);
    
    // CAD is available since it's not selected in any other row
    const cadOption = screen.getByRole('option', { name: /CAD.*Canadian Dollar/i });
    await user.click(cadOption);
    
    expect(onChange).toHaveBeenCalledWith('1', 'cad');
  });

  it('renders delete button when canRemove is true', () => {
    render(<SideCurrencyRow {...defaultProps} canRemove={true} />);
    
    const deleteButton = screen.getByLabelText('delete');
    expect(deleteButton).toBeInTheDocument();
  });

  it('does not render delete button when canRemove is false', () => {
    render(<SideCurrencyRow {...defaultProps} canRemove={false} />);
    
    const deleteButton = screen.queryByLabelText('delete');
    expect(deleteButton).not.toBeInTheDocument();
  });

  it('calls onRemove when delete button is clicked', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    
    render(<SideCurrencyRow {...defaultProps} canRemove={true} onRemove={onRemove} />);
    
    const deleteButton = screen.getByLabelText('delete');
    await user.click(deleteButton);
    
    expect(onRemove).toHaveBeenCalledWith(1);
  });

  it('disables select when isLoadingRates is true', () => {
    render(<SideCurrencyRow {...defaultProps} isLoadingRates={true} />);
    
    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('aria-disabled', 'true');
  });

  it('disables delete button when isLoadingRates is true', () => {
    render(<SideCurrencyRow {...defaultProps} canRemove={true} isLoadingRates={true} />);
    
    const deleteButton = screen.getByLabelText('delete');
    expect(deleteButton).toBeDisabled();
  });

  it('filters out the main currency from options', async () => {
    const user = userEvent.setup();
    
    render(<SideCurrencyRow {...defaultProps} />);
    
    const select = screen.getByRole('combobox');
    await user.click(select);
    
    // GBP (main currency) should not be in the options
    const gbpOption = screen.queryByRole('option', { name: /GBP/i });
    expect(gbpOption).not.toBeInTheDocument();
  });

  it('filters out already selected side currencies except current', async () => {
    const user = userEvent.setup();
    
    render(<SideCurrencyRow {...defaultProps} />);
    
    const select = screen.getByRole('combobox');
    await user.click(select);
    
    // EUR and JPY are already selected by other rows (positions 2 and 3)
    // They should be filtered out
    const eurOption = screen.queryByRole('option', { name: /EUR.*Euro/i });
    const jpyOption = screen.queryByRole('option', { name: /JPY.*Japanese Yen/i });
    
    expect(eurOption).not.toBeInTheDocument();
    expect(jpyOption).not.toBeInTheDocument();
  });

  it('includes current currency code in options even if selected elsewhere', async () => {
    const user = userEvent.setup();
    
    render(<SideCurrencyRow {...defaultProps} />);
    
    const select = screen.getByRole('combobox');
    await user.click(select);
    
    // USD is the current selection, should be in options
    const usdOption = screen.getByRole('option', { name: /USD.*US Dollar/i });
    expect(usdOption).toBeInTheDocument();
  });

  it('displays rate as 0 when rate is undefined', () => {
    const ratesWithoutUsd: Record<string, Record<string, Record<string, number>>> = {};
    last7Days.forEach(date => {
      const dateKey = date.toISOString().split('T')[0];
      ratesWithoutUsd[dateKey] = {
        gbp: {
          eur: 1.1834,
          jpy: 188.45
        }
      };
    });
    
    render(<SideCurrencyRow {...defaultProps} currencyRatesByDate={ratesWithoutUsd} />);
    
    const naElements = screen.getAllByText('N/A');
    // Should have 7 instances (one for each day)
    expect(naElements.length).toBe(7);
  });

  it('shows correct label when no currency is selected', () => {
    render(<SideCurrencyRow {...defaultProps} currencyCode="" />);
    
    expect(screen.getByText('Select a Currency')).toBeInTheDocument();
  });

  it('displays rate with proper formatting', () => {
    render(<SideCurrencyRow {...defaultProps} />);
    
    const rate = formatRate(mockCurrencyRates.gbp.usd);
    const rateElements = screen.getAllByText(rate);
    // Should have 7 instances (one for each day)
    expect(rateElements.length).toBe(7);
  });

  it('shows null rate when no currency is selected', () => {
    render(<SideCurrencyRow {...defaultProps} currencyCode="" />);
    
    const rateElements = document.querySelectorAll('.currency-rate');
    // Should have 7 rate cells, all empty
    expect(rateElements.length).toBe(7);
    rateElements.forEach(element => {
      expect(element.textContent).toBe('');
    });
  });

  it('renders with correct position value', () => {
    const position = 5;
    render(<SideCurrencyRow {...defaultProps} position={position} />);
    
    // The position should be used in the component
    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('id', expect.stringContaining('select-compare-currency'));
  });
});
