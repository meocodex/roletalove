import { type RouletteResult } from '@shared/schema';

export interface PatternResult {
  id?: string;
  type: string;
  sequence: any[];
  targetOutcome: any;
  outcomes?: any;
  probability: number;
  confidence: number;
  totalOccurrences?: number;
  successCount?: number;
  description: string;
  suggestion: string;
}

// Análise unificada de padrões - substitui lógica duplicada do servidor
export class UnifiedPatternAnalyzer {
  // Análise consolidada de sequências de cores
  static analyzeColorSequence(results: RouletteResult[]): PatternResult | null {
    if (results.length < 4) return null;
    
    const lastThree = results.slice(0, 3);
    const colors = lastThree.map(r => r.color);
    
    // Look for repeating patterns
    if (colors.every(c => c === colors[0]) && colors[0] !== 'green') {
      const oppositeColor = colors[0] === 'red' ? 'black' : 'red';
      return {
        type: 'color_sequence',
        sequence: colors,
        targetOutcome: oppositeColor,
        probability: 0.78,
        confidence: 0.85,
        description: `Sequência de ${colors[0] === 'red' ? 'Vermelho' : 'Preto'}`,
        suggestion: `Apostar em ${oppositeColor === 'red' ? 'Vermelho' : 'Preto'}`
      };
    }
    
    return null;
  }
  
  // Gera estratégia de números plenos unificada
  static generateStraightUpStrategy(results: RouletteResult[]): number[] {
    if (results.length < 10) {
      // Números balanceados para início
      return [7, 17, 23, 32, 1, 14, 29];
    }
    
    const numbers = new Set<number>();
    const numberCounts = new Map<number, number>();
    
    // Analisa últimos 30 resultados
    results.slice(0, 30).forEach(result => {
      if (result.number !== 0) {
        numberCounts.set(result.number, (numberCounts.get(result.number) || 0) + 1);
      }
    });
    
    // Números quentes (top 3)
    const hotNumbers = Array.from(numberCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([num]) => num);
    
    hotNumbers.forEach(num => numbers.add(num));
    
    // Números frios (não apareceram recentemente)
    const recentNumbers = new Set(results.slice(0, 15).map(r => r.number));
    const allNumbers = Array.from({length: 36}, (_, i) => i + 1);
    const coldNumbers = allNumbers.filter(num => !recentNumbers.has(num));
    
    // Adiciona 2 números frios
    coldNumbers.slice(0, 2).forEach(num => numbers.add(num));
    
    // Completa com números balanceados
    const remainingNumbers = allNumbers.filter(num => !numbers.has(num));
    while (numbers.size < 7 && remainingNumbers.length > 0) {
      const index = Math.floor(Math.random() * remainingNumbers.length);
      numbers.add(remainingNumbers.splice(index, 1)[0]);
    }
    
    return Array.from(numbers).slice(0, 7);
  }

  static analyzeDozens(results: RouletteResult[]): PatternResult | null {
    if (results.length < 10) return null;
    
    const recentResults = results.slice(0, 10);
    const dozenCounts = new Map<number, number>();
    
    recentResults.forEach(result => {
      if (result.dozen) {
        dozenCounts.set(result.dozen, (dozenCounts.get(result.dozen) || 0) + 1);
      }
    });
    
    // Encontra dúzia quente
    let hotDozen = 0;
    let maxCount = 0;
    
    dozenCounts.forEach((count, dozen) => {
      if (count > maxCount) {
        maxCount = count;
        hotDozen = dozen;
      }
    });
    
    if (maxCount >= 4) { // 40% or more of recent spins
      const probability = Math.min(maxCount / recentResults.length * 1.5, 0.85);
      return {
        type: 'dozen_hot',
        sequence: [`dozen_${hotDozen}`],
        targetOutcome: `dozen_${hotDozen}`,
        probability,
        confidence: 0.80,
        description: `${hotDozen}ª Dúzia Quente`,
        suggestion: `Apostar na ${hotDozen}ª Dúzia (${(hotDozen-1)*12 + 1}-${hotDozen*12})`
      };
    }
    
    return null;
  }
  
  static analyzeHotNumbers(results: RouletteResult[]): PatternResult | null {
    if (results.length < 20) return null;
    
    const recentResults = results.slice(0, 20);
    const numberCounts = new Map<number, number>();
    
    recentResults.forEach(result => {
      numberCounts.set(result.number, (numberCounts.get(result.number) || 0) + 1);
    });
    
    // Find numbers appearing more than expected
    const expectedFreq = recentResults.length / 37;
    let hotNumber = -1;
    let maxCount = 0;
    
    numberCounts.forEach((count, number) => {
      if (count > expectedFreq * 1.5 && count > maxCount) {
        maxCount = count;
        hotNumber = number;
      }
    });
    
    if (hotNumber >= 0 && maxCount >= 3) {
      const probability = Math.min(maxCount / recentResults.length * 3, 0.75);
      return {
        type: 'hot_number',
        sequence: [hotNumber],
        targetOutcome: hotNumber,
        probability,
        confidence: 0.70,
        description: `Número ${hotNumber} Quente`,
        suggestion: `Considerar aposta no número ${hotNumber}`
      };
    }
    
    return null;
  }
  
  static detectParity(results: RouletteResult[]): PatternResult | null {
    if (results.length < 8) return null;
    
    const recentResults = results.slice(0, 8).filter(r => r.number !== 0);
    if (recentResults.length < 6) return null;
    
    const parityCount = recentResults.reduce((acc, r) => {
      if (r.parity) {
        acc[r.parity] = (acc[r.parity] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    const evenCount = parityCount.even || 0;
    const oddCount = parityCount.odd || 0;
    
    if (evenCount >= 5 || oddCount >= 5) {
      const dominant = evenCount > oddCount ? 'even' : 'odd';
      const opposite = dominant === 'even' ? 'odd' : 'even';
      
      return {
        type: 'parity_trend',
        sequence: [dominant],
        targetOutcome: opposite,
        probability: 0.72,
        confidence: 0.75,
        description: `Tendência de ${dominant === 'even' ? 'Pares' : 'Ímpares'}`,
        suggestion: `Considerar aposta em ${opposite === 'even' ? 'Par' : 'Ímpar'}`
      };
    }
    
    return null;
  }
  
  static analyzeAll(results: RouletteResult[]): PatternResult[] {
    const patterns: PatternResult[] = [];
    
    const colorPattern = this.analyzeColorSequence(results);
    if (colorPattern) patterns.push(colorPattern);
    
    const dozenPattern = this.analyzeDozens(results);
    if (dozenPattern) patterns.push(dozenPattern);
    
    const hotNumberPattern = this.analyzeHotNumbers(results);
    if (hotNumberPattern) patterns.push(hotNumberPattern);
    
    const parityPattern = this.detectParity(results);
    if (parityPattern) patterns.push(parityPattern);
    
    return patterns.sort((a, b) => b.probability - a.probability);
  }
}
