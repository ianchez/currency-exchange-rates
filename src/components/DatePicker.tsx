import { TextField } from '@mui/material';
import { MIN_DATE } from '../constants/currency';
import { getYesterday, formatDateForInput, clampDate } from '../utils/dateUtils';

interface DatePickerProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
}

export const DatePicker = ({ selectedDate, onChange }: DatePickerProps) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(event.target.value);
    const minDateObj = new Date(MIN_DATE);
    const yesterday = getYesterday();
    const clampedDate = clampDate(newDate, minDateObj, yesterday);
    onChange(clampedDate);
  };

  // Get yesterday's date as max date (can't select future dates)
  const yesterday = getYesterday();
  const maxDate = formatDateForInput(yesterday);

  // Set minimum date (when data starts being available)
  const minDate = MIN_DATE;

  return (
    <TextField
      type="date"
      label="Select Date"
      value={formatDateForInput(selectedDate)}
      onChange={handleChange}
      slotProps={{
        inputLabel: {
          shrink: true,
        },
        htmlInput: {
          min: minDate,
          max: maxDate,
        }
      }}
      fullWidth
      className="date-picker"
    />
  );
};
