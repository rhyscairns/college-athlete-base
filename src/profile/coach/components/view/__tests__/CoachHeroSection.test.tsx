import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CoachHeroSection } from '../CoachHeroSection';
import type { CoachProfile } from '../../../types';

describe('CoachHeroSection', () => {
    const mockCoach: CoachProfile = {
        id: '123',
        firstName: 'John',
        lastName: 'Smith',
        initials: 'JS',
        email: 'john.smith@university.edu',
        phone: '+1-555-0123',
        university: 'State University',
        position: 'Head Coach',
        sport: 'Basketball',
        profileImage: undefined,
        teamWebsiteUrl: 'https://university.edu/basketball',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    it('renders coach name correctly', () => {
        render(<CoachHeroSection coach={mockCoach} />);

        expect(screen.getByText('John')).toBeInTheDocument();
        expect(screen.getByText('Smith')).toBeInTheDocument();
    });

    it('renders position, university, and sport', () => {
        render(<CoachHeroSection coach={mockCoach} />);

        expect(screen.getByText('Head Coach')).toBeInTheDocument();
        expect(screen.getByText('State University')).toBeInTheDocument();
        expect(screen.getByText('Basketball')).toBeInTheDocument();
    });

    it('renders contact information', () => {
        render(<CoachHeroSection coach={mockCoach} />);

        expect(screen.getByText('john.smith@university.edu')).toBeInTheDocument();
        expect(screen.getByText('+1-555-0123')).toBeInTheDocument();
    });

    it('renders team website link when provided', () => {
        render(<CoachHeroSection coach={mockCoach} />);

        const link = screen.getByRole('link', { name: /visit team website/i });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', 'https://university.edu/basketball');
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('does not render team website link when not provided', () => {
        const coachWithoutWebsite = { ...mockCoach, teamWebsiteUrl: undefined };
        render(<CoachHeroSection coach={coachWithoutWebsite} />);

        expect(screen.queryByRole('link', { name: /visit team website/i })).not.toBeInTheDocument();
    });

    it('does not render phone when not provided', () => {
        const coachWithoutPhone = { ...mockCoach, phone: undefined };
        render(<CoachHeroSection coach={coachWithoutPhone} />);

        expect(screen.queryByText('+1-555-0123')).not.toBeInTheDocument();
    });

    it('renders initials when no profile image is provided', () => {
        render(<CoachHeroSection coach={mockCoach} />);

        // Initials should appear twice (large background and small badge)
        const initialsElements = screen.getAllByText('JS');
        expect(initialsElements.length).toBeGreaterThanOrEqual(1);
    });

    it('renders profile image when provided', () => {
        const coachWithImage = {
            ...mockCoach,
            profileImage: 'https://example.com/coach.jpg',
        };
        render(<CoachHeroSection coach={coachWithImage} />);

        const image = screen.getByAltText('John Smith');
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src', 'https://example.com/coach.jpg');
    });

    it('shows edit button when isOwner is true', () => {
        render(<CoachHeroSection coach={mockCoach} isOwner={true} />);

        expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    });

    it('does not show edit button when isOwner is false', () => {
        render(<CoachHeroSection coach={mockCoach} isOwner={false} />);

        expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
    });

    it('does not show edit button when not provided', () => {
        render(<CoachHeroSection coach={mockCoach} />);

        expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
    });

    it('hides edit button when isEditing is true', () => {
        render(<CoachHeroSection coach={mockCoach} isOwner={true} isEditing={true} />);

        expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
    });

    it('calls onEdit when edit button is clicked', async () => {
        const user = userEvent.setup();
        const onEdit = jest.fn();

        render(<CoachHeroSection coach={mockCoach} isOwner={true} onEdit={onEdit} />);

        const editButton = screen.getByRole('button', { name: /edit/i });
        await user.click(editButton);

        expect(onEdit).toHaveBeenCalledTimes(1);
    });

    it('renders with minimal data (only required fields)', () => {
        const minimalCoach: CoachProfile = {
            id: '123',
            firstName: 'Jane',
            lastName: 'Doe',
            initials: 'JD',
            email: 'jane.doe@example.com',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        render(<CoachHeroSection coach={minimalCoach} />);

        expect(screen.getByText('Jane')).toBeInTheDocument();
        expect(screen.getByText('Doe')).toBeInTheDocument();
        expect(screen.getByText('jane.doe@example.com')).toBeInTheDocument();
    });

    it('handles empty optional fields gracefully', () => {
        const coachWithEmptyFields: CoachProfile = {
            id: '123',
            firstName: 'Test',
            lastName: 'Coach',
            initials: 'TC',
            email: 'test@example.com',
            phone: '',
            university: '',
            position: '',
            sport: '',
            profileImage: '',
            teamWebsiteUrl: '',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        render(<CoachHeroSection coach={coachWithEmptyFields} />);

        expect(screen.getByText('Test')).toBeInTheDocument();
        expect(screen.getByText('Coach')).toBeInTheDocument();
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    describe('Empty State Handling', () => {
        describe('for profile owner', () => {
            it('shows placeholder text for empty position when owner', () => {
                const coachWithoutPosition = { ...mockCoach, position: undefined };
                render(<CoachHeroSection coach={coachWithoutPosition} isOwner={true} />);

                expect(screen.getByText('No position specified')).toBeInTheDocument();
            });

            it('shows placeholder text for empty university when owner', () => {
                const coachWithoutUniversity = { ...mockCoach, university: undefined };
                render(<CoachHeroSection coach={coachWithoutUniversity} isOwner={true} />);

                expect(screen.getByText('No university specified')).toBeInTheDocument();
            });

            it('shows placeholder text for empty sport when owner', () => {
                const coachWithoutSport = { ...mockCoach, sport: undefined };
                render(<CoachHeroSection coach={coachWithoutSport} isOwner={true} />);

                expect(screen.getByText('No sport specified')).toBeInTheDocument();
            });

            it('shows placeholder text for empty phone when owner', () => {
                const coachWithoutPhone = { ...mockCoach, phone: undefined };
                render(<CoachHeroSection coach={coachWithoutPhone} isOwner={true} />);

                expect(screen.getByText('No phone number')).toBeInTheDocument();
            });

            it('shows placeholder text for empty team website when owner', () => {
                const coachWithoutWebsite = { ...mockCoach, teamWebsiteUrl: undefined };
                render(<CoachHeroSection coach={coachWithoutWebsite} isOwner={true} />);

                expect(screen.getByText('No team website link added')).toBeInTheDocument();
            });

            it('shows all placeholder texts when all optional fields are empty for owner', () => {
                const minimalCoach: CoachProfile = {
                    id: '123',
                    firstName: 'Jane',
                    lastName: 'Doe',
                    initials: 'JD',
                    email: 'jane.doe@example.com',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                render(<CoachHeroSection coach={minimalCoach} isOwner={true} />);

                expect(screen.getByText('No position specified')).toBeInTheDocument();
                expect(screen.getByText('No university specified')).toBeInTheDocument();
                expect(screen.getByText('No sport specified')).toBeInTheDocument();
                expect(screen.getByText('No phone number')).toBeInTheDocument();
                expect(screen.getByText('No team website link added')).toBeInTheDocument();
            });
        });

        describe('for non-owner viewers', () => {
            it('shows placeholder text for empty position when not owner', () => {
                const coachWithoutPosition = { ...mockCoach, position: undefined };
                render(<CoachHeroSection coach={coachWithoutPosition} isOwner={false} />);

                expect(screen.getByText('Position not specified')).toBeInTheDocument();
            });

            it('shows placeholder text for empty university when not owner', () => {
                const coachWithoutUniversity = { ...mockCoach, university: undefined };
                render(<CoachHeroSection coach={coachWithoutUniversity} isOwner={false} />);

                expect(screen.getByText('University not specified')).toBeInTheDocument();
            });

            it('shows placeholder text for empty sport when not owner', () => {
                const coachWithoutSport = { ...mockCoach, sport: undefined };
                render(<CoachHeroSection coach={coachWithoutSport} isOwner={false} />);

                expect(screen.getByText('Sport not specified')).toBeInTheDocument();
            });

            it('shows placeholder text for empty phone when not owner', () => {
                const coachWithoutPhone = { ...mockCoach, phone: undefined };
                render(<CoachHeroSection coach={coachWithoutPhone} isOwner={false} />);

                expect(screen.getByText('Phone not provided')).toBeInTheDocument();
            });

            it('does not show team website placeholder when not owner', () => {
                const coachWithoutWebsite = { ...mockCoach, teamWebsiteUrl: undefined };
                render(<CoachHeroSection coach={coachWithoutWebsite} isOwner={false} />);

                expect(screen.queryByText('No team website link added')).not.toBeInTheDocument();
                expect(screen.queryByRole('link', { name: /visit team website/i })).not.toBeInTheDocument();
            });

            it('shows all placeholder texts when all optional fields are empty for non-owner', () => {
                const minimalCoach: CoachProfile = {
                    id: '123',
                    firstName: 'Jane',
                    lastName: 'Doe',
                    initials: 'JD',
                    email: 'jane.doe@example.com',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                render(<CoachHeroSection coach={minimalCoach} isOwner={false} />);

                expect(screen.getByText('Position not specified')).toBeInTheDocument();
                expect(screen.getByText('University not specified')).toBeInTheDocument();
                expect(screen.getByText('Sport not specified')).toBeInTheDocument();
                expect(screen.getByText('Phone not provided')).toBeInTheDocument();
                expect(screen.queryByText('No team website link added')).not.toBeInTheDocument();
            });
        });

        describe('empty string handling', () => {
            it('treats empty string position as empty', () => {
                const coachWithEmptyPosition = { ...mockCoach, position: '' };
                render(<CoachHeroSection coach={coachWithEmptyPosition} isOwner={true} />);

                expect(screen.getByText('No position specified')).toBeInTheDocument();
            });

            it('treats empty string university as empty', () => {
                const coachWithEmptyUniversity = { ...mockCoach, university: '' };
                render(<CoachHeroSection coach={coachWithEmptyUniversity} isOwner={true} />);

                expect(screen.getByText('No university specified')).toBeInTheDocument();
            });

            it('treats empty string sport as empty', () => {
                const coachWithEmptySport = { ...mockCoach, sport: '' };
                render(<CoachHeroSection coach={coachWithEmptySport} isOwner={true} />);

                expect(screen.getByText('No sport specified')).toBeInTheDocument();
            });

            it('treats empty string phone as empty', () => {
                const coachWithEmptyPhone = { ...mockCoach, phone: '' };
                render(<CoachHeroSection coach={coachWithEmptyPhone} isOwner={true} />);

                expect(screen.getByText('No phone number')).toBeInTheDocument();
            });

            it('treats empty string team website as empty', () => {
                const coachWithEmptyWebsite = { ...mockCoach, teamWebsiteUrl: '' };
                render(<CoachHeroSection coach={coachWithEmptyWebsite} isOwner={true} />);

                expect(screen.getByText('No team website link added')).toBeInTheDocument();
            });
        });
    });
});
