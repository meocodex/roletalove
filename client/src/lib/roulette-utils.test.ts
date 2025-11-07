import { describe, it, expect } from 'vitest';
import {
  ROULETTE_NUMBERS,
  getNumberColor,
  getNumberProperties,
  getColorClass,
  formatRouletteNumber,
  ROULETTE_LAYOUT,
  getNeighbors,
} from './roulette-utils';

describe('Roulette Utils', () => {
  describe('ROULETTE_NUMBERS constants', () => {
    it('should have correct red numbers count', () => {
      expect(ROULETTE_NUMBERS.RED.length).toBe(18);
    });

    it('should have correct black numbers count', () => {
      expect(ROULETTE_NUMBERS.BLACK.length).toBe(18);
    });

    it('should have green number', () => {
      expect(ROULETTE_NUMBERS.GREEN).toEqual([0]);
    });

    it('should have all 37 numbers total', () => {
      const total = ROULETTE_NUMBERS.RED.length +
                    ROULETTE_NUMBERS.BLACK.length +
                    ROULETTE_NUMBERS.GREEN.length;
      expect(total).toBe(37);
    });
  });

  describe('getNumberColor', () => {
    it('should return green for zero', () => {
      expect(getNumberColor(0)).toBe('green');
    });

    it('should return red for red numbers', () => {
      expect(getNumberColor(1)).toBe('red');
      expect(getNumberColor(32)).toBe('red');
    });

    it('should return black for black numbers', () => {
      expect(getNumberColor(2)).toBe('black');
      expect(getNumberColor(17)).toBe('black');
    });

    it('should handle all valid numbers 0-36', () => {
      for (let i = 0; i <= 36; i++) {
        const color = getNumberColor(i);
        expect(['red', 'black', 'green']).toContain(color);
      }
    });
  });

  describe('getNumberProperties', () => {
    it('should return correct properties for zero', () => {
      const props = getNumberProperties(0);
      expect(props.number).toBe(0);
      expect(props.color).toBe('green');
      expect(props.dozen).toBeNull();
      expect(props.column).toBeNull();
      expect(props.half).toBeNull();
      expect(props.parity).toBeNull();
    });

    it('should return correct properties for number 1', () => {
      const props = getNumberProperties(1);
      expect(props.number).toBe(1);
      expect(props.color).toBe('red');
      expect(props.dozen).toBe(1);
      expect(props.column).toBe(1);
      expect(props.half).toBe('low');
      expect(props.parity).toBe('odd');
    });

    it('should return correct properties for number 17', () => {
      const props = getNumberProperties(17);
      expect(props.number).toBe(17);
      expect(props.color).toBe('black');
      expect(props.dozen).toBe(2);
      expect(props.column).toBe(2);
      expect(props.half).toBe('low');
      expect(props.parity).toBe('odd');
    });

    it('should return correct properties for number 36', () => {
      const props = getNumberProperties(36);
      expect(props.number).toBe(36);
      expect(props.color).toBe('red');
      expect(props.dozen).toBe(3);
      expect(props.column).toBe(3);
      expect(props.half).toBe('high');
      expect(props.parity).toBe('even');
    });

    it('should assign correct dozens', () => {
      // Dozen 1: 1-12
      expect(getNumberProperties(1).dozen).toBe(1);
      expect(getNumberProperties(12).dozen).toBe(1);

      // Dozen 2: 13-24
      expect(getNumberProperties(13).dozen).toBe(2);
      expect(getNumberProperties(24).dozen).toBe(2);

      // Dozen 3: 25-36
      expect(getNumberProperties(25).dozen).toBe(3);
      expect(getNumberProperties(36).dozen).toBe(3);
    });

    it('should assign correct halves', () => {
      // Low: 1-18
      expect(getNumberProperties(1).half).toBe('low');
      expect(getNumberProperties(18).half).toBe('low');

      // High: 19-36
      expect(getNumberProperties(19).half).toBe('high');
      expect(getNumberProperties(36).half).toBe('high');
    });

    it('should assign correct parity', () => {
      expect(getNumberProperties(2).parity).toBe('even');
      expect(getNumberProperties(4).parity).toBe('even');
      expect(getNumberProperties(1).parity).toBe('odd');
      expect(getNumberProperties(3).parity).toBe('odd');
    });
  });

  describe('getColorClass', () => {
    it('should return correct class for red', () => {
      const className = getColorClass('red');
      expect(className).toContain('bg-roulette-red');
    });

    it('should return correct class for black', () => {
      const className = getColorClass('black');
      expect(className).toContain('bg-black');
    });

    it('should return correct class for green', () => {
      const className = getColorClass('green');
      expect(className).toContain('bg-roulette-green');
    });

    it('should return default for unknown color', () => {
      const className = getColorClass('purple');
      expect(className).toBe('bg-gray-500');
    });
  });

  describe('formatRouletteNumber', () => {
    it('should format single digits with leading zero', () => {
      expect(formatRouletteNumber(0)).toBe('00');
      expect(formatRouletteNumber(1)).toBe('01');
      expect(formatRouletteNumber(9)).toBe('09');
    });

    it('should format double digits without change', () => {
      expect(formatRouletteNumber(10)).toBe('10');
      expect(formatRouletteNumber(17)).toBe('17');
      expect(formatRouletteNumber(36)).toBe('36');
    });

    it('should format all numbers correctly', () => {
      for (let i = 0; i <= 36; i++) {
        const formatted = formatRouletteNumber(i);
        expect(formatted).toHaveLength(2);
        expect(parseInt(formatted)).toBe(i);
      }
    });
  });

  describe('ROULETTE_LAYOUT', () => {
    it('should have 3 rows', () => {
      expect(ROULETTE_LAYOUT.length).toBe(3);
    });

    it('should have 12 numbers in each row', () => {
      ROULETTE_LAYOUT.forEach(row => {
        expect(row.length).toBe(12);
      });
    });

    it('should contain all numbers 1-36', () => {
      const allNumbers = ROULETTE_LAYOUT.flat();
      expect(allNumbers.length).toBe(36);

      for (let i = 1; i <= 36; i++) {
        expect(allNumbers).toContain(i);
      }
    });

    it('should have correct first row', () => {
      const expected = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36];
      expect(ROULETTE_LAYOUT[0]).toEqual(expected);
    });

    it('should have correct second row', () => {
      const expected = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35];
      expect(ROULETTE_LAYOUT[1]).toEqual(expected);
    });

    it('should have correct third row', () => {
      const expected = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34];
      expect(ROULETTE_LAYOUT[2]).toEqual(expected);
    });
  });

  describe('getNeighbors', () => {
    it('should return neighbors for valid numbers', () => {
      const neighbors = getNeighbors(17);
      expect(neighbors).toBeDefined();
      expect(Array.isArray(neighbors)).toBe(true);
    });

    it('should return correct number of neighbors for default radius', () => {
      const neighbors = getNeighbors(17);
      expect(neighbors.length).toBeLessThanOrEqual(7);
    });

    it('should return fewer neighbors for smaller radius', () => {
      const radius1 = getNeighbors(17, 1);
      const radius2 = getNeighbors(17, 2);

      expect(radius1.length).toBeLessThanOrEqual(radius2.length);
    });

    it('should return empty for unmapped numbers', () => {
      const neighbors = getNeighbors(100);
      expect(neighbors).toEqual([]);
    });

    it('should work for all valid roulette numbers', () => {
      for (let i = 0; i <= 36; i++) {
        const neighbors = getNeighbors(i);
        expect(Array.isArray(neighbors)).toBe(true);
      }
    });
  });

  describe('Integration: Properties Consistency', () => {
    it('should have consistent colors across utilities', () => {
      for (let i = 0; i <= 36; i++) {
        const colorFromUtil = getNumberColor(i);
        const colorFromProps = getNumberProperties(i).color;
        expect(colorFromUtil).toBe(colorFromProps);
      }
    });

    it('should have valid CSS classes for all colors', () => {
      for (let i = 0; i <= 36; i++) {
        const color = getNumberColor(i);
        const cssClass = getColorClass(color);
        expect(cssClass).toBeDefined();
        expect(cssClass.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Business Logic Validation', () => {
    it('should have 37 total numbers in European roulette', () => {
      const allNumbers = [
        ...ROULETTE_NUMBERS.RED,
        ...ROULETTE_NUMBERS.BLACK,
        ...ROULETTE_NUMBERS.GREEN
      ];
      expect(allNumbers.length).toBe(37);
    });

    it('should have equal red and black numbers', () => {
      expect(ROULETTE_NUMBERS.RED.length).toBe(ROULETTE_NUMBERS.BLACK.length);
    });

    it('should have all layout numbers in valid range', () => {
      ROULETTE_LAYOUT.flat().forEach(num => {
        expect(num).toBeGreaterThanOrEqual(1);
        expect(num).toBeLessThanOrEqual(36);
      });
    });
  });
});
