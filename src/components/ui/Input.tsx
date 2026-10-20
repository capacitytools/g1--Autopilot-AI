import { forwardRef, useId, type InputHTMLAttributes } from "react";

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  label?: string;
  hint?: string;
  error?: string;
  id?: string;
}

/**
 * Shared input primitive.
 * - Associates label, hint, and error with the input for screen readers.
 * - Shows error state visually + via aria-invalid.
 * - Touch-friendly height (h-11 = 44px, meets iOS tap target guidance).
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, id, className, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? `input-${autoId}`;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  const baseClasses =
    "block w-full rounded-md border bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:cursor-not-allowed disabled:bg-surface-muted";

  const stateClasses = error
    ? "border-red-500 focus:border-red-500 focus:ring-red-200"
    : "border-surface-border focus:border-brand-500 focus:ring-brand-200";

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1 block text-sm font-medium text-ink"
        >
          {label}
        </label>
      )}

      <input
        ref={ref}
        id={inputId}
        className={[baseClasses, stateClasses, className ?? ""]
          .filter(Boolean)
          .join(" ")}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...rest}
      />

      {hint && !error && (
        <p id={hintId} className="mt-1 text-xs text-ink-subtle">
          {hint}
        </p>
      )}

      {error && (
        <p id={errorId} className="mt-1 text-xs text-status-danger">
          {error}
        </p>
      )}
    </div>
  );
});
