import type { TextInputProps } from '../../../../types';

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
            <label htmlFor={inputId} className="block text-sm font-medium mb-1" style={{ color: 'var(--text-mid)' }}>
                {label}
                {required && <span className="ml-1" style={{ color: 'var(--status-danger)' }}>*</span>}
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
                className="w-full px-4 py-3 rounded-lg focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                style={{
                    background: 'var(--ink-1)',
                    border: `1px solid ${error ? 'var(--status-danger)' : 'var(--ink-3)'}`,
                    color: 'var(--text-hi)',
                }}
            />
            {error && <p className="mt-1 text-sm" style={{ color: 'var(--status-danger)' }}>{error}</p>}
        </div>
    );
}
