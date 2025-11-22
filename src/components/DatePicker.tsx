import { TextField, Box, Typography } from '@mui/material';
import { getYesterday, formatDateForInput, clampDate, getDateRange, getMinDate } from '../utils/dateUtils';

interface DatePickerProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
}

export const DatePicker = ({ selectedDate, onChange }: DatePickerProps) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(event.target.value);
    
    // Check if the date is valid
    if (isNaN(newDate.getTime())) return;
    
    const minDateObj = getMinDate();
    const yesterday = getYesterday();
    const clampedDate = clampDate(newDate, minDateObj, yesterday);
    onChange(clampedDate);
  };

  // Get yesterday's date as max date (can't select future dates)
  const yesterday = getYesterday();
  const maxDate = formatDateForInput(yesterday);

  // Set minimum date (90 days ago)
  const minDate = formatDateForInput(getMinDate());

  return (
    <Box className="date-picker-container">
      <TextField
        type="date"
        label="Select End Date"
        value={formatDateForInput(selectedDate)}
        onChange={handleChange}
        slotProps={{
          inputLabel: { shrink: true },
          htmlInput: { min: minDate, max: maxDate }
        }}
        fullWidth
        className="date-picker"
      />
      <Typography
        fontSize="0.9rem"
        variant="caption"
        color="text.secondary"
        className="info"
        sx={{ mt: 0.6, display: 'block' }}
      >
        Showing 7 days: <b>{getDateRange(selectedDate)}</b>
      </Typography>
    </Box>
  );
};
