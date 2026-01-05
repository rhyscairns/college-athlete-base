import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MultiSelectInput } from '@/authentication/components/MultiSelectInput';

describe('MultiSelectInput', () => {
    const mockOnChange = jest.fn();
    const options = [
        { value: 'basketball', label: 'Basketball' },
        { value: 'football', label: 'Football' },
        { value: 'soccer', label: 'Soccer' },
        { value: 'baseball', label: 'Baseball' },
    ];

    beforeEach(() => {
        mockOnChange.mockClear();
    });

    it('renders with label and checkboxes', () => {
        render(
            <MultiSelectInput
                label="Sports"
                name="sports"
                values={[]}
                onChange={mockOnChange}
                options={options}
            />
        );

        expect(screen.getByText('Sports')).toBeInTheDocument();
        expect(screen.getAllByRole('checkbox')).toHaveLength(4);
    });

    it('displays required indicator when required', () => {
        render(
            <MultiSelectInput
                label="Sports"
                name="sports"
                values={[]}
                onChange={mockOnChange}
                options={options}
                required
            />
        );

        expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('displays max selections indicator', () => {
        render(
            <MultiSelectInput
                label="Sports"
                name="sports"
                values={[]}
                onChange={mockOnChange}
                options={options}
                maxSelections={2}
            />
        );

        expect(screen.getByText('(Max 2)')).toBeInTheDocument();
    });

    it('renders all options as checkboxes', () => {
        render(
            <MultiSelectInput
                label="Sports"
                name="sports"
                values={[]}
                onChange={mockOnChange}
                options={options}
            />
        );

        expect(screen.getByLabelText('Basketball')).toBeInTheDocument();
        expect(screen.getByLabelText('Football')).toBeInTheDocument();
        expect(screen.getByLabelText('Soccer')).toBeInTheDocument();
        expect(screen.getByLabelText('Baseball')).toBeInTheDocument();
    });

    it('checks selected values', () => {
        render(
            <MultiSelectInput
                label="Sports"
                name="sports"
                values={['basketball', 'soccer']}
                onChange={mockOnChange}
                options={options}
            />
        );

        expect(screen.getByLabelText('Basketball')).toBeChecked();
        expect(screen.getByLabelText('Soccer')).toBeChecked();
        expect(screen.getByLabelText('Football')).not.toBeChecked();
    });

    it('calls onChange with added value when checkbox is checked', async () => {
        const user = userEvent.setup();
        render(
            <MultiSelectInput
                label="Sports"
                name="sports"
                values={[]}
                onChange={mockOnChange}
                options={options}
            />
        );

        const checkbox = screen.getByLabelText('Basketball');
        await user.click(checkbox);

        expect(mockOnChange).toHaveBeenCalledWith(['basketball']);
    });

    it('calls onChange with removed value when checkbox is unchecked', async () => {
        const user = userEvent.setup();
        render(
            <MultiSelectInput
                label="Sports"
                name="sports"
                values={['basketball', 'soccer']}
                onChange={mockOnChange}
                options={options}
            />
        );

        const checkbox = screen.getByLabelText('Basketball');
        await user.click(checkbox);

        expect(mockOnChange).toHaveBeenCalledWith(['soccer']);
    });

    it('enforces max selections limit', async () => {
        const user = userEvent.setup();
        render(
            <MultiSelectInput
                label="Sports"
                name="sports"
                values={['basketball', 'soccer']}
                onChange={mockOnChange}
                options={options}
                maxSelections={2}
            />
        );

        const footballCheckbox = screen.getByLabelText('Football');
        expect(footballCheckbox).toBeDisabled();

        await user.click(footballCheckbox);
        expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('allows selection after unchecking when at max limit', async () => {
        const user = userEvent.setup();
        const { rerender } = render(
            <MultiSelectInput
                label="Sports"
                name="sports"
                values={['basketball', 'soccer']}
                onChange={mockOnChange}
                options={options}
                maxSelections={2}
            />
        );

        // Uncheck one
        const basketballCheckbox = screen.getByLabelText('Basketball');
        await user.click(basketballCheckbox);
        expect(mockOnChange).toHaveBeenCalledWith(['soccer']);

        // Rerender with updated values
        rerender(
            <MultiSelectInput
                label="Sports"
                name="sports"
                values={['soccer']}
                onChange={mockOnChange}
                options={options}
                maxSelections={2}
            />
        );

        // Now football should be enabled
        const footballCheckbox = screen.getByLabelText('Football');
        expect(footballCheckbox).not.toBeDisabled();
    });

    it('displays error message when error prop is provided', () => {
        render(
            <MultiSelectInput
                label="Sports"
                name="sports"
                values={[]}
                onChange={mockOnChange}
                options={options}
                error="Please select at least one sport"
            />
        );

        expect(screen.getByRole('alert')).toHaveTextContent('Please select at least one sport');
    });

    it('applies error styling when error is present', () => {
        render(
            <MultiSelectInput
                label="Sports"
                name="sports"
                values={[]}
                onChange={mockOnChange}
                options={options}
                error="Please select at least one sport"
            />
        );

        const group = screen.getByRole('group');
        expect(group).toHaveClass('border-red-500');
        expect(group).toHaveAttribute('aria-invalid', 'true');
    });

    it('disables all checkboxes when disabled prop is true', () => {
        render(
            <MultiSelectInput
                label="Sports"
                name="sports"
                values={[]}
                onChange={mockOnChange}
                options={options}
                disabled
            />
        );

        const checkboxes = screen.getAllByRole('checkbox');
        checkboxes.forEach((checkbox) => {
            expect(checkbox).toBeDisabled();
        });
    });

    it('has proper accessibility attributes', () => {
        render(
            <MultiSelectInput
                label="Sports"
                name="sports"
                values={[]}
                onChange={mockOnChange}
                options={options}
                error="Please select at least one sport"
            />
        );

        const group = screen.getByRole('group');
        expect(group).toHaveAttribute('aria-invalid', 'true');
        expect(group).toHaveAttribute('aria-describedby', 'multiselect-sports-error');
    });
});
