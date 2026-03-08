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
          className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all ${error
              ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
              : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
            }`}
        />
      </div>
      {error && <ErrorMessage message={error} className="mt-1" id="email-error" />}
    </div>
  );
}
