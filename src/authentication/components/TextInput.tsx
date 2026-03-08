import { ErrorMessage } from './ErrorMessage';
import type { TextInputProps } from '../types';

export function TextInput({
    label,
    name,
    type = 'text',
    value,
    onChange,
    onBlur,
    error,
    required = false,
    placeholder,
    disabled = false,
    min,
    max,
    step,
}: TextInputProps) {
    const inputId = `input-${name}`;
    const errorId = `${inputId}-error`;

    return (
        <div className="w-full">
            <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
                {label}
                {required && <span className="text-red-600 ml-1">*</span>}
            </label>
            <input
                id={inputId}
                name={name}
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
                disabled={disabled}
                placeholder={placeholder}
                required={required}
                min={min}
                max={max}
                step={step}
                aria-invalid={!!error}
                aria-describedby={error ? errorId : undefined}
                aria-required={required}
                className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all ${error
                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                    }`}
            />
            {error && <ErrorMessage message={error} className="mt-1" id={errorId} />}
        </div>
    );
}
