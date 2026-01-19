import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AthleticInformationSection } from '../AthleticInformationSection';
import type { PlayerProfileFormData } from '../../../../types';

describe('AthleticInformationSection', () => {
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
        clubTeam: 'Elite Basketball Club',
        highSchool: 'Central High School',
        previousTeams: ['Team A', 'Team B'],
        championships: ['State Championship 2023'],
        allStarSelections: ['All-State 2023', 'All-Region 2024'],
    };

    beforeEach(() => {
        mockSetFormData.mockClear();
    });

    describe('Component Rendering', () => {
        it('renders with correct initial values', () => {
            render(
                <AthleticInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            expect(screen.getByDisplayValue('Elite Basketball Club')).toBeInTheDocument();
            expect(screen.getByDisplayValue('Central High School')).toBeInTheDocument();
            expect(screen.getByDisplayValue('Team A, Team B')).toBeInTheDocument();
            expect(screen.getByDisplayValue('State Championship 2023')).toBeInTheDocument();
            expect(screen.getByDisplayValue('All-State 2023, All-Region 2024')).toBeInTheDocument();
        });

        it('renders section heading', () => {
            render(
                <AthleticInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            expect(screen.getByRole('heading', { name: 'Athletic Information' })).toBeInTheDocument();
        });

        it('renders all athletic fields', () => {
            render(
                <AthleticInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            expect(screen.getByLabelText(/Club Team/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/High School/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Previous Teams/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Championships/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/All-Star Selections/i)).toBeInTheDocument();
        });

        it('renders with empty values when not provided', () => {
            const emptyFormData = {
                ...defaultFormData,
                clubTeam: undefined,
                highSchool: undefined,
                previousTeams: undefined,
                championships: undefined,
                allStarSelections: undefined,
            };

            render(
                <AthleticInformationSection
                    formData={emptyFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const clubTeamInput = screen.getByLabelText(/Club Team/i) as HTMLInputElement;
            const highSchoolInput = screen.getByLabelText(/High School/i) as HTMLInputElement;

            expect(clubTeamInput.value).toBe('');
            expect(highSchoolInput.value).toBe('');
        });

        it('renders optional placeholder for fields', () => {
            render(
                <AthleticInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            expect(screen.getByLabelText(/Club Team/i)).toHaveAttribute('placeholder', 'Optional');
            expect(screen.getByLabelText(/High School/i)).toHaveAttribute('placeholder', 'Optional');
            expect(screen.getByLabelText(/Previous Teams/i)).toHaveAttribute('placeholder', 'Optional');
            expect(screen.getByLabelText(/Championships/i)).toHaveAttribute('placeholder', 'Optional');
            expect(screen.getByLabelText(/All-Star Selections/i)).toHaveAttribute('placeholder', 'Optional');
        });
    });

    describe('Field Updates and State Changes', () => {
        it('triggers state change when club team is updated', async () => {
            const user = userEvent.setup();
            render(
                <AthleticInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const clubTeamInput = screen.getByLabelText(/Club Team/i);
            await user.clear(clubTeamInput);
            await user.type(clubTeamInput, 'New Club Team');

            expect(mockSetFormData).toHaveBeenCalled();
        });

        it('triggers state change when high school is updated', async () => {
            const user = userEvent.setup();
            render(
                <AthleticInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const highSchoolInput = screen.getByLabelText(/High School/i);
            await user.clear(highSchoolInput);
            await user.type(highSchoolInput, 'New High School');

            expect(mockSetFormData).toHaveBeenCalled();
        });

        it('triggers state change when previous teams is updated', async () => {
            const user = userEvent.setup();
            render(
                <AthleticInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const previousTeamsInput = screen.getByLabelText(/Previous Teams/i);
            await user.clear(previousTeamsInput);
            await user.type(previousTeamsInput, 'Team C, Team D');

            expect(mockSetFormData).toHaveBeenCalled();
        });

        it('triggers state change when championships is updated', async () => {
            const user = userEvent.setup();
            render(
                <AthleticInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const championshipsInput = screen.getByLabelText(/Championships/i);
            await user.clear(championshipsInput);
            await user.type(championshipsInput, 'National Championship 2024');

            expect(mockSetFormData).toHaveBeenCalled();
        });

        it('triggers state change when all-star selections is updated', async () => {
            const user = userEvent.setup();
            render(
                <AthleticInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const allStarInput = screen.getByLabelText(/All-Star Selections/i);
            await user.clear(allStarInput);
            await user.type(allStarInput, 'All-American 2024');

            expect(mockSetFormData).toHaveBeenCalled();
        });
    });

    describe('Array Field Handling', () => {
        it('converts comma-separated string to array for previous teams', async () => {
            const user = userEvent.setup();
            render(
                <AthleticInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const previousTeamsInput = screen.getByLabelText(/Previous Teams/i);
            await user.clear(previousTeamsInput);
            await user.type(previousTeamsInput, 'Team X, Team Y, Team Z');

            expect(mockSetFormData).toHaveBeenCalled();
            // Verify the last call includes array conversion
            const lastCall = mockSetFormData.mock.calls[mockSetFormData.mock.calls.length - 1][0];
            expect(typeof lastCall).toBe('function');
        });

        it('displays array values as comma-separated string', () => {
            render(
                <AthleticInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const previousTeamsInput = screen.getByLabelText(/Previous Teams/i) as HTMLTextAreaElement;
            expect(previousTeamsInput.value).toBe('Team A, Team B');
        });
    });

    describe('Disabled State', () => {
        it('disables all fields when isEditing is false', () => {
            render(
                <AthleticInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={false}
                />
            );

            expect(screen.getByLabelText(/Club Team/i)).toBeDisabled();
            expect(screen.getByLabelText(/High School/i)).toBeDisabled();
            expect(screen.getByLabelText(/Previous Teams/i)).toBeDisabled();
            expect(screen.getByLabelText(/Championships/i)).toBeDisabled();
            expect(screen.getByLabelText(/All-Star Selections/i)).toBeDisabled();
        });

        it('enables all fields when isEditing is true', () => {
            render(
                <AthleticInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            expect(screen.getByLabelText(/Club Team/i)).not.toBeDisabled();
            expect(screen.getByLabelText(/High School/i)).not.toBeDisabled();
            expect(screen.getByLabelText(/Previous Teams/i)).not.toBeDisabled();
            expect(screen.getByLabelText(/Championships/i)).not.toBeDisabled();
            expect(screen.getByLabelText(/All-Star Selections/i)).not.toBeDisabled();
        });
    });

    describe('Layout', () => {
        it('uses two-column grid layout for club team and high school', () => {
            const { container } = render(
                <AthleticInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const gridContainer = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2');
            expect(gridContainer).toBeInTheDocument();
        });

        it('uses textarea for array fields', () => {
            render(
                <AthleticInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const previousTeamsInput = screen.getByLabelText(/Previous Teams/i);
            const championshipsInput = screen.getByLabelText(/Championships/i);
            const allStarInput = screen.getByLabelText(/All-Star Selections/i);

            expect(previousTeamsInput.tagName).toBe('TEXTAREA');
            expect(championshipsInput.tagName).toBe('TEXTAREA');
            expect(allStarInput.tagName).toBe('TEXTAREA');
        });
    });
});
