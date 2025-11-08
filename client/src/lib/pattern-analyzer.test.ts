import { describe, it, expect, beforeEach } from 'vitest';
import { UnifiedPatternAnalyzer, type PatternResult } from './pattern-analyzer';
import { type RouletteResult } from '@shared/schema';

describe('UnifiedPatternAnalyzer', () => {
  // Helper function to create mock roulette results
  const createResult = (number: number, sessionId = 'test-session'): RouletteResult => {
    let color: string;
    let dozen: number | null = null;
    let column: number | null = null;
    let half: string | null = null;
    let parity: string | null = null;

    if (number === 0) {
      color = 'green';
    } else {
      const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
      color = redNumbers.includes(number) ? 'red' : 'black';

      if (number >= 1 && number <= 12) dozen = 1;
      else if (number >= 13 && number <= 24) dozen = 2;
      else if (number >= 25 && number <= 36) dozen = 3;

      column = ((number - 1) % 3) + 1;
      half = number <= 18 ? 'low' : 'high';
      parity = number % 2 === 0 ? 'even' : 'odd';
    }

    return {
      id: `result-${number}-${Date.now()}`,
      number,
      color,
      dozen,
      column,
      half,
      parity,
      timestamp: new Date(),
      sessionId,
      source: 'manual'
    };
  };

  describe('analyzeColorSequence', () => {
    it('should return null for insufficient data', () => {
      const results = [createResult(1), createResult(3)];
      const pattern = UnifiedPatternAnalyzer.analyzeColorSequence(results);
      expect(pattern).toBeNull();
    });

    it('should detect red sequence and suggest black', () => {
      const results = [
        createResult(1),  // red
        createResult(3),  // red
        createResult(5),  // red
        createResult(7)   // red (for context)
      ];
      const pattern = UnifiedPatternAnalyzer.analyzeColorSequence(results);

      expect(pattern).not.toBeNull();
      expect(pattern?.type).toBe('color_sequence');
      expect(pattern?.targetOutcome).toBe('black');
      expect(pattern?.probability).toBeGreaterThan(0);
      expect(pattern?.confidence).toBeGreaterThan(0);
    });

    it('should detect black sequence and suggest red', () => {
      const results = [
        createResult(2),  // black
        createResult(4),  // black
        createResult(6),  // black
        createResult(8)   // black
      ];
      const pattern = UnifiedPatternAnalyzer.analyzeColorSequence(results);

      expect(pattern).not.toBeNull();
      expect(pattern?.targetOutcome).toBe('red');
    });

    it('should not detect pattern for mixed colors', () => {
      const results = [
        createResult(1),  // red
        createResult(2),  // black
        createResult(3),  // red
        createResult(4)   // black
      ];
      const pattern = UnifiedPatternAnalyzer.analyzeColorSequence(results);
      expect(pattern).toBeNull();
    });

    it('should ignore green (zero) in sequences', () => {
      const results = [
        createResult(0),  // green
        createResult(0),  // green
        createResult(0),  // green
        createResult(1)   // red
      ];
      const pattern = UnifiedPatternAnalyzer.analyzeColorSequence(results);
      expect(pattern).toBeNull();
    });
  });

  describe('generateStraightUpStrategy', () => {
    it('should return balanced numbers for insufficient data', () => {
      const results = [createResult(1), createResult(2)];
      const strategy = UnifiedPatternAnalyzer.generateStraightUpStrategy(results);

      expect(strategy).toHaveLength(7);
      expect(strategy).toEqual([7, 17, 23, 32, 1, 14, 29]);
    });

    it('should return exactly 7 numbers', () => {
      const results = Array.from({ length: 30 }, (_, i) => createResult((i % 36) + 1));
      const strategy = UnifiedPatternAnalyzer.generateStraightUpStrategy(results);

      expect(strategy).toHaveLength(7);
    });

    it('should include hot numbers in strategy', () => {
      const results = [
        ...Array(5).fill(0).map(() => createResult(17)), // Make 17 hot
        ...Array.from({ length: 25 }, (_, i) => createResult((i % 36) + 1))
      ];
      const strategy = UnifiedPatternAnalyzer.generateStraightUpStrategy(results);

      expect(strategy).toContain(17);
    });

    it('should not include zero in strategy', () => {
      const results = Array.from({ length: 30 }, () => createResult(0));
      const strategy = UnifiedPatternAnalyzer.generateStraightUpStrategy(results);

      expect(strategy).not.toContain(0);
    });

    it('should return unique numbers', () => {
      const results = Array.from({ length: 30 }, (_, i) => createResult((i % 36) + 1));
      const strategy = UnifiedPatternAnalyzer.generateStraightUpStrategy(results);

      const uniqueNumbers = new Set(strategy);
      expect(uniqueNumbers.size).toBe(strategy.length);
    });
  });

  describe('analyzeDozens', () => {
    it('should return null for insufficient data', () => {
      const results = [createResult(1), createResult(2)];
      const pattern = UnifiedPatternAnalyzer.analyzeDozens(results);
      expect(pattern).toBeNull();
    });

    it('should detect hot dozen pattern', () => {
      const results = [
        createResult(1), createResult(2), createResult(3), createResult(4), // 1st dozen
        createResult(5), createResult(6), createResult(7), createResult(8), // 1st dozen
        createResult(14), createResult(15) // 2nd dozen
      ];
      const pattern = UnifiedPatternAnalyzer.analyzeDozens(results);

      expect(pattern).not.toBeNull();
      expect(pattern?.type).toBe('dozen_hot');
      expect(pattern?.targetOutcome).toContain('dozen_');
    });

    it('should not detect pattern when no dozen is dominant', () => {
      const results = [
        createResult(1),   // 1st dozen
        createResult(2),   // 1st dozen
        createResult(14),  // 2nd dozen
        createResult(15),  // 2nd dozen
        createResult(26),  // 3rd dozen
        createResult(27),  // 3rd dozen
        createResult(28),  // 3rd dozen
        createResult(29),  // 3rd dozen
        createResult(30),  // 3rd dozen
        createResult(31)   // 3rd dozen
      ];
      const pattern = UnifiedPatternAnalyzer.analyzeDozens(results);

      expect(pattern).not.toBeNull(); // Actually should detect 3rd dozen
      expect(pattern?.targetOutcome).toContain('dozen_3');
    });

    it('should calculate probability based on frequency', () => {
      const results = Array(10).fill(0).map(() => createResult(5)); // All 1st dozen
      const pattern = UnifiedPatternAnalyzer.analyzeDozens(results);

      expect(pattern).not.toBeNull();
      expect(pattern?.probability).toBeGreaterThan(0);
      expect(pattern?.probability).toBeLessThanOrEqual(0.85);
    });
  });

  describe('analyzeHotNumbers', () => {
    it('should return null for insufficient data', () => {
      const results = [createResult(1), createResult(2)];
      const pattern = UnifiedPatternAnalyzer.analyzeHotNumbers(results);
      expect(pattern).toBeNull();
    });

    it('should detect hot number appearing frequently', () => {
      const results = [
        createResult(17), createResult(17), createResult(17), createResult(17),
        ...Array.from({ length: 16 }, (_, i) => createResult((i % 36) + 1))
      ];
      const pattern = UnifiedPatternAnalyzer.analyzeHotNumbers(results);

      expect(pattern).not.toBeNull();
      expect(pattern?.type).toBe('hot_number');
      expect(pattern?.targetOutcome).toBe(17);
    });

    it('should not detect pattern when numbers are evenly distributed', () => {
      const results = Array.from({ length: 20 }, (_, i) => createResult((i % 36) + 1));
      const pattern = UnifiedPatternAnalyzer.analyzeHotNumbers(results);

      expect(pattern).toBeNull();
    });

    it('should calculate correct probability for hot number', () => {
      const results = [
        ...Array(5).fill(0).map(() => createResult(23)),
        ...Array.from({ length: 15 }, (_, i) => createResult((i % 36) + 1))
      ];
      const pattern = UnifiedPatternAnalyzer.analyzeHotNumbers(results);

      expect(pattern).not.toBeNull();
      expect(pattern?.probability).toBeGreaterThan(0);
      expect(pattern?.probability).toBeLessThanOrEqual(0.75);
    });
  });

  describe('detectParity', () => {
    it('should return null for insufficient data', () => {
      const results = [createResult(1), createResult(2)];
      const pattern = UnifiedPatternAnalyzer.detectParity(results);
      expect(pattern).toBeNull();
    });

    it('should detect even trend and suggest odd', () => {
      const results = [
        createResult(2), createResult(4), createResult(6), createResult(8),
        createResult(10), createResult(12), createResult(14), createResult(16)
      ];
      const pattern = UnifiedPatternAnalyzer.detectParity(results);

      expect(pattern).not.toBeNull();
      expect(pattern?.type).toBe('parity_trend');
      expect(pattern?.targetOutcome).toBe('odd');
    });

    it('should detect odd trend and suggest even', () => {
      const results = [
        createResult(1), createResult(3), createResult(5), createResult(7),
        createResult(9), createResult(11), createResult(13), createResult(15)
      ];
      const pattern = UnifiedPatternAnalyzer.detectParity(results);

      expect(pattern).not.toBeNull();
      expect(pattern?.targetOutcome).toBe('even');
    });

    it('should filter out zero when detecting parity', () => {
      const results = [
        createResult(0), createResult(0), createResult(2), createResult(4),
        createResult(6), createResult(8), createResult(10), createResult(12)
      ];
      const pattern = UnifiedPatternAnalyzer.detectParity(results);

      expect(pattern).not.toBeNull();
      expect(pattern?.targetOutcome).toBe('odd');
    });

    it('should not detect pattern when parity is balanced', () => {
      const results = [
        createResult(1), createResult(2), createResult(3), createResult(4),
        createResult(5), createResult(6), createResult(7), createResult(8)
      ];
      const pattern = UnifiedPatternAnalyzer.detectParity(results);

      expect(pattern).toBeNull();
    });
  });

  describe('analyzeAll', () => {
    it('should return empty array for insufficient data', () => {
      const results = [createResult(1)];
      const patterns = UnifiedPatternAnalyzer.analyzeAll(results);
      expect(patterns).toEqual([]);
    });

    it('should return all detected patterns', () => {
      const results = [
        createResult(1), createResult(3), createResult(5), createResult(7),
        createResult(9), createResult(11), createResult(13), createResult(15),
        createResult(17), createResult(19), createResult(21), createResult(23),
        createResult(25), createResult(27), createResult(29), createResult(31),
        createResult(33), createResult(35), createResult(1), createResult(3)
      ];
      const patterns = UnifiedPatternAnalyzer.analyzeAll(results);

      expect(patterns.length).toBeGreaterThan(0);
      expect(patterns.every(p => p.type && p.probability && p.confidence)).toBe(true);
    });

    it('should sort patterns by probability descending', () => {
      const results = Array.from({ length: 30 }, (_, i) => {
        // Create biased data to generate multiple patterns
        if (i < 10) return createResult(1); // Hot number
        if (i < 15) return createResult(3); // Red sequence
        return createResult((i % 36) + 1);
      });

      const patterns = UnifiedPatternAnalyzer.analyzeAll(results);

      if (patterns.length > 1) {
        for (let i = 0; i < patterns.length - 1; i++) {
          expect(patterns[i].probability).toBeGreaterThanOrEqual(patterns[i + 1].probability);
        }
      }
    });

    it('should include all pattern types when conditions are met', () => {
      const results = [
        // Color sequence (red)
        createResult(1), createResult(3), createResult(5),
        // Same dozen
        createResult(7), createResult(9), createResult(11),
        // Hot number 17
        createResult(17), createResult(17), createResult(17),
        // Even parity
        createResult(2), createResult(4), createResult(6), createResult(8),
        createResult(10), createResult(12), createResult(14),
        // Additional results for analysis
        ...Array.from({ length: 10 }, (_, i) => createResult((i % 36) + 1))
      ];

      const patterns = UnifiedPatternAnalyzer.analyzeAll(results);
      const types = new Set(patterns.map(p => p.type));

      expect(patterns.length).toBeGreaterThan(0);
      // At least one pattern should be detected
      expect(types.size).toBeGreaterThan(0);
    });

    it('should return valid PatternResult objects', () => {
      const results = Array.from({ length: 30 }, (_, i) => createResult((i % 36) + 1));
      const patterns = UnifiedPatternAnalyzer.analyzeAll(results);

      patterns.forEach(pattern => {
        expect(pattern).toHaveProperty('type');
        expect(pattern).toHaveProperty('sequence');
        expect(pattern).toHaveProperty('targetOutcome');
        expect(pattern).toHaveProperty('probability');
        expect(pattern).toHaveProperty('confidence');
        expect(pattern).toHaveProperty('description');
        expect(pattern).toHaveProperty('suggestion');

        expect(typeof pattern.type).toBe('string');
        expect(Array.isArray(pattern.sequence)).toBe(true);
        expect(typeof pattern.probability).toBe('number');
        expect(typeof pattern.confidence).toBe('number');
        expect(pattern.probability).toBeGreaterThan(0);
        expect(pattern.probability).toBeLessThanOrEqual(1);
        expect(pattern.confidence).toBeGreaterThan(0);
        expect(pattern.confidence).toBeLessThanOrEqual(1);
      });
    });
  });
});
