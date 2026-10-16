import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 focus-visible:outline-brand-600 disabled:bg-brand-600/50",
  secondary:
    "bg-surface text-ink border border-surface-border hover:bg-surface-muted disabled:opacity-50",
  ghost:
    "bg-transparent text-ink-muted hover:bg-surface-muted hover:text-ink disabled:opacity-50",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600 disabled:bg-red-600/50",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

/**
 * Shared button primitive.
 * - Handles loading state (disables + shows spinner).
 * - Enforces touch-friendly minimum height (h-10 = 40px on md).
 * - Accessible focus ring via Tailwind's focus-visible.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const isDisabled = disabled || loading;

    const classes = [
      "inline-flex items-center justify-center gap-2 rounded-md font-medium",
      "transition-colors",
      "disabled:cursor-not-allowed",
      VARIANT_CLASSES[variant],
      SIZE_CLASSES[size],
      className ?? "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        ref={ref}
        className={classes}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        {...rest}
      >
        {loading && <Spinner />}
        {children}
      </button>
    );
  },
);

function Spinner() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        className="opacity-25"
      />
      <path
        d="M4 12a8 8 0 018-8"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        className="opacity-75"
      />
    </svg>
  );
}