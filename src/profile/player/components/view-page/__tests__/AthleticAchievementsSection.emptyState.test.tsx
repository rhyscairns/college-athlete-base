import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AthleticAchievementsSection } from '../AthleticAchievementsSection';

describe('AthleticAchievementsSection - Empty State', () => {
    const mockOnEdit = jest.fn();
    const mockOnSave = jest.fn();
    const mockOnCancel = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Empty achievements array', () => {
        it('should show empty state for owner when achievements array is empty', () => {
            render(
                <AthleticAchievementsSection
                    achievements={[]}
                    isOwner={true}
                    isEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            expect(screen.getByText('No Achievements Yet')).toBeInTheDocument();
            expect(
                screen.getByText(/Add your athletic achievements, honors, and awards/i)
            ).toBeInTheDocument();
            expect(screen.getByText('Add Content')).toBeInTheDocument();
        });

        it('should show trophy icon in empty state', () => {
            render(
                <AthleticAchievementsSection
                    achievements={[]}
                    isOwner={true}
                    isEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            expect(screen.getByText('🏆')).toBeInTheDocument();
        });

        it('should call onEdit when "Add Content" button is clicked', () => {
            render(
                <AthleticAchievementsSection
                    achievements={[]}
                    isOwner={true}
                    isEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            const addButton = screen.getByText('Add Content');
            fireEvent.click(addButton);

            expect(mockOnEdit).toHaveBeenCalledTimes(1);
        });

        it('should hide section for non-owner when achievements array is empty', () => {
            const { container } = render(
                <AthleticAchievementsSection
                    achievements={[]}
                    isOwner={false}
                    isEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            expect(container.firstChild).toBeNull();
        });

        it('should not show "Add Content" button for non-owner', () => {
            render(
                <AthleticAchievementsSection
                    achievements={[]}
                    isOwner={false}
                    isEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            expect(screen.queryByText('Add Content')).not.toBeInTheDocument();
        });
    });

    describe('With achievements data', () => {
        const mockAchievements = [
            {
                id: '1',
                icon: 'trophy',
                title: 'State Champion',
                description: '2023 State Championship Winner',
                color: 'yellow',
            },
            {
                id: '2',
                icon: 'medal',
                title: 'All-Conference',
                description: 'First Team All-Conference Selection',
                color: 'blue',
            },
        ];

        it('should not show empty state when achievements exist', () => {
            render(
                <AthleticAchievementsSection
                    achievements={mockAchievements}
                    isOwner={true}
                    isEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            expect(screen.queryByText('No Achievements Yet')).not.toBeInTheDocument();
            expect(screen.getByText('State Champion')).toBeInTheDocument();
            expect(screen.getByText('All-Conference')).toBeInTheDocument();
        });

        it('should show achievements for non-owner when data exists', () => {
            render(
                <AthleticAchievementsSection
                    achievements={mockAchievements}
                    isOwner={false}
                    isEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            expect(screen.getByText('State Champion')).toBeInTheDocument();
            expect(screen.getByText('All-Conference')).toBeInTheDocument();
        });
    });

    describe('Edit mode', () => {
        it('should not show empty state when in edit mode', () => {
            // Mock scrollIntoView
            Element.prototype.scrollIntoView = jest.fn();

            render(
                <AthleticAchievementsSection
                    achievements={[]}
                    isOwner={true}
                    isEditing={true}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            expect(screen.queryByText('No Achievements Yet')).not.toBeInTheDocument();
            // Edit form should be shown instead
        });
    });

    describe('Accessibility', () => {
        it('should have proper button accessibility for empty state', () => {
            render(
                <AthleticAchievementsSection
                    achievements={[]}
                    isOwner={true}
                    isEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            const addButton = screen.getByText('Add Content');
            expect(addButton).toHaveAttribute('aria-label', 'Add content to this section');
        });

        it('should have minimum touch target size for add button', () => {
            render(
                <AthleticAchievementsSection
                    achievements={[]}
                    isOwner={true}
                    isEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            const addButton = screen.getByText('Add Content');
            window.getComputedStyle(addButton);

            // Check that min-height is set (44px minimum for touch targets)
            expect(addButton.className).toContain('min-h-[44px]');
        });
    });
});
