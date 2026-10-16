import { describe, it, expect, beforeEach } from "vitest";
import { getConfig, __resetConfigForTests } from "./config";

/**
 * Minimal valid environment for the config loader.
 * Overridden per-test as needed.
 */
const baseEnv: NodeJS.ProcessEnv = {
  NODE_ENV: "test",
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
  NEXT_PUBLIC_APP_ENV: "development",
  NEXT_PUBLIC_G1ID_URL: "https://g1-id.vercel.app",
  NEXT_PUBLIC_G1ID_SIGNUP_PATH: "/signup",
  NEXT_PUBLIC_G1ID_SIGNIN_PATH: "/signin",
  LOG_LEVEL: "info",
};

function applyEnv(env: NodeJS.ProcessEnv) {
  // Clear any prior values we manage.
  const managedKeys = [
    ...Object.keys(baseEnv),
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "OPENAI_API_KEY",
    "ANTHROPIC_API_KEY",
    "OPENROUTER_API_KEY",
    "SEARCH_PROVIDER_API_KEY",
    "PAYMENT_PROVIDER_SECRET_KEY",
    "PAYMENT_PROVIDER_WEBHOOK_SECRET",
  ];
  for (const key of managedKeys) {
    delete process.env[key];
  }
  Object.assign(process.env, env);
}

describe("config", () => {
  beforeEach(() => {
    __resetConfigForTests();
    applyEnv(baseEnv);
  });

  it("loads a valid minimal configuration", () => {
    const config = getConfig();

    expect(config.env).toBe("development");
    expect(config.isProduction).toBe(false);
    expect(config.app.url).toBe("http://localhost:3000");
    expect(config.g1id.url).toBe("https://g1-id.vercel.app");
    expect(config.g1id.signupPath).toBe("/signup");
    expect(config.g1id.signinPath).toBe("/signin");
    expect(config.logging.level).toBe("info");
  });

  it("reports Supabase as not configured when keys are missing", () => {
    const config = getConfig();

    expect(config.supabase.isConfigured).toBe(false);
    expect(config.supabase.url).toBeNull();
    expect(config.supabase.anonKey).toBeNull();
  });

  it("reports Supabase as configured when URL and anon key are present", () => {
    applyEnv({
      ...baseEnv,
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key-value",
    });
    __resetConfigForTests();

    const config = getConfig();

    expect(config.supabase.isConfigured).toBe(true);
    expect(config.supabase.url).toBe("https://example.supabase.co");
    expect(config.supabase.anonKey).toBe("anon-key-value");
  });

  it("reports AI providers as not configured when no keys are present", () => {
    const config = getConfig();

    expect(config.providers.ai.anyConfigured).toBe(false);
    expect(config.providers.ai.openai).toBeNull();
    expect(config.providers.ai.anthropic).toBeNull();
    expect(config.providers.ai.openrouter).toBeNull();
  });

  it("reports AI providers as configured when at least one key is present", () => {
    applyEnv({ ...baseEnv, OPENAI_API_KEY: "sk-test" });
    __resetConfigForTests();

    const config = getConfig();

    expect(config.providers.ai.anyConfigured).toBe(true);
    expect(config.providers.ai.openai).toBe("sk-test");
  });

  it("reports search as not configured by default", () => {
    const config = getConfig();

    expect(config.providers.search.isConfigured).toBe(false);
    expect(config.providers.search.apiKey).toBeNull();
  });

  it("reports payments as not configured by default", () => {
    const config = getConfig();

    expect(config.providers.payments.isConfigured).toBe(false);
  });

  it("reports payments as configured only when both keys are present", () => {
    applyEnv({
      ...baseEnv,
      PAYMENT_PROVIDER_SECRET_KEY: "sk_pay",
    });
    __resetConfigForTests();

    // Only one of the two keys — should remain not configured.
    expect(getConfig().providers.payments.isConfigured).toBe(false);

    applyEnv({
      ...baseEnv,
      PAYMENT_PROVIDER_SECRET_KEY: "sk_pay",
      PAYMENT_PROVIDER_WEBHOOK_SECRET: "whsec_123",
    });
    __resetConfigForTests();

    expect(getConfig().providers.payments.isConfigured).toBe(true);
  });

  it("throws a readable error when required values are missing", () => {
    applyEnv({
      NODE_ENV: "test",
      // Deliberately missing NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_G1ID_URL, etc.
    } as NodeJS.ProcessEnv);
    __resetConfigForTests();

    expect(() => getConfig()).toThrowError(/Invalid environment configuration/);
  });

  it("throws when NEXT_PUBLIC_APP_URL is not a valid URL", () => {
    applyEnv({ ...baseEnv, NEXT_PUBLIC_APP_URL: "not-a-url" });
    __resetConfigForTests();

    expect(() => getConfig()).toThrowError(/NEXT_PUBLIC_APP_URL/);
  });

  it("throws when G1-ID signup path does not start with a slash", () => {
    applyEnv({ ...baseEnv, NEXT_PUBLIC_G1ID_SIGNUP_PATH: "signup" });
    __resetConfigForTests();

    expect(() => getConfig()).toThrowError(/NEXT_PUBLIC_G1ID_SIGNUP_PATH/);
  });

  it("caches the configuration after first successful load", () => {
    const first = getConfig();
    const second = getConfig();

    expect(first).toBe(second);
  });
});