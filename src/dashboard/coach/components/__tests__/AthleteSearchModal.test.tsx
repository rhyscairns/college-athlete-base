import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { AthleteSearchModal } from '../AthleteSearchModal';
import { buildSearchQueryString } from '../../utils/search';

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

// Mock the search utility
jest.mock('../../utils/search', () => ({
    buildSearchQueryString: jest.fn(),
}));

// Mock createPortal to render in place for testing
jest.mock('react-dom', () => ({
    ...jest.requireActual('react-dom'),
    createPortal: (node: React.ReactNode) => node,
}));

describe('AthleteSearchModal', () => {
    const mockPush = jest.fn();
    const mockOnClose = jest.fn();
    const mockCoachId = 'coach-123';

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
        });
        (buildSearchQueryString as jest.Mock).mockReturnValue('sport=Basketball&gpaMin=3.0');
    });

    afterEach(() => {
        // Clean up any scroll lock styles
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
    });

    describe('Modal Rendering', () => {
        it('should not render when isOpen is false', () => {
            render(
                <AthleteSearchModal
                    isOpen={false}
                    onClose={mockOnClose}
                    coachId={mockCoachId}
                />
            );

            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });

        it('should render when isOpen is true', () => {
            render(
                <AthleteSearchModal
                    isOpen={true}
                    onClose={mockOnClose}
                    coachId={mockCoachId}
                />
            );

            expect(screen.getByRole('dialog')).toBeInTheDocument();
            expect(screen.getByText('Search Athletes')).toBeInTheDocument();
        });

        it('should have proper ARIA attributes', () => {
            render(
                <AthleteSearchModal
                    isOpen={true}
                    onClose={mockOnClose}
                    coachId={mockCoachId}
                />
            );

            const dialog = screen.getByRole('dialog');
            expect(dialog).toHaveAttribute('aria-modal', 'true');
            expect(dialog).toHaveAttribute('aria-labelledby', 'search-modal-title');
        });

        it('should render close button with proper ARIA label', () => {
            render(
                <AthleteSearchModal
                    isOpen={true}
                    onClose={mockOnClose}
                    coachId={mockCoachId}
                />
            );

            const closeButton = screen.getByLabelText('Close search modal');
            expect(closeButton).toBeInTheDocument();
        });
    });

    describe('Modal Close Functionality', () => {
        it('should close modal when close button is clicked', async () => {
            const user = userEvent.setup();
            render(
                <AthleteSearchModal
                    isOpen={true}
                    onClose={mockOnClose}
                    coachId={mockCoachId}
                />
            );

            const closeButton = screen.getByLabelText('Close search modal');
            await user.click(closeButton);

            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });

        it('should close modal when Escape key is pressed', async () => {
            const user = userEvent.setup();
            render(
                <AthleteSearchModal
                    isOpen={true}
                    onClose={mockOnClose}
                    coachId={mockCoachId}
                />
            );

            await user.keyboard('{Escape}');

            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });

        it('should close modal when backdrop is clicked', async () => {
            const user = userEvent.setup();
            render(
                <AthleteSearchModal
                    isOpen={true}
                    onClose={mockOnClose}
                    coachId={mockCoachId}
                />
            );

            const backdrop = screen.getByRole('dialog');
            await user.click(backdrop);

            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });

        it('should not close modal when clicking inside modal content', async () => {
            const user = userEvent.setup();
            render(
                <AthleteSearchModal
                    isOpen={true}
                    onClose={mockOnClose}
                    coachId={mockCoachId}
                />
            );

            const modalTitle = screen.getByText('Search Athletes');
            await user.click(modalTitle);

            expect(mockOnClose).not.toHaveBeenCalled();
        });

        it('should close modal when Cancel button is clicked', async () => {
            const user = userEvent.setup();
            render(
                <AthleteSearchModal
                    isOpen={true}
                    onClose={mockOnClose}
                    coachId={mockCoachId}
                />
            );

            const cancelButton = screen.getByRole('button', { name: /cancel/i });
            await user.click(cancelButton);

            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });
    });

    describe('Scroll Lock', () => {
        it('should lock scroll when modal opens', () => {
            const { rerender } = render(
                <AthleteSearchModal
                    isOpen={false}
                    onClose={mockOnClose}
                    coachId={mockCoachId}
                />
            );

            expect(document.body.style.overflow).toBe('');

            rerender(
                <AthleteSearchModal
                    isOpen={true}
                    onClose={mockOnClose}
                    coachId={mockCoachId}
                />
            );

            expect(document.body.style.overflow).toBe('hidden');
            expect(document.body.style.position).toBe('fixed');
        });

        it('should restore scroll when modal closes', () => {
            const { rerender } = render(
                <AthleteSearchModal
                    isOpen={true}
                    onClose={mockOnClose}
                    coachId={mockCoachId}
                />
            );

            expect(document.body.style.overflow).toBe('hidden');

            rerender(
                <AthleteSearchModal
                    isOpen={false}
                    onClose={mockOnClose}
                    coachId={mockCoachId}
                />
            );

            expect(document.body.style.overflow).toBe('');
            expect(document.body.style.position).toBe('');
        });
    });

    describe('Form Submission', () => {
        it('should handle successful form submission and navigate to results', async () => {
            const user = userEvent.setup();
            render(
                <AthleteSearchModal
                    isOpen={true}
                    onClose={mockOnClose}
                    coachId={mockCoachId}
                />
            );

            // Fill in a filter
            const sportSelect = screen.getByLabelText(/sport/i);
            await user.selectOptions(sportSelect, 'Basketball');

            // Submit form
            const searchButton = screen.getByRole('button', { name: /^search$/i });
            await user.click(searchButton);

            await waitFor(() => {
                expect(buildSearchQueryString).toHaveBeenCalled();
                expect(mockPush).toHaveBeenCalledWith(
                    `/coach/dashboard/${mockCoachId}/search?sport=Basketball&gpaMin=3.0`
                );
                expect(mockOnClose).toHaveBeenCalled();
            });
        });

        it('should display error message on submission failure', async () => {
            const user = userEvent.setup();
            const errorMessage = 'Network error occurred';

            // Mock buildSearchQueryString to throw an error
            (buildSearchQueryString as jest.Mock).mockImplementation(() => {
                throw new Error(errorMessage);
            });

            render(
                <AthleteSearchModal
                    isOpen={true}
                    onClose={mockOnClose}
                    coachId={mockCoachId}
                />
            );

            // Fill in a filter
            const sportSelect = screen.getByLabelText(/sport/i);
            await user.selectOptions(sportSelect, 'Basketball');

            // Submit form
            const searchButton = screen.getByRole('button', { name: /^search$/i });
            await user.click(searchButton);

            await waitFor(() => {
                expect(screen.getByText(errorMessage)).toBeInTheDocument();
            });

            // Modal should remain open
            expect(mockOnClose).not.toHaveBeenCalled();
        });

        it('should clear error when Cancel is clicked', async () => {
            const user = userEvent.setup();

            // Mock to throw error
            (buildSearchQueryString as jest.Mock).mockImplementation(() => {
                throw new Error('Test error');
            });

            render(
                <AthleteSearchModal
                    isOpen={true}
                    onClose={mockOnClose}
                    coachId={mockCoachId}
                />
            );

            // Fill in a filter and submit to trigger error
            const sportSelect = screen.getByLabelText(/sport/i);
            await user.selectOptions(sportSelect, 'Basketball');
            const searchButton = screen.getByRole('button', { name: /^search$/i });
            await user.click(searchButton);

            await waitFor(() => {
                expect(screen.getByText('Test error')).toBeInTheDocument();
            });

            // Click cancel
            const cancelButton = screen.getByRole('button', { name: /cancel/i });
            await user.click(cancelButton);

            expect(mockOnClose).toHaveBeenCalled();
        });
    });

    describe('Integration with AthleteSearchForm', () => {
        it('should render AthleteSearchForm component', () => {
            render(
                <AthleteSearchModal
                    isOpen={true}
                    onClose={mockOnClose}
                    coachId={mockCoachId}
                />
            );

            // Check for form elements
            expect(screen.getByLabelText(/sport/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/desired division/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /^search$/i })).toBeInTheDocument();
        });
    });

    describe('Responsive Design', () => {
        it('should apply full-screen modal on mobile viewport', () => {
            render(
                <AthleteSearchModal
                    isOpen={true}
                    onClose={mockOnClose}
                    coachId={mockCoachId}
                />
            );

            const modalContent = screen.getByRole('dialog').querySelector('div[class*="relative"]');
            expect(modalContent).toHaveClass('w-full');
            expect(modalContent).toHaveClass('h-full');
            expect(modalContent).toHaveClass('md:h-auto');
            expect(modalContent).toHaveClass('md:max-w-2xl');
        });

        it('should apply rounded corners only on desktop', () => {
            render(
                <AthleteSearchModal
                    isOpen={true}
                    onClose={mockOnClose}
                    coachId={mockCoachId}
                />
            );

            const modalContent = screen.getByRole('dialog').querySelector('div[class*="relative"]');
            expect(modalContent).toHaveClass('md:rounded-xl');
        });

        it('should apply responsive padding to modal header', () => {
            render(
                <AthleteSearchModal
                    isOpen={true}
                    onClose={mockOnClose}
                    coachId={mockCoachId}
                />
            );

            const header = screen.getByText('Search Athletes').closest('div');
            expect(header).toHaveClass('px-4');
            expect(header).toHaveClass('sm:px-6');
            expect(header).toHaveClass('py-3');
            expect(header).toHaveClass('sm:py-4');
        });

        it('should apply responsive text size to modal title', () => {
            render(
                <AthleteSearchModal
                    isOpen={true}
                    onClose={mockOnClose}
                    coachId={mockCoachId}
                />
            );

            const title = screen.getByText('Search Athletes');
            expect(title).toHaveClass('text-xl');
            expect(title).toHaveClass('sm:text-2xl');
        });

        it('should apply responsive padding to modal content', () => {
            render(
                <AthleteSearchModal
                    isOpen={true}
                    onClose={mockOnClose}
                    coachId={mockCoachId}
                />
            );

            const content = screen.getByRole('dialog').querySelector('div[class*="flex-1"]');
            expect(content).toHaveClass('px-4');
            expect(content).toHaveClass('sm:px-6');
            expect(content).toHaveClass('py-3');
            expect(content).toHaveClass('sm:py-4');
        });

        it('should apply responsive icon size to close button', () => {
            render(
                <AthleteSearchModal
                    isOpen={true}
                    onClose={mockOnClose}
                    coachId={mockCoachId}
                />
            );

            const closeButton = screen.getByLabelText('Close search modal');
            const icon = closeButton.querySelector('svg');
            expect(icon).toHaveClass('w-5');
            expect(icon).toHaveClass('h-5');
            expect(icon).toHaveClass('sm:w-6');
            expect(icon).toHaveClass('sm:h-6');
        });

        it('should not apply padding to backdrop on mobile', () => {
            render(
                <AthleteSearchModal
                    isOpen={true}
                    onClose={mockOnClose}
                    coachId={mockCoachId}
                />
            );

            const backdrop = screen.getByRole('dialog');
            expect(backdrop).toHaveClass('md:p-4');
            expect(backdrop).not.toHaveClass('p-4');
        });
    });
});