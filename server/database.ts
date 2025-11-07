import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://dummy:dummy@localhost:5432/dummy';

if (!process.env.DATABASE_URL) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }
  console.warn("⚠️ DATABASE_URL not set. Running in development mode without database.");
  console.warn("⚠️ Application will use in-memory storage. Data will be lost on restart.");
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
    
    // In development, continue with in-memory storage as fallback
    if (process.env.NODE_ENV === 'development') {
      console.log("⚠️ Switching to in-memory storage for development");
      return false;
    }
    throw error;
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