import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false },
});
export const db = drizzle({ client: pool, schema });

/**
 * Initialize database schema in production
 * Runs database migrations to create/update tables
 */
export async function initializeProductionDatabase(): Promise<void> {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (!isProduction) {
    console.log('[DB] Skipping schema initialization (development mode)');
    return;
  }

  console.log('[DB] Initializing production database schema...');
  
  try {
    // Run migrations from the migrations folder
    await migrate(db, { migrationsFolder: './migrations' });
    
    console.log('[DB] ✅ Production database schema initialized successfully');
  } catch (error: any) {
    console.error('[DB] ❌ Failed to initialize production database schema:', error.message);
    console.error('[DB] Error details:', error);
    
    // Don't throw - allow server to start even if schema sync fails
    // This prevents startup failures due to network issues or temporary problems
    console.warn('[DB] ⚠️  Server will start, but database may not be fully initialized');
  }
}
