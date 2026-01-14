interface EmailInputProps {
    label?: string;
    name?: string;
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    error?: string;
    placeholder?: string;
    disabled?: boolean;
}

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
                className={`w-full h-12 px-4 bg-white/60 backdrop-blur-sm text-gray-800 placeholder-gray-500 border-2 ${error ? 'border-red-500' : 'border-white/80'
                    } rounded-xl focus:outline-none focus:bg-white/80 focus:border-white disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
}
