import { z } from "zod";

/**
 * Server-side environment schema.
 * Validated once at module load. Fails loudly if required values
 * are missing or malformed — per master build prompt Section 4
 * Constraint 10: "Clearly distinguish implemented features from
 * planned integrations."
 *
 * Anything marked optional here is a feature whose provider is not
 * yet configured. Features gated by these values must show a clear
 * "not configured" state rather than pretending to work.
 */
const serverSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  NEXT_PUBLIC_APP_URL: z
    .string()
    .url("NEXT_PUBLIC_APP_URL must be a valid URL"),

  NEXT_PUBLIC_APP_ENV: z
    .enum(["development", "preview", "production"])
    .default("development"),

  NEXT_PUBLIC_G1ID_URL: z
    .string()
    .url("NEXT_PUBLIC_G1ID_URL must be a valid URL"),

  NEXT_PUBLIC_G1ID_SIGNUP_PATH: z
    .string()
    .startsWith("/", "NEXT_PUBLIC_G1ID_SIGNUP_PATH must start with /")
    .default("/signup"),

  NEXT_PUBLIC_G1ID_SIGNIN_PATH: z
    .string()
    .startsWith("/", "NEXT_PUBLIC_G1ID_SIGNIN_PATH must start with /")
    .default("/signin"),

  // --- Supabase (optional in Phase 1, required from Phase 2) ---
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional().or(z.literal("")),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional().or(z.literal("")),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().or(z.literal("")),

  // --- AI providers (Phase 6+) ---
  OPENAI_API_KEY: z.string().optional().or(z.literal("")),
  ANTHROPIC_API_KEY: z.string().optional().or(z.literal("")),
  OPENROUTER_API_KEY: z.string().optional().or(z.literal("")),

  // --- Search providers (Phase 4+) ---
  SEARCH_PROVIDER_API_KEY: z.string().optional().or(z.literal("")),

  // --- Payments (Phase 13+) ---
  PAYMENT_PROVIDER_SECRET_KEY: z.string().optional().or(z.literal("")),
  PAYMENT_PROVIDER_WEBHOOK_SECRET: z.string().optional().or(z.literal("")),

  // --- Logging ---
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

export type ServerConfig = z.infer<typeof serverSchema>;

/**
 * Shaped config consumed by the rest of the app.
 * Avoids scattering `process.env.X` lookups everywhere — keeps
 * provider swap-in/out (G1-ID, Supabase, AI, payments) in one place.
 */
export interface AppConfig {
  env: "development" | "preview" | "production";
  isProduction: boolean;
  app: {
    url: string;
  };
  g1id: {
    url: string;
    signupPath: string;
    signinPath: string;
  };
  supabase: {
    url: string | null;
    anonKey: string | null;
    serviceRoleKey: string | null;
    isConfigured: boolean;
  };
  providers: {
    ai: {
      openai: string | null;
      anthropic: string | null;
      openrouter: string | null;
      anyConfigured: boolean;
    };
    search: {
      apiKey: string | null;
      isConfigured: boolean;
    };
    payments: {
      secretKey: string | null;
      webhookSecret: string | null;
      isConfigured: boolean;
    };
  };
  logging: {
    level: "debug" | "info" | "warn" | "error";
  };
}

let cachedConfig: AppConfig | null = null;

/**
 * Load and validate configuration.
 * Throws a readable error listing every problem at once so setup
 * failures are diagnosed in one pass, not one error per reload.
 */
export function getConfig(): AppConfig {
  if (cachedConfig) return cachedConfig;

  const parsed = serverSchema.safeParse(process.env);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => {
        const path = issue.path.join(".");
        return `  - ${path}: ${issue.message}`;
      })
      .join("\n");

    throw new Error(
      `Invalid environment configuration:\n${issues}\n\n` +
        `Copy .env.example to .env.local and fill in the missing values.`,
    );
  }

  const env = parsed.data;

  const supabaseConfigured =
    Boolean(env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const aiConfigured =
    Boolean(env.OPENAI_API_KEY) ||
    Boolean(env.ANTHROPIC_API_KEY) ||
    Boolean(env.OPENROUTER_API_KEY);

  const searchConfigured = Boolean(env.SEARCH_PROVIDER_API_KEY);

  const paymentsConfigured =
    Boolean(env.PAYMENT_PROVIDER_SECRET_KEY) &&
    Boolean(env.PAYMENT_PROVIDER_WEBHOOK_SECRET);

  cachedConfig = {
    env: env.NEXT_PUBLIC_APP_ENV,
    isProduction: env.NEXT_PUBLIC_APP_ENV === "production",
    app: {
      url: env.NEXT_PUBLIC_APP_URL,
    },
    g1id: {
      url: env.NEXT_PUBLIC_G1ID_URL,
      signupPath: env.NEXT_PUBLIC_G1ID_SIGNUP_PATH,
      signinPath: env.NEXT_PUBLIC_G1ID_SIGNIN_PATH,
    },
    supabase: {
      url: env.NEXT_PUBLIC_SUPABASE_URL || null,
      anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY || null,
      serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY || null,
      isConfigured: supabaseConfigured,
    },
    providers: {
      ai: {
        openai: env.OPENAI_API_KEY || null,
        anthropic: env.ANTHROPIC_API_KEY || null,
        openrouter: env.OPENROUTER_API_KEY || null,
        anyConfigured: aiConfigured,
      },
      search: {
        apiKey: env.SEARCH_PROVIDER_API_KEY || null,
        isConfigured: searchConfigured,
      },
      payments: {
        secretKey: env.PAYMENT_PROVIDER_SECRET_KEY || null,
        webhookSecret: env.PAYMENT_PROVIDER_WEBHOOK_SECRET || null,
        isConfigured: paymentsConfigured,
      },
    },
    logging: {
      level: env.LOG_LEVEL,
    },
  };

  return cachedConfig;
}

/**
 * Test-only reset. Do not use in production code.
 */
export function __resetConfigForTests(): void {
  cachedConfig = null;
}