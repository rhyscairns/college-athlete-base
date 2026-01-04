import type { ErrorMessageProps } from '../types';

export function ErrorMessage({ message, className = '', id }: ErrorMessageProps) {
  return (
    <div
      id={id}
      role="alert"
      aria-live="polite"
      className={`text-sm text-red-600 ${className}`}
    >
      {message}
    </div>
  );
}
