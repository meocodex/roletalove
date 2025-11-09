import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://dummy:dummy@localhost:5432/dummy';

if (!process.env.DATABASE_URL) {
  console.warn("⚠️ DATABASE_URL not set. Starting without a persistent database.");
  console.warn("⚠️ The app will use in-memory storage; data will reset on restart.");
}

// Use the pool configuration from the blueprint
export const pool = new Pool({ connectionString: DATABASE_URL });
export const db = drizzle({ client: pool, schema });

console.log("✅ Database connection configured successfully");

// Utilitários para verificar conexão
export async function testConnection() {
  try {
    // Simple query to test connection using the pool
    await pool.query('SELECT 1');
    console.log("✅ Database connection test successful");
    return true;
  } catch (error) {
    console.error("❌ Database connection test failed:", error);
    
    // Always continue with in-memory storage fallback in this environment
    console.log("⚠️ Continuing without database (using in-memory storage)");
    return false;
  }
}

// Inicializar banco se necessário
export async function initializeDatabase() {
  try {
    console.log("🔄 Initializing database...");
    
    // Verificar se existe pelo menos uma tabela
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'users'
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      console.log("⚠️ Database tables not found. Please run migrations:");
      console.log("npm run db:push");
    } else {
      console.log("✅ Database initialized successfully");
    }

  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    
    // In development, continue anyway - will fall back to in-memory storage
    if (process.env.NODE_ENV === 'development') {
      console.log("⚠️ Continuing with in-memory storage for development");
    }
  }
}