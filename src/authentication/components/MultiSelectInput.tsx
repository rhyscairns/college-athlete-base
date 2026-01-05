'use client';

import { ErrorMessage } from './ErrorMessage';
import type { MultiSelectInputProps } from '../types';

export function MultiSelectInput({
    label,
    name,
    values,
    onChange,
    options,
    maxSelections,
    error,
    required = false,
    disabled = false,
}: MultiSelectInputProps) {
    const inputId = `multiselect-${name}`;
    const errorId = `${inputId}-error`;

    const handleToggle = (optionValue: string) => {
        if (disabled) return;

        if (values.includes(optionValue)) {
            // Remove the value
            onChange(values.filter((v) => v !== optionValue));
        } else {
            // Add the value if under max limit
            if (!maxSelections || values.length < maxSelections) {
                onChange([...values, optionValue]);
            }
        }
    };

    const isMaxReached = maxSelections ? values.length >= maxSelections : false;

    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
                {required && <span className="text-red-600 ml-1">*</span>}
                {maxSelections && (
                    <span className="text-gray-500 text-xs ml-2">
                        (Max {maxSelections})
                    </span>
                )}
            </label>
            <div
                role="group"
                aria-labelledby={inputId}
                aria-invalid={!!error}
                aria-describedby={error ? errorId : undefined}
                className={`w-full p-3 bg-white/60 backdrop-blur-sm border-2 rounded-xl transition-all ${error ? 'border-red-500' : 'border-white/80'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <div className="space-y-2">
                    {options.map((option) => {
                        const isSelected = values.includes(option.value);
                        const isDisabled = disabled || (!isSelected && isMaxReached);

                        return (
                            <label
                                key={option.value}
                                className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${isDisabled
                                    ? 'cursor-not-allowed opacity-50'
                                    : 'cursor-pointer hover:bg-white/40'
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    name={name}
                                    value={option.value}
                                    checked={isSelected}
                                    onChange={() => handleToggle(option.value)}
                                    disabled={isDisabled}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                                />
                                <span className="text-sm text-gray-800">{option.label}</span>
                            </label>
                        );
                    })}
                </div>
            </div>
            {error && <ErrorMessage message={error} className="mt-1" id={errorId} />}
        </div>
    );
}
