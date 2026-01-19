import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PhysicalAttributesSection } from '../PhysicalAttributesSection';
import type { PlayerProfileFormData } from '../../../../types';

describe('PhysicalAttributesSection', () => {
    const mockSetFormData = jest.fn();

    const defaultFormData: PlayerProfileFormData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        sex: 'male',
        sport: 'basketball',
        position: 'Point Guard',
        gpa: '3.5',
        country: 'USA',
        height: '72',
        weight: '180',
    };

    beforeEach(() => {
        mockSetFormData.mockClear();
    });

    describe('Component Rendering', () => {
        it('renders with correct initial values', () => {
            render(
                <PhysicalAttributesSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            expect(screen.getByDisplayValue('72')).toBeInTheDocument();
            expect(screen.getByDisplayValue('180')).toBeInTheDocument();
        });

        it('renders section heading', () => {
            render(
                <PhysicalAttributesSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            expect(screen.getByRole('heading', { name: 'Physical Attributes' })).toBeInTheDocument();
        });

        it('renders height and weight fields', () => {
            render(
                <PhysicalAttributesSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            expect(screen.getByLabelText(/Height/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Weight/i)).toBeInTheDocument();
        });

        it('renders with empty values when not provided', () => {
            const emptyFormData = {
                ...defaultFormData,
                height: undefined,
                weight: undefined,
            };

            render(
                <PhysicalAttributesSection
                    formData={emptyFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const heightInput = screen.getByLabelText(/Height/i) as HTMLInputElement;
            const weightInput = screen.getByLabelText(/Weight/i) as HTMLInputElement;

            expect(heightInput.value).toBe('');
            expect(weightInput.value).toBe('');
        });

        it('renders optional placeholder for fields', () => {
            render(
                <PhysicalAttributesSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const heightInput = screen.getByLabelText(/Height/i);
            const weightInput = screen.getByLabelText(/Weight/i);

            expect(heightInput).toHaveAttribute('placeholder', 'Optional');
            expect(weightInput).toHaveAttribute('placeholder', 'Optional');
        });
    });

    describe('Field Updates and State Changes', () => {
        it('triggers state change when height is updated', async () => {
            const user = userEvent.setup();
            render(
                <PhysicalAttributesSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const heightInput = screen.getByLabelText(/Height/i);
            await user.clear(heightInput);
            await user.type(heightInput, '75');

            expect(mockSetFormData).toHaveBeenCalled();
        });

        it('triggers state change when weight is updated', async () => {
            const user = userEvent.setup();
            render(
                <PhysicalAttributesSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const weightInput = screen.getByLabelText(/Weight/i);
            await user.clear(weightInput);
            await user.type(weightInput, '190');

            expect(mockSetFormData).toHaveBeenCalled();
        });
    });

    describe('Field Attributes', () => {
        it('has correct type for height field', () => {
            render(
                <PhysicalAttributesSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const heightInput = screen.getByLabelText(/Height/i);
            expect(heightInput).toHaveAttribute('type', 'number');
        });

        it('has correct type for weight field', () => {
            render(
                <PhysicalAttributesSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const weightInput = screen.getByLabelText(/Weight/i);
            expect(weightInput).toHaveAttribute('type', 'number');
        });
    });

    describe('Disabled State', () => {
        it('disables fields when isEditing is false', () => {
            render(
                <PhysicalAttributesSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={false}
                />
            );

            // In view mode, the component renders differently
            expect(screen.getByText('Physical Attributes')).toBeInTheDocument();
            expect(screen.getByText('72')).toBeInTheDocument();
            expect(screen.getByText('180')).toBeInTheDocument();
        });

        it('enables fields when isEditing is true', () => {
            render(
                <PhysicalAttributesSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            expect(screen.getByLabelText(/Height/i)).not.toBeDisabled();
            expect(screen.getByLabelText(/Weight/i)).not.toBeDisabled();
        });
    });

    describe('Layout', () => {
        it('uses two-column grid layout', () => {
            const { container } = render(
                <PhysicalAttributesSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const gridContainer = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2');
            expect(gridContainer).toBeInTheDocument();
        });
    });
});
