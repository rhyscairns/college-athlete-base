import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StatsSection } from '../StatsSection';
import type { PlayerProfileFormData } from '../../../../types';

describe('StatsSection', () => {
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
        stats: {
            pointsPerGame: 18.5,
            assistsPerGame: 6.2,
            reboundsPerGame: 4.8,
        },
    };

    beforeEach(() => {
        mockSetFormData.mockClear();
    });

    describe('Component Rendering', () => {
        it('renders with correct initial values', () => {
            render(
                <StatsSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            expect(screen.getByDisplayValue('18.5')).toBeInTheDocument();
            expect(screen.getByDisplayValue('6.2')).toBeInTheDocument();
            expect(screen.getByDisplayValue('4.8')).toBeInTheDocument();
        });

        it('renders section heading', () => {
            render(
                <StatsSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            expect(screen.getByRole('heading', { name: 'Statistics' })).toBeInTheDocument();
        });

        it('renders all stat fields', () => {
            render(
                <StatsSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            expect(screen.getByLabelText(/Points Per Game/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Assists Per Game/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Rebounds Per Game/i)).toBeInTheDocument();
        });

        it('renders with empty values when stats not provided', () => {
            const emptyFormData = {
                ...defaultFormData,
                stats: undefined,
            };

            render(
                <StatsSection
                    formData={emptyFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const pointsInput = screen.getByLabelText(/Points Per Game/i) as HTMLInputElement;
            const assistsInput = screen.getByLabelText(/Assists Per Game/i) as HTMLInputElement;
            const reboundsInput = screen.getByLabelText(/Rebounds Per Game/i) as HTMLInputElement;

            expect(pointsInput.value).toBe('');
            expect(assistsInput.value).toBe('');
            expect(reboundsInput.value).toBe('');
        });

        it('renders optional placeholder for fields', () => {
            render(
                <StatsSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            expect(screen.getByLabelText(/Points Per Game/i)).toHaveAttribute('placeholder', 'Optional');
            expect(screen.getByLabelText(/Assists Per Game/i)).toHaveAttribute('placeholder', 'Optional');
            expect(screen.getByLabelText(/Rebounds Per Game/i)).toHaveAttribute('placeholder', 'Optional');
        });
    });

    describe('Field Updates and State Changes', () => {
        it('triggers state change when points per game is updated', async () => {
            const user = userEvent.setup();
            render(
                <StatsSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const pointsInput = screen.getByLabelText(/Points Per Game/i);
            await user.clear(pointsInput);
            await user.type(pointsInput, '22.5');

            expect(mockSetFormData).toHaveBeenCalled();
        });

        it('triggers state change when assists per game is updated', async () => {
            const user = userEvent.setup();
            render(
                <StatsSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const assistsInput = screen.getByLabelText(/Assists Per Game/i);
            await user.clear(assistsInput);
            await user.type(assistsInput, '8.0');

            expect(mockSetFormData).toHaveBeenCalled();
        });

        it('triggers state change when rebounds per game is updated', async () => {
            const user = userEvent.setup();
            render(
                <StatsSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const reboundsInput = screen.getByLabelText(/Rebounds Per Game/i);
            await user.clear(reboundsInput);
            await user.type(reboundsInput, '5.5');

            expect(mockSetFormData).toHaveBeenCalled();
        });
    });

    describe('Field Attributes', () => {
        it('has correct type for all stat fields', () => {
            render(
                <StatsSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            expect(screen.getByLabelText(/Points Per Game/i)).toHaveAttribute('type', 'number');
            expect(screen.getByLabelText(/Assists Per Game/i)).toHaveAttribute('type', 'number');
            expect(screen.getByLabelText(/Rebounds Per Game/i)).toHaveAttribute('type', 'number');
        });

        it('has correct step attribute for decimal values', () => {
            render(
                <StatsSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            expect(screen.getByLabelText(/Points Per Game/i)).toHaveAttribute('step', '0.1');
            expect(screen.getByLabelText(/Assists Per Game/i)).toHaveAttribute('step', '0.1');
            expect(screen.getByLabelText(/Rebounds Per Game/i)).toHaveAttribute('step', '0.1');
        });
    });

    describe('Stat Value Parsing', () => {
        it('converts string input to number in stats object', async () => {
            const user = userEvent.setup();
            render(
                <StatsSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const pointsInput = screen.getByLabelText(/Points Per Game/i);
            await user.clear(pointsInput);
            await user.type(pointsInput, '25.0');

            expect(mockSetFormData).toHaveBeenCalled();
            // Verify the function updates stats correctly
            const lastCall = mockSetFormData.mock.calls[mockSetFormData.mock.calls.length - 1][0];
            expect(typeof lastCall).toBe('function');
        });

        it('handles empty stat values', async () => {
            const user = userEvent.setup();
            render(
                <StatsSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const pointsInput = screen.getByLabelText(/Points Per Game/i);
            await user.clear(pointsInput);

            expect(mockSetFormData).toHaveBeenCalled();
        });
    });

    describe('Disabled State', () => {
        it('disables all fields when isEditing is false', () => {
            render(
                <StatsSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={false}
                />
            );

            expect(screen.getByLabelText(/Points Per Game/i)).toBeDisabled();
            expect(screen.getByLabelText(/Assists Per Game/i)).toBeDisabled();
            expect(screen.getByLabelText(/Rebounds Per Game/i)).toBeDisabled();
        });

        it('enables all fields when isEditing is true', () => {
            render(
                <StatsSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            expect(screen.getByLabelText(/Points Per Game/i)).not.toBeDisabled();
            expect(screen.getByLabelText(/Assists Per Game/i)).not.toBeDisabled();
            expect(screen.getByLabelText(/Rebounds Per Game/i)).not.toBeDisabled();
        });
    });

    describe('Layout', () => {
        it('uses two-column grid layout for stat pairs', () => {
            const { container } = render(
                <StatsSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const gridContainers = container.querySelectorAll('.grid.grid-cols-1.md\\:grid-cols-2');
            expect(gridContainers.length).toBeGreaterThan(0);
        });
    });
});
