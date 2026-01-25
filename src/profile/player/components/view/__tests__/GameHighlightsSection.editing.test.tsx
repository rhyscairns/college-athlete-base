import { render, screen, fireEvent } from '@testing-library/react';
import { GameHighlightsSection } from '../GameHighlightsSection';
import { mockPlayerData } from '../../../data/mockPlayerData';

Element.prototype.scrollIntoView = jest.fn();

describe('GameHighlightsSection - Inline Editing', () => {
    const defaultProps = {
        videos: mockPlayerData.videos,
        isOwner: true,
        isEditing: false,
        isAnyOtherSectionEditing: false,
        onEdit: jest.fn(),
        onSave: jest.fn(),
        onCancel: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Edit button visibility (Requirements 1.1, 1.2)', () => {
        it('shows edit button when user is the owner and not editing', () => {
            render(<GameHighlightsSection {...defaultProps} />);
            expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
        });

        it('hides edit button when user is not the owner', () => {
            render(<GameHighlightsSection {...defaultProps} isOwner={false} />);
            expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
        });

        it('hides edit button when section is in edit mode', () => {
            render(<GameHighlightsSection {...defaultProps} isEditing={true} />);
            expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
        });

        it('disables edit button when another section is being edited', () => {
            render(<GameHighlightsSection {...defaultProps} isAnyOtherSectionEditing={true} />);
            expect(screen.getByRole('button', { name: /edit/i })).toBeDisabled();
        });
    });

    describe('Entering edit mode (Requirements 1.3, 1.4)', () => {
        it('calls onEdit when edit button is clicked', () => {
            const onEdit = jest.fn();
            render(<GameHighlightsSection {...defaultProps} onEdit={onEdit} />);
            fireEvent.click(screen.getByRole('button', { name: /edit/i }));
            expect(onEdit).toHaveBeenCalledTimes(1);
        });

        it('displays Save and Cancel buttons in edit mode', () => {
            render(<GameHighlightsSection {...defaultProps} isEditing={true} />);
            expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
        });
    });

    describe('Exiting edit mode - Cancel (Requirements 1.4, 1.6)', () => {
        it('calls onCancel when cancel button is clicked', () => {
            const onCancel = jest.fn();
            render(<GameHighlightsSection {...defaultProps} isEditing={true} onCancel={onCancel} />);
            fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
            expect(onCancel).toHaveBeenCalledTimes(1);
        });
    });

    describe('Add video functionality (Requirements 10.2, 10.5)', () => {
        it('displays add video button in edit mode', () => {
            render(<GameHighlightsSection {...defaultProps} isEditing={true} />);
            expect(screen.getByRole('button', { name: /add video/i })).toBeInTheDocument();
        });
    });

    describe('Remove video functionality (Requirements 10.2, 10.5)', () => {
        it('displays remove button for each video in edit mode', () => {
            render(<GameHighlightsSection {...defaultProps} isEditing={true} />);
            expect(screen.getAllByRole('button', { name: /^remove$/i }).length).toBeGreaterThan(0);
        });
    });

    describe('Keyboard navigation (Requirements 1.6)', () => {
        it('cancels editing when Escape key is pressed', () => {
            const onCancel = jest.fn();
            render(<GameHighlightsSection {...defaultProps} isEditing={true} onCancel={onCancel} />);
            fireEvent.keyDown(document, { key: 'Escape' });
            expect(onCancel).toHaveBeenCalledTimes(1);
        });

        it('does not trigger Escape handler when not in edit mode', () => {
            const onCancel = jest.fn();
            render(<GameHighlightsSection {...defaultProps} isEditing={false} onCancel={onCancel} />);
            fireEvent.keyDown(document, { key: 'Escape' });
            expect(onCancel).not.toHaveBeenCalled();
        });
    });

    describe('View mode display', () => {
        it('displays videos in view mode', () => {
            render(<GameHighlightsSection {...defaultProps} isEditing={false} />);
            mockPlayerData.videos.forEach((video) => {
                expect(screen.getByText(video.title)).toBeInTheDocument();
            });
        });

        it('displays featured video prominently', () => {
            render(<GameHighlightsSection {...defaultProps} isEditing={false} />);
            expect(screen.getByText(/featured/i)).toBeInTheDocument();
        });
    });
});
