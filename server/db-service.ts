import { eq, desc, sql } from "drizzle-orm";
import { db } from "./database";
import { users, subscriptions, rouletteResults, patterns, strategies, alerts } from "@shared/schema";
import { hashPassword } from "./auth-utils";
import type { 
  User, 
  InsertUser,
  RouletteResult,
  InsertRouletteResult,
  Pattern,
  Strategy,
  Alert 
} from "@shared/schema";

// Fallback storage se database não estiver configurado
import { storage as memoryStorage } from "./storage";

class DatabaseService {
  private isDbAvailable(): boolean {
    return db !== null && db !== undefined;
  }

  // ========== USERS ==========
  async createUser(userData: {
    name: string;
    phone: string;
    email: string;
    password: string;
    planType?: 'basico' | 'intermediario' | 'completo';
  }): Promise<User> {
    if (!this.isDbAvailable()) {
      // Fallback para storage em memória (implementação futura)
      throw new Error("Database not available and memory storage not implemented for users");
    }

    const hashedPassword = await hashPassword(userData.password);

    const insertData: InsertUser = {
      name: userData.name,
      phone: userData.phone,
      email: userData.email.toLowerCase(),
      planType: userData.planType || 'basico',
      userRole: 'user',
      isActive: true,
      lastLoginAt: new Date(),
    };

    // Inserir usuário
    const [newUser] = await db.insert(users)
      .values(insertData)
      .returning();

    // Armazenar senha hasheada separadamente (não está no schema return)
    await db.execute(
      sql`UPDATE users SET password = ${hashedPassword} WHERE id = ${newUser.id}`
    );

    return newUser;
  }

  async findUserByEmail(email: string): Promise<(User & { password: string }) | null> {
    if (!this.isDbAvailable()) {
      // Fallback para storage em memória - importar usuários mock
      const { MOCK_USERS } = await import("./auth-routes");
      const mockUser = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (mockUser) {
        return {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          phone: '(11) 98888-8888', // Fallback para phone que é required
          planType: mockUser.planType,
          userRole: mockUser.userRole,
          isActive: mockUser.isActive,
          lastLoginAt: mockUser.lastLoginAt || null,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.createdAt,
          password: mockUser.password
        };
      }
      return null;
    }

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        phone: users.phone,
        planType: users.planType,
        userRole: users.userRole,
        isActive: users.isActive,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        password: sql<string>`password`, // Campo que não está no schema público
      })
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    return user || null;
  }

  async findUserById(id: string): Promise<User | null> {
    if (!this.isDbAvailable()) {
      // Fallback para storage em memória (implementação futura)
      return null;
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return user || null;
  }

  async updateUserLastLogin(id: string): Promise<void> {
    if (!this.isDbAvailable()) {
      return;
    }

    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, id));
  }

  // ========== ROULETTE RESULTS ==========
  async addResult(resultData: InsertRouletteResult): Promise<RouletteResult> {
    if (!this.isDbAvailable()) {
      return memoryStorage.addResult(resultData);
    }

    // Calcular propriedades derivadas
    const number = resultData.number;
    const color = number === 0 ? 'green' : 
                  [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(number) ? 'red' : 'black';
    const dozen = number === 0 ? null : Math.ceil(number / 12);
    const column = number === 0 ? null : ((number - 1) % 3) + 1;
    const half = number === 0 ? null : number <= 18 ? 'low' : 'high';
    const parity = number === 0 ? null : number % 2 === 0 ? 'even' : 'odd';

    const [newResult] = await db.insert(rouletteResults)
      .values({
        ...resultData,
        color,
        dozen,
        column,
        half,
        parity,
      })
      .returning();

    return newResult;
  }

  async getResults(limit = 100): Promise<RouletteResult[]> {
    if (!this.isDbAvailable()) {
      return memoryStorage.getResults();
    }

    return db
      .select()
      .from(rouletteResults)
      .orderBy(desc(rouletteResults.timestamp))
      .limit(limit);
  }

  // ========== PATTERNS ==========
  async getPatterns(): Promise<Pattern[]> {
    if (!this.isDbAvailable()) {
      return memoryStorage.getPatterns();
    }

    return db
      .select()
      .from(patterns)
      .where(eq(patterns.isActive, true))
      .orderBy(desc(patterns.createdAt));
  }

  // ========== STRATEGIES ==========
  async getStrategies(): Promise<Strategy[]> {
    if (!this.isDbAvailable()) {
      return memoryStorage.getStrategies();
    }

    return db
      .select()
      .from(strategies)
      .where(eq(strategies.isActive, true))
      .orderBy(desc(strategies.createdAt));
  }

  // ========== ALERTS ==========
  async getAlerts(): Promise<Alert[]> {
    if (!this.isDbAvailable()) {
      return memoryStorage.getAlerts();
    }

    return db
      .select()
      .from(alerts)
      .orderBy(desc(alerts.timestamp))
      .limit(50);
  }
}

export const dbService = new DatabaseService();