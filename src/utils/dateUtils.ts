/**
 * Used as default for historical rate queries since today's data might not be available
 */
export const getYesterday = (): Date => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday;
};

/**
 * Get the minimum date (90 days before today)
 */
export const getMinDate = (): Date => {
  const date = new Date();
  date.setDate(date.getDate() - 90);
  return date;
};

/**
 * Format a Date object to YYYY-MM-DD string for HTML date inputs
 */
export const formatDateForInput = (date: Date): string => {
  // Check if date is valid
  if (isNaN(date.getTime())) return '';
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Clamp a date between min and max dates
 */
export const clampDate = (date: Date, min: Date, max: Date): Date => {
  if (date < min) return min;
  if (date > max) return max;
  return date;
};

/**
 * Get a date range string for 7 days ending on the given date
 */
export const getDateRange = (endDate: Date): string => {
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - 6);
  return `${formatDateForInput(startDate)} to ${formatDateForInput(endDate)}`;
};

/**
 * Get an array of the last 7 dates (including and going back from the given date)
 */
export const getLast7Days = (endDate: Date): Date[] => {
  const dates: Date[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(endDate);
    date.setDate(endDate.getDate() - i);
    dates.push(date);
  }
  return dates;
};
