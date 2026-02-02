import { render, screen, fireEvent } from '@testing-library/react';
import { StatsShowcase } from '../StatsShowcase';

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

describe('StatsShowcase - Empty State', () => {
    const emptyStats = {};

    describe('Empty stats for non-owner', () => {
        it('returns null and hides section when stats is empty and user is not owner', () => {
            const { container } = render(
                <StatsShowcase
                    stats={emptyStats}
                    isOwner={false}
                />
            );

            // Section should not be rendered
            expect(container.querySelector('section')).not.toBeInTheDocument();
        });

        it('returns null when stats has only empty values and user is not owner', () => {
            const statsWithEmptyValues = {
                'Receiving Yards': '',
                'Touchdowns': '',
            };

            const { container } = render(
                <StatsShowcase
                    stats={statsWithEmptyValues}
                    isOwner={false}
                />
            );

            // Section should not be rendered
            expect(container.querySelector('section')).not.toBeInTheDocument();
        });
    });

    describe('Empty stats for owner', () => {
        it('shows empty state with prompt when stats is empty and user is owner', () => {
            render(
                <StatsShowcase
                    stats={emptyStats}
                    isOwner={true}
                    onEdit={jest.fn()}
                />
            );

            // Should show empty state title and description
            expect(screen.getByText('No Stats Yet')).toBeInTheDocument();
            expect(screen.getByText(/Add your season statistics/i)).toBeInTheDocument();
        });

        it('shows "Add Content" button in empty state for owner', () => {
            render(
                <StatsShowcase
                    stats={emptyStats}
                    isOwner={true}
                    onEdit={jest.fn()}
                />
            );

            expect(screen.getByRole('button', { name: /add content/i })).toBeInTheDocument();
        });

        it('calls onEdit when "Add Content" button is clicked in empty state', () => {
            const onEdit = jest.fn();
            render(
                <StatsShowcase
                    stats={emptyStats}
                    isOwner={true}
                    onEdit={onEdit}
                />
            );

            fireEvent.click(screen.getByRole('button', { name: /add content/i }));
            expect(onEdit).toHaveBeenCalledTimes(1);
        });

        it('shows section header even in empty state', () => {
            render(
                <StatsShowcase
                    stats={emptyStats}
                    isOwner={true}
                    onEdit={jest.fn()}
                />
            );

            expect(screen.getByText('Season Statistics')).toBeInTheDocument();
            expect(screen.getByText(/Junior Year Performance/i)).toBeInTheDocument();
        });

        it('shows empty state icon', () => {
            render(
                <StatsShowcase
                    stats={emptyStats}
                    isOwner={true}
                    onEdit={jest.fn()}
                />
            );

            // Check for the stats icon emoji
            expect(screen.getByText('📊')).toBeInTheDocument();
        });

        it('shows edit form when isEditing is true even with empty stats', () => {
            render(
                <StatsShowcase
                    stats={emptyStats}
                    isOwner={true}
                    isEditing={true}
                    onEdit={jest.fn()}
                    onSave={jest.fn()}
                    onCancel={jest.fn()}
                />
            );

            // Edit form should show Save and Cancel buttons
            expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
        });
    });

    describe('Partial stats data', () => {
        it('shows normal view when at least one stat has a value', () => {
            const partialStats = {
                'Receiving Yards': '1,250',
                'Touchdowns': '',
                'Receptions': '',
            };

            render(
                <StatsShowcase
                    stats={partialStats}
                    isOwner={false}
                />
            );

            // Should show the stat with value
            expect(screen.getByText('1,250')).toBeInTheDocument();
            expect(screen.getByText('Receiving Yards')).toBeInTheDocument();
        });

        it('shows edit button for owner when partial stats exist', () => {
            const partialStats = {
                'Receiving Yards': '1,250',
                'Touchdowns': '',
            };

            render(
                <StatsShowcase
                    stats={partialStats}
                    isOwner={true}
                    isEditing={false}
                    onEdit={jest.fn()}
                />
            );

            expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
        });
    });

    describe('Edge cases', () => {
        it('handles null stats gracefully for non-owner', () => {
            const { container } = render(
                <StatsShowcase
                    stats={null as any}
                    isOwner={false}
                />
            );

            // Section should not be rendered
            expect(container.querySelector('section')).not.toBeInTheDocument();
        });

        it('shows empty state for owner when stats is null', () => {
            render(
                <StatsShowcase
                    stats={null as any}
                    isOwner={true}
                    onEdit={jest.fn()}
                />
            );

            expect(screen.getByText('No Stats Yet')).toBeInTheDocument();
        });

        it('handles undefined stats gracefully for non-owner', () => {
            const { container } = render(
                <StatsShowcase
                    stats={undefined as any}
                    isOwner={false}
                />
            );

            // Section should not be rendered
            expect(container.querySelector('section')).not.toBeInTheDocument();
        });
    });
});
