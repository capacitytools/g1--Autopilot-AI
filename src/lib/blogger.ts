import { getConfig } from "./config";

type LogLevel = "debug" | "info" | "warn" | "error";

const LEVELS: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

/**
 * Structured logger.
 * - Never logs secrets. Callers must not pass raw credentials.
 * - Level is controlled by LOG_LEVEL env var.
 * - Output is single-line JSON in production, human-readable in dev.
 *
 * Per master build prompt Section 28: "Never log full private credentials."
 */
class Logger {
  private minLevel: number;

  constructor() {
    let level: LogLevel = "info";
    try {
      level = getConfig().logging.level;
    } catch {
      // Config not available (e.g. during early boot or tests).
      // Fall back to "info" — do not throw from the logger.
    }
    this.minLevel = LEVELS[level];
  }

  private shouldLog(level: LogLevel): boolean {
    return LEVELS[level] >= this.minLevel;
  }

  private write(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
  ): void {
    if (!this.shouldLog(level)) return;

    const entry = {
      ts: new Date().toISOString(),
      level,
      message,
      ...(context ? { context } : {}),
    };

    const isProduction = process.env.NODE_ENV === "production";

    if (isProduction) {
      // Single-line JSON for log aggregators.
      // eslint-disable-next-line no-console
      console[level === "debug" ? "log" : level](JSON.stringify(entry));
    } else {
      // Human-readable for local development.
      const ctx = context ? ` ${JSON.stringify(context)}` : "";
      // eslint-disable-next-line no-console
      console[level === "debug" ? "log" : level](
        `[${level.toUpperCase()}] ${message}${ctx}`,
      );
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.write("debug", message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.write("info", message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.write("warn", message, context);
  }

  error(
    message: string,
    error?: unknown,
    context?: Record<string, unknown>,
  ): void {
    const errorContext: Record<string, unknown> = { ...context };

    if (error instanceof Error) {
      errorContext.errorName = error.name;
      errorContext.errorMessage = error.message;
      if (error.stack) errorContext.stack = error.stack;
    } else if (error !== undefined) {
      errorContext.error = String(error);
    }

    this.write("error", message, errorContext);
  }
}

export const logger = new Logger();