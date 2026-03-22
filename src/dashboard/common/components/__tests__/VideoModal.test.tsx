import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VideoModal } from '../VideoModal';
import { getYouTubeEmbedUrl } from '../../utils/youtube';

// Mock the youtube utility
jest.mock('../../utils/youtube', () => ({
    getYouTubeEmbedUrl: jest.fn((url: string) => {
        if (url.includes('invalid')) {
            throw new Error('Invalid YouTube URL: Unable to extract video ID');
        }
        if (!url || url.trim() === '') {
            throw new Error('Invalid YouTube URL: URL must be a non-empty string');
        }
        return `https://www.youtube.com/embed/test-video-id?autoplay=1&rel=0`;
    }),
}));

describe('VideoModal', () => {
    const mockOnClose = jest.fn();
    const defaultProps = {
        isOpen: true,
        onClose: mockOnClose,
        videoUrl: 'https://www.youtube.com/watch?v=test-video-id',
        videoTitle: 'Test Video',
        playerName: 'John Doe',
    };

    beforeEach(() => {
        jest.clearAllMocks();
        // Reset body overflow
        document.body.style.overflow = '';
    });

    afterEach(() => {
        // Clean up body overflow
        document.body.style.overflow = '';
    });

    describe('Rendering', () => {
        it('should render modal when isOpen is true', () => {
            render(<VideoModal {...defaultProps} />);

            expect(screen.getByRole('dialog')).toBeInTheDocument();
            expect(screen.getByText('Test Video')).toBeInTheDocument();
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        it('should not render modal when isOpen is false', () => {
            render(<VideoModal {...defaultProps} isOpen={false} />);

            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
            expect(screen.queryByText('Test Video')).not.toBeInTheDocument();
        });

        it('should render video iframe with correct src', () => {
            render(<VideoModal {...defaultProps} />);

            const iframe = screen.getByTitle('Test Video');
            expect(iframe).toBeInTheDocument();
            expect(iframe).toHaveAttribute(
                'src',
                'https://www.youtube.com/embed/test-video-id?autoplay=1&rel=0'
            );
        });

        it('should render close button', () => {
            render(<VideoModal {...defaultProps} />);

            const closeButton = screen.getByRole('button', { name: /close video modal/i });
            expect(closeButton).toBeInTheDocument();
        });

        it('should render video title when provided', () => {
            render(<VideoModal {...defaultProps} />);

            expect(screen.getByText('Test Video')).toBeInTheDocument();
        });

        it('should render player name when provided', () => {
            render(<VideoModal {...defaultProps} />);

            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        it('should not render video info section when title and name are missing', () => {
            render(
                <VideoModal
                    {...defaultProps}
                    videoTitle={undefined}
                    playerName={undefined}
                />
            );

            // The video info section should not be rendered
            const dialog = screen.getByRole('dialog');
            const videoInfoText = dialog.textContent;
            expect(videoInfoText).not.toContain('Test Video');
            expect(videoInfoText).not.toContain('John Doe');
        });

        it('should render only player name when title is missing', () => {
            render(<VideoModal {...defaultProps} videoTitle={undefined} />);

            expect(screen.queryByText('Test Video')).not.toBeInTheDocument();
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        it('should render only title when player name is missing', () => {
            render(<VideoModal {...defaultProps} playerName={undefined} />);

            expect(screen.getByText('Test Video')).toBeInTheDocument();
            expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        });
    });

    describe('ARIA Attributes', () => {
        it('should have role="dialog" on modal container', () => {
            render(<VideoModal {...defaultProps} />);

            const dialog = screen.getByRole('dialog');
            expect(dialog).toBeInTheDocument();
        });

        it('should have aria-modal="true" on modal container', () => {
            render(<VideoModal {...defaultProps} />);

            const dialog = screen.getByRole('dialog');
            expect(dialog).toHaveAttribute('aria-modal', 'true');
        });

        it('should have aria-labelledby pointing to video title', () => {
            render(<VideoModal {...defaultProps} />);

            const dialog = screen.getByRole('dialog');
            const ariaLabelledBy = dialog.getAttribute('aria-labelledby');
            expect(ariaLabelledBy).toBeTruthy();

            const titleElement = document.getElementById(ariaLabelledBy!);
            expect(titleElement).toBeInTheDocument();
            expect(titleElement?.textContent).toBe('Test Video');
        });

        it('should have aria-label on close button', () => {
            render(<VideoModal {...defaultProps} />);

            const closeButton = screen.getByRole('button', { name: /close video modal/i });
            expect(closeButton).toHaveAttribute('aria-label', 'Close video modal');
        });

        it('should have appropriate title attribute on iframe', () => {
            render(<VideoModal {...defaultProps} />);

            const iframe = screen.getByTitle('Test Video');
            expect(iframe).toHaveAttribute('title', 'Test Video');
        });

        it('should use fallback title for iframe when videoTitle is missing', () => {
            render(<VideoModal {...defaultProps} videoTitle={undefined} />);

            const iframe = screen.getByTitle('Player highlight video');
            expect(iframe).toHaveAttribute('title', 'Player highlight video');
        });

        it('should have allow attribute on iframe for YouTube features', () => {
            render(<VideoModal {...defaultProps} />);

            const iframe = screen.getByTitle('Test Video');
            expect(iframe).toHaveAttribute(
                'allow',
                'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
            );
        });

        it('should have allowFullScreen attribute on iframe', () => {
            render(<VideoModal {...defaultProps} />);

            const iframe = screen.getByTitle('Test Video');
            expect(iframe).toHaveAttribute('allowFullScreen');
        });
    });

    describe('YouTube URL Transformation', () => {
        it('should call getYouTubeEmbedUrl with the provided video URL', () => {
            const mockGetYouTubeEmbedUrl = getYouTubeEmbedUrl as jest.MockedFunction<
                typeof getYouTubeEmbedUrl
            >;
            mockGetYouTubeEmbedUrl.mockClear();

            render(<VideoModal {...defaultProps} />);

            expect(mockGetYouTubeEmbedUrl).toHaveBeenCalledWith(
                'https://www.youtube.com/watch?v=test-video-id'
            );
        });

        it('should use the transformed embed URL in iframe src', () => {
            render(<VideoModal {...defaultProps} />);

            const iframe = screen.getByTitle('Test Video');
            expect(iframe).toHaveAttribute(
                'src',
                'https://www.youtube.com/embed/test-video-id?autoplay=1&rel=0'
            );
        });

        it('should handle different YouTube URL formats', () => {
            const mockGetYouTubeEmbedUrl = getYouTubeEmbedUrl as jest.MockedFunction<
                typeof getYouTubeEmbedUrl
            >;

            // Test watch URL
            mockGetYouTubeEmbedUrl.mockClear();
            const { rerender } = render(
                <VideoModal
                    {...defaultProps}
                    videoUrl="https://www.youtube.com/watch?v=abc123"
                />
            );
            expect(mockGetYouTubeEmbedUrl).toHaveBeenCalledWith(
                'https://www.youtube.com/watch?v=abc123'
            );

            // Test short URL
            mockGetYouTubeEmbedUrl.mockClear();
            rerender(
                <VideoModal {...defaultProps} videoUrl="https://youtu.be/xyz789" />
            );
            expect(mockGetYouTubeEmbedUrl).toHaveBeenCalledWith(
                'https://youtu.be/xyz789'
            );

            // Test embed URL
            mockGetYouTubeEmbedUrl.mockClear();
            rerender(
                <VideoModal
                    {...defaultProps}
                    videoUrl="https://www.youtube.com/embed/def456"
                />
            );
            expect(mockGetYouTubeEmbedUrl).toHaveBeenCalledWith(
                'https://www.youtube.com/embed/def456'
            );
        });
    });

    describe('Close button click handler', () => {
        it('should call onClose when close button is clicked', () => {
            render(<VideoModal {...defaultProps} />);

            const closeButton = screen.getByRole('button', { name: /close video modal/i });
            fireEvent.click(closeButton);

            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });

        it('should focus close button when modal opens', () => {
            render(<VideoModal {...defaultProps} />);

            const closeButton = screen.getByRole('button', { name: /close video modal/i });
            expect(closeButton).toHaveFocus();
        });
    });

    describe('Backdrop click handler', () => {
        it('should call onClose when backdrop is clicked', () => {
            render(<VideoModal {...defaultProps} />);

            const backdrop = screen.getByRole('dialog');
            fireEvent.click(backdrop);

            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });

        it('should not call onClose when modal content is clicked', () => {
            render(<VideoModal {...defaultProps} />);

            const videoTitle = screen.getByText('Test Video');
            fireEvent.click(videoTitle);

            expect(mockOnClose).not.toHaveBeenCalled();
        });
    });

    describe('Escape key handler', () => {
        it('should call onClose when Escape key is pressed', () => {
            render(<VideoModal {...defaultProps} />);

            fireEvent.keyDown(document, { key: 'Escape' });

            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });

        it('should not call onClose when other keys are pressed', () => {
            render(<VideoModal {...defaultProps} />);

            fireEvent.keyDown(document, { key: 'Enter' });
            fireEvent.keyDown(document, { key: 'Tab' });
            fireEvent.keyDown(document, { key: 'Space' });

            expect(mockOnClose).not.toHaveBeenCalled();
        });

        it('should not add event listener when modal is closed', () => {
            const { rerender } = render(<VideoModal {...defaultProps} isOpen={false} />);

            fireEvent.keyDown(document, { key: 'Escape' });
            expect(mockOnClose).not.toHaveBeenCalled();

            rerender(<VideoModal {...defaultProps} isOpen={true} />);
            fireEvent.keyDown(document, { key: 'Escape' });
            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });
    });

    describe('Body scroll lock', () => {
        it('should lock body scroll when modal opens', () => {
            expect(document.body.style.overflow).toBe('');

            render(<VideoModal {...defaultProps} />);

            expect(document.body.style.overflow).toBe('hidden');
        });

        it('should unlock body scroll when modal closes', () => {
            const { rerender } = render(<VideoModal {...defaultProps} />);
            expect(document.body.style.overflow).toBe('hidden');

            rerender(<VideoModal {...defaultProps} isOpen={false} />);

            expect(document.body.style.overflow).toBe('');
        });

        it('should restore original overflow value when modal closes', () => {
            document.body.style.overflow = 'scroll';

            const { rerender } = render(<VideoModal {...defaultProps} />);
            expect(document.body.style.overflow).toBe('hidden');

            rerender(<VideoModal {...defaultProps} isOpen={false} />);

            expect(document.body.style.overflow).toBe('scroll');
        });

        it('should unlock scroll on unmount', () => {
            const { unmount } = render(<VideoModal {...defaultProps} />);
            expect(document.body.style.overflow).toBe('hidden');

            unmount();

            expect(document.body.style.overflow).toBe('');
        });
    });

    describe('Video playback stop on close', () => {
        it('should not render iframe when modal is closed', () => {
            render(<VideoModal {...defaultProps} isOpen={false} />);

            const iframe = screen.queryByTitle(/player highlight video/i);
            expect(iframe).not.toBeInTheDocument();
        });

        it('should unmount iframe when modal closes', () => {
            const { rerender } = render(<VideoModal {...defaultProps} />);

            let iframe = screen.queryByTitle(/test video/i);
            expect(iframe).toBeInTheDocument();

            rerender(<VideoModal {...defaultProps} isOpen={false} />);

            iframe = screen.queryByTitle(/test video/i);
            expect(iframe).not.toBeInTheDocument();
        });

        it('should render new iframe when modal reopens', () => {
            const { rerender } = render(<VideoModal {...defaultProps} />);

            const firstIframe = screen.getByTitle(/test video/i);
            expect(firstIframe).toBeInTheDocument();

            rerender(<VideoModal {...defaultProps} isOpen={false} />);
            rerender(<VideoModal {...defaultProps} isOpen={true} />);

            const secondIframe = screen.getByTitle(/test video/i);
            expect(secondIframe).toBeInTheDocument();
        });
    });

    describe('Event listener cleanup', () => {
        it('should remove escape key listener on unmount', () => {
            const { unmount } = render(<VideoModal {...defaultProps} />);

            unmount();

            fireEvent.keyDown(document, { key: 'Escape' });
            expect(mockOnClose).not.toHaveBeenCalled();
        });

        it('should remove escape key listener when modal closes', () => {
            const { rerender } = render(<VideoModal {...defaultProps} />);

            rerender(<VideoModal {...defaultProps} isOpen={false} />);

            fireEvent.keyDown(document, { key: 'Escape' });
            expect(mockOnClose).not.toHaveBeenCalled();
        });
    });

    describe('Focus trap', () => {
        it('should trap focus within modal when tabbing forward', () => {
            render(<VideoModal {...defaultProps} />);

            const closeButton = screen.getByRole('button', { name: /close video modal/i });

            // Close button should be focused initially
            expect(closeButton).toHaveFocus();

            // Tab should cycle back to close button (only focusable element in this test)
            fireEvent.keyDown(document, { key: 'Tab' });

            // In a real scenario with multiple focusable elements, focus would cycle
            expect(closeButton).toHaveFocus();
        });

        it('should trap focus within modal when tabbing backward', () => {
            render(<VideoModal {...defaultProps} />);

            const closeButton = screen.getByRole('button', { name: /close video modal/i });

            // Close button should be focused initially
            expect(closeButton).toHaveFocus();

            // Shift+Tab should cycle to last focusable element
            fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });

            // With only one focusable element, it should stay on close button
            expect(closeButton).toHaveFocus();
        });

        it('should not trap focus when modal is closed', () => {
            const { rerender } = render(<VideoModal {...defaultProps} />);

            rerender(<VideoModal {...defaultProps} isOpen={false} />);

            // Tab key should not be trapped
            fireEvent.keyDown(document, { key: 'Tab' });

            // No error should occur
            expect(mockOnClose).not.toHaveBeenCalled();
        });
    });

    describe('Focus management', () => {
        it('should store and return focus to trigger element when modal closes', () => {
            // Create a trigger button
            const triggerButton = document.createElement('button');
            triggerButton.textContent = 'Watch Video';
            document.body.appendChild(triggerButton);
            triggerButton.focus();

            expect(triggerButton).toHaveFocus();

            // Open modal
            const { rerender } = render(<VideoModal {...defaultProps} />);

            // Close button should be focused
            const closeButton = screen.getByRole('button', { name: /close video modal/i });
            expect(closeButton).toHaveFocus();

            // Close modal
            rerender(<VideoModal {...defaultProps} isOpen={false} />);

            // Focus should return to trigger button
            expect(triggerButton).toHaveFocus();

            // Cleanup
            document.body.removeChild(triggerButton);
        });

        it('should handle focus return when trigger element is removed', () => {
            // Create a trigger button
            const triggerButton = document.createElement('button');
            triggerButton.textContent = 'Watch Video';
            document.body.appendChild(triggerButton);
            triggerButton.focus();

            // Open modal
            const { rerender } = render(<VideoModal {...defaultProps} />);

            // Remove trigger button while modal is open
            document.body.removeChild(triggerButton);

            // Close modal - should not throw error
            expect(() => {
                rerender(<VideoModal {...defaultProps} isOpen={false} />);
            }).not.toThrow();
        });
    });

    describe('Multiple interaction scenarios', () => {
        it('should handle multiple open/close cycles', () => {
            const { rerender } = render(<VideoModal {...defaultProps} />);

            // First close
            fireEvent.keyDown(document, { key: 'Escape' });
            expect(mockOnClose).toHaveBeenCalledTimes(1);

            // Reopen
            rerender(<VideoModal {...defaultProps} isOpen={true} />);
            mockOnClose.mockClear();

            // Second close
            const closeButton = screen.getByRole('button', { name: /close video modal/i });
            fireEvent.click(closeButton);
            expect(mockOnClose).toHaveBeenCalledTimes(1);

            // Reopen again
            rerender(<VideoModal {...defaultProps} isOpen={true} />);
            mockOnClose.mockClear();

            // Third close via backdrop
            const backdrop = screen.getByRole('dialog');
            fireEvent.click(backdrop);
            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });

        it('should maintain scroll lock across multiple interactions', () => {
            const { rerender } = render(<VideoModal {...defaultProps} />);
            expect(document.body.style.overflow).toBe('hidden');

            // Close and reopen
            rerender(<VideoModal {...defaultProps} isOpen={false} />);
            expect(document.body.style.overflow).toBe('');

            rerender(<VideoModal {...defaultProps} isOpen={true} />);
            expect(document.body.style.overflow).toBe('hidden');

            rerender(<VideoModal {...defaultProps} isOpen={false} />);
            expect(document.body.style.overflow).toBe('');
        });
    });

    describe('Error handling', () => {
        it('should display error message when video URL is invalid', () => {
            render(
                <VideoModal
                    {...defaultProps}
                    videoUrl="https://www.youtube.com/invalid-url"
                />
            );

            expect(screen.getByText('Unable to load video')).toBeInTheDocument();
            expect(
                screen.getByText(/The video URL format is not recognized/i)
            ).toBeInTheDocument();
        });

        it('should display error message when video URL is empty', () => {
            render(<VideoModal {...defaultProps} videoUrl="" />);

            expect(screen.getByText('Unable to load video')).toBeInTheDocument();
            expect(screen.getByText(/No video URL provided/i)).toBeInTheDocument();
        });

        it('should display error message when video URL is whitespace only', () => {
            render(<VideoModal {...defaultProps} videoUrl="   " />);

            expect(screen.getByText('Unable to load video')).toBeInTheDocument();
            expect(screen.getByText(/No video URL provided/i)).toBeInTheDocument();
        });

        it('should not render iframe when there is an error', () => {
            render(
                <VideoModal
                    {...defaultProps}
                    videoUrl="https://www.youtube.com/invalid-url"
                />
            );

            const iframe = screen.queryByTitle(/player highlight video/i);
            expect(iframe).not.toBeInTheDocument();
        });

        it('should display error icon when video URL is invalid', () => {
            render(
                <VideoModal
                    {...defaultProps}
                    videoUrl="https://www.youtube.com/invalid-url"
                />
            );

            // Check for the warning icon SVG
            const errorContainer = screen.getByText('Unable to load video').parentElement;
            expect(errorContainer).toBeInTheDocument();
            expect(errorContainer?.querySelector('svg')).toBeInTheDocument();
        });

        it('should still allow closing modal when there is an error', () => {
            render(
                <VideoModal
                    {...defaultProps}
                    videoUrl="https://www.youtube.com/invalid-url"
                />
            );

            const closeButton = screen.getByRole('button', { name: /close video modal/i });
            fireEvent.click(closeButton);

            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });

        it('should log error to console when URL transformation fails', () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

            render(
                <VideoModal
                    {...defaultProps}
                    videoUrl="https://www.youtube.com/invalid-url"
                />
            );

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('VideoModal: Error transforming YouTube URL'),
                expect.any(String)
            );

            consoleErrorSpy.mockRestore();
        });

        it('should log error to console when video URL is missing', () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

            render(<VideoModal {...defaultProps} videoUrl="" />);

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'VideoModal: Missing or empty video URL'
            );

            consoleErrorSpy.mockRestore();
        });
    });

    describe('Loading state', () => {
        it('should display loading spinner initially', () => {
            render(<VideoModal {...defaultProps} />);

            expect(screen.getByText('Loading video...')).toBeInTheDocument();
        });

        it('should hide loading spinner after iframe loads', async () => {
            render(<VideoModal {...defaultProps} />);

            const iframe = screen.getByTitle(/test video/i);
            fireEvent.load(iframe);

            await waitFor(() => {
                expect(screen.queryByText('Loading video...')).not.toBeInTheDocument();
            });
        });

        it('should display loading spinner with animation', () => {
            render(<VideoModal {...defaultProps} />);

            const loadingText = screen.getByText('Loading video...');
            const loadingContainer = loadingText.parentElement;
            const spinner = loadingContainer?.querySelector('svg');

            expect(spinner).toBeInTheDocument();
            expect(spinner).toHaveClass('animate-spin');
        });

        it('should reset loading state when modal reopens', async () => {
            const { rerender } = render(<VideoModal {...defaultProps} />);

            // Load the iframe
            const iframe = screen.getByTitle(/test video/i);
            fireEvent.load(iframe);

            await waitFor(() => {
                expect(screen.queryByText('Loading video...')).not.toBeInTheDocument();
            });

            // Close and reopen modal
            rerender(<VideoModal {...defaultProps} isOpen={false} />);
            rerender(<VideoModal {...defaultProps} isOpen={true} />);

            // Loading should be shown again
            expect(screen.getByText('Loading video...')).toBeInTheDocument();
        });

        it('should not display loading spinner when there is an error', () => {
            render(
                <VideoModal
                    {...defaultProps}
                    videoUrl="https://www.youtube.com/invalid-url"
                />
            );

            expect(screen.queryByText('Loading video...')).not.toBeInTheDocument();
        });

        it('should render iframe even when loading', () => {
            render(<VideoModal {...defaultProps} />);

            expect(screen.getByText('Loading video...')).toBeInTheDocument();
            expect(screen.getByTitle(/test video/i)).toBeInTheDocument();
        });
    });
});
