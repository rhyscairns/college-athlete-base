/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GameHighlightsSection } from '../GameHighlightsSection';

describe('GameHighlightsSection - Empty State', () => {
    const mockOnEdit = jest.fn();
    const mockOnSave = jest.fn();
    const mockOnCancel = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        // Mock scrollIntoView
        Element.prototype.scrollIntoView = jest.fn();
    });

    describe('Empty videos array', () => {
        it('should hide section for non-owners when videos array is empty', () => {
            const { container } = render(
                <GameHighlightsSection
                    videos={[]}
                    isOwner={false}
                    isEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            // Section should not be rendered at all
            expect(container.firstChild).toBeNull();
        });

        it('should show empty state for owners when videos array is empty', () => {
            render(
                <GameHighlightsSection
                    videos={[]}
                    isOwner={true}
                    isEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            // Should show empty state message
            expect(screen.getByText('No Videos Yet')).toBeInTheDocument();
            expect(
                screen.getByText(/Add highlight videos to showcase your best plays/i)
            ).toBeInTheDocument();
        });

        it('should show "Add Content" button for owners in empty state', () => {
            render(
                <GameHighlightsSection
                    videos={[]}
                    isOwner={true}
                    isEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            const addButton = screen.getByRole('button', { name: /add content/i });
            expect(addButton).toBeInTheDocument();
        });

        it('should call onEdit when "Add Content" button is clicked', () => {
            render(
                <GameHighlightsSection
                    videos={[]}
                    isOwner={true}
                    isEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            const addButton = screen.getByRole('button', { name: /add content/i });
            fireEvent.click(addButton);

            expect(mockOnEdit).toHaveBeenCalledTimes(1);
        });

        it('should show video icon in empty state', () => {
            render(
                <GameHighlightsSection
                    videos={[]}
                    isOwner={true}
                    isEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            // Check for the video emoji icon
            expect(screen.getByText('🎥')).toBeInTheDocument();
        });
    });

    describe('With videos data', () => {
        const mockVideos = [
            {
                id: '1',
                title: 'Highlight Reel 2024',
                description: 'Best plays from the season',
                url: 'https://example.com/video1',
                thumbnail: 'https://example.com/thumb1.jpg',
                duration: '3:45',
                isFeatured: true,
                date: '2024-01-15',
            },
            {
                id: '2',
                title: 'Championship Game',
                description: 'Final game highlights',
                url: 'https://example.com/video2',
                thumbnail: 'https://example.com/thumb2.jpg',
                duration: '2:30',
                isFeatured: false,
                date: '2024-02-01',
            },
        ];

        it('should show videos for owners when data exists', () => {
            render(
                <GameHighlightsSection
                    videos={mockVideos}
                    isOwner={true}
                    isEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            // Should show video titles
            expect(screen.getByText('Highlight Reel 2024')).toBeInTheDocument();
            expect(screen.getByText('Championship Game')).toBeInTheDocument();

            // Should NOT show empty state
            expect(screen.queryByText('No Videos Yet')).not.toBeInTheDocument();
        });

        it('should show videos for non-owners when data exists', () => {
            render(
                <GameHighlightsSection
                    videos={mockVideos}
                    isOwner={false}
                    isEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            // Should show video titles
            expect(screen.getByText('Highlight Reel 2024')).toBeInTheDocument();
            expect(screen.getByText('Championship Game')).toBeInTheDocument();

            // Should NOT show empty state
            expect(screen.queryByText('No Videos Yet')).not.toBeInTheDocument();
        });

        it('should show edit button for owners when data exists', () => {
            render(
                <GameHighlightsSection
                    videos={mockVideos}
                    isOwner={true}
                    isEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            // Should show the edit button in the header
            const editButton = screen.getByRole('button', { name: /edit/i });
            expect(editButton).toBeInTheDocument();
        });

        it('should not show edit button for non-owners when data exists', () => {
            render(
                <GameHighlightsSection
                    videos={mockVideos}
                    isOwner={false}
                    isEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            // Should NOT show the edit button
            expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
        });
    });

    describe('Edit mode', () => {
        it('should show edit form when isEditing is true, even with empty videos', () => {
            render(
                <GameHighlightsSection
                    videos={[]}
                    isOwner={true}
                    isEditing={true}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            // Should show edit form (check for save/cancel buttons)
            expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();

            // Should NOT show empty state when editing
            expect(screen.queryByText('No Videos Yet')).not.toBeInTheDocument();
        });
    });

    describe('Section visibility', () => {
        it('should render section header for owners even with empty videos', () => {
            render(
                <GameHighlightsSection
                    videos={[]}
                    isOwner={true}
                    isEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            // Section header should be visible
            expect(screen.getByText('Game Highlights')).toBeInTheDocument();
            expect(screen.getByText('Watch the action')).toBeInTheDocument();
        });

        it('should not render anything for non-owners with empty videos', () => {
            const { container } = render(
                <GameHighlightsSection
                    videos={[]}
                    isOwner={false}
                    isEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            // Nothing should be rendered
            expect(container.firstChild).toBeNull();
        });
    });
});
