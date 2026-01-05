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
                className={`w-full h-12 px-4 bg-white/60 backdrop-blur-sm text-gray-800 placeholder-gray-500 border-2 rounded-xl focus:outline-none focus:bg-white/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all ${error ? 'border-red-500 focus:border-red-600' : 'border-white/80 focus:border-white'
                    }`}
            />
            {error && <ErrorMessage message={error} className="mt-1" id={errorId} />}
        </div>
    );
}
