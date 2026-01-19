import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AcademicInformationSection } from '../AcademicInformationSection';
import type { PlayerProfileFormData } from '../../../../types';

describe('AcademicInformationSection', () => {
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
        testScores: JSON.stringify({ sat: '1400', act: '32' }),
        graduationYear: '2025',
        classRank: '15',
        honors: ['Honor Roll', 'National Merit Scholar'],
    };

    beforeEach(() => {
        mockSetFormData.mockClear();
    });

    describe('Component Rendering', () => {
        it('renders with correct initial values', () => {
            render(
                <AcademicInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            expect(screen.getByDisplayValue('1400')).toBeInTheDocument();
            expect(screen.getByDisplayValue('32')).toBeInTheDocument();
            expect(screen.getByDisplayValue('2025')).toBeInTheDocument();
            expect(screen.getByDisplayValue('15')).toBeInTheDocument();
        });

        it('renders section heading', () => {
            render(
                <AcademicInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            expect(screen.getByRole('heading', { name: 'Academic Information' })).toBeInTheDocument();
        });

        it('renders all academic fields', () => {
            render(
                <AcademicInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            expect(screen.getByLabelText(/SAT Score/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/ACT Score/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Graduation Year/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/GPA/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Class Rank/i)).toBeInTheDocument();
            expect(screen.getByText(/Honors & Awards/i)).toBeInTheDocument();
        });

        it('renders honors list when provided', () => {
            render(
                <AcademicInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            expect(screen.getByDisplayValue('Honor Roll')).toBeInTheDocument();
            expect(screen.getByDisplayValue('National Merit Scholar')).toBeInTheDocument();
        });

        it('renders with empty test scores when not provided', () => {
            const emptyFormData = {
                ...defaultFormData,
                testScores: undefined,
            };

            render(
                <AcademicInformationSection
                    formData={emptyFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const satInput = screen.getByLabelText(/SAT Score/i) as HTMLInputElement;
            const actInput = screen.getByLabelText(/ACT Score/i) as HTMLInputElement;

            expect(satInput.value).toBe('');
            expect(actInput.value).toBe('');
        });

        it('renders optional placeholder for fields', () => {
            render(
                <AcademicInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            expect(screen.getByLabelText(/SAT Score/i)).toHaveAttribute('placeholder', 'Optional');
            expect(screen.getByLabelText(/ACT Score/i)).toHaveAttribute('placeholder', 'Optional');
            expect(screen.getByLabelText(/Graduation Year/i)).toHaveAttribute('placeholder', 'Optional');
            expect(screen.getByLabelText(/Class Rank/i)).toHaveAttribute('placeholder', 'Optional');
        });
    });

    describe('Field Updates and State Changes', () => {
        it('triggers state change when SAT score is updated', async () => {
            const user = userEvent.setup();
            render(
                <AcademicInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const satInput = screen.getByLabelText(/SAT Score/i);
            await user.clear(satInput);
            await user.type(satInput, '1500');

            expect(mockSetFormData).toHaveBeenCalled();
        });

        it('triggers state change when ACT score is updated', async () => {
            const user = userEvent.setup();
            render(
                <AcademicInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const actInput = screen.getByLabelText(/ACT Score/i);
            await user.clear(actInput);
            await user.type(actInput, '35');

            expect(mockSetFormData).toHaveBeenCalled();
        });

        it('triggers state change when graduation year is updated', async () => {
            const user = userEvent.setup();
            render(
                <AcademicInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const graduationYearInput = screen.getByLabelText(/Graduation Year/i);
            await user.clear(graduationYearInput);
            await user.type(graduationYearInput, '2026');

            expect(mockSetFormData).toHaveBeenCalled();
        });

        it('triggers state change when GPA is updated', async () => {
            const user = userEvent.setup();
            render(
                <AcademicInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const gpaInput = screen.getByLabelText(/GPA/i);
            await user.clear(gpaInput);
            await user.type(gpaInput, '4.0');

            expect(mockSetFormData).toHaveBeenCalled();
        });

        it('triggers state change when class rank is updated', async () => {
            const user = userEvent.setup();
            render(
                <AcademicInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const classRankInput = screen.getByLabelText(/Class Rank/i);
            await user.clear(classRankInput);
            await user.type(classRankInput, '10');

            expect(mockSetFormData).toHaveBeenCalled();
        });
    });

    describe('Honors Management', () => {
        it('allows adding new honor', async () => {
            const user = userEvent.setup();
            render(
                <AcademicInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const addButton = screen.getByRole('button', { name: /Add Honor\/Award/i });
            await user.click(addButton);

            expect(mockSetFormData).toHaveBeenCalled();
        });

        it('allows removing honor', async () => {
            const user = userEvent.setup();
            render(
                <AcademicInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const removeButtons = screen.getAllByRole('button', { name: /Remove/i });
            await user.click(removeButtons[0]);

            expect(mockSetFormData).toHaveBeenCalled();
        });

        it('allows updating honor text', async () => {
            const user = userEvent.setup();
            render(
                <AcademicInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const honorInput = screen.getByDisplayValue('Honor Roll');
            await user.clear(honorInput);
            await user.type(honorInput, 'Dean\'s List');

            expect(mockSetFormData).toHaveBeenCalled();
        });
    });

    describe('Field Attributes', () => {
        it('has correct type for SAT score field', () => {
            render(
                <AcademicInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const satInput = screen.getByLabelText(/SAT Score/i);
            expect(satInput).toHaveAttribute('type', 'number');
        });

        it('has correct type for ACT score field', () => {
            render(
                <AcademicInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const actInput = screen.getByLabelText(/ACT Score/i);
            expect(actInput).toHaveAttribute('type', 'number');
        });

        it('has correct type for graduation year field', () => {
            render(
                <AcademicInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const graduationYearInput = screen.getByLabelText(/Graduation Year/i);
            expect(graduationYearInput).toHaveAttribute('type', 'number');
        });

        it('has correct constraints for GPA field', () => {
            render(
                <AcademicInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const gpaInput = screen.getByLabelText(/GPA/i);
            expect(gpaInput).toHaveAttribute('type', 'number');
            expect(gpaInput).toHaveAttribute('min', '0');
            expect(gpaInput).toHaveAttribute('max', '4');
            expect(gpaInput).toHaveAttribute('step', '0.01');
        });
    });

    describe('Disabled State', () => {
        it('disables all fields when isEditing is false', () => {
            render(
                <AcademicInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={false}
                />
            );

            expect(screen.getByLabelText(/SAT Score/i)).toBeDisabled();
            expect(screen.getByLabelText(/ACT Score/i)).toBeDisabled();
            expect(screen.getByLabelText(/Graduation Year/i)).toBeDisabled();
            expect(screen.getByLabelText(/GPA/i)).toBeDisabled();
            expect(screen.getByLabelText(/Class Rank/i)).toBeDisabled();
        });

        it('enables all fields when isEditing is true', () => {
            render(
                <AcademicInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            expect(screen.getByLabelText(/SAT Score/i)).not.toBeDisabled();
            expect(screen.getByLabelText(/ACT Score/i)).not.toBeDisabled();
            expect(screen.getByLabelText(/Graduation Year/i)).not.toBeDisabled();
            expect(screen.getByLabelText(/GPA/i)).not.toBeDisabled();
            expect(screen.getByLabelText(/Class Rank/i)).not.toBeDisabled();
        });

        it('hides add/remove buttons when isEditing is false', () => {
            render(
                <AcademicInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={false}
                />
            );

            expect(screen.queryByRole('button', { name: /Add Honor\/Award/i })).not.toBeInTheDocument();
            expect(screen.queryByRole('button', { name: /Remove/i })).not.toBeInTheDocument();
        });
    });

    describe('Layout', () => {
        it('uses two-column grid layout for test scores', () => {
            const { container } = render(
                <AcademicInformationSection
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
