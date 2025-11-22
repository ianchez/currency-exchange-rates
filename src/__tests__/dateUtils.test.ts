import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  getYesterday,
  getMinDate,
  formatDateForInput, 
  clampDate,
  getDateRange
} from '../utils/dateUtils';

describe('dateUtils', () => {
  describe('getYesterday', () => {
    beforeEach(() => {
      // Reset date mocks before each test
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns a Date object', () => {
      const result = getYesterday();
      expect(result).toBeInstanceOf(Date);
    });

    it('returns yesterday\'s date', () => {
      // Set a fixed date: November 22, 2025
      const mockDate = new Date('2025-11-22T12:00:00Z');
      vi.setSystemTime(mockDate);

      const yesterday = getYesterday();
      
      expect(yesterday.getDate()).toBe(21);
      expect(yesterday.getMonth()).toBe(10); // November (0-indexed)
      expect(yesterday.getFullYear()).toBe(2025);
    });
  });

  describe('getMinDate', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns a Date object', () => {
      const result = getMinDate();
      expect(result).toBeInstanceOf(Date);
    });

    it('returns a date 90 days before today', () => {
      // Set a fixed date: November 22, 2025
      const mockDate = new Date('2025-11-22T12:00:00Z');
      vi.setSystemTime(mockDate);

      const minDate = getMinDate();
      
      // 90 days before Nov 22, 2025 is August 24, 2025
      expect(minDate.getDate()).toBe(24);
      expect(minDate.getMonth()).toBe(7); // August (0-indexed)
      expect(minDate.getFullYear()).toBe(2025);
    });

    it('handles year boundaries correctly', () => {
      // Set date to early in the year
      const mockDate = new Date('2025-02-15T12:00:00Z');
      vi.setSystemTime(mockDate);

      const minDate = getMinDate();
      
      // 90 days before Feb 15, 2025 is November 17, 2024
      expect(minDate.getDate()).toBe(17);
      expect(minDate.getMonth()).toBe(10); // November (0-indexed)
      expect(minDate.getFullYear()).toBe(2024);
    });

    it('returns a date exactly 90 days in the past', () => {
      const mockDate = new Date('2025-11-22T12:00:00Z');
      vi.setSystemTime(mockDate);

      const minDate = getMinDate();
      const today = new Date();
      
      const daysDifference = Math.floor((today.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
      expect(daysDifference).toBe(90);
    });
  });

  describe('formatDateForInput', () => {
    it('formats date to YYYY-MM-DD', () => {
      const date = new Date('2025-11-22T12:00:00Z');
      const result = formatDateForInput(date);
      
      expect(result).toBe('2025-11-22');
    });

    it('pads single-digit months with zero', () => {
      const date = new Date('2025-03-15T12:00:00Z');
      const result = formatDateForInput(date);
      
      expect(result).toBe('2025-03-15');
    });

    it('pads single-digit days with zero', () => {
      const date = new Date('2025-11-05T12:00:00Z');
      const result = formatDateForInput(date);
      
      expect(result).toBe('2025-11-05');
    });

    it('returns consistent format for different times', () => {
      const morning = new Date('2025-11-22T08:00:00Z');
      const evening = new Date('2025-11-22T20:00:00Z');
      
      expect(formatDateForInput(morning)).toBe(formatDateForInput(evening));
    });

    it('returns empty string for invalid date', () => {
      const invalidDate = new Date('invalid');
      const result = formatDateForInput(invalidDate);
      
      expect(result).toBe('');
    });

    it('handles NaN date', () => {
      const nanDate = new Date(NaN);
      const result = formatDateForInput(nanDate);
      
      expect(result).toBe('');
    });
  });

  describe('clampDate', () => {
    const minDate = new Date('2024-04-01T00:00:00Z');
    const maxDate = new Date('2025-11-22T00:00:00Z');

    it('returns the date when within range', () => {
      const date = new Date('2025-06-15T12:00:00Z');
      const result = clampDate(date, minDate, maxDate);
      
      expect(result).toBe(date);
      expect(result.getTime()).toBe(date.getTime());
    });

    it('returns min date when date is before min', () => {
      const date = new Date('2024-01-01T12:00:00Z');
      const result = clampDate(date, minDate, maxDate);
      
      expect(result).toBe(minDate);
      expect(result.getTime()).toBe(minDate.getTime());
    });

    it('returns max date when date is after max', () => {
      const date = new Date('2026-01-01T12:00:00Z');
      const result = clampDate(date, minDate, maxDate);
      
      expect(result).toBe(maxDate);
      expect(result.getTime()).toBe(maxDate.getTime());
    });

    it('handles dates very close to boundaries', () => {
      const justBeforeMin = new Date(minDate.getTime() - 1);
      const justAfterMax = new Date(maxDate.getTime() + 1);
      
      expect(clampDate(justBeforeMin, minDate, maxDate)).toBe(minDate);
      expect(clampDate(justAfterMax, minDate, maxDate)).toBe(maxDate);
    });

    it('handles same min and max date', () => {
      const singleDate = new Date('2025-06-15T12:00:00Z');
      const before = new Date('2025-06-14T12:00:00Z');
      const after = new Date('2025-06-16T12:00:00Z');
      
      expect(clampDate(before, singleDate, singleDate)).toBe(singleDate);
      expect(clampDate(after, singleDate, singleDate)).toBe(singleDate);
      expect(clampDate(singleDate, singleDate, singleDate)).toBe(singleDate);
    });
  });

  describe('getDateRange', () => {
    it('returns 7-day range ending on given date', () => {
      const date = new Date('2025-11-22T12:00:00Z');
      const result = getDateRange(date);
      
      expect(result).toBe('2025-11-16 to 2025-11-22');
    });

    it('handles month boundaries correctly', () => {
      const date = new Date('2025-11-05T12:00:00Z');
      const result = getDateRange(date);
      
      expect(result).toBe('2025-10-30 to 2025-11-05');
    });

    it('handles year boundaries correctly', () => {
      const date = new Date('2025-01-03T12:00:00Z');
      const result = getDateRange(date);
      
      expect(result).toBe('2024-12-28 to 2025-01-03');
    });
  });
});
