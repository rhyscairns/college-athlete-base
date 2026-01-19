import { render, screen } from '@testing-library/react';
import { RecruitingContactSection } from '../RecruitingContactSection';

describe('RecruitingContactSection', () => {
    const mockContact = {
        email: 'player@example.com',
        phone: '(512) 555-0123',
        socialMedia: {
            twitter: 'https://twitter.com/player',
            instagram: 'https://instagram.com/player',
            hudl: 'https://hudl.com/player',
        },
        headCoach: {
            name: 'Coach Miller',
            email: 'coach@example.com',
            phone: '(512) 555-0456',
        },
    };

    it('renders section title', () => {
        render(<RecruitingContactSection contact={mockContact} />);

        expect(screen.getByText('Get In Touch')).toBeInTheDocument();
    });

    it('renders player contact information', () => {
        render(<RecruitingContactSection contact={mockContact} />);

        expect(screen.getByText('player@example.com')).toBeInTheDocument();
        expect(screen.getByText('(512) 555-0123')).toBeInTheDocument();
    });

    it('renders coach contact information', () => {
        render(<RecruitingContactSection contact={mockContact} />);

        expect(screen.getByText('Coach Miller')).toBeInTheDocument();
        expect(screen.getByText('coach@example.com')).toBeInTheDocument();
        expect(screen.getByText('(512) 555-0456')).toBeInTheDocument();
    });

    it('renders social media links', () => {
        render(<RecruitingContactSection contact={mockContact} />);

        const links = screen.getAllByRole('link');
        expect(links.length).toBeGreaterThan(0);
    });

    it('has correct section id for navigation', () => {
        const { container } = render(<RecruitingContactSection contact={mockContact} />);

        const section = container.querySelector('section');
        expect(section).toHaveAttribute('id', 'contact');
    });
});
