/**
 * Machine Learning Analyzer para Roleta
 * Sistema avançado de análise com algoritmos de ML
 */

import type { RouletteResult } from "../../../shared/schema";

// Tipos para ML Analysis
export interface MLPrediction {
  number: number;
  probability: number;
  confidence: number;
  category: 'hot' | 'cold' | 'neutral';
  reasoning: string[];
}

export interface FeatureVector {
  lastSeen: number;           // Rodadas desde última aparição
  frequency: number;          // Frequência relativa
  momentum: number;           // Tendência recente
  neighborActivity: number;   // Atividade dos vizinhos físicos
  sequencePattern: number;    // Padrões de sequência
  entropy: number;           // Medida de aleatoriedade
}

export interface MarkovState {
  sequence: number[];
  probability: number;
  occurrences: number;
}

export class MLAnalyzer {
  private static readonly WINDOW_SIZE = 50;
  private static readonly MARKOV_ORDER = 3;
  private static readonly MIN_SAMPLES = 20;

  /**
   * Análise principal com múltiplos algoritmos ML
   */
  static analyzePredictions(results: RouletteResult[]): MLPrediction[] {
    if (results.length < this.MIN_SAMPLES) {
      return [];
    }

    const predictions: MLPrediction[] = [];
    
    // Análise para cada número (0-36)
    for (let number = 0; number <= 36; number++) {
      const features = this.extractFeatures(number, results);
      const markovProb = this.calculateMarkovProbability(number, results);
      const bayesianProb = this.calculateBayesianProbability(features, results);
      const ensembleProb = this.ensembleMethod(features, markovProb, bayesianProb);
      
      const prediction: MLPrediction = {
        number,
        probability: ensembleProb.probability,
        confidence: ensembleProb.confidence,
        category: this.classifyNumber(features, ensembleProb.probability),
        reasoning: this.generateReasoning(features, markovProb, bayesianProb)
      };
      
      predictions.push(prediction);
    }

    return predictions.sort((a, b) => b.probability - a.probability);
  }

  /**
   * Análise de vizinhos baseada em ML
   */
  static analyzeMLNeighbors(results: RouletteResult[]): { number: number; neighbors: number[]; totalProbability: number; reasoning: string }[] {
    if (results.length < this.MIN_SAMPLES) {
      return [];
    }

    const predictions = this.analyzePredictions(results);
    const wheelOrder = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
    
    const neighborGroups: { number: number; neighbors: number[]; totalProbability: number; reasoning: string }[] = [];

    // Análise dos top números para vizinhança
    const topNumbers = predictions.slice(0, 10);
    
    for (const pred of topNumbers) {
      const centerIndex = wheelOrder.indexOf(pred.number);
      const neighbors: number[] = [];
      let totalProb = pred.probability;
      
      // Pegar 2 números de cada lado (5 números total)
      for (let i = -2; i <= 2; i++) {
        const neighborIndex = (centerIndex + i + wheelOrder.length) % wheelOrder.length;
        const neighborNumber = wheelOrder[neighborIndex];
        neighbors.push(neighborNumber);
        
        if (i !== 0) { // Não contar o número central duas vezes
          const neighborPred = predictions.find(p => p.number === neighborNumber);
          if (neighborPred) {
            totalProb += neighborPred.probability * 0.3; // Peso menor para vizinhos
          }
        }
      }

      // Só incluir se a probabilidade total for significativa
      if (totalProb > 0.08) {
        neighborGroups.push({
          number: pred.number,
          neighbors: neighbors.sort((a, b) => a - b),
          totalProbability: totalProb,
          reasoning: `Centro: ${pred.number} (${(pred.probability * 100).toFixed(1)}%) + vizinhos físicos`
        });
      }
    }

    return neighborGroups.sort((a, b) => b.totalProbability - a.totalProbability).slice(0, 3);
  }

  /**
   * Extração de features para ML
   */
  private static extractFeatures(number: number, results: RouletteResult[]): FeatureVector {
    const recentResults = results.slice(-this.WINDOW_SIZE);
    const numbers = recentResults.map(r => r.number);
    
    return {
      lastSeen: this.calculateLastSeen(number, numbers),
      frequency: this.calculateFrequency(number, numbers),
      momentum: this.calculateMomentum(number, numbers),
      neighborActivity: this.calculateNeighborActivity(number, numbers),
      sequencePattern: this.calculateSequencePattern(number, numbers),
      entropy: this.calculateEntropy(numbers)
    };
  }

