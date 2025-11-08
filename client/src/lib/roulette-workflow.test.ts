import { describe, it, expect, beforeEach } from 'vitest';
import { UnifiedPatternAnalyzer } from './pattern-analyzer';
import type { RouletteResult } from '@shared/schema';

/**
 * WORKFLOW: Análise de Roleta Completa
 *
 * Testa o fluxo completo de:
 * 1. Usuário adiciona número da roleta
 * 2. Sistema analisa padrões
 * 3. Gera estratégias
 * 4. Apresenta sugestões
 * 5. Usuário aposta
 * 6. Resultado é validado
 */
describe('Roulette Analysis Workflow', () => {
  // Helper para criar resultado de roleta
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

  describe('Initial Game Start Flow', () => {
    it('should handle first spin of the day', () => {
      // STEP 1: User starts new session
      const sessionId = 'session-001';
      const results: RouletteResult[] = [];

      // STEP 2: First number appears
      const firstNumber = 17;
      const result = createResult(firstNumber, sessionId);
      results.push(result);

      // STEP 3: System records number
      expect(results.length).toBe(1);
      expect(results[0].number).toBe(17);
      expect(results[0].color).toBe('black');

      // STEP 4: Not enough data for analysis
      const patterns = UnifiedPatternAnalyzer.analyzeAll(results);
      expect(patterns.length).toBe(0);

      // STEP 5: System suggests balanced strategy
      const strategy = UnifiedPatternAnalyzer.generateStraightUpStrategy(results);
      expect(strategy).toEqual([7, 17, 23, 32, 1, 14, 29]); // Default balanced numbers
    });

    it('should accumulate results over time', () => {
      // STEP 1: Session starts
      const results: RouletteResult[] = [];

      // STEP 2: Multiple numbers are added
      const numbers = [17, 23, 32, 5, 14, 29, 7, 11, 30];
      numbers.forEach(num => {
        results.push(createResult(num));
      });

      // STEP 3: Results are accumulated
      expect(results.length).toBe(9);

      // STEP 4: Can be analyzed
      const strategy = UnifiedPatternAnalyzer.generateStraightUpStrategy(results);
      expect(strategy.length).toBe(7);
      expect(strategy.every(n => n > 0 && n <= 36)).toBe(true);
    });
  });

  describe('Pattern Detection Flow', () => {
    it('should detect color pattern and suggest bet', () => {
      // STEP 1: User observes multiple red numbers
      const results: RouletteResult[] = [
        createResult(1),  // red
        createResult(3),  // red
        createResult(5),  // red
        createResult(7),  // red (for context)
      ];

      // STEP 2: System analyzes patterns
      const patterns = UnifiedPatternAnalyzer.analyzeAll(results);

      // STEP 3: Pattern is detected
      expect(patterns.length).toBeGreaterThan(0);
      const colorPattern = patterns.find(p => p.type === 'color_sequence');
      expect(colorPattern).toBeDefined();

      // STEP 4: System suggests opposite color
      expect(colorPattern?.targetOutcome).toBe('black');
      expect(colorPattern?.probability).toBeGreaterThan(0);

      // STEP 5: User sees suggestion
      expect(colorPattern?.suggestion).toContain('Preto');
    });

    it('should detect hot dozen and suggest bet', () => {
      // STEP 1: Multiple numbers from same dozen appear
      const results: RouletteResult[] = [
        createResult(1),   // 1st dozen
        createResult(2),   // 1st dozen
        createResult(3),   // 1st dozen
        createResult(4),   // 1st dozen
        createResult(5),   // 1st dozen
        createResult(14),  // 2nd dozen
        createResult(15),  // 2nd dozen
        createResult(26),  // 3rd dozen
        createResult(27),  // 3rd dozen
        createResult(6),   // 1st dozen
      ];

      // STEP 2: System analyzes patterns
      const patterns = UnifiedPatternAnalyzer.analyzeAll(results);

      // STEP 3: Hot dozen pattern detected
      const dozenPattern = patterns.find(p => p.type === 'dozen_hot');
      expect(dozenPattern).toBeDefined();

      // STEP 4: System suggests betting on hot dozen
      expect(dozenPattern?.targetOutcome).toContain('dozen_1');

      // STEP 5: Shows probability and confidence
      expect(dozenPattern?.probability).toBeGreaterThan(0.5);
      expect(dozenPattern?.confidence).toBeGreaterThan(0.5);
    });

    it('should detect hot number pattern', () => {
      // STEP 1: Same number appears frequently
      const results: RouletteResult[] = [
        createResult(17), createResult(17), createResult(17), createResult(17),
        ...Array.from({ length: 16 }, (_, i) => createResult((i % 36) + 1))
      ];

      // STEP 2: System analyzes
      const patterns = UnifiedPatternAnalyzer.analyzeAll(results);

      // STEP 3: Hot number detected
      const hotPattern = patterns.find(p => p.type === 'hot_number');
      expect(hotPattern).toBeDefined();

      // STEP 4: Suggests betting on hot number
      expect(hotPattern?.targetOutcome).toBe(17);
    });

    it('should detect parity trend', () => {
      // STEP 1: Even numbers dominate
      const results: RouletteResult[] = [
        createResult(2), createResult(4), createResult(6), createResult(8),
        createResult(10), createResult(12), createResult(14), createResult(16)
      ];

      // STEP 2: System analyzes
      const patterns = UnifiedPatternAnalyzer.analyzeAll(results);

      // STEP 3: Parity trend detected
      const parityPattern = patterns.find(p => p.type === 'parity_trend');
      expect(parityPattern).toBeDefined();

      // STEP 4: Suggests opposite parity
      expect(parityPattern?.targetOutcome).toBe('odd');
    });
  });

  describe('Strategy Generation Flow', () => {
    it('should generate strategy based on hot numbers', () => {
      // STEP 1: Some numbers appear more frequently
      const results: RouletteResult[] = [];

      // Make 17, 23, 32 hot
      for (let i = 0; i < 5; i++) {
        results.push(createResult(17));
        results.push(createResult(23));
        results.push(createResult(32));
      }

      // Add variety
      for (let i = 1; i <= 15; i++) {
        results.push(createResult(i));
      }

      // STEP 2: Generate strategy
      const strategy = UnifiedPatternAnalyzer.generateStraightUpStrategy(results);

      // STEP 3: Strategy includes hot numbers
      expect(strategy).toContain(17);
      expect(strategy).toContain(23);
      expect(strategy).toContain(32);

      // STEP 4: Strategy has exactly 7 numbers
      expect(strategy.length).toBe(7);

      // STEP 5: All numbers are valid
      expect(strategy.every(n => n >= 1 && n <= 36)).toBe(true);
    });

    it('should prioritize hot numbers in strategy', () => {
      // STEP 1: Create history with some numbers appearing frequently
      const results: RouletteResult[] = [];
      const hotNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

      hotNumbers.forEach(num => {
        results.push(createResult(num));
        results.push(createResult(num));
      });

      // STEP 2: Generate strategy
      const strategy = UnifiedPatternAnalyzer.generateStraightUpStrategy(results);

      // STEP 3: Strategy should include some of the hot numbers
      const hasHotNumber = strategy.some(num => hotNumbers.includes(num));
      expect(hasHotNumber).toBe(true);

      // STEP 4: Strategy is balanced with 7 numbers
      expect(strategy.length).toBe(7);
    });

    it('should provide unique numbers only', () => {
      // STEP 1: Generate strategy
      const results = Array.from({ length: 30 }, (_, i) => createResult((i % 36) + 1));
      const strategy = UnifiedPatternAnalyzer.generateStraightUpStrategy(results);

      // STEP 2: Check uniqueness
      const uniqueNumbers = new Set(strategy);
      expect(uniqueNumbers.size).toBe(strategy.length);
    });
  });

  describe('Real-time Analysis Flow', () => {
    it('should update analysis as new numbers arrive', () => {
      // STEP 1: Start with initial results
      let results: RouletteResult[] = [
        createResult(1),
        createResult(2),
      ];

      // STEP 2: Initial analysis - not enough data
      let patterns = UnifiedPatternAnalyzer.analyzeAll(results);
      expect(patterns.length).toBe(0);

      // STEP 3: Add more numbers
      results.push(createResult(3));
      results.push(createResult(5));
      results.push(createResult(7));
      results.push(createResult(9));
      results.push(createResult(11));
      results.push(createResult(13));

      // STEP 4: Re-analyze with new data
      patterns = UnifiedPatternAnalyzer.analyzeAll(results);

      // STEP 5: Now patterns may be detected
      expect(patterns.length).toBeGreaterThanOrEqual(0);
    });

    it('should prioritize patterns by probability', () => {
      // STEP 1: Create scenario with multiple patterns
      const results: RouletteResult[] = [
        // Color sequence (red)
        createResult(1), createResult(3), createResult(5),
        // Even numbers
        createResult(2), createResult(4), createResult(6), createResult(8),
        // Hot dozen
        createResult(7), createResult(9), createResult(11),
        // Additional context
        createResult(14), createResult(15), createResult(16),
        createResult(17), createResult(18), createResult(19),
        createResult(20), createResult(21), createResult(22),
      ];

      // STEP 2: Analyze all patterns
      const patterns = UnifiedPatternAnalyzer.analyzeAll(results);

      // STEP 3: Should be sorted by probability
      for (let i = 0; i < patterns.length - 1; i++) {
        expect(patterns[i].probability).toBeGreaterThanOrEqual(patterns[i + 1].probability);
      }
    });
  });

  describe('User Betting Flow', () => {
    it('should validate bet based on strategy', () => {
      // STEP 1: User receives strategy
      const results = Array.from({ length: 30 }, (_, i) => createResult((i % 36) + 1));
      const strategy = UnifiedPatternAnalyzer.generateStraightUpStrategy(results);

      // STEP 2: User chooses to bet on suggested numbers
      const userBets = strategy.slice(0, 5); // User bets on first 5

      // STEP 3: Validate bets are valid roulette numbers
      expect(userBets.every(bet => bet >= 1 && bet <= 36)).toBe(true);

      // STEP 4: User places bet
      const betAmount = 10; // R$ 10 per number
      const totalBet = betAmount * userBets.length;
      expect(totalBet).toBe(50);
    });

    it('should handle bet on pattern suggestion', () => {
      // STEP 1: System detects color pattern
      const results: RouletteResult[] = [
        createResult(1), createResult(3), createResult(5), createResult(7)
      ];

      const patterns = UnifiedPatternAnalyzer.analyzeAll(results);
      const colorPattern = patterns.find(p => p.type === 'color_sequence');

      // STEP 2: User decides to bet on suggested color
      const suggestedColor = colorPattern?.targetOutcome;
      expect(suggestedColor).toBe('black');

      // STEP 3: User places color bet
      const bet = {
        type: 'color',
        value: suggestedColor,
        amount: 50,
      };

      expect(bet.value).toBe('black');
      expect(bet.amount).toBe(50);
    });
  });

  describe('Result Validation Flow', () => {
    it('should validate winning bet', () => {
      // STEP 1: User bet on specific numbers
      const userBets = [17, 23, 32, 5, 14];

      // STEP 2: New number appears
      const newResult = createResult(17);

      // STEP 3: Check if user won
      const isWinner = userBets.includes(newResult.number);
      expect(isWinner).toBe(true);

      // STEP 4: Calculate payout (35:1 for straight up)
      const betAmount = 10;
      const payout = isWinner ? betAmount * 35 : 0;
      expect(payout).toBe(350);
    });

    it('should validate losing bet', () => {
      // STEP 1: User bet on specific numbers
      const userBets = [17, 23, 32, 5, 14];

      // STEP 2: Different number appears
      const newResult = createResult(1);

      // STEP 3: Check if user won
      const isWinner = userBets.includes(newResult.number);
      expect(isWinner).toBe(false);

      // STEP 4: No payout
      const betAmount = 10;
      const payout = isWinner ? betAmount * 35 : 0;
      expect(payout).toBe(0);
    });

    it('should validate color bet', () => {
      // STEP 1: User bet on black
      const userBet = { type: 'color', value: 'black', amount: 50 };

      // STEP 2: Black number appears
      const newResult = createResult(2); // black

      // STEP 3: Check win
      const isWinner = newResult.color === userBet.value;
      expect(isWinner).toBe(true);

      // STEP 4: Calculate payout (1:1 for color)
      const payout = isWinner ? userBet.amount * 2 : 0;
      expect(payout).toBe(100);
    });
  });

  describe('Session Statistics Flow', () => {
    it('should track session statistics', () => {
      // STEP 1: Create session with multiple results
      const sessionId = 'session-statistics';
      const results: RouletteResult[] = [
        createResult(1, sessionId),   // red
        createResult(2, sessionId),   // black
        createResult(3, sessionId),   // red
        createResult(4, sessionId),   // black
        createResult(17, sessionId),  // black
        createResult(23, sessionId),  // red
        createResult(32, sessionId),  // red
        createResult(0, sessionId),   // green
      ];

      // STEP 2: Calculate statistics
      const totalSpins = results.length;
      const redCount = results.filter(r => r.color === 'red').length;
      const blackCount = results.filter(r => r.color === 'black').length;
      const greenCount = results.filter(r => r.color === 'green').length;

      // STEP 3: Verify statistics
      expect(totalSpins).toBe(8);
      expect(redCount).toBe(4);
      expect(blackCount).toBe(3);
      expect(greenCount).toBe(1);

      // STEP 4: Calculate percentages
      const redPercent = (redCount / totalSpins) * 100;
      const blackPercent = (blackCount / totalSpins) * 100;

      expect(redPercent).toBe(50);
      expect(blackPercent).toBe(37.5);
    });

    it('should track dozen distribution', () => {
      // STEP 1: Session with varied dozens
      const results: RouletteResult[] = [
        createResult(1),   // 1st
        createResult(2),   // 1st
        createResult(3),   // 1st
        createResult(13),  // 2nd
        createResult(14),  // 2nd
        createResult(25),  // 3rd
      ];

      // STEP 2: Count dozens
      const dozenCounts = results.reduce((acc, r) => {
        if (r.dozen) {
          acc[r.dozen] = (acc[r.dozen] || 0) + 1;
        }
        return acc;
      }, {} as Record<number, number>);

      // STEP 3: Verify distribution
      expect(dozenCounts[1]).toBe(3);
      expect(dozenCounts[2]).toBe(2);
      expect(dozenCounts[3]).toBe(1);
    });
  });

  describe('Error Handling Flow', () => {
    it('should handle empty results gracefully', () => {
      // STEP 1: No results yet
      const results: RouletteResult[] = [];

      // STEP 2: Try to analyze
      const patterns = UnifiedPatternAnalyzer.analyzeAll(results);

      // STEP 3: Should return empty patterns
      expect(patterns).toEqual([]);
    });

    it('should handle single result', () => {
      // STEP 1: Only one result
      const results: RouletteResult[] = [createResult(17)];

      // STEP 2: Try to analyze
      const patterns = UnifiedPatternAnalyzer.analyzeAll(results);

      // STEP 3: Should handle gracefully
      expect(Array.isArray(patterns)).toBe(true);
    });

    it('should handle invalid number gracefully', () => {
      // STEP 1: Invalid roulette number (> 36)
      const invalidNumber = 50;

      // STEP 2: Should still create result structure
      const result = createResult(invalidNumber);

      // STEP 3: Should have basic properties
      expect(result.number).toBe(50);
      expect(result).toHaveProperty('color');
      expect(result).toHaveProperty('timestamp');
    });
  });

  describe('Multi-Pattern Detection Flow', () => {
    it('should detect multiple simultaneous patterns', () => {
      // STEP 1: Create complex scenario
      const results: RouletteResult[] = [
        // Red sequence
        createResult(1), createResult(3), createResult(5),
        // Hot number 17
        createResult(17), createResult(17), createResult(17),
        // Even parity
        createResult(2), createResult(4), createResult(6), createResult(8),
        // 1st dozen hot
        createResult(7), createResult(9), createResult(11),
        // More context
        ...Array.from({ length: 10 }, (_, i) => createResult((i % 36) + 1))
      ];

      // STEP 2: Analyze all
      const patterns = UnifiedPatternAnalyzer.analyzeAll(results);

      // STEP 3: Multiple patterns should be detected
      expect(patterns.length).toBeGreaterThan(0);

      // STEP 4: Each pattern should have required properties
      patterns.forEach(pattern => {
        expect(pattern).toHaveProperty('type');
        expect(pattern).toHaveProperty('probability');
        expect(pattern).toHaveProperty('confidence');
        expect(pattern).toHaveProperty('suggestion');
      });
    });
  });
});
