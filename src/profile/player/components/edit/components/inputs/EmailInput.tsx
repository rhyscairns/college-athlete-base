import type { EmailInputProps } from '../../../../types';

export function EmailInput({
    label = 'Email',
    name = 'email',
    value,
    onChange,
    onBlur,
    error,
    placeholder,
    disabled = false
}: EmailInputProps) {
    return (
        <div className="w-full">
            <label htmlFor={name} className="block text-sm font-medium mb-1" style={{ color: 'var(--text-mid)' }}>
                {label}
                <span className="ml-1" style={{ color: 'var(--status-danger)' }}>*</span>
            </label>
            <input
                id={name}
                name={name}
                type="email"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
                placeholder={placeholder}
                disabled={disabled}
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
