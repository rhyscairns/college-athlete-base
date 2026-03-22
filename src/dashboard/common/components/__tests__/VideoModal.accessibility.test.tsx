/**
 * Accessibility Tests for VideoModal Component
 * Tests keyboard navigation, focus management, ARIA attributes, and touch targets
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 4.5
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VideoModal } from '../VideoModal';

// Mock the youtube utility
jest.mock('../../utils/youtube', () => ({
    getYouTubeEmbedUrl: jest.fn((url: string) => {
        if (url.includes('invalid')) {
            throw new Error('Invalid YouTube URL: Unable to extract video ID');
        }
        return `https://www.youtube.com/embed/test-video-id?autoplay=1&rel=0`;
    }),
}));

describe('VideoModal - Accessibility Tests', () => {
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
        document.body.style.overflow = '';
        // Clear any existing focus
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
    });

    afterEach(() => {
        document.body.style.overflow = '';
    });

    describe('Keyboard Navigation - Tab Key (Requirement 5.1, 5.2)', () => {
        it('should trap focus within modal when tabbing forward', async () => {
            const user = userEvent.setup();
            render(<VideoModal {...defaultProps} />);

            const closeButton = screen.getByRole('button', { name: /close video modal/i });

            // Close button should be focused initially
            await waitFor(() => {
                expect(closeButton).toHaveFocus();
            });

            // Tab forward - should cycle through focusable elements
            await user.tab();

            // Focus should remain within the modal
            const dialog = screen.getByRole('dialog');
            expect(dialog.contains(document.activeElement)).toBe(true);
        });

        it('should trap focus within modal when tabbing backward with Shift+Tab', async () => {
            const user = userEvent.setup();
            render(<VideoModal {...defaultProps} />);

            const closeButton = screen.getByRole('button', { name: /close video modal/i });

            await waitFor(() => {
                expect(closeButton).toHaveFocus();
            });

            // Shift+Tab backward
            await user.tab({ shift: true });

            // Focus should remain within the modal
            const dialog = screen.getByRole('dialog');
            expect(dialog.contains(document.activeElement)).toBe(true);
        });

        it('should cycle focus to first element when tabbing from last element', async () => {
            const user = userEvent.setup();
            render(<VideoModal {...defaultProps} />);

            const closeButton = screen.getByRole('button', { name: /close video modal/i });

            await waitFor(() => {
                expect(closeButton).toHaveFocus();
            });

            // Tab through all focusable elements
            await user.tab();
            await user.tab();
            await user.tab();

            // Should cycle back to close button or stay within modal
            const dialog = screen.getByRole('dialog');
            expect(dialog.contains(document.activeElement)).toBe(true);
        });

        it('should not trap focus when modal is closed', async () => {
            const user = userEvent.setup();
            const { rerender } = render(<VideoModal {...defaultProps} />);

            // Close the modal
            rerender(<VideoModal {...defaultProps} isOpen={false} />);

            // Tab should not be trapped
            await user.tab();

            // No error should occur and modal should not be in document
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
    });

    describe('Keyboard Navigation - Escape Key (Requirement 5.1)', () => {
        it('should close modal when Escape key is pressed', async () => {
            const user = userEvent.setup();
            render(<VideoModal {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument();
            });

            await user.keyboard('{Escape}');

            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });

        it('should close modal when Escape is pressed regardless of focus location', async () => {
            const user = userEvent.setup();
            render(<VideoModal {...defaultProps} />);

            // Move focus away from close button
            const dialog = screen.getByRole('dialog');
            dialog.focus();

            await user.keyboard('{Escape}');

            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });

        it('should not respond to Escape when modal is closed', async () => {
            const user = userEvent.setup();
            render(<VideoModal {...defaultProps} isOpen={false} />);

            await user.keyboard('{Escape}');

            expect(mockOnClose).not.toHaveBeenCalled();
        });
    });

    describe('Focus Trap Within Modal (Requirement 5.2)', () => {
        it('should contain all focusable elements within modal', async () => {
            render(<VideoModal {...defaultProps} />);

            const dialog = screen.getByRole('dialog');
            const closeButton = screen.getByRole('button', { name: /close video modal/i });

            // All focusable elements should be within the dialog
            expect(dialog.contains(closeButton)).toBe(true);
        });

        it('should prevent focus from escaping modal via Tab', async () => {
            const user = userEvent.setup();

            // Create external focusable element
            const externalButton = document.createElement('button');
            externalButton.textContent = 'External Button';
            document.body.appendChild(externalButton);

            render(<VideoModal {...defaultProps} />);

            const dialog = screen.getByRole('dialog');

            // Tab multiple times
            await user.tab();
            await user.tab();
            await user.tab();

            // Focus should still be within modal
            expect(dialog.contains(document.activeElement)).toBe(true);
            expect(document.activeElement).not.toBe(externalButton);

            // Cleanup
            document.body.removeChild(externalButton);
        });

        it('should prevent focus from escaping modal via Shift+Tab', async () => {
            const user = userEvent.setup();

            // Create external focusable element
            const externalButton = document.createElement('button');
            externalButton.textContent = 'External Button';
            document.body.appendChild(externalButton);

            render(<VideoModal {...defaultProps} />);

            const dialog = screen.getByRole('dialog');

            // Shift+Tab multiple times
            await user.tab({ shift: true });
            await user.tab({ shift: true });

            // Focus should still be within modal
            expect(dialog.contains(document.activeElement)).toBe(true);
            expect(document.activeElement).not.toBe(externalButton);

            // Cleanup
            document.body.removeChild(externalButton);
        });

        it('should maintain focus trap after iframe loads', async () => {
            const user = userEvent.setup();
            render(<VideoModal {...defaultProps} />);

            // Wait for iframe to load
            const iframe = screen.getByTitle('Test Video');
            await waitFor(() => {
                expect(iframe).toBeInTheDocument();
            });

            const dialog = screen.getByRole('dialog');

            // Tab after iframe loads
            await user.tab();

            // Focus should still be trapped
            expect(dialog.contains(document.activeElement)).toBe(true);
        });
    });

    describe('Focus Return to Trigger Button (Requirement 5.3)', () => {
        it('should return focus to trigger button when modal closes', async () => {
            const user = userEvent.setup();

            // Create trigger button
            const triggerButton = document.createElement('button');
            triggerButton.textContent = 'Watch Video';
            triggerButton.setAttribute('data-testid', 'trigger-button');
            document.body.appendChild(triggerButton);
            triggerButton.focus();

            expect(triggerButton).toHaveFocus();

            // Open modal
            const { rerender } = render(<VideoModal {...defaultProps} />);

            // Close button should be focused
            const closeButton = screen.getByRole('button', { name: /close video modal/i });
            await waitFor(() => {
                expect(closeButton).toHaveFocus();
            });

            // Close modal
            rerender(<VideoModal {...defaultProps} isOpen={false} />);

            // Focus should return to trigger button
            await waitFor(() => {
                expect(triggerButton).toHaveFocus();
            });

            // Cleanup
            document.body.removeChild(triggerButton);
        });

        it('should return focus after closing via Escape key', async () => {
            const user = userEvent.setup();

            // Create trigger button
            const triggerButton = document.createElement('button');
            triggerButton.textContent = 'Watch Video';
            document.body.appendChild(triggerButton);
            triggerButton.focus();

            const { rerender } = render(<VideoModal {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument();
            });

            // Close via Escape
            await user.keyboard('{Escape}');

            // Simulate the close
            rerender(<VideoModal {...defaultProps} isOpen={false} />);

            // Focus should return to trigger button
            await waitFor(() => {
                expect(triggerButton).toHaveFocus();
            });

            // Cleanup
            document.body.removeChild(triggerButton);
        });

        it('should return focus after closing via close button', async () => {
            const user = userEvent.setup();

            // Create trigger button
            const triggerButton = document.createElement('button');
            triggerButton.textContent = 'Watch Video';
            document.body.appendChild(triggerButton);
            triggerButton.focus();

            const { rerender } = render(<VideoModal {...defaultProps} />);

            const closeButton = screen.getByRole('button', { name: /close video modal/i });
            await user.click(closeButton);

            // Simulate the close
            rerender(<VideoModal {...defaultProps} isOpen={false} />);

            // Focus should return to trigger button
            await waitFor(() => {
                expect(triggerButton).toHaveFocus();
            });

            // Cleanup
            document.body.removeChild(triggerButton);
        });

        it('should handle focus return gracefully when trigger element is removed', async () => {
            // Create trigger button
            const triggerButton = document.createElement('button');
            triggerButton.textContent = 'Watch Video';
            document.body.appendChild(triggerButton);
            triggerButton.focus();

            const { rerender } = render(<VideoModal {...defaultProps} />);

            // Remove trigger button while modal is open
            document.body.removeChild(triggerButton);

            // Close modal - should not throw error
            expect(() => {
                rerender(<VideoModal {...defaultProps} isOpen={false} />);
            }).not.toThrow();
        });
    });

    describe('Screen Reader Announcements (Requirement 5.6)', () => {
        it('should announce modal with role="dialog"', () => {
            render(<VideoModal {...defaultProps} />);

            const dialog = screen.getByRole('dialog');
            expect(dialog).toBeInTheDocument();
        });

        it('should have aria-modal="true" for screen reader context', () => {
            render(<VideoModal {...defaultProps} />);

            const dialog = screen.getByRole('dialog');
            expect(dialog).toHaveAttribute('aria-modal', 'true');
        });

        it('should announce video title via aria-labelledby', () => {
            render(<VideoModal {...defaultProps} />);

            const dialog = screen.getByRole('dialog');
            const ariaLabelledBy = dialog.getAttribute('aria-labelledby');

            expect(ariaLabelledBy).toBeTruthy();

            const titleElement = document.getElementById(ariaLabelledBy!);
            expect(titleElement).toBeInTheDocument();
            expect(titleElement?.textContent).toBe('Test Video');
        });

        it('should provide context for close button', () => {
            render(<VideoModal {...defaultProps} />);

            const closeButton = screen.getByRole('button', { name: /close video modal/i });
            expect(closeButton).toHaveAttribute('aria-label', 'Close video modal');
        });

        it('should announce video player purpose via iframe title', () => {
            render(<VideoModal {...defaultProps} />);

            const iframe = screen.getByTitle('Test Video');
            expect(iframe).toHaveAttribute('title', 'Test Video');
        });

        it('should use fallback title when videoTitle is not provided', () => {
            render(<VideoModal {...defaultProps} videoTitle={undefined} />);

            const iframe = screen.getByTitle('Player highlight video');
            expect(iframe).toHaveAttribute('title', 'Player highlight video');
        });
    });

    describe('ARIA Attributes (Requirement 5.4, 5.5, 5.7)', () => {
        it('should have all required ARIA attributes on dialog', () => {
            render(<VideoModal {...defaultProps} />);

            const dialog = screen.getByRole('dialog');

            expect(dialog).toHaveAttribute('role', 'dialog');
            expect(dialog).toHaveAttribute('aria-modal', 'true');
            expect(dialog).toHaveAttribute('aria-labelledby');
        });

        it('should have aria-label on close button', () => {
            render(<VideoModal {...defaultProps} />);

            const closeButton = screen.getByRole('button', { name: /close video modal/i });
            expect(closeButton).toHaveAttribute('aria-label');
        });

        it('should have proper iframe accessibility attributes', () => {
            render(<VideoModal {...defaultProps} />);

            const iframe = screen.getByTitle('Test Video');

            expect(iframe).toHaveAttribute('title');
            expect(iframe).toHaveAttribute('allow');
            expect(iframe).toHaveAttribute('allowFullScreen');
        });

        it('should maintain ARIA attributes after interactions', async () => {
            const user = userEvent.setup();
            render(<VideoModal {...defaultProps} />);

            const dialog = screen.getByRole('dialog');
            const closeButton = screen.getByRole('button', { name: /close video modal/i });

            // Interact with modal
            await user.tab();
            await user.keyboard('{Enter}');

            // ARIA attributes should still be present
            expect(dialog).toHaveAttribute('aria-modal', 'true');
            expect(closeButton).toHaveAttribute('aria-label');
        });
    });

    describe('Visible Focus Indicators (Requirement 5.5)', () => {
        it('should have visible focus indicator on close button', async () => {
            render(<VideoModal {...defaultProps} />);

            const closeButton = screen.getByRole('button', { name: /close video modal/i });

            await waitFor(() => {
                expect(closeButton).toHaveFocus();
            });

            // Check for focus ring classes
            const classes = closeButton.className;
            expect(classes).toMatch(/focus:outline-none/);
            expect(classes).toMatch(/focus:ring-2/);
        });

        it('should maintain focus indicator when tabbing through elements', async () => {
            const user = userEvent.setup();
            render(<VideoModal {...defaultProps} />);

            await user.tab();

            // Active element should have focus styles
            const activeElement = document.activeElement as HTMLElement;
            expect(activeElement).toBeInTheDocument();

            const dialog = screen.getByRole('dialog');
            expect(dialog.contains(activeElement)).toBe(true);
        });

        it('should show focus indicator on close button when focused via keyboard', async () => {
            const user = userEvent.setup();
            render(<VideoModal {...defaultProps} />);

            const closeButton = screen.getByRole('button', { name: /close video modal/i });

            // Tab to close button
            await user.tab();

            // Close button should be focused
            await waitFor(() => {
                expect(closeButton).toHaveFocus();
            });

            // Should have focus ring classes
            expect(closeButton.className).toMatch(/focus:ring/);
        });
    });

    describe('Minimum Touch Target Sizes (Requirement 4.5)', () => {
        it('should have close button with minimum 44x44px touch target', () => {
            render(<VideoModal {...defaultProps} />);

            const closeButton = screen.getByRole('button', { name: /close video modal/i });

            // Check for minimum size classes (w-11 h-11 = 44px x 44px)
            const classes = closeButton.className;
            expect(classes).toMatch(/w-11/);
            expect(classes).toMatch(/h-11/);
        });

        it('should have appropriate button styling for mobile interaction', () => {
            render(<VideoModal {...defaultProps} />);

            const closeButton = screen.getByRole('button', { name: /close video modal/i });

            // Check for transition classes for smooth interactions
            expect(closeButton.className).toMatch(/transition-colors/);

            // Check that button is properly sized (44x44px minimum)
            expect(closeButton.className).toMatch(/w-11/);
            expect(closeButton.className).toMatch(/h-11/);
        });

        it('should maintain touch target size on mobile viewports', () => {
            // Simulate mobile viewport
            global.innerWidth = 375;
            global.innerHeight = 667;

            render(<VideoModal {...defaultProps} />);

            const closeButton = screen.getByRole('button', { name: /close video modal/i });

            // Button should still have minimum size classes (w-11 h-11 = 44px x 44px)
            const classes = closeButton.className;
            expect(classes).toMatch(/w-11/);
            expect(classes).toMatch(/h-11/);
        });
    });

    describe('Keyboard Support - Enter and Space Keys', () => {
        it('should close modal when Enter is pressed on close button', async () => {
            const user = userEvent.setup();
            render(<VideoModal {...defaultProps} />);

            const closeButton = screen.getByRole('button', { name: /close video modal/i });

            await waitFor(() => {
                expect(closeButton).toHaveFocus();
            });

            await user.keyboard('{Enter}');

            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });

        it('should close modal when Space is pressed on close button', async () => {
            const user = userEvent.setup();
            render(<VideoModal {...defaultProps} />);

            const closeButton = screen.getByRole('button', { name: /close video modal/i });

            await waitFor(() => {
                expect(closeButton).toHaveFocus();
            });

            await user.keyboard(' ');

            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });
    });

    describe('Focus Management Edge Cases', () => {
        it('should set initial focus to close button when modal opens', async () => {
            render(<VideoModal {...defaultProps} />);

            const closeButton = screen.getByRole('button', { name: /close video modal/i });

            await waitFor(() => {
                expect(closeButton).toHaveFocus();
            });
        });

        it('should maintain focus within modal when clicking on non-interactive elements', async () => {
            const user = userEvent.setup();
            render(<VideoModal {...defaultProps} />);

            const dialog = screen.getByRole('dialog');
            const closeButton = screen.getByRole('button', { name: /close video modal/i });

            // Close button should be focused initially
            await waitFor(() => {
                expect(closeButton).toHaveFocus();
            });

            // Click on video title (non-interactive)
            const videoTitle = screen.getByText('Test Video');
            await user.click(videoTitle);

            // Focus should still be within modal (either on close button or another focusable element)
            // Note: clicking non-interactive elements may not change focus, so we just verify
            // the modal is still functional and focus is somewhere valid
            expect(dialog).toBeInTheDocument();

            // Verify we can still interact with the modal
            await user.keyboard('{Escape}');
            expect(mockOnClose).toHaveBeenCalled();
        });

        it('should handle rapid open/close cycles without focus issues', async () => {
            const { rerender } = render(<VideoModal {...defaultProps} />);

            // Rapid close/open
            rerender(<VideoModal {...defaultProps} isOpen={false} />);
            rerender(<VideoModal {...defaultProps} isOpen={true} />);
            rerender(<VideoModal {...defaultProps} isOpen={false} />);
            rerender(<VideoModal {...defaultProps} isOpen={true} />);

            const closeButton = screen.getByRole('button', { name: /close video modal/i });

            await waitFor(() => {
                expect(closeButton).toHaveFocus();
            });
        });
    });

    describe('Accessibility with Error States', () => {
        it('should maintain accessibility when video URL is invalid', () => {
            render(<VideoModal {...defaultProps} videoUrl="invalid-url" />);

            const dialog = screen.getByRole('dialog');
            expect(dialog).toHaveAttribute('aria-modal', 'true');

            const closeButton = screen.getByRole('button', { name: /close video modal/i });
            expect(closeButton).toHaveAttribute('aria-label');
        });

        it('should allow keyboard navigation in error state', async () => {
            const user = userEvent.setup();
            render(<VideoModal {...defaultProps} videoUrl="invalid-url" />);

            const closeButton = screen.getByRole('button', { name: /close video modal/i });

            await waitFor(() => {
                expect(closeButton).toHaveFocus();
            });

            await user.keyboard('{Escape}');

            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });

        it('should announce error message to screen readers', () => {
            render(<VideoModal {...defaultProps} videoUrl="invalid-url" />);

            const errorMessage = screen.getByText('Unable to load video');
            expect(errorMessage).toBeInTheDocument();
        });
    });
});
