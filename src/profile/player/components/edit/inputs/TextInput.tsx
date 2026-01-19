import type { TextInputProps } from '../../../types';

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
                className={`w-full h-12 px-4 bg-white/60 backdrop-blur-sm text-gray-800 placeholder-gray-500 border-2 ${error ? 'border-red-500' : 'border-white/80'
                    } rounded-xl focus:outline-none focus:bg-white/80 focus:border-white disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
}