  /**
   * Cadeias de Markov de ordem superior
   */
  private static calculateMarkovProbability(targetNumber: number, results: RouletteResult[]): number {
    const numbers = results.map(r => r.number);
    if (numbers.length < this.MARKOV_ORDER + 1) return 1/37;

    const currentSequence = numbers.slice(-this.MARKOV_ORDER);
    const states = this.buildMarkovStates(numbers);
    
    // Buscar estados que começam com a sequência atual
    const matchingStates = states.filter(state => 
      this.arraysEqual(state.sequence.slice(0, -1), currentSequence)
    );
    
    if (matchingStates.length === 0) return 1/37;
    
    // Calcular probabilidade do número alvo
    const targetStates = matchingStates.filter(state => 
      state.sequence[state.sequence.length - 1] === targetNumber
    );
    
    const totalOccurrences = matchingStates.reduce((sum, state) => sum + state.occurrences, 0);
    const targetOccurrences = targetStates.reduce((sum, state) => sum + state.occurrences, 0);
    
    return totalOccurrences > 0 ? targetOccurrences / totalOccurrences : 1/37;
  }

  /**
   * Probabilidades Bayesianas com atualizações
   */
  private static calculateBayesianProbability(features: FeatureVector, results: RouletteResult[]): number {
    // Prior: probabilidade base (1/37 para roleta europeia)
    const prior = 1/37;
    
    // Likelihood baseado nas features
    let likelihood = 1.0;
    
    // Ajuste baseado na frequência
    if (features.frequency > 0.027) { // Acima da média (1/37)
      likelihood *= 1.2;
    } else if (features.frequency < 0.020) {
      likelihood *= 0.8;
    }
    
    // Ajuste baseado no momentum
    if (features.momentum > 0.5) {
      likelihood *= 1.15;
    } else if (features.momentum < -0.5) {
      likelihood *= 0.85;
    }
    
    // Ajuste baseado na atividade dos vizinhos
    if (features.neighborActivity > 0.3) {
      likelihood *= 1.1;
    }
    
    // Evidência: normalização
    const evidence = 0.027; // Aproximação
    
    return (likelihood * prior) / evidence;
  }

  /**
   * Método ensemble combinando múltiplos algoritmos
   */
  private static ensembleMethod(
    features: FeatureVector, 
    markovProb: number, 
    bayesianProb: number
  ): { probability: number; confidence: number } {
    // Pesos para cada método
    const weights = {
      markov: 0.4,
      bayesian: 0.3,
      frequency: 0.2,
      momentum: 0.1
    };
    
    // Normalizar probabilidades
    const normalizedMarkov = Math.min(Math.max(markovProb, 0), 1);
    const normalizedBayesian = Math.min(Math.max(bayesianProb, 0), 1);
    const frequencyScore = features.frequency * 37; // Normalizar para 0-1
    const momentumScore = (features.momentum + 1) / 2; // Normalizar -1,1 para 0,1
    
    // Combinar probabilidades
    const ensembleProbability = 
      weights.markov * normalizedMarkov +
      weights.bayesian * normalizedBayesian +
      weights.frequency * frequencyScore +
      weights.momentum * momentumScore;
    
    // Calcular confiança baseada na concordância entre métodos
    const variance = this.calculateVariance([
      normalizedMarkov, normalizedBayesian, frequencyScore, momentumScore
    ]);
    const confidence = Math.max(0, 1 - variance * 2);
    
    return {
      probability: Math.min(Math.max(ensembleProbability, 0), 1),
      confidence: confidence
    };
  }

  /**
   * Classificação de números em categorias
   */
  private static classifyNumber(features: FeatureVector, probability: number): 'hot' | 'cold' | 'neutral' {
    if (probability > 0.035 && features.frequency > 0.03) {
      return 'hot';
    } else if (probability < 0.020 && features.lastSeen > 30) {
      return 'cold';
    }
    return 'neutral';
  }

