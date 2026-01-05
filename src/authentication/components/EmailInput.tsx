import { ErrorMessage } from './ErrorMessage';
import type { EmailInputProps } from '../types';

export function EmailInput({ value, onChange, onBlur, error, disabled = false }: EmailInputProps) {
  return (
    <div className="w-full">
      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
        Email
        <span className="text-red-600 ml-1">*</span>
      </label>
      <div className="relative">
        <input
          id="email"
          type="email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? 'email-error' : undefined}
          aria-required={true}
          className="w-full h-12 px-4 bg-white/60 backdrop-blur-sm text-gray-800 placeholder-gray-500 border-2 rounded-xl focus:outline-none focus:bg-white/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all border-white/80 focus:border-white"
        />
      </div>
      {error && <ErrorMessage message={error} className="mt-1" id="email-error" />}
    </div>
  );
}
