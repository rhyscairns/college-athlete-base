import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from '../Pagination';

describe('Pagination', () => {
    const mockOnPageChange = jest.fn();

    beforeEach(() => {
        mockOnPageChange.mockClear();
    });

    describe('Rendering', () => {
        it('should not render when totalPages is 1', () => {
            const { container } = render(
                <Pagination
                    currentPage={1}
                    totalPages={1}
                    onPageChange={mockOnPageChange}
                />
            );
            expect(container.firstChild).toBeNull();
        });

        it('should not render when totalPages is 0', () => {
            const { container } = render(
                <Pagination
                    currentPage={1}
                    totalPages={0}
                    onPageChange={mockOnPageChange}
                />
            );
            expect(container.firstChild).toBeNull();
        });

        it('should render previous and next buttons', () => {
            render(
                <Pagination
                    currentPage={2}
                    totalPages={5}
                    onPageChange={mockOnPageChange}
                />
            );

            expect(screen.getByLabelText('Go to previous page')).toBeInTheDocument();
            expect(screen.getByLabelText('Go to next page')).toBeInTheDocument();
        });

        it('should render page number buttons', () => {
            render(
                <Pagination
                    currentPage={1}
                    totalPages={5}
                    onPageChange={mockOnPageChange}
                />
            );

            expect(screen.getByLabelText('Current page, Page 1')).toBeInTheDocument();
            expect(screen.getByLabelText('Page 2')).toBeInTheDocument();
            expect(screen.getByLabelText('Page 3')).toBeInTheDocument();
            expect(screen.getByLabelText('Page 4')).toBeInTheDocument();
            expect(screen.getByLabelText('Page 5')).toBeInTheDocument();
        });
    });

    describe('First Page Behavior', () => {
        it('should disable previous button on first page', () => {
            render(
                <Pagination
                    currentPage={1}
                    totalPages={5}
                    onPageChange={mockOnPageChange}
                />
            );

            const previousButton = screen.getByLabelText('Go to previous page');
            expect(previousButton).toBeDisabled();
            expect(previousButton).toHaveClass('cursor-not-allowed');
        });

        it('should not call onPageChange when clicking disabled previous button', () => {
            render(
                <Pagination
                    currentPage={1}
                    totalPages={5}
                    onPageChange={mockOnPageChange}
                />
            );

            const previousButton = screen.getByLabelText('Go to previous page');
            fireEvent.click(previousButton);
            expect(mockOnPageChange).not.toHaveBeenCalled();
        });

        it('should enable next button on first page', () => {
            render(
                <Pagination
                    currentPage={1}
                    totalPages={5}
                    onPageChange={mockOnPageChange}
                />
            );

            const nextButton = screen.getByLabelText('Go to next page');
            expect(nextButton).not.toBeDisabled();
        });
    });

    describe('Last Page Behavior', () => {
        it('should disable next button on last page', () => {
            render(
                <Pagination
                    currentPage={5}
                    totalPages={5}
                    onPageChange={mockOnPageChange}
                />
            );

            const nextButton = screen.getByLabelText('Go to next page');
            expect(nextButton).toBeDisabled();
            expect(nextButton).toHaveClass('cursor-not-allowed');
        });

        it('should not call onPageChange when clicking disabled next button', () => {
            render(
                <Pagination
                    currentPage={5}
                    totalPages={5}
                    onPageChange={mockOnPageChange}
                />
            );

            const nextButton = screen.getByLabelText('Go to next page');
            fireEvent.click(nextButton);
            expect(mockOnPageChange).not.toHaveBeenCalled();
        });

        it('should enable previous button on last page', () => {
            render(
                <Pagination
                    currentPage={5}
                    totalPages={5}
                    onPageChange={mockOnPageChange}
                />
            );

            const previousButton = screen.getByLabelText('Go to previous page');
            expect(previousButton).not.toBeDisabled();
        });
    });

    describe('Current Page Highlighting', () => {
        it('should highlight current page in blue', () => {
            render(
                <Pagination
                    currentPage={3}
                    totalPages={5}
                    onPageChange={mockOnPageChange}
                />
            );

            const currentPageButton = screen.getByLabelText('Current page, Page 3');
            expect(currentPageButton).toHaveClass('bg-blue-500');
            expect(currentPageButton).toHaveAttribute('aria-current', 'page');
        });

        it('should not highlight non-current pages', () => {
            render(
                <Pagination
                    currentPage={3}
                    totalPages={5}
                    onPageChange={mockOnPageChange}
                />
            );

            const page2Button = screen.getByLabelText('Page 2');
            expect(page2Button).not.toHaveClass('bg-blue-500');
            expect(page2Button).toHaveClass('bg-slate-800/50');
            expect(page2Button).not.toHaveAttribute('aria-current');
        });
    });

    describe('Page Navigation', () => {
        it('should call onPageChange with correct page when clicking page number', () => {
            render(
                <Pagination
                    currentPage={1}
                    totalPages={5}
                    onPageChange={mockOnPageChange}
                />
            );

            const page3Button = screen.getByLabelText('Page 3');
            fireEvent.click(page3Button);
            expect(mockOnPageChange).toHaveBeenCalledWith(3);
        });

        it('should call onPageChange with previous page when clicking previous button', () => {
            render(
                <Pagination
                    currentPage={3}
                    totalPages={5}
                    onPageChange={mockOnPageChange}
                />
            );

            const previousButton = screen.getByLabelText('Go to previous page');
            fireEvent.click(previousButton);
            expect(mockOnPageChange).toHaveBeenCalledWith(2);
        });

        it('should call onPageChange with next page when clicking next button', () => {
            render(
                <Pagination
                    currentPage={3}
                    totalPages={5}
                    onPageChange={mockOnPageChange}
                />
            );

            const nextButton = screen.getByLabelText('Go to next page');
            fireEvent.click(nextButton);
            expect(mockOnPageChange).toHaveBeenCalledWith(4);
        });

        it('should not call onPageChange when clicking current page', () => {
            render(
                <Pagination
                    currentPage={3}
                    totalPages={5}
                    onPageChange={mockOnPageChange}
                />
            );

            const currentPageButton = screen.getByLabelText('Current page, Page 3');
            fireEvent.click(currentPageButton);
            expect(mockOnPageChange).not.toHaveBeenCalled();
        });
    });

    describe('Ellipsis Display', () => {
        it('should show ellipsis when there are many pages', () => {
            render(
                <Pagination
                    currentPage={5}
                    totalPages={10}
                    onPageChange={mockOnPageChange}
                    maxVisiblePages={5}
                />
            );

            const ellipses = screen.getAllByText('...');
            expect(ellipses.length).toBeGreaterThan(0);
        });

        it('should not show ellipsis when all pages fit', () => {
            render(
                <Pagination
                    currentPage={3}
                    totalPages={5}
                    onPageChange={mockOnPageChange}
                    maxVisiblePages={5}
                />
            );

            expect(screen.queryByText('...')).not.toBeInTheDocument();
        });

        it('should show ellipsis before last page when current page is near start', () => {
            render(
                <Pagination
                    currentPage={2}
                    totalPages={10}
                    onPageChange={mockOnPageChange}
                    maxVisiblePages={5}
                />
            );

            // Should show pages 1, 2, 3, 4, ..., 10
            expect(screen.getByLabelText('Page 1')).toBeInTheDocument();
            expect(screen.getByLabelText('Page 10')).toBeInTheDocument();
            expect(screen.getByText('...')).toBeInTheDocument();
        });

        it('should show ellipsis after first page when current page is near end', () => {
            render(
                <Pagination
                    currentPage={9}
                    totalPages={10}
                    onPageChange={mockOnPageChange}
                    maxVisiblePages={5}
                />
            );

            // Should show pages 1, ..., 7, 8, 9, 10
            expect(screen.getByLabelText('Page 1')).toBeInTheDocument();
            expect(screen.getByLabelText('Page 10')).toBeInTheDocument();
            expect(screen.getByText('...')).toBeInTheDocument();
        });
    });

    describe('MaxVisiblePages', () => {
        it('should respect maxVisiblePages prop', () => {
            render(
                <Pagination
                    currentPage={5}
                    totalPages={10}
                    onPageChange={mockOnPageChange}
                    maxVisiblePages={3}
                />
            );

            // With maxVisiblePages=3, should show fewer page buttons
            const pageButtons = screen.getAllByRole('button').filter(
                button => button.getAttribute('aria-label')?.startsWith('Page')
            );
            // Should show: 1, ..., 5, ..., 10 = 3 page buttons + ellipses
            expect(pageButtons.length).toBeLessThanOrEqual(5);
        });

        it('should default to 5 maxVisiblePages when not specified', () => {
            render(
                <Pagination
                    currentPage={5}
                    totalPages={10}
                    onPageChange={mockOnPageChange}
                />
            );

            // Should show more pages with default maxVisiblePages=5
            expect(screen.getByLabelText('Page 1')).toBeInTheDocument();
            expect(screen.getByLabelText('Current page, Page 5')).toBeInTheDocument();
            expect(screen.getByLabelText('Page 10')).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should handle 2 total pages correctly', () => {
            render(
                <Pagination
                    currentPage={1}
                    totalPages={2}
                    onPageChange={mockOnPageChange}
                />
            );

            expect(screen.getByLabelText('Current page, Page 1')).toBeInTheDocument();
            expect(screen.getByLabelText('Page 2')).toBeInTheDocument();
            expect(screen.queryByText('...')).not.toBeInTheDocument();
        });

        it('should handle very large page numbers', () => {
            render(
                <Pagination
                    currentPage={50}
                    totalPages={100}
                    onPageChange={mockOnPageChange}
                    maxVisiblePages={5}
                />
            );

            expect(screen.getByLabelText('Page 1')).toBeInTheDocument();
            expect(screen.getByLabelText('Current page, Page 50')).toBeInTheDocument();
            expect(screen.getByLabelText('Page 100')).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('should have proper aria-labels on buttons', () => {
            render(
                <Pagination
                    currentPage={2}
                    totalPages={5}
                    onPageChange={mockOnPageChange}
                />
            );

            expect(screen.getByLabelText('Go to previous page')).toBeInTheDocument();
            expect(screen.getByLabelText('Go to next page')).toBeInTheDocument();
            expect(screen.getByLabelText('Page 1')).toBeInTheDocument();
        });

        it('should mark current page with aria-current', () => {
            render(
                <Pagination
                    currentPage={3}
                    totalPages={5}
                    onPageChange={mockOnPageChange}
                />
            );

            const currentPageButton = screen.getByLabelText('Current page, Page 3');
            expect(currentPageButton).toHaveAttribute('aria-current', 'page');
        });

        it('should have disabled attribute on disabled buttons', () => {
            render(
                <Pagination
                    currentPage={1}
                    totalPages={5}
                    onPageChange={mockOnPageChange}
                />
            );

            const previousButton = screen.getByLabelText('Go to previous page');
            expect(previousButton).toHaveAttribute('disabled');
        });
    });
});
