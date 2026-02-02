import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GameHighlightsSection } from '../GameHighlightsSection';

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

describe('GameHighlightsSection', () => {
    const mockVideos = [
        {
            id: '1',
            title: 'Junior Season Highlights',
            description: 'Full season compilation',
            duration: '5:45',
            isFeatured: true,
            url: 'https://youtube.com/watch?v=123',
            thumbnail: '',
            date: '',
        },
        {
            id: '2',
            title: 'Season Opener',
            description: '',
            duration: '3:45',
            isFeatured: false,
            date: 'Sept 2023',
            url: 'https://youtube.com/watch?v=456',
            thumbnail: '',
        },
    ];

    it('renders section title', () => {
        render(<GameHighlightsSection videos={mockVideos} />);

        expect(screen.getByText('Game Highlights')).toBeInTheDocument();
    });

    it('renders featured video', () => {
        render(<GameHighlightsSection videos={mockVideos} />);

        expect(screen.getByText('Junior Season Highlights')).toBeInTheDocument();
        expect(screen.getByText('Full season compilation')).toBeInTheDocument();
        expect(screen.getByText('FEATURED')).toBeInTheDocument();
    });

    it('renders other videos', () => {
        render(<GameHighlightsSection videos={mockVideos} />);

        expect(screen.getByText('Season Opener')).toBeInTheDocument();
    });

    it('has correct section id for navigation', () => {
        const { container } = render(<GameHighlightsSection videos={mockVideos} />);

        const section = container.querySelector('section');
        expect(section).toHaveAttribute('id', 'highlights');
    });

    describe('Inline Editing', () => {
        it('shows edit button when user is owner', () => {
            render(
                <GameHighlightsSection
                    videos={mockVideos}
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

        it('hides edit button when user is not owner', () => {
            render(
                <GameHighlightsSection
                    videos={mockVideos}
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
                <GameHighlightsSection
                    videos={mockVideos}
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
                <GameHighlightsSection
                    videos={mockVideos}
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

        it('renders edit mode when isEditing is true', () => {
            render(
                <GameHighlightsSection
                    videos={mockVideos}
                    isOwner={true}
                    isEditing={true}
                    isAnyOtherSectionEditing={false}
                    onEdit={jest.fn()}
                    onSave={jest.fn()}
                    onCancel={jest.fn()}
                />
            );

            // Edit mode should show Save and Cancel buttons
            expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
        });

        it('applies edit mode background when isEditing is true', () => {
            const { container } = render(
                <GameHighlightsSection
                    videos={mockVideos}
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
                <GameHighlightsSection
                    videos={mockVideos}
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

        it('validates required fields before saving', async () => {
            const onSave = jest.fn();
            render(
                <GameHighlightsSection
                    videos={[
                        {
                            id: '1',
                            title: '',
                            description: '',
                            duration: '',
                            isFeatured: false,
                            url: '',
                            thumbnail: '',
                            date: '',
                        },
                    ]}
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
                expect(onSave).not.toHaveBeenCalled();
            });
        });

        it('validates URL format before saving', async () => {
            const onSave = jest.fn();
            render(
                <GameHighlightsSection
                    videos={[
                        {
                            id: '1',
                            title: 'Test Video',
                            description: '',
                            duration: '',
                            isFeatured: false,
                            url: 'invalid-url',
                            thumbnail: '',
                            date: '',
                        },
                    ]}
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
                expect(onSave).not.toHaveBeenCalled();
            });
        });

        it('calls onSave with updated data when validation passes', async () => {
            const onSave = jest.fn();
            render(
                <GameHighlightsSection
                    videos={mockVideos}
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
                expect(onSave).toHaveBeenCalledWith({
                    videos: mockVideos,
                });
            });
        });

        it('resets form data when exiting edit mode', () => {
            const { rerender } = render(
                <GameHighlightsSection
                    videos={mockVideos}
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
                <GameHighlightsSection
                    videos={mockVideos}
                    isOwner={true}
                    isEditing={false}
                    isAnyOtherSectionEditing={false}
                    onEdit={jest.fn()}
                    onSave={jest.fn()}
                    onCancel={jest.fn()}
                />
            );

            // Should show view mode
            expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
            expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
        });
    });
});
