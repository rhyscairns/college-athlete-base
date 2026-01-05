import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TextInput } from '@/authentication/components/TextInput';

describe('TextInput', () => {
    const mockOnChange = jest.fn();

    beforeEach(() => {
        mockOnChange.mockClear();
    });

    it('renders with label and input', () => {
        render(
            <TextInput
                label="First Name"
                name="firstName"
                value=""
                onChange={mockOnChange}
            />
        );

        expect(screen.getByLabelText('First Name')).toBeInTheDocument();
        expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('displays required indicator when required', () => {
        render(
            <TextInput
                label="First Name"
                name="firstName"
                value=""
                onChange={mockOnChange}
                required
            />
        );

        expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('calls onChange when user types', async () => {
        const user = userEvent.setup();
        render(
            <TextInput
                label="First Name"
                name="firstName"
                value=""
                onChange={mockOnChange}
            />
        );

        const input = screen.getByRole('textbox');
        await user.type(input, 'John');

        expect(mockOnChange).toHaveBeenCalledTimes(4);
        expect(mockOnChange).toHaveBeenNthCalledWith(1, 'J');
        expect(mockOnChange).toHaveBeenNthCalledWith(2, 'o');
        expect(mockOnChange).toHaveBeenNthCalledWith(3, 'h');
        expect(mockOnChange).toHaveBeenNthCalledWith(4, 'n');
    });

    it('displays error message when error prop is provided', () => {
        render(
            <TextInput
                label="First Name"
                name="firstName"
                value=""
                onChange={mockOnChange}
                error="This field is required"
            />
        );

        expect(screen.getByRole('alert')).toHaveTextContent('This field is required');
    });

    it('applies error styling when error is present', () => {
        render(
            <TextInput
                label="First Name"
                name="firstName"
                value=""
                onChange={mockOnChange}
                error="This field is required"
            />
        );

        const input = screen.getByRole('textbox');
        expect(input).toHaveClass('border-red-500');
        expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('renders with placeholder', () => {
        render(
            <TextInput
                label="First Name"
                name="firstName"
                value=""
                onChange={mockOnChange}
                placeholder="Enter your first name"
            />
        );

        expect(screen.getByPlaceholderText('Enter your first name')).toBeInTheDocument();
    });

    it('disables input when disabled prop is true', () => {
        render(
            <TextInput
                label="First Name"
                name="firstName"
                value=""
                onChange={mockOnChange}
                disabled
            />
        );

        expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('renders as email input when type is email', () => {
        render(
            <TextInput
                label="Email"
                name="email"
                type="email"
                value=""
                onChange={mockOnChange}
            />
        );

        const input = screen.getByLabelText('Email');
        expect(input).toHaveAttribute('type', 'email');
    });

    it('renders as number input with min, max, and step', () => {
        render(
            <TextInput
                label="GPA"
                name="gpa"
                type="number"
                value=""
                onChange={mockOnChange}
                min={0}
                max={4}
                step={0.1}
            />
        );

        const input = screen.getByLabelText('GPA');
        expect(input).toHaveAttribute('type', 'number');
        expect(input).toHaveAttribute('min', '0');
        expect(input).toHaveAttribute('max', '4');
        expect(input).toHaveAttribute('step', '0.1');
    });

    it('has proper accessibility attributes', () => {
        render(
            <TextInput
                label="First Name"
                name="firstName"
                value=""
                onChange={mockOnChange}
                required
                error="This field is required"
            />
        );

        const input = screen.getByRole('textbox');
        expect(input).toHaveAttribute('aria-required', 'true');
        expect(input).toHaveAttribute('aria-invalid', 'true');
        expect(input).toHaveAttribute('aria-describedby', 'input-firstName-error');
    });
});
