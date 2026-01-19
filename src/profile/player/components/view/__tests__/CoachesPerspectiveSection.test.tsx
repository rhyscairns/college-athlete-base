import { render, screen } from '@testing-library/react';
import { CoachesPerspectiveSection } from '../CoachesPerspectiveSection';

describe('CoachesPerspectiveSection', () => {
    const mockTestimonials = [
        {
            id: '1',
            quote: 'Marcus is an exceptional player.',
            coachName: 'Coach Miller',
            coachTitle: 'Head Coach',
            coachOrganization: 'Westlake High School',
        },
    ];

    it('renders section title', () => {
        render(<CoachesPerspectiveSection testimonials={mockTestimonials} />);

        expect(screen.getByText("Coaches' Perspective")).toBeInTheDocument();
    });

    it('renders testimonial quote', () => {
        render(<CoachesPerspectiveSection testimonials={mockTestimonials} />);

        expect(screen.getByText('Marcus is an exceptional player.')).toBeInTheDocument();
    });

    it('renders coach information', () => {
        render(<CoachesPerspectiveSection testimonials={mockTestimonials} />);

        expect(screen.getByText('Coach Miller')).toBeInTheDocument();
        expect(screen.getByText('Head Coach')).toBeInTheDocument();
        expect(screen.getByText('Westlake High School')).toBeInTheDocument();
    });

    it('has correct section id for navigation', () => {
        const { container } = render(<CoachesPerspectiveSection testimonials={mockTestimonials} />);

        const section = container.querySelector('section');
        expect(section).toHaveAttribute('id', 'coaches');
    });
});
