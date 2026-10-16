/**
 * Normalized application errors.
 * Every error that reaches a user is one of these — never a raw
 * stack trace, never a provider-specific message, never a secret.
 *
 * Per master build prompt Section 28:
 * "Error normalization" is a required capability of the AI
 * provider interface, and this module generalizes that principle
 * across the whole app.
 */

export type ErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "PROVIDER_NOT_CONFIGURED"
  | "PROVIDER_ERROR"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly httpStatus: number;
  readonly userMessage: string;
  readonly context?: Record<string, unknown>;

  constructor(params: {
    code: ErrorCode;
    message: string;
    userMessage?: string;
    httpStatus?: number;
    context?: Record<string, unknown>;
  }) {
    super(params.message);
    this.name = "AppError";
    this.code = params.code;
    this.httpStatus = params.httpStatus ?? defaultHttpStatus(params.code);
    this.userMessage = params.userMessage ?? defaultUserMessage(params.code);
    this.context = params.context;
  }
}

function defaultHttpStatus(code: ErrorCode): number {
  switch (code) {
    case "UNAUTHORIZED":
      return 401;
    case "FORBIDDEN":
      return 403;
    case "NOT_FOUND":
      return 404;
    case "VALIDATION_ERROR":
      return 400;
    case "CONFLICT":
      return 409;
    case "RATE_LIMITED":
      return 429;
    case "PROVIDER_NOT_CONFIGURED":
      return 503;
    case "PROVIDER_ERROR":
      return 502;
    case "INTERNAL_ERROR":
    default:
      return 500;
  }
}

function defaultUserMessage(code: ErrorCode): string {
  switch (code) {
    case "UNAUTHORIZED":
      return "You need to sign in to continue.";
    case "FORBIDDEN":
      return "You don't have permission to do that.";
    case "NOT_FOUND":
      return "We couldn't find what you were looking for.";
    case "VALIDATION_ERROR":
      return "Some of the information you entered isn't valid.";
    case "CONFLICT":
      return "That action conflicts with the current state.";
    case "RATE_LIMITED":
      return "Too many requests. Please try again shortly.";
    case "PROVIDER_NOT_CONFIGURED":
      return "This feature isn't configured yet. An administrator needs to connect a provider.";
    case "PROVIDER_ERROR":
      return "A service we depend on is having trouble. Please try again shortly.";
    case "INTERNAL_ERROR":
    default:
      return "Something went wrong. Please try again.";
  }
}

/**
 * Convenience constructors for the most common cases.
 */
export const errors = {
  unauthorized: (message = "Not authenticated") =>
    new AppError({ code: "UNAUTHORIZED", message }),

  forbidden: (message = "Not permitted") =>
    new AppError({ code: "FORBIDDEN", message }),

  notFound: (what = "Resource") =>
    new AppError({ code: "NOT_FOUND", message: `${what} not found` }),

  validation: (message: string, context?: Record<string, unknown>) =>
    new AppError({ code: "VALIDATION_ERROR", message, context }),

  conflict: (message: string) =>
    new AppError({ code: "CONFLICT", message }),

  rateLimited: (message = "Rate limit exceeded") =>
    new AppError({ code: "RATE_LIMITED", message }),

  providerNotConfigured: (provider: string) =>
    new AppError({
      code: "PROVIDER_NOT_CONFIGURED",
      message: `Provider not configured: ${provider}`,
      userMessage: `${provider} isn't configured yet. Ask an administrator to connect it.`,
    }),

  providerError: (provider: string, cause?: string) =>
    new AppError({
      code: "PROVIDER_ERROR",
      message: cause ?? `Provider error: ${provider}`,
      context: { provider },
    }),

  internal: (message = "Internal error", context?: Record<string, unknown>) =>
    new AppError({ code: "INTERNAL_ERROR", message, context }),
};

/**
 * Convert any thrown value into a safe, client-facing shape.
 * Never returns a stack trace. Never returns raw provider messages
 * unless explicitly marked safe via AppError.userMessage.
 */
export function toClientError(error: unknown): {
  code: ErrorCode;
  message: string;
} {
  if (error instanceof AppError) {
    return { code: error.code, message: error.userMessage };
  }
  return {
    code: "INTERNAL_ERROR",
    message: defaultUserMessage("INTERNAL_ERROR"),
  };
}