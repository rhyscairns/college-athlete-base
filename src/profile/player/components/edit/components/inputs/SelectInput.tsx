import type { SelectInputProps } from '../../../../types';

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
            <label htmlFor={inputId} className="block text-sm font-medium mb-1" style={{ color: 'var(--text-mid)' }}>
                {label}
                {required && <span className="ml-1" style={{ color: 'var(--status-danger)' }}>*</span>}
            </label>
            <select
                id={inputId}
                name={name}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
                disabled={disabled}
                required={required}
                className="w-full h-12 px-4 rounded-xl focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all appearance-none"
                style={{
                    background: 'var(--ink-1)',
                    border: `1px solid ${error ? 'var(--status-danger)' : 'var(--ink-3)'}`,
                    color: 'var(--text-hi)',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23888'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
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
            {error && <p className="mt-1 text-sm" style={{ color: 'var(--status-danger)' }}>{error}</p>}
        </div>
    );
}
