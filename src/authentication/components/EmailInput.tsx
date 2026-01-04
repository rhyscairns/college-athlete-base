import { ErrorMessage } from './ErrorMessage';
import type { EmailInputProps } from '../types';

export function EmailInput({ value, onChange, error, disabled = false }: EmailInputProps) {
  return (
    <div className="w-full">
      <div className="relative">
        <input
          id="email"
          type="email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? 'email-error' : undefined}
          aria-label="Email"
          placeholder="Username"
          className="w-full h-14 text-center bg-white/60 backdrop-blur-sm text-gray-800 placeholder-gray-500 border-2 border-white/80 rounded-xl focus:outline-none focus:border-white focus:bg-white/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        />
      </div>
      {error && <ErrorMessage message={error} className="mt-2" id="email-error" />}
    </div>
  );
}
