import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SelectInput } from '@/authentication/components/SelectInput';

describe('SelectInput', () => {
    const mockOnChange = jest.fn();
    const options = [
        { value: 'basketball', label: 'Basketball' },
        { value: 'football', label: 'Football' },
        { value: 'soccer', label: 'Soccer' },
    ];

    beforeEach(() => {
        mockOnChange.mockClear();
    });

    it('renders with label and select element', () => {
        render(
            <SelectInput
                label="Sport"
                name="sport"
                value=""
                onChange={mockOnChange}
                options={options}
            />
        );

        expect(screen.getByLabelText('Sport')).toBeInTheDocument();
        expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('displays required indicator when required', () => {
        render(
            <SelectInput
                label="Sport"
                name="sport"
                value=""
                onChange={mockOnChange}
                options={options}
                required
            />
        );

        expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('renders all options', () => {
        render(
            <SelectInput
                label="Sport"
                name="sport"
                value=""
                onChange={mockOnChange}
                options={options}
            />
        );

        expect(screen.getByRole('option', { name: 'Basketball' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Football' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Soccer' })).toBeInTheDocument();
    });

    it('displays placeholder option', () => {
        render(
            <SelectInput
                label="Sport"
                name="sport"
                value=""
                onChange={mockOnChange}
                options={options}
                placeholder="Choose a sport"
            />
        );

        expect(screen.getByRole('option', { name: 'Choose a sport' })).toBeInTheDocument();
    });

    it('calls onChange when user selects an option', async () => {
        const user = userEvent.setup();
        render(
            <SelectInput
                label="Sport"
                name="sport"
                value=""
                onChange={mockOnChange}
                options={options}
            />
        );

        const select = screen.getByRole('combobox');
        await user.selectOptions(select, 'basketball');

        expect(mockOnChange).toHaveBeenCalledWith('basketball');
    });

    it('displays selected value', () => {
        render(
            <SelectInput
                label="Sport"
                name="sport"
                value="football"
                onChange={mockOnChange}
                options={options}
            />
        );

        const select = screen.getByRole('combobox') as HTMLSelectElement;
        expect(select.value).toBe('football');
    });

    it('displays error message when error prop is provided', () => {
        render(
            <SelectInput
                label="Sport"
                name="sport"
                value=""
                onChange={mockOnChange}
                options={options}
                error="This field is required"
            />
        );

        expect(screen.getByRole('alert')).toHaveTextContent('This field is required');
    });

    it('applies error styling when error is present', () => {
        render(
            <SelectInput
                label="Sport"
                name="sport"
                value=""
                onChange={mockOnChange}
                options={options}
                error="This field is required"
            />
        );

        const select = screen.getByRole('combobox');
        expect(select).toHaveClass('border-red-500');
        expect(select).toHaveAttribute('aria-invalid', 'true');
    });

    it('disables select when disabled prop is true', () => {
        render(
            <SelectInput
                label="Sport"
                name="sport"
                value=""
                onChange={mockOnChange}
                options={options}
                disabled
            />
        );

        expect(screen.getByRole('combobox')).toBeDisabled();
    });

    it('has proper accessibility attributes', () => {
        render(
            <SelectInput
                label="Sport"
                name="sport"
                value=""
                onChange={mockOnChange}
                options={options}
                required
                error="This field is required"
            />
        );

        const select = screen.getByRole('combobox');
        expect(select).toHaveAttribute('aria-required', 'true');
        expect(select).toHaveAttribute('aria-invalid', 'true');
        expect(select).toHaveAttribute('aria-describedby', 'select-sport-error');
    });
});
