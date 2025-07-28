import { type RouletteResult, type InsertRouletteResult, type Pattern, type InsertPattern, type Strategy, type InsertStrategy, type Alert, type InsertAlert, type Session, type InsertSession } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Roulette Results
  addResult(result: InsertRouletteResult): Promise<RouletteResult>;
  getResults(sessionId: string, limit?: number): Promise<RouletteResult[]>;
  getRecentResults(limit: number): Promise<RouletteResult[]>;
  
  // Patterns
  savePattern(pattern: InsertPattern): Promise<Pattern>;
  getActivePatterns(): Promise<Pattern[]>;
  getPatternById(id: string): Promise<Pattern | undefined>;
  updatePattern(id: string, updates: Partial<Pattern>): Promise<Pattern | undefined>;
  
  // Strategies
  saveStrategy(strategy: InsertStrategy): Promise<Strategy>;
  getActiveStrategies(): Promise<Strategy[]>;
  updateStrategy(id: string, updates: Partial<Strategy>): Promise<Strategy | undefined>;
  
  // Alerts
  addAlert(alert: InsertAlert): Promise<Alert>;
  getRecentAlerts(limit: number): Promise<Alert[]>;
  markAlertAsRead(id: string): Promise<void>;
  
  // Sessions
  createSession(session: InsertSession): Promise<Session>;
  getCurrentSession(): Promise<Session | undefined>;
  updateSession(id: string, updates: Partial<Session>): Promise<Session | undefined>;
}

export class MemStorage implements IStorage {
  private results: Map<string, RouletteResult> = new Map();
  private patterns: Map<string, Pattern> = new Map();
  private strategies: Map<string, Strategy> = new Map();
  private alerts: Map<string, Alert> = new Map();
  private sessions: Map<string, Session> = new Map();
  private currentSessionId: string | null = null;

  constructor() {
    // Initialize with default session
    this.initializeDefaultSession();
    this.initializeDefaultStrategies();
  }

  private async initializeDefaultSession() {
    const session: Session = {
      id: randomUUID(),
      name: "Sessão Principal",
      startTime: new Date(),
      endTime: null,
      totalSpins: 0,
      patternsDetected: 0,
      successRate: 0,
      isActive: true
    };
    this.sessions.set(session.id, session);
    this.currentSessionId = session.id;
  }

  private async initializeDefaultStrategies() {
    // Straight-up numbers strategy (max 7 numbers as requested)
    const straightUpStrategy: Strategy = {
      id: randomUUID(),
      name: "Números Plenos",
      type: "straight_up",
      numbers: [17, 32, 19, 4, 21, 7, 14], // Max 7 numbers
      maxAttempts: 5,
      currentAttempts: 0,
      isActive: true,
      lastUsed: null,
      successRate: 0,
      createdAt: new Date()
    };

    // Neighbors strategy (up to 21 numbers as requested)
    const neighborsStrategy: Strategy = {
      id: randomUUID(),
      name: "Vizinhos do 17",
      type: "neighbors",
      numbers: [2, 25, 4, 21, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20], // 21 numbers
      maxAttempts: 5, // Max 5 attempts as requested
      currentAttempts: 0,
      isActive: false,
      lastUsed: null,
      successRate: 0,
      createdAt: new Date()
    };

    this.strategies.set(straightUpStrategy.id, straightUpStrategy);
    this.strategies.set(neighborsStrategy.id, neighborsStrategy);
  }

  async addResult(insertResult: InsertRouletteResult): Promise<RouletteResult> {
    const id = randomUUID();
    const result: RouletteResult = {
      ...insertResult,
      id,
      timestamp: new Date()
    };
    
    this.results.set(id, result);
    
    // Update current session
    if (this.currentSessionId) {
      const session = this.sessions.get(this.currentSessionId);
      if (session) {
        session.totalSpins += 1;
        this.sessions.set(this.currentSessionId, session);
      }
    }
    
    return result;
  }

  async getResults(sessionId: string, limit = 100): Promise<RouletteResult[]> {
    return Array.from(this.results.values())
      .filter(r => r.sessionId === sessionId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async getRecentResults(limit: number): Promise<RouletteResult[]> {
    return Array.from(this.results.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async savePattern(insertPattern: InsertPattern): Promise<Pattern> {
    const id = randomUUID();
    const pattern: Pattern = {
      ...insertPattern,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.patterns.set(id, pattern);
    return pattern;
  }

  async getActivePatterns(): Promise<Pattern[]> {
    return Array.from(this.patterns.values())
      .filter(p => p.isActive)
      .sort((a, b) => b.probability - a.probability);
  }

  async getPatternById(id: string): Promise<Pattern | undefined> {
    return this.patterns.get(id);
  }

  async updatePattern(id: string, updates: Partial<Pattern>): Promise<Pattern | undefined> {
    const pattern = this.patterns.get(id);
    if (!pattern) return undefined;
    
    const updatedPattern = { ...pattern, ...updates, updatedAt: new Date() };
    this.patterns.set(id, updatedPattern);
    return updatedPattern;
  }

  async saveStrategy(insertStrategy: InsertStrategy): Promise<Strategy> {
    const id = randomUUID();
    const strategy: Strategy = {
      ...insertStrategy,
      id,
      createdAt: new Date()
    };
    
    this.strategies.set(id, strategy);
    return strategy;
  }

  async getActiveStrategies(): Promise<Strategy[]> {
    return Array.from(this.strategies.values())
      .filter(s => s.isActive);
  }

  async updateStrategy(id: string, updates: Partial<Strategy>): Promise<Strategy | undefined> {
    const strategy = this.strategies.get(id);
    if (!strategy) return undefined;
    
    const updatedStrategy = { ...strategy, ...updates };
    this.strategies.set(id, updatedStrategy);
    return updatedStrategy;
  }

  async addAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = randomUUID();
    const alert: Alert = {
      ...insertAlert,
      id,
      timestamp: new Date()
    };
    
    this.alerts.set(id, alert);
    return alert;
  }

  async getRecentAlerts(limit: number): Promise<Alert[]> {
    return Array.from(this.alerts.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async markAlertAsRead(id: string): Promise<void> {
    const alert = this.alerts.get(id);
    if (alert) {
      alert.read = true;
      this.alerts.set(id, alert);
    }
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const id = randomUUID();
    const session: Session = {
      ...insertSession,
      id,
      startTime: new Date()
    };
    
    this.sessions.set(id, session);
    this.currentSessionId = id;
    return session;
  }

  async getCurrentSession(): Promise<Session | undefined> {
    if (!this.currentSessionId) return undefined;
    return this.sessions.get(this.currentSessionId);
  }

  async updateSession(id: string, updates: Partial<Session>): Promise<Session | undefined> {
    const session = this.sessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...updates };
    this.sessions.set(id, updatedSession);
    return updatedSession;
  }
}

export const storage = new MemStorage();
