import React from 'react';
import { render, screen } from '@testing-library/react';
import { CoachesPerspectiveSection } from '../CoachesPerspectiveSection';
import type { Testimonial } from '../../../types';

const mockTestimonials: Testimonial[] = [
    {
        id: 'testimonial-1',
        quote: 'Marcus is an exceptional player with great leadership skills.',
        coachName: 'Coach David Miller',
        coachTitle: 'Head Football Coach',
        coachOrganization: 'Westlake High School',
    },
    {
        id: 'testimonial-2',
        quote: 'A rare combination of speed, size, and football IQ.',
        coachName: 'James Wilson',
        coachTitle: 'Offensive Coordinator',
        coachOrganization: 'Westlake High School',
    },
];

// Visual styling tests removed — styling is now handled via design tokens (CSS custom properties).
// Behavior tests remain in CoachesPerspectiveSection.test.tsx.
describe('CoachesPerspectiveSection - Visual Tests', () => {
    it('renders testimonials', () => {
        render(<CoachesPerspectiveSection testimonials={mockTestimonials} />);
        expect(screen.getByText('Marcus is an exceptional player with great leadership skills.')).toBeInTheDocument();
        expect(screen.getByText('Coach David Miller')).toBeInTheDocument();
    });

    it('renders empty state when no testimonials', () => {
        render(<CoachesPerspectiveSection testimonials={[]} isOwner={true} />);
        expect(screen.queryByText('Marcus is an exceptional player')).not.toBeInTheDocument();
    });
});
