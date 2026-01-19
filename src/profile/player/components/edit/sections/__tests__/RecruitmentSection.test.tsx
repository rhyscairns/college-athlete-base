import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecruitmentSection } from '../RecruitmentSection';
import type { PlayerProfileFormData } from '../../../../types';

describe('RecruitmentSection', () => {
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
        recruitmentStatus: 'open',
        availableDate: '2025-08-01',
        scholarshipNeeds: 'Full scholarship preferred',
    };

    beforeEach(() => {
        mockSetFormData.mockClear();
    });

    describe('Component Rendering', () => {
        it('renders with correct initial values', () => {
            render(
                <RecruitmentSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const recruitmentStatusSelect = screen.getByLabelText(/Recruitment Status/i) as HTMLSelectElement;
            expect(recruitmentStatusSelect.value).toBe('open');
            expect(screen.getByDisplayValue('2025-08-01')).toBeInTheDocument();
            expect(screen.getByDisplayValue('Full scholarship preferred')).toBeInTheDocument();
        });

        it('renders section heading', () => {
            render(
                <RecruitmentSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            expect(screen.getByRole('heading', { name: 'Recruitment Information' })).toBeInTheDocument();
        });

        it('renders all recruitment fields', () => {
            render(
                <RecruitmentSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            expect(screen.getByLabelText(/Recruitment Status/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Available Date/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Scholarship Needs/i)).toBeInTheDocument();
        });

        it('renders with empty values when not provided', () => {
            const emptyFormData = {
                ...defaultFormData,
                recruitmentStatus: undefined,
                availableDate: undefined,
                scholarshipNeeds: undefined,
            };

            render(
                <RecruitmentSection
                    formData={emptyFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const recruitmentStatusSelect = screen.getByLabelText(/Recruitment Status/i) as HTMLSelectElement;
            const availableDateInput = screen.getByLabelText(/Available Date/i) as HTMLInputElement;
            const scholarshipNeedsInput = screen.getByLabelText(/Scholarship Needs/i) as HTMLInputElement;

            expect(recruitmentStatusSelect.value).toBe('');
            expect(availableDateInput.value).toBe('');
            expect(scholarshipNeedsInput.value).toBe('');
        });

        it('renders optional placeholder for scholarship needs', () => {
            render(
                <RecruitmentSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            expect(screen.getByLabelText(/Scholarship Needs/i)).toHaveAttribute('placeholder', 'Optional');
        });
    });

    describe('Recruitment Status Options', () => {
        it('displays recruitment status options', async () => {
            const user = userEvent.setup();
            render(
                <RecruitmentSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const recruitmentStatusSelect = screen.getByLabelText(/Recruitment Status/i);

            // Check that options exist
            expect(screen.getByRole('option', { name: /Open to Recruitment/i })).toBeInTheDocument();
            expect(screen.getByRole('option', { name: /Committed/i })).toBeInTheDocument();
            expect(screen.getByRole('option', { name: /Not Looking/i })).toBeInTheDocument();
        });

        it('allows selecting different recruitment status', async () => {
            const user = userEvent.setup();
            render(
                <RecruitmentSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const recruitmentStatusSelect = screen.getByLabelText(/Recruitment Status/i);
            await user.selectOptions(recruitmentStatusSelect, 'committed');

            expect(mockSetFormData).toHaveBeenCalled();
        });
    });

    describe('Field Updates and State Changes', () => {
        it('triggers state change when recruitment status is updated', async () => {
            const user = userEvent.setup();
            render(
                <RecruitmentSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const recruitmentStatusSelect = screen.getByLabelText(/Recruitment Status/i);
            await user.selectOptions(recruitmentStatusSelect, 'not-looking');

            expect(mockSetFormData).toHaveBeenCalled();
        });

        it('triggers state change when available date is updated', async () => {
            const user = userEvent.setup();
            render(
                <RecruitmentSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const availableDateInput = screen.getByLabelText(/Available Date/i);
            await user.clear(availableDateInput);
            await user.type(availableDateInput, '2026-01-15');

            expect(mockSetFormData).toHaveBeenCalled();
        });

        it('triggers state change when scholarship needs is updated', async () => {
            const user = userEvent.setup();
            render(
                <RecruitmentSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const scholarshipNeedsInput = screen.getByLabelText(/Scholarship Needs/i);
            await user.clear(scholarshipNeedsInput);
            await user.type(scholarshipNeedsInput, 'Partial scholarship acceptable');

            expect(mockSetFormData).toHaveBeenCalled();
        });
    });

    describe('Field Attributes', () => {
        it('has correct type for available date field', () => {
            render(
                <RecruitmentSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const availableDateInput = screen.getByLabelText(/Available Date/i);
            expect(availableDateInput).toHaveAttribute('type', 'date');
        });
    });

    describe('Disabled State', () => {
        it('disables all fields when isEditing is false', () => {
            render(
                <RecruitmentSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={false}
                />
            );

            expect(screen.getByLabelText(/Recruitment Status/i)).toBeDisabled();
            expect(screen.getByLabelText(/Available Date/i)).toBeDisabled();
            expect(screen.getByLabelText(/Scholarship Needs/i)).toBeDisabled();
        });

        it('enables all fields when isEditing is true', () => {
            render(
                <RecruitmentSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            expect(screen.getByLabelText(/Recruitment Status/i)).not.toBeDisabled();
            expect(screen.getByLabelText(/Available Date/i)).not.toBeDisabled();
            expect(screen.getByLabelText(/Scholarship Needs/i)).not.toBeDisabled();
        });
    });

    describe('Layout', () => {
        it('uses two-column grid layout for recruitment status and available date', () => {
            const { container } = render(
                <RecruitmentSection
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
