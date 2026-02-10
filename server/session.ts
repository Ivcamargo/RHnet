import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET must be set.");
}

// Ensure session table and index exist (idempotent)
export async function ensureSessionSchema() {
  if (!process.env.DATABASE_URL) {
    console.log("[Session] Skipping schema initialization (no DATABASE_URL configured)");
    return;
  }

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR NOT NULL,
        sess JSON NOT NULL,
        expire TIMESTAMP(6) NOT NULL
      )
    `);

    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'sessions_pkey'
        ) THEN
          ALTER TABLE sessions ADD CONSTRAINT sessions_pkey PRIMARY KEY (sid) NOT DEFERRABLE INITIALLY IMMEDIATE;
        END IF;
      END $$;
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions (expire)
    `);

    console.log("[Session] Schema initialized successfully");
  } catch (error: any) {
    console.error("[Session] Error initializing schema:", error?.message ?? error);
  }
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const PgSession = connectPg(session);
  const store = new PgSession({
    conString: process.env.DATABASE_URL,
    tableName: "sessions",
    createTableIfMissing: false,
    errorLog: (error: any) => {
      if (error && !error.message?.includes("already exists")) {
        console.error("[Session store]", error.message);
      }
    },
  });

  const isProduction = process.env.NODE_ENV === "production";

  return session({
    store,
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "lax" : "lax",
      maxAge: sessionTtl,
    },
  });
}
