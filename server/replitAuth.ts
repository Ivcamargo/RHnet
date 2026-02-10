import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { pool } from "./db";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

// Ensure session table and index exist (idempotent)
export async function ensureSessionSchema() {
  // Only run if DATABASE_URL is configured (skip if Postgres isn't available)
  if (!process.env.DATABASE_URL) {
    console.log('[Session] Skipping schema initialization (no DATABASE_URL configured)');
    return;
  }

  try {
    // Create session table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR NOT NULL COLLATE "default",
        sess JSON NOT NULL,
        expire TIMESTAMP(6) NOT NULL
      )
    `);
    
    // Add primary key constraint if not exists
    await pool.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'sessions_pkey'
        ) THEN
          ALTER TABLE sessions ADD CONSTRAINT sessions_pkey PRIMARY KEY (sid) NOT DEFERRABLE INITIALLY IMMEDIATE;
        END IF;
      END $$
    `);
    
    // Create index if not exists (this is the one causing the error)
    await pool.query(`
      CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions (expire)
    `);
    
    console.log('[Session] Schema initialized successfully');
  } catch (error: any) {
    console.error('[Session] Error initializing schema:', error.message);
    // Don't throw - allow app to start even if session setup has issues
  }
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  // Use PostgreSQL session store for production persistence
  const PgSession = connectPg(session);
  const store = new PgSession({
    conString: process.env.DATABASE_URL,
    tableName: 'sessions',
    createTableIfMissing: false, // We handle table creation explicitly above
    errorLog: (error: any) => {
      // Only log critical errors, not "already exists" warnings
      if (error && !error.message?.includes('already exists')) {
        console.error('[Session store]', error.message);
      }
    },
  });
  
  const isProduction = process.env.NODE_ENV === 'production' || process.env.REPLIT_DEPLOYMENT === '1';
  
  return session({
    store,
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction, // Enable secure cookies in production
      sameSite: isProduction ? 'none' : 'lax', // Required for cross-site cookies in production
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
): Promise<{ success: boolean; error?: string }> {
  try {
    // CRITICAL SECURITY FIX: Only assign default company to NEW users
    // Check if user already exists by ID first, then by email to avoid duplicates
    let existingUser = await storage.getUser(claims["sub"]);
    
    if (!existingUser) {
      // If not found by ID, check by email to avoid email constraint violation
      const allUsers = await storage.getAllUsers();
      existingUser = allUsers.find(user => user.email === claims["email"]);
    }
    
    if (existingUser) {
      // User exists (by ID or email) - update profile info but PRESERVE role (security)
      await storage.upsertUser({
        id: claims["sub"], // Use the new ID from claims (important for OIDC consistency)
        companyId: existingUser.companyId, // PRESERVE existing companyId
        email: claims["email"],
        firstName: claims["first_name"],
        lastName: claims["last_name"],
        profileImageUrl: claims["profile_image_url"],
        role: existingUser.role, // ALWAYS preserve existing role for security
        departmentId: existingUser.departmentId, // PRESERVE existing departmentId
      });
    } else {
      // NEW user - assign to default company (SECURITY: only use default CNPJ company)
      const allCompanies = await storage.getCompanies();
      
      // SECURITY: Only look for default company with specific CNPJ - no fallbacks
      let defaultCompany = allCompanies.find(c => c.cnpj === "00000000000000");
      
      if (!defaultCompany) {
        try {
          defaultCompany = await storage.createCompany({
            name: "Empresa Padrão",
            address: "Endereço não definido",
            cnpj: "00000000000000"
          });
        } catch (error: any) {
          // SECURITY: Improved error handling using proper error detection
          if (error?.code === "23505" || (error instanceof Error && error.message.includes("companies_cnpj_unique"))) {
            // Try to find the company again after failed creation
            const companiesRetry = await storage.getCompanies();
            defaultCompany = companiesRetry.find(c => c.cnpj === "00000000000000");
            if (!defaultCompany) {
              throw new Error("System configuration error: Default company not found. Contact administrator.");
            }
          } else {
            throw error;
          }
        }
      }

      // SECURITY: Always assign new users as "employee" - roles managed server-side only
      await storage.upsertUser({
        id: claims["sub"],
        companyId: defaultCompany.id,
        email: claims["email"],
        firstName: claims["first_name"],
        lastName: claims["last_name"],
        profileImageUrl: claims["profile_image_url"],
        role: "employee", // SECURITY: Never trust role from external claims
      });
    }
    
    return { success: true };
  } catch (error) {
    // Log error without exposing database credentials
    console.error("Database error during user upsert:", {
      userId: claims["sub"],
      userEmail: claims["email"],
      error: error instanceof Error ? error.message : "Unknown error",
      errorType: error instanceof Error ? error.constructor.name : "Unknown",
      timestamp: new Date().toISOString()
    });
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Database connection failed"
    };
  }
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    try {
      const user = {};
      updateUserSession(user, tokens);
      
      // CRITICAL: Handle database errors gracefully to prevent server crashes
      const claims = tokens.claims();
      if (!claims) {
        return verified(new Error("Failed to retrieve user claims"), false);
      }
      
      const upsertResult = await upsertUser(claims);
      
      if (!upsertResult.success) {
        console.error("Authentication failed due to database error:", {
          error: upsertResult.error,
          userId: claims["sub"],
          timestamp: new Date().toISOString()
        });
        
        // Return authentication error instead of crashing
        return verified(new Error("Database authentication failed: " + upsertResult.error), false);
      }
      
      verified(null, user);
    } catch (error) {
      console.error("Unexpected error in authentication verify:", {
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      });
      
      // Ensure we don't crash the server
      verified(new Error("Authentication system error"), false);
    }
  };

  for (const domain of process.env
    .REPLIT_DOMAINS!.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}/landing`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
