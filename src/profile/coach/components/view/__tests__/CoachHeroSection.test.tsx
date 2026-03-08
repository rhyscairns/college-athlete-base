import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CoachHeroSection } from '../CoachHeroSection';
import type { CoachProfile } from '../../../types';

// Mock Next.js Image component
jest.mock('next/image', () => ({
    __esModule: true,
    default: (props: any) => {
        // Filter out Next.js Image-specific props that aren't valid HTML attributes
        const { fill, priority, sizes, ...imgProps } = props;
        // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
        return <img {...imgProps} />;
    },
}));

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

        expect(screen.getByText('John Smith')).toBeInTheDocument();
    });

    it('renders position, university, and sport', () => {
        render(<CoachHeroSection coach={mockCoach} />);

        expect(screen.getAllByText('Head Coach').length).toBeGreaterThan(0);
        expect(screen.getAllByText('State University').length).toBeGreaterThan(0);
        expect(screen.getByText('Basketball')).toBeInTheDocument();
    });

    it('renders contact information', () => {
        render(<CoachHeroSection coach={mockCoach} />);

        expect(screen.getByText('john.smith@university.edu')).toBeInTheDocument();
        expect(screen.getByText('+1-555-0123')).toBeInTheDocument();
    });

    it('renders team website link when provided', () => {
        render(<CoachHeroSection coach={mockCoach} />);

        const link = screen.getByRole('link', { name: /visit.*official website/i });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', 'https://university.edu/basketball');
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('does not render team website link when not provided', () => {
        const coachWithoutWebsite = { ...mockCoach, teamWebsiteUrl: undefined };
        render(<CoachHeroSection coach={coachWithoutWebsite} />);

        expect(screen.queryByRole('link', { name: /visit.*official website/i })).not.toBeInTheDocument();
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

        expect(screen.getByText('Jane Doe')).toBeInTheDocument();
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

        expect(screen.getByText('Test Coach')).toBeInTheDocument();
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    describe('Empty State Handling', () => {
        it('renders default values for missing optional fields', () => {
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

            // Should render with default values
            expect(screen.getByText('Jane Doe')).toBeInTheDocument();
            expect(screen.getByText('jane.doe@example.com')).toBeInTheDocument();
            expect(screen.getByText('Head Coach')).toBeInTheDocument(); // Default position
        });

        it('does not render phone section when phone is missing', () => {
            const coachWithoutPhone = { ...mockCoach, phone: undefined };
            render(<CoachHeroSection coach={coachWithoutPhone} />);

            expect(screen.queryByText('+1-555-0123')).not.toBeInTheDocument();
        });

        it('does not render team website button when URL is missing', () => {
            const coachWithoutWebsite = { ...mockCoach, teamWebsiteUrl: undefined };
            render(<CoachHeroSection coach={coachWithoutWebsite} />);

            expect(screen.queryByRole('link', { name: /visit.*official website/i })).not.toBeInTheDocument();
        });

        it('does not render sport tag when sport is missing', () => {
            const coachWithoutSport = { ...mockCoach, sport: undefined };
            render(<CoachHeroSection coach={coachWithoutSport} />);

            expect(screen.queryByText('Basketball')).not.toBeInTheDocument();
        });
    });
});
