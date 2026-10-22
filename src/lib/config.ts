import { z } from "zod";

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_APP_ENV: z.enum(["development", "preview", "production"]).default("development"),
  NEXT_PUBLIC_G1ID_URL: z.string().url(),
  NEXT_PUBLIC_G1ID_SIGNUP_PATH: z.string().default("/signup"),
  NEXT_PUBLIC_G1ID_SIGNIN_PATH: z.string().default("/signin"),

  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional().or(z.literal("")),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional().or(z.literal("")),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().or(z.literal("")),

  // New Cloudinary variables
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().optional().or(z.literal("")),
  NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: z.string().optional().or(z.literal("")),

  OPENAI_API_KEY: z.string().optional().or(z.literal("")),
  ANTHROPIC_API_KEY: z.string().optional().or(z.literal("")),
  OPENROUTER_API_KEY: z.string().optional().or(z.literal("")),
  SEARCH_PROVIDER_API_KEY: z.string().optional().or(z.literal("")),
  PAYMENT_PROVIDER_SECRET_KEY: z.string().optional().or(z.literal("")),
  PAYMENT_PROVIDER_WEBHOOK_SECRET: z.string().optional().or(z.literal("")),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

export type ServerConfig = z.infer<typeof serverSchema>;

export interface AppConfig {
  env: "development" | "preview" | "production";
  isProduction: boolean;
  app: { url: string };
  g1id: { url: string; signupPath: string; signinPath: string };
  supabase: { url: string | null; anonKey: string | null; serviceRoleKey: string | null; isConfigured: boolean };
  cloudinary: { cloudName: string | null; uploadPreset: string | null; isConfigured: boolean };
  providers: {
    ai: { openai: string | null; anthropic: string | null; openrouter: string | null; anyConfigured: boolean };
    search: { apiKey: string | null; isConfigured: boolean };
    payments: { secretKey: string | null; webhookSecret: string | null; isConfigured: boolean };
  };
  logging: { level: "debug" | "info" | "warn" | "error" };
}

let cachedConfig: AppConfig | null = null;

export function getConfig(): AppConfig {
  if (cachedConfig) return cachedConfig;

  const parsed = serverSchema.safeParse(process.env);

  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`).join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}\n\nCopy .env.example to .env.local and fill in the missing values.`);
  }

  const env = parsed.data;

  const supabaseConfigured = Boolean(env.NEXT_PUBLIC_SUPABASE_URL) && Boolean(env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const aiConfigured = Boolean(env.OPENAI_API_KEY) || Boolean(env.ANTHROPIC_API_KEY) || Boolean(env.OPENROUTER_API_KEY);
  const searchConfigured = Boolean(env.SEARCH_PROVIDER_API_KEY);
  const paymentsConfigured = Boolean(env.PAYMENT_PROVIDER_SECRET_KEY) && Boolean(env.PAYMENT_PROVIDER_WEBHOOK_SECRET);
  const cloudinaryConfigured = Boolean(env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) && Boolean(env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

  cachedConfig = {
    env: env.NEXT_PUBLIC_APP_ENV,
    isProduction: env.NEXT_PUBLIC_APP_ENV === "production",
    app: { url: env.NEXT_PUBLIC_APP_URL },
    g1id: { url: env.NEXT_PUBLIC_G1ID_URL, signupPath: env.NEXT_PUBLIC_G1ID_SIGNUP_PATH, signinPath: env.NEXT_PUBLIC_G1ID_SIGNIN_PATH },
    supabase: { url: env.NEXT_PUBLIC_SUPABASE_URL || null, anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY || null, serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY || null, isConfigured: supabaseConfigured },
    cloudinary: { cloudName: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || null, uploadPreset: env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || null, isConfigured: cloudinaryConfigured },
    providers: {
      ai: { openai: env.OPENAI_API_KEY || null, anthropic: env.ANTHROPIC_API_KEY || null, openrouter: env.OPENROUTER_API_KEY || null, anyConfigured: aiConfigured },
      search: { apiKey: env.SEARCH_PROVIDER_API_KEY || null, isConfigured: searchConfigured },
      payments: { secretKey: env.PAYMENT_PROVIDER_SECRET_KEY || null, webhookSecret: env.PAYMENT_PROVIDER_WEBHOOK_SECRET || null, isConfigured: paymentsConfigured },
    },
    logging: { level: env.LOG_LEVEL },
  };

  return cachedConfig;
}

export function __resetConfigForTests(): void {
  cachedConfig = null;
}