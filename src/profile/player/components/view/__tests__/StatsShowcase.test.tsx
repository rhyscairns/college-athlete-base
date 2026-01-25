import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StatsShowcase } from '../StatsShowcase';

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

describe('StatsShowcase', () => {
    const mockStats = {
        receivingYards: 1250,
        touchdowns: 12,
        receptions: 68,
        yardsPerCatch: 18.4,
        longestReception: 78,
    };

    it('renders section title', () => {
        render(<StatsShowcase stats={mockStats} />);

        expect(screen.getByText('Season Statistics')).toBeInTheDocument();
    });

    it('renders all stat cards', () => {
        render(<StatsShowcase stats={mockStats} />);

        expect(screen.getByText('1,250')).toBeInTheDocument();
        expect(screen.getByText('12')).toBeInTheDocument();
        expect(screen.getByText('68')).toBeInTheDocument();
        expect(screen.getByText('18.4')).toBeInTheDocument();
        expect(screen.getByText('78')).toBeInTheDocument();
    });

    it('renders stat labels', () => {
        render(<StatsShowcase stats={mockStats} />);

        expect(screen.getByText('Receiving Yards')).toBeInTheDocument();
        expect(screen.getByText('Touchdowns')).toBeInTheDocument();
        expect(screen.getByText('Receptions')).toBeInTheDocument();
        expect(screen.getByText('Yards/Catch')).toBeInTheDocument();
        expect(screen.getByText('Longest Reception')).toBeInTheDocument();
    });

    it('has correct section id for navigation', () => {
        const { container } = render(<StatsShowcase stats={mockStats} />);

        const section = container.querySelector('section');
        expect(section).toHaveAttribute('id', 'stats');
    });

    describe('Inline Editing', () => {
        it('shows edit button when isOwner is true and not editing', () => {
            render(
                <StatsShowcase
                    stats={mockStats}
                    isOwner={true}
                    isEditing={false}
                    isAnyOtherSectionEditing={false}
                    onEdit={jest.fn()}
                    onSave={jest.fn()}
                    onCancel={jest.fn()}
                />
            );

            expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
        });

        it('does not show edit button when isOwner is false', () => {
            render(
                <StatsShowcase
                    stats={mockStats}
                    isOwner={false}
                    isEditing={false}
                    isAnyOtherSectionEditing={false}
                    onEdit={jest.fn()}
                    onSave={jest.fn()}
                    onCancel={jest.fn()}
                />
            );

            expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
        });

        it('calls onEdit when edit button is clicked', () => {
            const onEdit = jest.fn();
            render(
                <StatsShowcase
                    stats={mockStats}
                    isOwner={true}
                    isEditing={false}
                    isAnyOtherSectionEditing={false}
                    onEdit={onEdit}
                    onSave={jest.fn()}
                    onCancel={jest.fn()}
                />
            );

            fireEvent.click(screen.getByRole('button', { name: /edit/i }));
            expect(onEdit).toHaveBeenCalledTimes(1);
        });

        it('disables edit button when another section is editing', () => {
            render(
                <StatsShowcase
                    stats={mockStats}
                    isOwner={true}
                    isEditing={false}
                    isAnyOtherSectionEditing={true}
                    onEdit={jest.fn()}
                    onSave={jest.fn()}
                    onCancel={jest.fn()}
                />
            );

            const editButton = screen.getByRole('button', { name: /edit/i });
            expect(editButton).toBeDisabled();
        });

        it('shows edit form when isEditing is true', () => {
            render(
                <StatsShowcase
                    stats={mockStats}
                    isOwner={true}
                    isEditing={true}
                    isAnyOtherSectionEditing={false}
                    onEdit={jest.fn()}
                    onSave={jest.fn()}
                    onCancel={jest.fn()}
                />
            );

            // Edit form should show Save and Cancel buttons
            expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
        });

        it('applies edit mode background when isEditing is true', () => {
            const { container } = render(
                <StatsShowcase
                    stats={mockStats}
                    isOwner={true}
                    isEditing={true}
                    isAnyOtherSectionEditing={false}
                    onEdit={jest.fn()}
                    onSave={jest.fn()}
                    onCancel={jest.fn()}
                />
            );

            const section = container.querySelector('section');
            expect(section).toHaveClass('bg-blue-500/5', 'border-blue-500/20');
        });

        it('calls onCancel when cancel button is clicked', () => {
            const onCancel = jest.fn();
            render(
                <StatsShowcase
                    stats={mockStats}
                    isOwner={true}
                    isEditing={true}
                    isAnyOtherSectionEditing={false}
                    onEdit={jest.fn()}
                    onSave={jest.fn()}
                    onCancel={onCancel}
                />
            );

            fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
            expect(onCancel).toHaveBeenCalledTimes(1);
        });

        it('calls onSave with updated data when save button is clicked', async () => {
            const onSave = jest.fn();
            render(
                <StatsShowcase
                    stats={mockStats}
                    isOwner={true}
                    isEditing={true}
                    isAnyOtherSectionEditing={false}
                    onEdit={jest.fn()}
                    onSave={onSave}
                    onCancel={jest.fn()}
                />
            );

            fireEvent.click(screen.getByRole('button', { name: /save/i }));

            await waitFor(() => {
                expect(onSave).toHaveBeenCalledTimes(1);
                expect(onSave).toHaveBeenCalledWith({
                    stats: expect.objectContaining({
                        receivingYards: 1250,
                        touchdowns: 12,
                        receptions: 68,
                        yardsPerCatch: 18.4,
                        longestReception: 78,
                    }),
                });
            });
        });

        it('resets form data when exiting edit mode', () => {
            const { rerender } = render(
                <StatsShowcase
                    stats={mockStats}
                    isOwner={true}
                    isEditing={true}
                    isAnyOtherSectionEditing={false}
                    onEdit={jest.fn()}
                    onSave={jest.fn()}
                    onCancel={jest.fn()}
                />
            );

            // Exit edit mode
            rerender(
                <StatsShowcase
                    stats={mockStats}
                    isOwner={true}
                    isEditing={false}
                    isAnyOtherSectionEditing={false}
                    onEdit={jest.fn()}
                    onSave={jest.fn()}
                    onCancel={jest.fn()}
                />
            );

            // Should show view mode again
            expect(screen.getByText('1,250')).toBeInTheDocument();
        });
    });
});
