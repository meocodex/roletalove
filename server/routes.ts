import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertRouletteResultSchema, insertAlertSchema, type RouletteResult } from "@shared/schema";
import { z } from "zod";

// Generate exactly 7 numbers for straight-up strategy based on pattern analysis
function generateStraightUpNumbers(results: RouletteResult[]): number[] {
  const numbers = new Set<number>();
  
  // Strategy 1: Hot numbers (numbers that appeared more frequently)
  const numberCounts = new Map<number, number>();
  const recentResults = results.slice(0, 50); // Last 50 spins
  
  recentResults.forEach(result => {
    numberCounts.set(result.number, (numberCounts.get(result.number) || 0) + 1);
  });
  
  // Get top hot numbers
  const hotNumbers = Array.from(numberCounts.entries())
    .filter(([num]) => num !== 0) // Exclude zero
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([num]) => num);
  
  hotNumbers.forEach(num => numbers.add(num));
  
  // Strategy 2: Cold numbers (numbers that haven't appeared recently)
  const allNumbers = Array.from({length: 36}, (_, i) => i + 1);
  const recentNumbers = new Set(recentResults.slice(0, 20).map(r => r.number));
  const coldNumbers = allNumbers.filter(num => !recentNumbers.has(num));
  
  // Add 2 cold numbers randomly
  for (let i = 0; i < 2 && coldNumbers.length > 0; i++) {
    const index = Math.floor(Math.random() * coldNumbers.length);
    numbers.add(coldNumbers.splice(index, 1)[0]);
  }
  
  // Strategy 3: Fill remaining with balanced selection
  const remainingNumbers = allNumbers.filter(num => !numbers.has(num));
  while (numbers.size < 7 && remainingNumbers.length > 0) {
    const index = Math.floor(Math.random() * remainingNumbers.length);
    numbers.add(remainingNumbers.splice(index, 1)[0]);
  }
  
  // Ensure exactly 7 numbers
  const result = Array.from(numbers).slice(0, 7);
  
  // If we have less than 7, fill with random numbers
  while (result.length < 7) {
    const randomNum = Math.floor(Math.random() * 36) + 1;
    if (!result.includes(randomNum)) {
      result.push(randomNum);
    }
  }
  
  return result;
}

// Pattern analysis algorithms
class PatternAnalyzer {
  private static getNumberColor(number: number): string {
    if (number === 0) return 'green';
    const redNumbers = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
    return redNumbers.includes(number) ? 'red' : 'black';
  }

  private static getNumberProperties(number: number) {
    return {
      number,
      color: this.getNumberColor(number),
      dozen: number === 0 ? null : Math.ceil(number / 12),
      column: number === 0 ? null : ((number - 1) % 3) + 1,
      half: number === 0 ? null : number <= 18 ? 'low' : 'high',
      parity: number === 0 ? null : number % 2 === 0 ? 'even' : 'odd'
    };
  }

  static async analyzePatterns(results: RouletteResult[]): Promise<any[]> {
    const patterns: any[] = [];
    
    // Color sequence patterns
    const colorSequences = this.findColorSequences(results);
    patterns.push(...colorSequences);
    
    // Dozen patterns  
    const dozenPatterns = this.findDozenPatterns(results);
    patterns.push(...dozenPatterns);
    
    // Hot number patterns
    const hotNumbers = this.findHotNumbers(results);
    patterns.push(...hotNumbers);
    
    return patterns.filter(p => p.probability >= 0.75);
  }

  private static findColorSequences(results: RouletteResult[]): any[] {
    const patterns: any[] = [];
    const sequences: any[] = [];
    
    // Look for patterns like [R,R,R] -> B
    for (let i = 0; i < results.length - 3; i++) {
      const sequence = results.slice(i, i + 3).map(r => r.color);
      const nextResult = results[i + 3];
      
      sequences.push({
        sequence,
        nextColor: nextResult.color
      });
    }
    
    // Find recurring patterns
    const sequenceMap = new Map<string, { total: number; outcomes: Map<string, number> }>();
    sequences.forEach(seq => {
      const key = seq.sequence.join(',');
      if (!sequenceMap.has(key)) {
        sequenceMap.set(key, { total: 0, outcomes: new Map() });
      }
      
      const data = sequenceMap.get(key)!;
      data.total++;
      const outcome = seq.nextColor;
      data.outcomes.set(outcome, (data.outcomes.get(outcome) || 0) + 1);
    });
    
    // Calculate probabilities
    sequenceMap.forEach((data, sequence) => {
      if (data.total >= 10) { // Minimum occurrences
        data.outcomes.forEach((count: number, outcome: string) => {
          const probability = count / data.total;
          if (probability >= 0.75) {
            patterns.push({
              type: 'color_sequence',
              sequence: sequence.split(','),
              targetOutcome: outcome,
              probability,
              confidence: 0.95,
              totalOccurrences: data.total,
              successCount: count
            });
          }
        });
      }
    });
    
    return patterns;
  }

