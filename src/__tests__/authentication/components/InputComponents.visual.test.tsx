import { render, screen } from '@testing-library/react';
import { TextInput } from '@/authentication/components/TextInput';
import { EmailInput } from '@/authentication/components/EmailInput';

describe('Input Components - Light Theme Visual Tests', () => {
    const mockOnChange = jest.fn();

    beforeEach(() => {
        mockOnChange.mockClear();
    });

    describe('TextInput Light Theme Styling', () => {
        it('applies light theme background and text colors', () => {
            render(
                <TextInput
                    label="Test Input"
                    name="test"
                    value=""
                    onChange={mockOnChange}
                />
            );

            const input = screen.getByRole('textbox');
            expect(input).toHaveClass('bg-white');
            expect(input).toHaveClass('text-gray-900');
            expect(input).toHaveClass('placeholder-gray-400');
        });

        it('applies proper border styling in default state', () => {
            render(
                <TextInput
                    label="Test Input"
                    name="test"
                    value=""
                    onChange={mockOnChange}
                />
            );

            const input = screen.getByRole('textbox');
            expect(input).toHaveClass('border-gray-300');
            expect(input).toHaveClass('border');
        });

        it('applies blue focus ring classes', () => {
            render(
                <TextInput
                    label="Test Input"
                    name="test"
                    value=""
                    onChange={mockOnChange}
                />
            );

            const input = screen.getByRole('textbox');
            expect(input).toHaveClass('focus:border-blue-500');
            expect(input).toHaveClass('focus:ring-2');
            expect(input).toHaveClass('focus:ring-blue-500/20');
        });

        it('applies red error styling when error is present', () => {
            render(
                <TextInput
                    label="Test Input"
                    name="test"
                    value=""
                    onChange={mockOnChange}
                    error="Error message"
                />
            );

            const input = screen.getByRole('textbox');
            expect(input).toHaveClass('border-red-500');
            expect(input).toHaveClass('focus:border-red-500');
            expect(input).toHaveClass('focus:ring-red-500/20');
        });

        it('applies disabled styling', () => {
            render(
                <TextInput
                    label="Test Input"
                    name="test"
                    value=""
                    onChange={mockOnChange}
                    disabled
                />
            );

            const input = screen.getByRole('textbox');
            expect(input).toHaveClass('disabled:opacity-50');
            expect(input).toHaveClass('disabled:cursor-not-allowed');
        });

        it('applies proper padding and rounded corners', () => {
            render(
                <TextInput
                    label="Test Input"
                    name="test"
                    value=""
                    onChange={mockOnChange}
                />
            );

            const input = screen.getByRole('textbox');
            expect(input).toHaveClass('px-4');
            expect(input).toHaveClass('py-3');
            expect(input).toHaveClass('rounded-lg');
        });

        it('applies transition classes', () => {
            render(
                <TextInput
                    label="Test Input"
                    name="test"
                    value=""
                    onChange={mockOnChange}
                />
            );

            const input = screen.getByRole('textbox');
            expect(input).toHaveClass('transition-all');
        });
    });

    describe('EmailInput Light Theme Styling', () => {
        it('applies light theme background and text colors', () => {
            render(<EmailInput value="" onChange={mockOnChange} />);

            const input = screen.getByLabelText(/email/i);
            expect(input).toHaveClass('bg-white');
            expect(input).toHaveClass('text-gray-900');
            expect(input).toHaveClass('placeholder-gray-400');
        });

        it('applies proper border styling in default state', () => {
            render(<EmailInput value="" onChange={mockOnChange} />);

            const input = screen.getByLabelText(/email/i);
            expect(input).toHaveClass('border-gray-300');
            expect(input).toHaveClass('border');
        });

        it('applies blue focus ring classes', () => {
            render(<EmailInput value="" onChange={mockOnChange} />);

            const input = screen.getByLabelText(/email/i);
            expect(input).toHaveClass('focus:border-blue-500');
            expect(input).toHaveClass('focus:ring-2');
            expect(input).toHaveClass('focus:ring-blue-500/20');
        });

        it('applies red error styling when error is present', () => {
            render(<EmailInput value="" onChange={mockOnChange} error="Invalid email" />);

            const input = screen.getByLabelText(/email/i);
            expect(input).toHaveClass('border-red-500');
            expect(input).toHaveClass('focus:border-red-500');
            expect(input).toHaveClass('focus:ring-red-500/20');
        });

        it('applies disabled styling', () => {
            render(<EmailInput value="" onChange={mockOnChange} disabled />);

            const input = screen.getByLabelText(/email/i);
            expect(input).toHaveClass('disabled:opacity-50');
            expect(input).toHaveClass('disabled:cursor-not-allowed');
        });

        it('applies proper padding and rounded corners', () => {
            render(<EmailInput value="" onChange={mockOnChange} />);

            const input = screen.getByLabelText(/email/i);
            expect(input).toHaveClass('px-4');
            expect(input).toHaveClass('py-3');
            expect(input).toHaveClass('rounded-lg');
        });

        it('applies transition classes', () => {
            render(<EmailInput value="" onChange={mockOnChange} />);

            const input = screen.getByLabelText(/email/i);
            expect(input).toHaveClass('transition-all');
        });
    });

    describe('Label Styling', () => {
        it('applies dark gray text to labels', () => {
            render(
                <TextInput
                    label="Test Label"
                    name="test"
                    value=""
                    onChange={mockOnChange}
                />
            );

            const label = screen.getByText('Test Label');
            expect(label).toHaveClass('text-gray-700');
        });

        it('applies proper label font styling', () => {
            render(
                <TextInput
                    label="Test Label"
                    name="test"
                    value=""
                    onChange={mockOnChange}
                />
            );

            const label = screen.getByText('Test Label');
            expect(label).toHaveClass('text-sm');
            expect(label).toHaveClass('font-medium');
        });
    });
});