  /**
   * Geração de explicações para as previsões
   */
  private static generateReasoning(
    features: FeatureVector, 
    markovProb: number, 
    bayesianProb: number
  ): string[] {
    const reasoning: string[] = [];
    
    if (features.frequency > 0.03) {
      reasoning.push(`Alta frequência: ${(features.frequency * 100).toFixed(1)}%`);
    }
    
    if (features.lastSeen > 25) {
      reasoning.push(`Não sai há ${features.lastSeen} rodadas`);
    }
    
    if (features.momentum > 0.3) {
      reasoning.push('Tendência crescente recente');
    }
    
    if (features.neighborActivity > 0.3) {
      reasoning.push('Vizinhos físicos ativos');
    }
    
    if (markovProb > 0.04) {
      reasoning.push('Padrão sequencial detectado');
    }
    
    if (reasoning.length === 0) {
      reasoning.push('Análise estatística padrão');
    }
    
    return reasoning;
  }

  // Métodos utilitários para cálculos específicos
  private static calculateLastSeen(number: number, numbers: number[]): number {
    const lastIndex = numbers.lastIndexOf(number);
    return lastIndex === -1 ? numbers.length : numbers.length - lastIndex - 1;
  }

  private static calculateFrequency(number: number, numbers: number[]): number {
    const count = numbers.filter(n => n === number).length;
    return numbers.length > 0 ? count / numbers.length : 0;
  }

  private static calculateMomentum(number: number, numbers: number[]): number {
    if (numbers.length < 10) return 0;
    
    const recentHalf = numbers.slice(-Math.ceil(numbers.length / 2));
    const olderHalf = numbers.slice(0, Math.floor(numbers.length / 2));
    
    const recentFreq = recentHalf.filter(n => n === number).length / recentHalf.length;
    const olderFreq = olderHalf.filter(n => n === number).length / olderHalf.length;
    
    return recentFreq - olderFreq;
  }

  private static calculateNeighborActivity(number: number, numbers: number[]): number {
    // Vizinhos físicos na roda europeia
    const neighbors = this.getPhysicalNeighbors(number);
    const recentNumbers = numbers.slice(-10);
    
    const neighborHits = neighbors.filter(neighbor => 
      recentNumbers.includes(neighbor)
    ).length;
    
    return neighborHits / neighbors.length;
  }

  private static calculateSequencePattern(number: number, numbers: number[]): number {
    // Detectar padrões de repetição
    let patternScore = 0;
    const windowSize = 5;
    
    for (let i = windowSize; i < numbers.length; i++) {
      const currentWindow = numbers.slice(i - windowSize, i);
      const targetWindow = numbers.slice(i - windowSize * 2, i - windowSize);
      
      if (this.arraysEqual(currentWindow, targetWindow) && currentWindow.includes(number)) {
        patternScore += 0.1;
      }
    }
    
    return Math.min(patternScore, 1);
  }

  private static calculateEntropy(numbers: number[]): number {
    const frequencies = new Map<number, number>();
    
    numbers.forEach(num => {
      frequencies.set(num, (frequencies.get(num) || 0) + 1);
    });
    
    let entropy = 0;
    const total = numbers.length;
    
    frequencies.forEach(count => {
      const probability = count / total;
      entropy -= probability * Math.log2(probability);
    });
    
    return entropy / Math.log2(37); // Normalizado para roleta europeia
  }

  private static buildMarkovStates(numbers: number[]): MarkovState[] {
    const states = new Map<string, MarkovState>();
    
    for (let i = this.MARKOV_ORDER; i < numbers.length; i++) {
      const sequence = numbers.slice(i - this.MARKOV_ORDER, i + 1);
      const key = sequence.join(',');
      
      if (states.has(key)) {
        states.get(key)!.occurrences++;
      } else {
        states.set(key, {
          sequence: [...sequence],
          probability: 0,
          occurrences: 1
        });
      }
    }
    
    return Array.from(states.values());
  }

  private static getPhysicalNeighbors(number: number): number[] {
    // Ordem física dos números na roda europeia
    const wheelOrder = [
      0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
      5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
    ];
    
    const index = wheelOrder.indexOf(number);
    if (index === -1) return [];
    
    const neighbors = [];
    // 2 vizinhos de cada lado
    for (let i = -2; i <= 2; i++) {
      if (i !== 0) {
        const neighborIndex = (index + i + wheelOrder.length) % wheelOrder.length;
        neighbors.push(wheelOrder[neighborIndex]);
      }
    }
    
    return neighbors;
  }

  private static calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
  }

  private static arraysEqual(a: number[], b: number[]): boolean {
    return a.length === b.length && a.every((val, index) => val === b[index]);
  }
}