/**
 * Sistema de Estratégias Combinadas Inteligentes
 * Combina múltiplos tipos de apostas com otimização de portfólio
 */

import type { RouletteResult } from "../../../shared/schema";
import { MLAnalyzer, type MLPrediction } from "./ml-analyzer";

// Tipos para estratégias combinadas
export interface CombinedStrategy {
  id: string;
  name: string;
  description: string;
  allocations: StrategyAllocation[];
  expectedReturn: number;
  riskLevel: 'low' | 'medium' | 'high';
  confidence: number;
}

export interface StrategyAllocation {
  type: 'straight_up' | 'neighbors' | 'dozens' | 'colors' | 'even_odd';
  percentage: number;
  numbers: number[];
  reasoning: string;
  expectedPayout: number;
}

export class CombinedStrategiesEngine {
  private static readonly MIN_RESULTS = 25;

  /**
   * Gera estratégia combinada otimizada
   */
  static generateOptimalStrategy(results: RouletteResult[]): CombinedStrategy | null {
    if (results.length < this.MIN_RESULTS) {
      return null;
    }

    // Obter previsões ML
    const mlPredictions = MLAnalyzer.analyzePredictions(results);
    
    // Gerar estratégia balanceada baseada nas previsões
    return this.generateBalancedStrategy(mlPredictions, results);
  }

  /**
   * Estratégia balanceada (padrão)
   */
  private static generateBalancedStrategy(
    predictions: MLPrediction[], 
    results: RouletteResult[]
  ): CombinedStrategy {
    const allocations: StrategyAllocation[] = [];
    
    // 50% em números plenos quentes
    const hotNumbers = predictions
      .filter(p => p.category === 'hot')
      .slice(0, 5)
      .map(p => p.number);
    
    if (hotNumbers.length > 0) {
      allocations.push({
        type: 'straight_up',
        percentage: 50,
        numbers: hotNumbers,
        reasoning: `Números quentes com alta probabilidade ML`,
        expectedPayout: 35
      });
    }

    // 25% em vizinhos de números frios
    const coldNumbers = predictions
      .filter(p => p.category === 'cold')
      .slice(0, 2)
      .map(p => p.number);
    
    if (coldNumbers.length > 0) {
      const neighborNumbers = this.getNeighborsFromNumbers(coldNumbers);
      allocations.push({
        type: 'neighbors',
        percentage: 25,
        numbers: neighborNumbers,
        reasoning: 'Vizinhos de números frios - expectativa de reversão',
        expectedPayout: 35
      });
    }

    // 15% em dúzias com melhor performance
    const bestDozen = this.getBestPerformingDozen(results);
    if (bestDozen.length > 0) {
      allocations.push({
        type: 'dozens',
        percentage: 15,
        numbers: bestDozen,
        reasoning: 'Dúzia com melhor performance recente',
        expectedPayout: 2
      });
    }

    // 10% em hedge - cor com melhor tendência
    const colorTrend = this.getColorTrend(results);
    if (colorTrend.length > 0) {
      allocations.push({
        type: 'colors',
        percentage: 10,
        numbers: colorTrend,
        reasoning: 'Cor com tendência favorável',
        expectedPayout: 1
      });
    }

    return {
      id: `balanced_${Date.now()}`,
      name: 'Estratégia Balanceada ML',
      description: 'Combinação equilibrada baseada em análise de Machine Learning',
      allocations,
      expectedReturn: this.calculateExpectedReturn(allocations),
      riskLevel: 'medium',
      confidence: this.calculateOverallConfidence(predictions)
    };
  }

  /**
   * Obtém vizinhos físicos de uma lista de números
   */
  private static getNeighborsFromNumbers(numbers: number[]): number[] {
    const neighbors = new Set<number>();
    
    numbers.forEach(num => {
      const physicalNeighbors = this.getPhysicalNeighbors(num);
      physicalNeighbors.forEach(neighbor => neighbors.add(neighbor));
    });
    
    return Array.from(neighbors);
  }

  /**
   * Obtém dúzia com melhor performance recente
   */
  private static getBestPerformingDozen(results: RouletteResult[]): number[] {
    const recent = results.slice(-15);
    const dozenCounts = { first: 0, second: 0, third: 0 };
    
    recent.forEach(result => {
      if (result.number >= 1 && result.number <= 12) dozenCounts.first++;
      else if (result.number >= 13 && result.number <= 24) dozenCounts.second++;
      else if (result.number >= 25 && result.number <= 36) dozenCounts.third++;
    });
    
    const best = Object.entries(dozenCounts).reduce((a, b) => 
      dozenCounts[a[0] as keyof typeof dozenCounts] > dozenCounts[b[0] as keyof typeof dozenCounts] ? a : b
    );
    
    if (best[0] === 'first') return Array.from({length: 12}, (_, i) => i + 1);
    if (best[0] === 'second') return Array.from({length: 12}, (_, i) => i + 13);
    return Array.from({length: 12}, (_, i) => i + 25);
  }

  /**
   * Obtém tendência de cor com melhor performance
   */
  private static getColorTrend(results: RouletteResult[]): number[] {
    const recent = results.slice(-10);
    const colorCounts = { red: 0, black: 0 };
    
    const redNumbers = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
    
    recent.forEach(result => {
      if (redNumbers.includes(result.number)) colorCounts.red++;
      else if (result.number !== 0) colorCounts.black++;
    });
    
    if (colorCounts.red > colorCounts.black) {
      return redNumbers;
    } else {
      return [2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35];
    }
  }

  /**
   * Calcula retorno esperado das alocações
   */
  private static calculateExpectedReturn(allocations: StrategyAllocation[]): number {
    return allocations.reduce((total, allocation) => {
      const probability = allocation.numbers.length / 37;
      const weightedReturn = (allocation.percentage / 100) * probability * allocation.expectedPayout;
      return total + weightedReturn;
    }, 0);
  }

  /**
   * Calcula confiança geral das previsões
   */
  private static calculateOverallConfidence(predictions: MLPrediction[]): number {
    if (predictions.length === 0) return 0.5;
    
    const topPredictions = predictions.slice(0, 5);
    const avgConfidence = topPredictions.reduce((sum, p) => sum + p.confidence, 0) / topPredictions.length;
    
    return avgConfidence;
  }

  /**
   * Obtém vizinhos físicos na roda europeia
   */
  private static getPhysicalNeighbors(number: number): number[] {
    const wheelOrder = [
      0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
      5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
    ];
    
    const index = wheelOrder.indexOf(number);
    if (index === -1) return [];
    
    const neighbors = [];
    for (let i = -2; i <= 2; i++) {
      if (i !== 0) {
        const neighborIndex = (index + i + wheelOrder.length) % wheelOrder.length;
        neighbors.push(wheelOrder[neighborIndex]);
      }
    }
    
    return neighbors;
  }
}

