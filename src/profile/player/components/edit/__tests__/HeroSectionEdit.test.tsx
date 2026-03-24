import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HeroSectionEdit } from '../components/sections/HeroSectionEdit';
import type { Hero, ValidationErrors } from '../../../types';
import * as sportsConstants from '@/constants/sports';

describe('HeroSectionEdit', () => {
    const mockFormData: Hero = {
        firstName: 'Marcus',
        lastName: 'Johnson',
        initials: 'MJ',
        position: 'Wide Receiver',
        school: 'Westlake High School',
        location: 'Austin, TX',
        classYear: '2025',
        height: '6\'2"',
        weight: '185 lbs',
    };

    const mockSetFormData = jest.fn();
    const mockOnSave = jest.fn();
    const mockOnCancel = jest.fn();
    const mockErrors: ValidationErrors = {};

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders all form fields with correct values', () => {
        render(
            <HeroSectionEdit
                formData={mockFormData}
                setFormData={mockSetFormData}
                errors={mockErrors}
                isSaving={false}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        );

        expect(screen.getByLabelText(/first name/i)).toHaveValue('Marcus');
        expect(screen.getByLabelText(/last name/i)).toHaveValue('Johnson');
        expect(screen.getByLabelText(/position/i)).toHaveValue('Wide Receiver');
        expect(screen.getByLabelText(/school/i)).toHaveValue('Westlake High School');
        expect(screen.getByLabelText(/location/i)).toHaveValue('Austin, TX');
        expect(screen.getByLabelText(/class year/i)).toHaveValue('2025');
        expect(screen.getByLabelText(/height/i)).toHaveValue('6\'2"');
        expect(screen.getByLabelText(/weight/i)).toHaveValue('185 lbs');
    });

    it('calls setFormData when input values change', () => {
        render(
            <HeroSectionEdit
                formData={mockFormData}
                setFormData={mockSetFormData}
                errors={mockErrors}
                isSaving={false}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        );

        const firstNameInput = screen.getByLabelText(/first name/i);
        fireEvent.change(firstNameInput, { target: { value: 'John' } });

        expect(mockSetFormData).toHaveBeenCalled();
    });

    it('displays validation errors when present', () => {
        const errorsWithMessages: ValidationErrors = {
            firstName: 'First name is required',
            position: 'Position is required',
        };

        render(
            <HeroSectionEdit
                formData={mockFormData}
                setFormData={mockSetFormData}
                errors={errorsWithMessages}
                isSaving={false}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        );

        expect(screen.getByText('First name is required')).toBeInTheDocument();
        expect(screen.getByText('Position is required')).toBeInTheDocument();
    });

    it('calls onSave when Save button is clicked', () => {
        render(
            <HeroSectionEdit
                formData={mockFormData}
                setFormData={mockSetFormData}
                errors={mockErrors}
                isSaving={false}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        );

        const saveButton = screen.getByRole('button', { name: /save/i });
        fireEvent.click(saveButton);

        expect(mockOnSave).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when Cancel button is clicked', () => {
        render(
            <HeroSectionEdit
                formData={mockFormData}
                setFormData={mockSetFormData}
                errors={mockErrors}
                isSaving={false}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        );

        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        fireEvent.click(cancelButton);

        expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('disables all inputs when isSaving is true', () => {
        render(
            <HeroSectionEdit
                formData={mockFormData}
                setFormData={mockSetFormData}
                errors={mockErrors}
                isSaving={true}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        );

        expect(screen.getByLabelText(/first name/i)).toBeDisabled();
        expect(screen.getByLabelText(/last name/i)).toBeDisabled();
        expect(screen.getByLabelText(/position/i)).toBeDisabled();
        expect(screen.getByLabelText(/school/i)).toBeDisabled();
        expect(screen.getByLabelText(/location/i)).toBeDisabled();
        expect(screen.getByLabelText(/class year/i)).toBeDisabled();
        expect(screen.getByLabelText(/height/i)).toBeDisabled();
        expect(screen.getByLabelText(/weight/i)).toBeDisabled();
    });

    it('shows "Saving..." text on Save button when isSaving is true', () => {
        render(
            <HeroSectionEdit
                formData={mockFormData}
                setFormData={mockSetFormData}
                errors={mockErrors}
                isSaving={true}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        );

        expect(screen.getByRole('button', { name: /saving/i })).toBeInTheDocument();
    });

    it('applies correct styling classes', () => {
        const { container } = render(
            <HeroSectionEdit
                formData={mockFormData}
                setFormData={mockSetFormData}
                errors={mockErrors}
                isSaving={false}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        );

        // Check for white card with shadow
        const cardContainer = container.querySelector('.bg-white.rounded-2xl.shadow-lg');
        expect(cardContainer).toBeInTheDocument();

        // Check for blue gradient header
        const header = container.querySelector('.bg-gradient-to-r.from-blue-600.to-blue-500');
        expect(header).toBeInTheDocument();
    });

    it('uses grid layout for paired fields', () => {
        const { container } = render(
            <HeroSectionEdit
                formData={mockFormData}
                setFormData={mockSetFormData}
                errors={mockErrors}
                isSaving={false}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        );

        const gridContainers = container.querySelectorAll('.grid.grid-cols-1.md\\:grid-cols-2.gap-4');
        expect(gridContainers.length).toBe(3); // Name fields, Height/Weight, School/Location
    });

    it('displays section headers with icons', () => {
        render(
            <HeroSectionEdit
                formData={mockFormData}
                setFormData={mockSetFormData}
                errors={mockErrors}
                isSaving={false}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        );

        expect(screen.getByText('Personal Information')).toBeInTheDocument();
        expect(screen.getByText('Athletic Information')).toBeInTheDocument();
        expect(screen.getByText('School Information')).toBeInTheDocument();
    });

    it('displays initials in header avatar', () => {
        render(
            <HeroSectionEdit
                formData={mockFormData}
                setFormData={mockSetFormData}
                errors={mockErrors}
                isSaving={false}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        );

        expect(screen.getByText('MJ')).toBeInTheDocument();
    });

    describe('Sport and Position/Event TypeaheadInput', () => {
        it('renders sport field with TypeaheadInput', () => {
            render(
                <HeroSectionEdit
                    formData={mockFormData}
                    setFormData={mockSetFormData}
                    errors={mockErrors}
                    isSaving={false}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            const sportInput = screen.getByLabelText(/^sport$/i);
            expect(sportInput).toBeInTheDocument();
            expect(sportInput).toHaveAttribute('role', 'combobox');
        });

        it('renders position/event field with TypeaheadInput', () => {
            render(
                <HeroSectionEdit
                    formData={mockFormData}
                    setFormData={mockSetFormData}
                    errors={mockErrors}
                    isSaving={false}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            const positionInput = screen.getByLabelText(/position|event/i);
            expect(positionInput).toBeInTheDocument();
            expect(positionInput).toHaveAttribute('role', 'combobox');
        });

        it('disables position/event field when no sport is selected', () => {
            const formDataWithoutSport: Hero = {
                ...mockFormData,
                sport: undefined,
                position: undefined,
            };

            render(
                <HeroSectionEdit
                    formData={formDataWithoutSport}
                    setFormData={mockSetFormData}
                    errors={mockErrors}
                    isSaving={false}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            const positionInput = screen.getByLabelText(/position|event/i);
            expect(positionInput).toBeDisabled();
            expect(positionInput).toHaveAttribute('placeholder', 'Please select a sport first');
        });

        it('enables position/event field when sport is selected', async () => {
            const formDataWithSport: Hero = {
                ...mockFormData,
                sport: 'Soccer',
                position: undefined,
            };

            render(
                <HeroSectionEdit
                    formData={formDataWithSport}
                    setFormData={mockSetFormData}
                    errors={mockErrors}
                    isSaving={false}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            const positionInput = screen.getByLabelText(/position|event/i);
            expect(positionInput).not.toBeDisabled();
        });

        it('changes position/event field label to "Position" for position-based sports', () => {
            const formDataWithFootball: Hero = {
                ...mockFormData,
                sport: 'Football',
                position: undefined,
            };

            render(
                <HeroSectionEdit
                    formData={formDataWithFootball}
                    setFormData={mockSetFormData}
                    errors={mockErrors}
                    isSaving={false}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            expect(screen.getByLabelText(/^position$/i)).toBeInTheDocument();
        });

        it('changes position/event field label to "Event" for event-based sports', () => {
            const formDataWithSwimming: Hero = {
                ...mockFormData,
                sport: 'Swimming & Diving',
                position: undefined,
            };

            render(
                <HeroSectionEdit
                    formData={formDataWithSwimming}
                    setFormData={mockSetFormData}
                    errors={mockErrors}
                    isSaving={false}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            expect(screen.getByLabelText(/^event$/i)).toBeInTheDocument();
        });

        it('clears position/event when sport changes', async () => {
            const user = userEvent.setup();
            const formDataWithSportAndPosition: Hero = {
                ...mockFormData,
                sport: 'Soccer',
                position: 'Forward',
            };

            render(
                <HeroSectionEdit
                    formData={formDataWithSportAndPosition}
                    setFormData={mockSetFormData}
                    errors={mockErrors}
                    isSaving={false}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            const sportInput = screen.getByLabelText(/^sport$/i);

            // Clear and type new sport
            await user.clear(sportInput);
            await user.type(sportInput, 'Basketball');

            // Verify setFormData was called with cleared position
            await waitFor(() => {
                const calls = mockSetFormData.mock.calls;
                const lastCall = calls[calls.length - 1];
                expect(lastCall).toBeDefined();
                // Check that position was cleared in one of the calls
                const positionClearedCall = calls.find(call => {
                    const updater = call[0];
                    if (typeof updater === 'function') {
                        const result = updater(formDataWithSportAndPosition);
                        return result.position === '';
                    }
                    return false;
                });
                expect(positionClearedCall).toBeDefined();
            });
        });

        it('updates available options when sport changes', async () => {
            const user = userEvent.setup();
            const formDataWithoutSport: Hero = {
                ...mockFormData,
                sport: undefined,
                position: undefined,
            };

            const { rerender } = render(
                <HeroSectionEdit
                    formData={formDataWithoutSport}
                    setFormData={mockSetFormData}
                    errors={mockErrors}
                    isSaving={false}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            const sportInput = screen.getByLabelText(/^sport$/i);

            // Type to trigger sport selection
            await user.type(sportInput, 'Soccer');

            // Simulate selecting Soccer
            await user.click(sportInput);

            // Rerender with Soccer selected
            const updatedFormData: Hero = {
                ...formDataWithoutSport,
                sport: 'Soccer',
            };

            rerender(
                <HeroSectionEdit
                    formData={updatedFormData}
                    setFormData={mockSetFormData}
                    errors={mockErrors}
                    isSaving={false}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            // Position field should now be enabled
            const positionInput = screen.getByLabelText(/position/i);
            expect(positionInput).not.toBeDisabled();
        });

        it('displays validation error for invalid sport', async () => {
            const user = userEvent.setup();
            const formDataWithoutSport: Hero = {
                ...mockFormData,
                sport: undefined,
            };

            render(
                <HeroSectionEdit
                    formData={formDataWithoutSport}
                    setFormData={mockSetFormData}
                    errors={mockErrors}
                    isSaving={false}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            const sportInput = screen.getByLabelText(/^sport$/i);

            // Type an invalid sport
            await user.type(sportInput, 'InvalidSport123');
            await user.tab(); // Trigger blur

            // Wait for validation error to appear
            await waitFor(() => {
                expect(screen.getByText('Please select a sport from the list')).toBeInTheDocument();
            });
        });

        it('displays validation error for invalid position/event', async () => {
            const user = userEvent.setup();
            const formDataWithSport: Hero = {
                ...mockFormData,
                sport: 'Soccer',
                position: undefined,
            };

            render(
                <HeroSectionEdit
                    formData={formDataWithSport}
                    setFormData={mockSetFormData}
                    errors={mockErrors}
                    isSaving={false}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            const positionInput = screen.getByLabelText(/position/i);

            // Type an invalid position
            await user.type(positionInput, 'InvalidPosition123');
            await user.tab(); // Trigger blur

            // Wait for validation error to appear
            await waitFor(() => {
                expect(screen.getByText('Please select a valid position from the list')).toBeInTheDocument();
            });
        });

        it('clears sport validation error when valid sport is selected', async () => {
            const user = userEvent.setup();
            const formDataWithoutSport: Hero = {
                ...mockFormData,
                sport: undefined,
            };

            render(
                <HeroSectionEdit
                    formData={formDataWithoutSport}
                    setFormData={mockSetFormData}
                    errors={mockErrors}
                    isSaving={false}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            const sportInput = screen.getByLabelText(/^sport$/i);

            // Type an invalid sport first
            await user.type(sportInput, 'InvalidSport');
            await user.tab();

            await waitFor(() => {
                expect(screen.getByText('Please select a sport from the list')).toBeInTheDocument();
            });

            // Clear and type a valid sport
            await user.clear(sportInput);
            await user.type(sportInput, 'Soccer');

            // Error should be cleared
            await waitFor(() => {
                expect(screen.queryByText('Please select a sport from the list')).not.toBeInTheDocument();
            });
        });

        it('save button remains enabled with validation warnings', async () => {
            const user = userEvent.setup();
            const formDataWithoutSport: Hero = {
                ...mockFormData,
                sport: undefined,
            };

            render(
                <HeroSectionEdit
                    formData={formDataWithoutSport}
                    setFormData={mockSetFormData}
                    errors={mockErrors}
                    isSaving={false}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            const sportInput = screen.getByLabelText(/^sport$/i);

            // Type an invalid sport to trigger validation warning
            await user.type(sportInput, 'InvalidSport');
            await user.tab();

            await waitFor(() => {
                expect(screen.getByText('Please select a sport from the list')).toBeInTheDocument();
            });

            // Save button should still be enabled
            const saveButton = screen.getByRole('button', { name: /save/i });
            expect(saveButton).not.toBeDisabled();
        });

        it('displays correct placeholder for position field', () => {
            const formDataWithSoccer: Hero = {
                ...mockFormData,
                sport: 'Soccer',
                position: undefined,
            };

            render(
                <HeroSectionEdit
                    formData={formDataWithSoccer}
                    setFormData={mockSetFormData}
                    errors={mockErrors}
                    isSaving={false}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            const positionInput = screen.getByLabelText(/position/i);
            expect(positionInput).toHaveAttribute('placeholder', 'e.g., Point Guard, Quarterback');
        });

        it('displays correct placeholder for event field', () => {
            const formDataWithSwimming: Hero = {
                ...mockFormData,
                sport: 'Swimming & Diving',
                position: undefined,
            };

            render(
                <HeroSectionEdit
                    formData={formDataWithSwimming}
                    setFormData={mockSetFormData}
                    errors={mockErrors}
                    isSaving={false}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            const eventInput = screen.getByLabelText(/event/i);
            expect(eventInput).toHaveAttribute('placeholder', 'e.g., 100m Freestyle, High Jump');
        });

        it('disables sport and position fields when isSaving is true', () => {
            const formDataWithSport: Hero = {
                ...mockFormData,
                sport: 'Soccer',
            };

            render(
                <HeroSectionEdit
                    formData={formDataWithSport}
                    setFormData={mockSetFormData}
                    errors={mockErrors}
                    isSaving={true}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            expect(screen.getByLabelText(/^sport$/i)).toBeDisabled();
            expect(screen.getByLabelText(/position/i)).toBeDisabled();
        });

        it('displays sport and position values from formData', () => {
            const formDataWithSportAndPosition: Hero = {
                ...mockFormData,
                sport: 'Basketball',
                position: 'Point Guard',
            };

            render(
                <HeroSectionEdit
                    formData={formDataWithSportAndPosition}
                    setFormData={mockSetFormData}
                    errors={mockErrors}
                    isSaving={false}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            expect(screen.getByLabelText(/^sport$/i)).toHaveValue('Basketball');
            expect(screen.getByLabelText(/position/i)).toHaveValue('Point Guard');
        });
    });
});
