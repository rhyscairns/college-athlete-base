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
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
                {label}
                <span className="text-red-600 ml-1">*</span>
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
                className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all ${error
                    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                    }`}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
}
