import type { SelectInputProps } from '../../types';

export function SelectInput({
    label,
    name,
    value,
    onChange,
    onBlur,
    error,
    options,
    required = false,
    placeholder = 'Select an option',
    disabled = false,
}: SelectInputProps) {
    const inputId = `select-${name}`;

    return (
        <div className="w-full">
            <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
                {label}
                {required && <span className="text-red-600 ml-1">*</span>}
            </label>
            <select
                id={inputId}
                name={name}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
                disabled={disabled}
                required={required}
                className={`w-full h-12 px-4 bg-white/60 backdrop-blur-sm text-gray-800 border-2 ${error ? 'border-red-500' : 'border-white/80'
                    } rounded-xl focus:outline-none focus:bg-white/80 focus:border-white disabled:opacity-50 disabled:cursor-not-allowed transition-all appearance-none`}
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    backgroundSize: '1.25rem',
                    paddingRight: '2.5rem',
                }}
            >
                <option value="" disabled>
                    {placeholder}
                </option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
}
