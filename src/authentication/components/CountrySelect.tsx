'use client';

import { useState, useRef, useEffect, useId } from 'react';
import { COUNTRIES_LIST } from '../constants';

interface CountrySelectProps {
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    label?: string;
    name?: string;
    /** Extra option prepended before the country list (e.g. "All International" in search) */
    extraOptions?: { value: string; label: string }[];
}

/**
 * Searchable country selector.
 * Renders a text input that filters the full country list as the user types.
 * Keyboard-navigable and accessible.
 */
export function CountrySelect({
    value,
    onChange,
    onBlur,
    error,
    required,
    disabled,
    label = 'Country',
    name = 'country',
    extraOptions = [],
}: CountrySelectProps) {
    const id = useId();
    const listboxId = `${id}-listbox`;

    const allOptions = [...extraOptions, ...COUNTRIES_LIST];
    const selectedLabel = allOptions.find(c => c.value === value)?.label ?? '';

    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const filtered = query.trim()
        ? allOptions.filter(c => c.label.toLowerCase().includes(query.toLowerCase()))
        : allOptions;

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
                setQuery('');
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Scroll active item into view
    useEffect(() => {
        if (activeIndex >= 0 && listRef.current) {
            const item = listRef.current.children[activeIndex] as HTMLElement;
            item?.scrollIntoView({ block: 'nearest' });
        }
    }, [activeIndex]);

    const select = (val: string) => {
        onChange(val);
        setQuery('');
        setOpen(false);
        setActiveIndex(-1);
        inputRef.current?.blur();
        onBlur?.();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        setOpen(true);
        setActiveIndex(-1);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
            setOpen(true);
            return;
        }
        if (e.key === 'Escape') {
            setOpen(false);
            setQuery('');
            return;
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(i => Math.min(i + 1, filtered.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(i => Math.max(i - 1, 0));
        } else if (e.key === 'Enter' && activeIndex >= 0) {
            e.preventDefault();
            select(filtered[activeIndex].value);
        }
    };

    const displayValue = open ? query : selectedLabel;

    const inputStyle: React.CSSProperties = {
        background: 'var(--ink-2, #fff)',
        border: `1px solid ${error ? 'var(--status-danger, #ef4444)' : 'var(--ink-3, #d1d5db)'}`,
        color: 'var(--text-hi, #111)',
    };

    return (
        <div ref={containerRef} className="relative w-full">
            {label && (
                <label
                    htmlFor={id}
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: 'var(--text-mid, #374151)' }}
                >
                    {label}
                    {required && <span className="ml-0.5" style={{ color: 'var(--status-danger, #ef4444)' }} aria-hidden="true">*</span>}
                </label>
            )}

            <div className="relative">
                <input
                    ref={inputRef}
                    id={id}
                    name={name}
                    type="text"
                    role="combobox"
                    aria-expanded={open}
                    aria-controls={listboxId}
                    aria-autocomplete="list"
                    aria-activedescendant={activeIndex >= 0 ? `${id}-opt-${activeIndex}` : undefined}
                    aria-required={required}
                    aria-invalid={Boolean(error)}
                    autoComplete="off"
                    disabled={disabled}
                    value={displayValue}
                    placeholder="Search country…"
                    onChange={handleInputChange}
                    onFocus={() => { setOpen(true); setQuery(''); }}
                    onBlur={() => {
                        // Small delay so click on option registers first
                        setTimeout(() => {
                            if (!containerRef.current?.contains(document.activeElement)) {
                                setOpen(false);
                                setQuery('');
                                onBlur?.();
                            }
                        }, 150);
                    }}
                    onKeyDown={handleKeyDown}
                    className="w-full px-3 py-2 pr-8 rounded-lg text-sm focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={inputStyle}
                />
                {/* Chevron */}
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text-lo, #9ca3af)' }}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </span>
            </div>

            {/* Dropdown */}
            {open && filtered.length > 0 && (
                <ul
                    ref={listRef}
                    id={listboxId}
                    role="listbox"
                    aria-label={label}
                    className="absolute z-50 w-full mt-1 rounded-lg overflow-y-auto shadow-lg"
                    style={{
                        maxHeight: '14rem',
                        background: 'var(--ink-1, #fff)',
                        border: '1px solid var(--ink-3, #d1d5db)',
                    }}
                >
                    {filtered.map((option, i) => (
                        <li
                            key={option.value}
                            id={`${id}-opt-${i}`}
                            role="option"
                            aria-selected={option.value === value}
                            onMouseDown={(e) => { e.preventDefault(); select(option.value); }}
                            onMouseEnter={() => setActiveIndex(i)}
                            className="px-3 py-2 text-sm cursor-pointer"
                            style={{
                                background: i === activeIndex
                                    ? 'var(--ink-3, #e5e7eb)'
                                    : option.value === value
                                        ? 'var(--ink-2, #f3f4f6)'
                                        : 'transparent',
                                color: option.value === value
                                    ? 'var(--brand-500, #16a34a)'
                                    : 'var(--text-hi, #111)',
                                fontWeight: option.value === value ? 600 : 400,
                            }}
                        >
                            {option.label}
                        </li>
                    ))}
                </ul>
            )}

            {open && filtered.length === 0 && (
                <div
                    className="absolute z-50 w-full mt-1 px-3 py-2 text-sm rounded-lg"
                    style={{
                        background: 'var(--ink-1, #fff)',
                        border: '1px solid var(--ink-3, #d1d5db)',
                        color: 'var(--text-lo, #9ca3af)',
                    }}
                >
                    No countries found
                </div>
            )}

            {error && (
                <p className="mt-1 text-xs" style={{ color: 'var(--status-danger, #ef4444)' }} role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}
