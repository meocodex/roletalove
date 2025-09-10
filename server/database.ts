import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "@shared/schema";

// URL da database - usar Neon em produção, fallback para desenvolvimento
const DATABASE_URL = process.env.DATABASE_URL || 
  "postgresql://localhost:5432/roulette_dev?sslmode=prefer";

let sql: any;
let db: any;

try {
  // Configurar conexão Neon
  sql = neon(DATABASE_URL);
  db = drizzle(sql, { schema });
  
  console.log("✅ Database connection configured successfully");
} catch (error) {
  console.error("❌ Database connection failed:", error);
  
  // Em desenvolvimento, usar simulação em memória
  if (process.env.NODE_ENV === 'development') {
    console.log("⚠️ Using in-memory storage for development");
    db = null; // Usar storage.ts existente
  } else {
    throw error;
  }
}

export { db, sql };

// Utilitários para verificar conexão
export async function testConnection() {
  if (!db) {
    console.log("Database not configured - using in-memory storage");
    return false;
  }

  try {
    // Query simples para testar conexão
    await sql`SELECT 1`;
    console.log("✅ Database connection test successful");
    return true;
  } catch (error) {
    console.error("❌ Database connection test failed:", error);
    
    // Em desenvolvimento, desabilitar database e usar in-memory storage
    if (process.env.NODE_ENV === 'development') {
      console.log("⚠️ Switching to in-memory storage for development");
      db = null;
      sql = null;
    }
    return false;
  }
}

// Inicializar banco se necessário
export async function initializeDatabase() {
  if (!db) {
    console.log("Database not configured - using in-memory storage");
    return;
  }

  try {
    console.log("🔄 Initializing database...");
    
    // Verificar se existe pelo menos uma tabela
    const result = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'users'
      LIMIT 1
    `;

    if (result.length === 0) {
      console.log("⚠️ Database tables not found. Please run migrations:");
      console.log("npm run db:push");
    } else {
      console.log("✅ Database initialized successfully");
    }

  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    
    // Em desenvolvimento, desabilitar database e usar in-memory storage
    if (process.env.NODE_ENV === 'development') {
      console.log("⚠️ Switching to in-memory storage for development");
      db = null;
      sql = null;
    }
  }
}