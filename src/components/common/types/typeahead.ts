/**
 * Props for the TypeaheadInput component
 * Provides autocomplete functionality with dropdown suggestions
 */
export interface TypeaheadInputProps {
    /** Label text displayed above the input */
    label: string;

    /** Name attribute for the input field */
    name: string;

    /** Current value of the input */
    value: string;

    /** Array of options to filter and display in dropdown */
    options: string[];

    /** Callback fired when input value changes */
    onChange: (value: string) => void;

    /** Optional callback fired when an option is selected from dropdown */
    onSelect?: (value: string) => void;

    /** Error message to display below input */
    error?: string;

    /** Whether the input is disabled */
    disabled?: boolean;

    /** Placeholder text for the input */
    placeholder?: string;

    /** Minimum number of characters required before showing dropdown (default: 3) */
    minChars?: number;

    /** Message to display when no results match the input */
    noResultsMessage?: string;

    /** Additional CSS class names for the container */
    className?: string;
}