  private static findDozenPatterns(results: RouletteResult[]): any[] {
    const patterns: any[] = [];
    const dozenCounts = new Map<number, number>();
    
    // Count dozen occurrences in recent results
    const recentResults = results.slice(0, 20);
    recentResults.forEach(result => {
      if (result.dozen) {
        dozenCounts.set(result.dozen, (dozenCounts.get(result.dozen) || 0) + 1);
      }
    });
    
    // Find hot dozens
    dozenCounts.forEach((count: number, dozen: number) => {
      const probability = count / recentResults.length;
      if (probability >= 0.35) { // 35% or higher in recent spins
        patterns.push({
          type: 'dozen_hot',
          sequence: [`dozen_${dozen}`],
          targetOutcome: `dozen_${dozen}`,
          probability: Math.min(probability * 2, 0.85), // Boost probability but cap at 85%
          confidence: 0.80,
          totalOccurrences: count,
          successCount: count
        });
      }
    });
    
    return patterns;
  }

  private static findHotNumbers(results: RouletteResult[]): any[] {
    const patterns: any[] = [];
    const numberCounts = new Map<number, number>();
    
    // Count number occurrences in recent results
    const recentResults = results.slice(0, 50);
    recentResults.forEach(result => {
      numberCounts.set(result.number, (numberCounts.get(result.number) || 0) + 1);
    });
    
    // Find hot numbers (appearing more than expected)
    const expectedFrequency = recentResults.length / 37; // European roulette has 37 numbers
    
    numberCounts.forEach((count: number, number: number) => {
      if (count > expectedFrequency * 1.5) { // 50% above expected
        const probability = Math.min(count / recentResults.length * 5, 0.80); // Boost and cap
        patterns.push({
          type: 'hot_number',
          sequence: [number],
          targetOutcome: number,
          probability,
          confidence: 0.75,
          totalOccurrences: count,
          successCount: count
        });
      }
    });
    
    return patterns;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const clients = new Set<WebSocket>();
  
  wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('Client connected to WebSocket');
    
    // Send initial data
    ws.send(JSON.stringify({
      type: 'connection',
      message: 'Connected to roulette analysis system'
    }));
    
    ws.on('close', () => {
      clients.delete(ws);
      console.log('Client disconnected from WebSocket');
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });
  });
  
  // Broadcast to all connected clients
  const broadcast = (data: any) => {
    const message = JSON.stringify(data);
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  };

  // API Routes
  
  // Add new roulette result
  app.post('/api/results', async (req, res) => {
    try {
      const validatedData = insertRouletteResultSchema.parse(req.body);
      
      // Get current session
      const currentSession = await storage.getCurrentSession();
      if (!currentSession) {
        return res.status(400).json({ error: 'No active session' });
      }
      
      // Add number properties
      const numberProps = {
        color: validatedData.number === 0 ? 'green' : 
               [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(validatedData.number) ? 'red' : 'black',
        dozen: validatedData.number === 0 ? null : Math.ceil(validatedData.number / 12),
        column: validatedData.number === 0 ? null : ((validatedData.number - 1) % 3) + 1,
        half: validatedData.number === 0 ? null : validatedData.number <= 18 ? 'low' : 'high',
        parity: validatedData.number === 0 ? null : validatedData.number % 2 === 0 ? 'even' : 'odd'
      };
      
      const result = await storage.addResult({
        ...validatedData,
        ...numberProps,
        sessionId: currentSession.id
      });
      
      // Analyze patterns after new result
      const recentResults = await storage.getRecentResults(100);
      const patterns = await PatternAnalyzer.analyzePatterns(recentResults);
      
      // Save new patterns and create alerts
      for (const pattern of patterns) {
        await storage.savePattern({
          sequence: pattern.sequence,
          type: pattern.type,
          outcomes: { [pattern.targetOutcome]: pattern.successCount },
          probability: pattern.probability,
          confidence: pattern.confidence,
          totalOccurrences: pattern.totalOccurrences,
          successCount: pattern.successCount,
          lastTriggered: new Date(),
          isActive: true
        });
        
        // Create alert for high-probability patterns
        if (pattern.probability >= 0.80) {
          await storage.addAlert({
            type: 'pattern_detected',
            title: 'Padrão de Alta Probabilidade Detectado',
            message: `${pattern.type}: ${pattern.probability * 100}% de chance`,
            severity: 'success',
            data: pattern,
            read: false
          });
        }
      }
      
      // Check strategy hits
      const activeStrategies = await storage.getActiveStrategies();
      for (const strategy of activeStrategies) {
        const strategyNumbers = Array.isArray(strategy.numbers) ? strategy.numbers as number[] : [];
        if (strategyNumbers.includes(result.number)) {
          // Strategy hit!
          await storage.updateStrategy(strategy.id, {
            currentAttempts: 0,
            successRate: ((strategy.successRate || 0) + 1) / 2, // Simple average
            lastUsed: new Date()
          });
          
          await storage.addAlert({
            type: 'strategy_hit',
            title: 'Acerto na Estratégia!',
            message: `${strategy.name} - Número ${result.number}`,
            severity: 'success',
            data: { strategy: strategy.name, number: result.number },
            read: false
          });
        } else {
          // Increment attempts
          const newAttempts = (strategy.currentAttempts || 0) + 1;
          if (newAttempts >= (strategy.maxAttempts || 5)) {
            // Max attempts reached - recalculate strategy
            let newNumbers = strategyNumbers;
            
            // For straight_up strategy, regenerate exactly 7 numbers
            if (strategy.type === 'straight_up') {
              newNumbers = generateStraightUpNumbers(recentResults);
            }
            
            await storage.updateStrategy(strategy.id, {
              currentAttempts: 0,
              numbers: newNumbers,
              lastUsed: new Date()
            });
            
            await storage.addAlert({
              type: 'system_info',
              title: 'Estratégia Recalculada',
              message: `${strategy.name} - Novos números gerados após ${strategy.maxAttempts} tentativas`,
              severity: 'warning',
              data: { strategy: strategy.name, newNumbers },
              read: false
            });
          } else {
            await storage.updateStrategy(strategy.id, {
              currentAttempts: newAttempts
            });
          }
        }
      }
      
      // Broadcast update to WebSocket clients
      broadcast({
        type: 'new_result',
        data: {
          result,
          patterns: patterns.slice(0, 3), // Top 3 patterns
          strategies: await storage.getActiveStrategies()
        }
      });
      
      res.json(result);
    } catch (error) {
      console.error('Error adding result:', error);
      res.status(400).json({ error: 'Invalid data' });
    }
  });
  
  // Get recent results
  app.get('/api/results', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const results = await storage.getRecentResults(limit);
      res.json(results);
    } catch (error) {
      console.error('Error fetching results:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Get active patterns
  app.get('/api/patterns', async (req, res) => {
    try {
      const patterns = await storage.getActivePatterns();
      res.json(patterns);
    } catch (error) {
      console.error('Error fetching patterns:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Get active strategies
  app.get('/api/strategies', async (req, res) => {
    try {
      const strategies = await storage.getActiveStrategies();
      res.json(strategies);
    } catch (error) {
      console.error('Error fetching strategies:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Update strategy
  app.put('/api/strategies/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const strategy = await storage.updateStrategy(id, updates);
      
      if (!strategy) {
        return res.status(404).json({ error: 'Strategy not found' });
      }
      
      // Broadcast update
      broadcast({
        type: 'strategy_updated',
        data: strategy
      });
      
      res.json(strategy);
    } catch (error) {
      console.error('Error updating strategy:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Get recent alerts
  app.get('/api/alerts', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const alerts = await storage.getRecentAlerts(limit);
      res.json(alerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Get current session stats
  app.get('/api/session/stats', async (req, res) => {
    try {
      const session = await storage.getCurrentSession();
      if (!session) {
        return res.status(404).json({ error: 'No active session' });
      }
      
      const results = await storage.getResults(session.id);
      const patterns = await storage.getActivePatterns();
      
      // Calculate additional stats
      const lastZero = results.findIndex(r => r.number === 0);
      const colorCounts = results.slice(0, 20).reduce((acc, r) => {
        acc[r.color] = (acc[r.color] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      res.json({
        session,
        totalSpins: results.length,
        patternsDetected: patterns.length,
        lastZero: lastZero >= 0 ? lastZero : null,
        colorDistribution: colorCounts,
        successRate: patterns.length > 0 ? patterns[0].probability * 100 : 0
      });
    } catch (error) {
      console.error('Error fetching session stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return httpServer;
}
