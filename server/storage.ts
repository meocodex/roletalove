import { type RouletteResult, type InsertRouletteResult, type Pattern, type InsertPattern, type Strategy, type InsertStrategy, type Alert, type InsertAlert, type Session, type InsertSession, type BettingPreference, type InsertBettingPreference } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Roulette Results
  addResult(result: InsertRouletteResult): Promise<RouletteResult>;
  getResults(sessionId?: string, limit?: number): Promise<RouletteResult[]>;
  getRecentResults(limit: number): Promise<RouletteResult[]>;
  
  // Patterns
  savePattern(pattern: InsertPattern): Promise<Pattern>;
  getPatterns(): Promise<Pattern[]>;
  getActivePatterns(): Promise<Pattern[]>;
  getPatternById(id: string): Promise<Pattern | undefined>;
  updatePattern(id: string, updates: Partial<Pattern>): Promise<Pattern | undefined>;
  
  // Strategies
  saveStrategy(strategy: InsertStrategy): Promise<Strategy>;
  getStrategies(): Promise<Strategy[]>;
  getActiveStrategies(): Promise<Strategy[]>;
  updateStrategy(id: string, updates: Partial<Strategy>): Promise<Strategy | undefined>;
  
  // Alerts
  addAlert(alert: InsertAlert): Promise<Alert>;
  getAlerts(): Promise<Alert[]>;
  getRecentAlerts(limit: number): Promise<Alert[]>;
  markAlertAsRead(id: string): Promise<void>;
  
  // Sessions
  createSession(session: InsertSession): Promise<Session>;
  getCurrentSession(): Promise<Session | undefined>;
  updateSession(id: string, updates: Partial<Session>): Promise<Session | undefined>;
  
  // Betting Preferences
  getBettingPreferences(): Promise<BettingPreference[]>;
  updateBettingPreference(id: string, updates: Partial<BettingPreference>): Promise<BettingPreference | undefined>;
  saveBettingPreference(preference: InsertBettingPreference): Promise<BettingPreference>;
}

export class MemStorage implements IStorage {
  private results: Map<string, RouletteResult> = new Map();
  private patterns: Map<string, Pattern> = new Map();
  private strategies: Map<string, Strategy> = new Map();
  private alerts: Map<string, Alert> = new Map();
  private sessions: Map<string, Session> = new Map();
  private bettingPreferences: Map<string, BettingPreference> = new Map();
  private currentSessionId: string | null = null;

  constructor() {
    // Initialize with default session and strategies
    this.initializeDefaultSession();
    this.initializeDefaultStrategies();
    this.initializeDefaultBettingPreferences();
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

  private async initializeDefaultBettingPreferences() {
    const preferences: BettingPreference[] = [
      {
        id: randomUUID(),
        name: "Números Plenos",
        type: "straight_up",
        enabled: true,
        description: "Apostas em números únicos (0-36) com pagamento 35:1",
        priority: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: randomUUID(),
        name: "Vizinhos",
        type: "neighbors",
        enabled: true,
        description: "Apostas em grupos de números vizinhos na roda",
        priority: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: randomUUID(),
        name: "Dúzias",
        type: "dozens",
        enabled: true,
        description: "Apostas nas dúzias (1-12, 13-24, 25-36) com pagamento 2:1",
        priority: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: randomUUID(),
        name: "Colunas",
        type: "columns",
        enabled: false,
        description: "Apostas nas colunas verticais com pagamento 2:1",
        priority: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: randomUUID(),
        name: "Cores",
        type: "colors",
        enabled: false,
        description: "Apostas em vermelho/preto com pagamento 1:1",
        priority: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: randomUUID(),
        name: "Par/Ímpar", 
        type: "parity",
        enabled: false,
        description: "Apostas em números pares/ímpares com pagamento 1:1",
        priority: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    preferences.forEach(pref => {
      this.bettingPreferences.set(pref.id, pref);
    });
  }

  async addResult(insertResult: InsertRouletteResult): Promise<RouletteResult> {
    const id = randomUUID();
    
    // Calculate number properties
    const numberProps = {
      color: insertResult.number === 0 ? 'green' : 
             [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(insertResult.number) ? 'red' : 'black',
      dozen: insertResult.number === 0 ? null : Math.ceil(insertResult.number / 12),
      column: insertResult.number === 0 ? null : ((insertResult.number - 1) % 3) + 1,
      half: insertResult.number === 0 ? null : insertResult.number <= 18 ? 'low' : 'high',
      parity: insertResult.number === 0 ? null : insertResult.number % 2 === 0 ? 'even' : 'odd'
    };
    
    const result: RouletteResult = {
      ...insertResult,
      ...numberProps,
      id,
      source: insertResult.source || 'manual',
      timestamp: new Date()
    };
    
    this.results.set(id, result);
    
    // Update current session
    if (this.currentSessionId) {
      const session = this.sessions.get(this.currentSessionId);
      if (session && session.totalSpins !== null) {
        session.totalSpins += 1;
        session.patternsDetected = (session.patternsDetected || 0) + 1;
        this.sessions.set(this.currentSessionId, session);
      }
    }
    
    return result;
  }

  async getResults(sessionId?: string, limit = 100): Promise<RouletteResult[]> {
    const results = Array.from(this.results.values());
    
    if (sessionId) {
      return results
        .filter(r => r.sessionId === sessionId)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limit);
    }
    
    return results
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
      isActive: insertPattern.isActive ?? true,
      lastTriggered: insertPattern.lastTriggered ?? null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.patterns.set(id, pattern);
    return pattern;
  }

  async getPatterns(): Promise<Pattern[]> {
    return Array.from(this.patterns.values())
      .sort((a, b) => b.probability - a.probability);
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
      isActive: insertStrategy.isActive ?? true,
      maxAttempts: insertStrategy.maxAttempts ?? 5,
      currentAttempts: insertStrategy.currentAttempts ?? 0,
      lastUsed: insertStrategy.lastUsed ?? null,
      successRate: insertStrategy.successRate ?? null,
      createdAt: new Date()
    };
    
    this.strategies.set(id, strategy);
    return strategy;
  }

  async getStrategies(): Promise<Strategy[]> {
    return Array.from(this.strategies.values());
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
      data: insertAlert.data || {},
      read: insertAlert.read ?? null,
      timestamp: new Date()
    };
    
    this.alerts.set(id, alert);
    return alert;
  }

  async getAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
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
      name: insertSession.name ?? null,
      isActive: insertSession.isActive ?? true,
      successRate: insertSession.successRate ?? null,
      endTime: insertSession.endTime ?? null,
      totalSpins: insertSession.totalSpins ?? 0,
      patternsDetected: insertSession.patternsDetected ?? 0,
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

  async getBettingPreferences(): Promise<BettingPreference[]> {
    return Array.from(this.bettingPreferences.values())
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  async updateBettingPreference(id: string, updates: Partial<BettingPreference>): Promise<BettingPreference | undefined> {
    const preference = this.bettingPreferences.get(id);
    if (!preference) return undefined;
    
    const updatedPreference = { ...preference, ...updates, updatedAt: new Date() };
    this.bettingPreferences.set(id, updatedPreference);
    return updatedPreference;
  }

  async saveBettingPreference(insertPreference: InsertBettingPreference): Promise<BettingPreference> {
    const id = randomUUID();
    const preference: BettingPreference = {
      ...insertPreference,
      id,
      enabled: insertPreference.enabled ?? true,
      description: insertPreference.description ?? null,
      priority: insertPreference.priority ?? 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.bettingPreferences.set(id, preference);
    return preference;
  }
}

export const storage = new MemStorage();
