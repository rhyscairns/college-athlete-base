import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CoachesPerspectiveSection } from '../CoachesPerspectiveSection';

describe('CoachesPerspectiveSection - Empty State', () => {
    const emptyTestimonials: any[] = [];

    describe('when testimonials array is empty', () => {
        it('should hide section for non-owners', () => {
            const { container } = render(
                <CoachesPerspectiveSection
                    testimonials={emptyTestimonials}
                    isOwner={false}
                />
            );

            // Section should not be rendered at all
            const section = container.querySelector('section');
            expect(section).not.toBeInTheDocument();
        });

        it('should show empty state for owners', () => {
            render(
                <CoachesPerspectiveSection
                    testimonials={emptyTestimonials}
                    isOwner={true}
                />
            );

            // Should show empty state message
            expect(screen.getByText('No Testimonials Yet')).toBeInTheDocument();
            expect(
                screen.getByText(/Add testimonials from coaches who have worked with you/i)
            ).toBeInTheDocument();
        });

        it('should show "Add Content" button for owners', () => {
            const mockOnEdit = jest.fn();
            render(
                <CoachesPerspectiveSection
                    testimonials={emptyTestimonials}
                    isOwner={true}
                    onEdit={mockOnEdit}
                />
            );

            const addButton = screen.getByRole('button', { name: /add content/i });
            expect(addButton).toBeInTheDocument();
        });

        it('should call onEdit when "Add Content" button is clicked', async () => {
            const user = userEvent.setup();
            const mockOnEdit = jest.fn();

            render(
                <CoachesPerspectiveSection
                    testimonials={emptyTestimonials}
                    isOwner={true}
                    onEdit={mockOnEdit}
                />
            );

            const addButton = screen.getByRole('button', { name: /add content/i });
            await user.click(addButton);

            expect(mockOnEdit).toHaveBeenCalledTimes(1);
        });

        it('should show testimonial icon in empty state', () => {
            render(
                <CoachesPerspectiveSection
                    testimonials={emptyTestimonials}
                    isOwner={true}
                />
            );

            // Check for the icon emoji in the empty state
            expect(screen.getByText('💬')).toBeInTheDocument();
        });

        it('should not show section header for empty state', () => {
            render(
                <CoachesPerspectiveSection
                    testimonials={emptyTestimonials}
                    isOwner={true}
                />
            );

            // Header is only shown when there's data, not in empty state
            expect(screen.queryByText("Coaches' Perspective")).not.toBeInTheDocument();
        });

        it('should show "Add Content" button in empty state', () => {
            render(
                <CoachesPerspectiveSection
                    testimonials={emptyTestimonials}
                    isOwner={true}
                    onEdit={jest.fn()}
                />
            );

            // The Add Content button should be present in the empty state
            const addButton = screen.getByText('Add Content');
            expect(addButton).toBeInTheDocument();
        });
    });

    describe('when testimonials array has data', () => {
        const mockTestimonials = [
            {
                id: '1',
                quote: 'Marcus is an exceptional player.',
                coachName: 'Coach Miller',
                coachTitle: 'Head Coach',
                coachOrganization: 'Westlake High School',
            },
        ];

        it('should show testimonials for non-owners', () => {
            render(
                <CoachesPerspectiveSection
                    testimonials={mockTestimonials}
                    isOwner={false}
                />
            );

            expect(screen.getByText('Marcus is an exceptional player.')).toBeInTheDocument();
            expect(screen.getByText('Coach Miller')).toBeInTheDocument();
        });

        it('should show testimonials for owners', () => {
            render(
                <CoachesPerspectiveSection
                    testimonials={mockTestimonials}
                    isOwner={true}
                />
            );

            expect(screen.getByText('Marcus is an exceptional player.')).toBeInTheDocument();
            expect(screen.getByText('Coach Miller')).toBeInTheDocument();
        });

        it('should not show empty state when data exists', () => {
            render(
                <CoachesPerspectiveSection
                    testimonials={mockTestimonials}
                    isOwner={true}
                />
            );

            expect(screen.queryByText('No Testimonials Yet')).not.toBeInTheDocument();
        });
    });

    describe('accessibility', () => {
        it('should have proper section structure for empty state', () => {
            const { container } = render(
                <CoachesPerspectiveSection
                    testimonials={emptyTestimonials}
                    isOwner={true}
                />
            );

            const section = container.querySelector('section');
            expect(section).toHaveAttribute('id', 'coaches');
        });

        it('should have accessible button label', () => {
            const mockOnEdit = jest.fn();
            render(
                <CoachesPerspectiveSection
                    testimonials={emptyTestimonials}
                    isOwner={true}
                    onEdit={mockOnEdit}
                />
            );

            const addButton = screen.getByRole('button', { name: /add content/i });
            expect(addButton).toHaveAttribute('aria-label', 'Add content to this section');
        });
    });
});
