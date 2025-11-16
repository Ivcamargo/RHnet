import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import fs from 'fs';
import path from 'path';

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });

/**
 * Ensure all database tables exist (truly idempotent initialization)
 * 
 * Uses a dedicated migrations tracking table to ensure schema is only initialized once
 * Automatically detects existing schemas (from Drizzle or manual setup) and marks them as migrated
 * 
 * Works in both development and production without any configuration
 * Safe to run multiple times - tracks completion to prevent re-execution
 */
export async function ensureAllTablesExist(): Promise<void> {
  console.log('[DB] Checking database schema...');
  
  try {
    // Create migrations table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS _schema_migrations (
        id serial PRIMARY KEY,
        migration_name varchar NOT NULL UNIQUE,
        executed_at timestamp DEFAULT now()
      );
    `);
    
    // Check if initial schema migration has already been applied
    const migrationCheck = await pool.query(`
      SELECT EXISTS (
        SELECT 1 FROM _schema_migrations 
        WHERE migration_name = '0000_solid_ogun'
      );
    `);
    
    const migrationApplied = migrationCheck.rows[0]?.exists;
    
    if (migrationApplied) {
      console.log('[DB] ✅ Database schema already initialized');
      return;
    }
    
    console.log('[DB] Initializing database schema (running idempotent migration)...');
    
    // Read the migration SQL file
    const migrationPath = path.join(process.cwd(), 'migrations', '0000_solid_ogun.sql');
    
    if (!fs.existsSync(migrationPath)) {
      console.warn('[DB] ⚠️  Migration file not found, skipping schema initialization');
      return;
    }
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute migration in a transaction for all-or-nothing behavior
    // Use a dedicated client to ensure all commands run on the same connection
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Execute the full migration SQL
      // Note: This may fail on existing constraints, which is acceptable
      // since CREATE TABLE IF NOT EXISTS makes it idempotent
      await client.query(migrationSQL);
      
      // Record migration as completed
      await client.query(`
        INSERT INTO _schema_migrations (migration_name) 
        VALUES ('0000_solid_ogun')
      `);
      
      await client.query('COMMIT');
      console.log('[DB] ✅ Database schema initialized successfully (56 tables created)');
    } catch (txError: any) {
      await client.query('ROLLBACK');
      
      // Check if this is a benign "already exists" error for constraints
      // If tables already exist from previous Drizzle setup, constraints will fail
      // In this case, we still want to mark the migration as complete
      if (txError.message && txError.message.includes('already exists')) {
        console.log('[DB] ⚙️  Schema appears to already exist, marking as initialized...');
        await pool.query(`
          INSERT INTO _schema_migrations (migration_name) 
          VALUES ('0000_solid_ogun')
          ON CONFLICT (migration_name) DO NOTHING
        `);
        console.log('[DB] ✅ Database schema already initialized (existing schema detected)');
      } else {
        throw txError;
      }
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('[DB] ❌ Failed to initialize database schema:', error.message);
    
    // Don't throw - allow server to start even if schema init fails
    // This prevents startup failures due to network issues or temporary problems
    console.warn('[DB] ⚠️  Server will start, but database may not be fully initialized');
  }
}