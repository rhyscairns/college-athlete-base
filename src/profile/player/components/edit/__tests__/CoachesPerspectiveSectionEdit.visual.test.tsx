import React from 'react';
import { render, screen } from '@testing-library/react';
import { CoachesPerspectiveSectionEdit } from '../components/sections/CoachesPerspectiveSectionEdit';
import type { Testimonial } from '../../../types';

const mockTestimonials: Testimonial[] = [
    {
        id: 'testimonial-1',
        quote: 'Marcus is an exceptional player with great leadership skills.',
        coachName: 'Coach David Miller',
        coachTitle: 'Head Football Coach',
        coachOrganization: 'Westlake High School',
    },
];

const defaultProps = {
    formData: mockTestimonials,
    setFormData: jest.fn(),
    errors: {},
    isSaving: false,
    onSave: jest.fn(),
    onCancel: jest.fn(),
};

// Visual styling tests removed — styling is now handled via design tokens.
// Behavior tests remain in CoachesPerspectiveSectionEdit.test.tsx.
describe('CoachesPerspectiveSectionEdit - Visual Tests', () => {
    it('renders the edit form', () => {
        render(<CoachesPerspectiveSectionEdit {...defaultProps} />);
        expect(screen.getByDisplayValue('Marcus is an exceptional player with great leadership skills.')).toBeInTheDocument();
    });

    it('renders save and cancel buttons', () => {
        render(<CoachesPerspectiveSectionEdit {...defaultProps} />);
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
});
