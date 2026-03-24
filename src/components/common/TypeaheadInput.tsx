'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { TypeaheadInputProps } from './types/typeahead';

/**
 * TypeaheadInput Component
 * 
 * A reusable autocomplete input with dropdown suggestions.
 * Features:
 * - Filters options based on input (case-insensitive)
 * - Shows dropdown after minChars threshold (default: 3)
 * - Keyboard navigation (Arrow Up/Down, Enter, Escape)
 * - Click outside to close
 * - Full accessibility with ARIA attributes
 */
export const TypeaheadInput: React.FC<TypeaheadInputProps> = ({
    label,
    name,
    value,
    options,
    onChange,
    onSelect,
    error,
    disabled = false,
    placeholder,
    minChars = 3,
    noResultsMessage = 'No results found',
    className = '',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [inputValue, setInputValue] = useState(value);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Filter options based on input value
    const filteredOptions = useMemo(() => {
        if (inputValue.length < minChars) return [];

        const lowerInput = inputValue.toLowerCase();
        return options.filter(option =>
            option.toLowerCase().includes(lowerInput)
        );
    }, [inputValue, options, minChars]);

    // Sync internal state with external value prop
    useEffect(() => {
        setInputValue(value);
    }, [value]);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        onChange(newValue);

        // Open dropdown if meets minChars threshold
        if (newValue.length >= minChars) {
            setIsOpen(true);
            setHighlightedIndex(-1);
        } else {
            setIsOpen(false);
        }
    };

    const handleSelect = (option: string) => {
        setInputValue(option);
        onChange(option);
        if (onSelect) {
            onSelect(option);
        }
        setIsOpen(false);
        setHighlightedIndex(-1);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen && e.key !== 'Escape') {
            // Open dropdown if meets threshold
            if (inputValue.length >= minChars && filteredOptions.length > 0) {
                setIsOpen(true);
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev < filteredOptions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
                    handleSelect(filteredOptions[highlightedIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setIsOpen(false);
                setHighlightedIndex(-1);
                break;
        }
    };

    const handleFocus = () => {
        if (inputValue.length >= minChars && filteredOptions.length > 0) {
            setIsOpen(true);
        }
    };

    const handleBlur = () => {
        // Delay to allow click on option to register
        setTimeout(() => {
            setIsOpen(false);
        }, 200);
    };

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <label
                htmlFor={name}
                className="block text-sm font-medium text-gray-700 mb-1"
            >
                {label}
            </label>
            <input
                ref={inputRef}
                id={name}
                name={name}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={handleFocus}
                onBlur={handleBlur}
                disabled={disabled}
                placeholder={placeholder}
                aria-autocomplete="list"
                aria-controls={`${name}-listbox`}
                aria-expanded={isOpen}
                aria-activedescendant={
                    highlightedIndex >= 0 ? `${name}-option-${highlightedIndex}` : undefined
                }
                aria-describedby={error ? `${name}-error` : undefined}
                role="combobox"
                className={`
                    w-full px-3 py-2 border rounded-md shadow-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500
                    ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
                    text-[16px] sm:text-base md:text-sm
                    transition-colors duration-150
                `}
            />

            {isOpen && (
                <ul
                    id={`${name}-listbox`}
                    role="listbox"
                    aria-label={`${label} suggestions`}
                    className="
                        absolute z-50 w-full mt-1 bg-white border border-gray-300 
                        rounded-md shadow-lg overflow-auto
                        max-h-[200px] sm:max-h-[250px] lg:max-h-[300px]
                        animate-fade-in
                    "
                >
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option, index) => (
                            <li
                                key={option}
                                id={`${name}-option-${index}`}
                                role="option"
                                aria-selected={index === highlightedIndex}
                                onClick={() => handleSelect(option)}
                                onMouseEnter={() => setHighlightedIndex(index)}
                                className={`
                                    px-4 py-3 cursor-pointer transition-colors duration-150
                                    min-h-[48px] sm:min-h-[44px] md:min-h-[40px] 
                                    flex items-center text-[16px] sm:text-base md:text-sm
                                    ${index === highlightedIndex
                                        ? 'bg-blue-100 text-blue-900 font-medium'
                                        : 'text-gray-900 hover:bg-gray-50 active:bg-gray-100'
                                    }
                                    ${index === 0 ? 'rounded-t-md' : ''}
                                    ${index === filteredOptions.length - 1 ? 'rounded-b-md' : ''}
                                `}
                            >
                                {option}
                            </li>
                        ))
                    ) : (
                        <li
                            className="
                                px-4 py-3 text-gray-500 
                                min-h-[48px] sm:min-h-[44px] md:min-h-[40px] 
                                flex items-center text-[16px] sm:text-base md:text-sm
                            "
                            role="option"
                            aria-disabled="true"
                        >
                            {noResultsMessage}
                        </li>
                    )}
                </ul>
            )}

            {error && (
                <p
                    id={`${name}-error`}
                    className="mt-1 text-sm text-red-600"
                    role="alert"
                >
                    {error}
                </p>
            )}
        </div>
    );
};

export default TypeaheadInput;
