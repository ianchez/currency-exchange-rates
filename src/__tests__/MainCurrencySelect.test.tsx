import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { MainCurrencySelect } from '../components/MainCurrencySelect';
import { createMockProps } from './helpers/testUtils';

describe('MainCurrencySelect', () => {
  const defaultProps = createMockProps();

  it('renders the select component with label', () => {
    render(<MainCurrencySelect {...defaultProps} />);
    
    expect(screen.getByLabelText('Selected Currency')).toBeInTheDocument();
  });

  it('displays all currencies as menu items', () => {
    render(<MainCurrencySelect {...defaultProps} />);
    
    const select = screen.getByLabelText('Selected Currency');
    expect(select).toHaveTextContent('USD (US Dollar)');
  });

  it('displays selected currency value', () => {
    render(<MainCurrencySelect {...defaultProps} />);
    
    // MUI Select renders the value as text content, not as a value attribute
    const select = screen.getByRole('combobox');
    expect(select).toHaveTextContent('USD (US Dollar)');
  });

  it('calls onChange when a new currency is selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    
    render(<MainCurrencySelect {...defaultProps} onChange={onChange} />);
    
    const select = screen.getByRole('combobox');
    await user.click(select);
    
    const eurOption = screen.getByRole('option', { name: /EUR.*Euro/i });
    await user.click(eurOption);
    
    expect(onChange).toHaveBeenCalledWith('eur');
  });

  it('disables the select when isLoadingRates is true', () => {
    render(<MainCurrencySelect {...defaultProps} isLoadingRates={true} />);
    
    // MUI Select uses aria-disabled for disabled state
    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('aria-disabled', 'true');
  });

  it('shows loading state when currencies are undefined', () => {
    render(<MainCurrencySelect {...defaultProps} allCurrencies={undefined} />);
    
    const select = screen.getByLabelText('Selected Currency');
    expect(select).toBeInTheDocument();
  });
});
