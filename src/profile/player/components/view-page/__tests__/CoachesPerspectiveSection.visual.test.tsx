import React from 'react';
import { render, screen } from '@testing-library/react';
import { CoachesPerspectiveSection } from '../CoachesPerspectiveSection';
import type { Testimonial } from '../../../types';

describe('CoachesPerspectiveSection - Light Theme Visual Tests', () => {
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
        {
            id: 'testimonial-3',
            quote: 'One of the most dedicated athletes I have coached.',
            coachName: 'Sarah Johnson',
            coachTitle: 'Athletic Director',
            coachOrganization: 'State Athletics',
        },
    ];

    const defaultProps = {
        testimonials: mockTestimonials,
        isOwner: false,
        isEditing: false,
        isAnyOtherSectionEditing: false,
        onEdit: jest.fn(),
        onSave: jest.fn(),
        onCancel: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Testimonial Card Styling', () => {
        it('renders testimonial cards with white background', () => {
            const { container } = render(<CoachesPerspectiveSection {...defaultProps} />);

            const cards = container.querySelectorAll('.bg-white');
            expect(cards.length).toBeGreaterThan(0);
        });

        it('renders testimonial cards with gray-200 borders', () => {
            const { container } = render(<CoachesPerspectiveSection {...defaultProps} />);

            const cards = container.querySelectorAll('.border-gray-200');
            expect(cards.length).toBeGreaterThan(0);
        });

        it('renders testimonial cards with rounded corners', () => {
            const { container } = render(<CoachesPerspectiveSection {...defaultProps} />);

            const cards = container.querySelectorAll('.rounded-2xl');
            expect(cards.length).toBeGreaterThan(0);
        });

        it('has hover state with yellow border', () => {
            const { container } = render(<CoachesPerspectiveSection {...defaultProps} />);

            const cards = container.querySelectorAll('.hover\\:border-yellow-400');
            expect(cards.length).toBeGreaterThan(0);
        });

        it('has hover state with shadow', () => {
            const { container } = render(<CoachesPerspectiveSection {...defaultProps} />);

            const cards = container.querySelectorAll('.hover\\:shadow-lg');
            expect(cards.length).toBeGreaterThan(0);
        });
    });

    describe('Quote Icon Styling', () => {
        it('renders quote icon with yellow color', () => {
            const { container } = render(<CoachesPerspectiveSection {...defaultProps} />);

            const quoteIcons = container.querySelectorAll('.text-yellow-500\\/40');
            expect(quoteIcons.length).toBe(3); // One for each testimonial
        });

        it('renders quote icon with proper size', () => {
            const { container } = render(<CoachesPerspectiveSection {...defaultProps} />);

            const quoteIcons = container.querySelectorAll('.text-5xl');
            expect(quoteIcons.length).toBeGreaterThan(0);
        });
    });

    describe('Quote Text Styling', () => {
        it('renders quote text with gray-700 color', () => {
            render(<CoachesPerspectiveSection {...defaultProps} />);

            const quoteText = screen.getByText('Marcus is an exceptional player with great leadership skills.');
            expect(quoteText).toHaveClass('text-gray-700');
        });

        it('renders quote text in italic', () => {
            render(<CoachesPerspectiveSection {...defaultProps} />);

            const quoteText = screen.getByText('Marcus is an exceptional player with great leadership skills.');
            expect(quoteText).toHaveClass('italic');
        });

        it('renders all quotes with proper styling', () => {
            const { container } = render(<CoachesPerspectiveSection {...defaultProps} />);

            const quotes = container.querySelectorAll('.text-gray-700.italic');
            expect(quotes.length).toBe(3);
        });
    });

    describe('Coach Info Styling', () => {
        it('renders coach name with gray-900 color', () => {
            render(<CoachesPerspectiveSection {...defaultProps} />);

            const coachName = screen.getByText('Coach David Miller');
            expect(coachName).toHaveClass('text-gray-900');
            expect(coachName).toHaveClass('font-bold');
        });

        it('renders coach title with gray-600 color', () => {
            render(<CoachesPerspectiveSection {...defaultProps} />);

            const coachTitle = screen.getByText('Head Football Coach');
            expect(coachTitle).toHaveClass('text-gray-600');
        });

        it('renders organization with gray-500 color', () => {
            render(<CoachesPerspectiveSection {...defaultProps} />);

            const organizations = screen.getAllByText('Westlake High School');
            organizations.forEach((org) => {
                expect(org).toHaveClass('text-gray-500');
            });
        });

        it('has border separator above coach info', () => {
            const { container } = render(<CoachesPerspectiveSection {...defaultProps} />);

            const separators = container.querySelectorAll('.border-t.border-gray-200');
            expect(separators.length).toBe(3); // One for each testimonial
        });
    });

    describe('Decorative Elements', () => {
        it('renders decorative gradient element', () => {
            const { container } = render(<CoachesPerspectiveSection {...defaultProps} />);

            const decorativeElements = container.querySelectorAll('.bg-gradient-to-tl.from-yellow-400\\/10');
            expect(decorativeElements.length).toBe(3);
        });

        it('decorative element is positioned correctly', () => {
            const { container } = render(<CoachesPerspectiveSection {...defaultProps} />);

            const decorativeElements = container.querySelectorAll('.absolute.bottom-0.right-0');
            expect(decorativeElements.length).toBeGreaterThan(0);
        });
    });

    describe('Grid Layout', () => {
        it('uses responsive grid layout', () => {
            const { container } = render(<CoachesPerspectiveSection {...defaultProps} />);

            const grid = container.querySelector('.grid.md\\:grid-cols-2.lg\\:grid-cols-3');
            expect(grid).toBeInTheDocument();
        });

        it('has proper gap between cards', () => {
            const { container } = render(<CoachesPerspectiveSection {...defaultProps} />);

            const grid = container.querySelector('.gap-6');
            expect(grid).toBeInTheDocument();
        });
    });

    describe('Content Display', () => {
        it('displays all testimonials', () => {
            render(<CoachesPerspectiveSection {...defaultProps} />);

            expect(screen.getByText('Marcus is an exceptional player with great leadership skills.')).toBeInTheDocument();
            expect(screen.getByText('A rare combination of speed, size, and football IQ.')).toBeInTheDocument();
            expect(screen.getByText('One of the most dedicated athletes I have coached.')).toBeInTheDocument();
        });

        it('displays all coach names', () => {
            render(<CoachesPerspectiveSection {...defaultProps} />);

            expect(screen.getByText('Coach David Miller')).toBeInTheDocument();
            expect(screen.getByText('James Wilson')).toBeInTheDocument();
            expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
        });

        it('displays all coach titles', () => {
            render(<CoachesPerspectiveSection {...defaultProps} />);

            expect(screen.getByText('Head Football Coach')).toBeInTheDocument();
            expect(screen.getByText('Offensive Coordinator')).toBeInTheDocument();
            expect(screen.getByText('Athletic Director')).toBeInTheDocument();
        });

        it('displays all organizations', () => {
            render(<CoachesPerspectiveSection {...defaultProps} />);

            const organizations = screen.getAllByText('Westlake High School');
            expect(organizations).toHaveLength(2);
            expect(screen.getByText('State Athletics')).toBeInTheDocument();
        });
    });

    describe('Responsive Design', () => {
        it('has responsive padding on cards', () => {
            const { container } = render(<CoachesPerspectiveSection {...defaultProps} />);

            const cards = container.querySelectorAll('.p-6.md\\:p-8');
            expect(cards.length).toBe(3);
        });

        it('has responsive text sizing for quotes', () => {
            const { container } = render(<CoachesPerspectiveSection {...defaultProps} />);

            const quotes = container.querySelectorAll('.text-base.md\\:text-lg');
            // Should have 3 quotes (no subtitle in content area anymore)
            expect(quotes.length).toBe(3);
        });
    });

    describe('Accessibility', () => {
        it('has proper semantic structure', () => {
            const { container } = render(<CoachesPerspectiveSection {...defaultProps} />);

            const section = container.querySelector('section#coaches');
            expect(section).toBeInTheDocument();
        });

        it('has proper heading hierarchy', () => {
            render(<CoachesPerspectiveSection {...defaultProps} />);

            const heading = screen.getByText("Coaches' Perspective");
            expect(heading.tagName).toBe('H2');
        });

        it('has descriptive subtitle', () => {
            render(<CoachesPerspectiveSection {...defaultProps} />);

            expect(screen.getByText('What the coaches say')).toBeInTheDocument();
        });
    });

    describe('Transition Effects', () => {
        it('has transition effects on cards', () => {
            const { container } = render(<CoachesPerspectiveSection {...defaultProps} />);

            const cards = container.querySelectorAll('.transition-all');
            expect(cards.length).toBeGreaterThan(0);
        });
    });

    describe('Empty State', () => {
        it('shows empty state for owners with no testimonials', () => {
            const emptyProps = {
                ...defaultProps,
                testimonials: [],
                isOwner: true,
            };

            render(<CoachesPerspectiveSection {...emptyProps} />);

            expect(screen.getByText('No Testimonials Yet')).toBeInTheDocument();
        });

        it('hides section for non-owners with no testimonials', () => {
            const emptyProps = {
                ...defaultProps,
                testimonials: [],
                isOwner: false,
            };

            const { container } = render(<CoachesPerspectiveSection {...emptyProps} />);

            expect(container.querySelector('section')).not.toBeInTheDocument();
        });
    });
});
