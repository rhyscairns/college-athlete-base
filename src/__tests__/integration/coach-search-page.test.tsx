import { render, screen, waitFor } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';
import CoachSearchPage from '../../app/coach/[coachId]/dashboard/search/page';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
    useSearchParams: jest.fn(),
}));

// Mock child components
jest.mock('@/dashboard/coach/components/SearchFiltersBar', () => ({
    SearchFiltersBar: function MockSearchFiltersBar({ criteria, onFilterChange, onClearAll }: any) {
        return (
            <div data-testid="search-filters-bar">
                <button onClick={() => onFilterChange({ sport: 'Basketball' })}>Change Filter</button>
                <button onClick={onClearAll}>Clear All</button>
                <div data-testid="criteria">{JSON.stringify(criteria)}</div>
            </div>
        );
    },
}));

jest.mock('@/dashboard/coach/components/AthleteSearchResults', () => ({
    AthleteSearchResults: function MockAthleteSearchResults({ athletes, isLoading, totalCount, onPageChange }: any) {
        return (
            <div data-testid="athlete-search-results">
                {isLoading && <div data-testid="loading">Loading...</div>}
                {!isLoading && <div data-testid="total-count">{totalCount}</div>}
                {!isLoading && athletes.map((athlete: any) => (
                    <div key={athlete.id} data-testid={`athlete-${athlete.id}`}>
                        {athlete.firstName} {athlete.lastName}
                    </div>
                ))}
                <button onClick={() => onPageChange(2)}>Next Page</button>
            </div>
        );
    },
}));

// React.use() checks promise.status internally before suspending.
// Pre-marking the promise as fulfilled lets use() return synchronously in tests.
function resolvedParams(coachId: string): Promise<{ coachId: string }> {
    const p = Promise.resolve({ coachId }) as any;
    p.status = 'fulfilled';
    p.value = { coachId };
    return p as Promise<{ coachId: string }>;
}

describe('CoachSearchPage Integration Tests', () => {
    const mockPush = jest.fn();
    const mockRouter = {
        push: mockPush,
        back: jest.fn(),
        forward: jest.fn(),
        refresh: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
    };

    // Helper to create API response in the correct format
    const createApiResponse = (athletes: any[], totalCount: number, page = 1, pageSize = 20) => ({
        success: true,
        data: {
            athletes,
            pagination: {
                totalCount,
                currentPage: page,
                totalPages: Math.ceil(totalCount / pageSize),
                pageSize,
            },
            filters: {},
        },
    });

    const renderPage = () =>
        render(<CoachSearchPage params={resolvedParams('coach-123')} />);

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
        global.fetch = jest.fn();
        global.scrollTo = jest.fn();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('Page Load with URL Parameters', () => {
        it('should parse and use URL search parameters on load', async () => {
            const mockSearchParams = new URLSearchParams({
                sport: 'Basketball',
                position: 'Point Guard',
                gpaMin: '3.0',
            });

            (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => createApiResponse(
                    [{ id: '1', firstName: 'John', lastName: 'Doe', sport: 'Basketball' }],
                    1
                ),
            });

            renderPage();

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith(
                    expect.stringContaining('sport=Basketball')
                );
                expect(global.fetch).toHaveBeenCalledWith(
                    expect.stringContaining('position=Point+Guard')
                );
                expect(global.fetch).toHaveBeenCalledWith(
                    expect.stringContaining('gpaMin=3')
                );
            });
        });

        it('should handle empty URL parameters', async () => {
            const mockSearchParams = new URLSearchParams();
            (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => createApiResponse([], 0),
            });

            renderPage();

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalled();
            });

            expect(screen.getByTestId('athlete-search-results')).toBeInTheDocument();
        });

        it('should handle all filter types in URL', async () => {
            const mockSearchParams = new URLSearchParams({
                sport: 'Football',
                position: 'Quarterback',
                desiredDivision: 'NCAA D1',
                gpaMin: '3.5',
                gpaMax: '4.0',
                affordableAmount: '15000',
                heightMin: '72',
                heightMax: '78',
                weightMin: '200',
                weightMax: '220',
            });

            (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => createApiResponse([], 0),
            });

            renderPage();

            await waitFor(() => {
                const fetchCall = (global.fetch as jest.Mock).mock.calls[0][0];
                expect(fetchCall).toContain('sport=Football');
                expect(fetchCall).toContain('position=Quarterback');
                expect(fetchCall).toContain('desiredDivision=NCAA+D1');
                expect(fetchCall).toContain('gpaMin=3.5');
                expect(fetchCall).toContain('gpaMax=4');
                expect(fetchCall).toContain('affordableAmount=15000');
                expect(fetchCall).toContain('heightMin=');
                expect(fetchCall).toContain('heightMax=');
                expect(fetchCall).toContain('weightMin=200');
                expect(fetchCall).toContain('weightMax=220');
            });
        });

        it('should display search results after loading', async () => {
            const mockSearchParams = new URLSearchParams({ sport: 'Basketball' });
            (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => createApiResponse(
                    [
                        { id: '1', firstName: 'John', lastName: 'Doe' },
                        { id: '2', firstName: 'Jane', lastName: 'Smith' },
                    ],
                    2
                ),
            });

            renderPage();

            expect(screen.getByTestId('loading')).toBeInTheDocument();

            await waitFor(() => {
                expect(screen.getByTestId('athlete-1')).toBeInTheDocument();
                expect(screen.getByTestId('athlete-2')).toBeInTheDocument();
            });

            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        });
    });

    describe('Error Handling', () => {
        it('should display error message when API call fails', async () => {
            const mockSearchParams = new URLSearchParams({ sport: 'Basketball' });
            (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 500,
            });

            renderPage();

            await waitFor(() => {
                expect(screen.getByText('Error loading search results')).toBeInTheDocument();
                expect(screen.getByText('Failed to fetch search results')).toBeInTheDocument();
            });
        });

        it('should display retry button on error', async () => {
            const mockSearchParams = new URLSearchParams({ sport: 'Basketball' });
            (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

            (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

            renderPage();

            await waitFor(() => {
                expect(screen.getByText('Try again')).toBeInTheDocument();
            });
        });

        it('should handle network errors gracefully', async () => {
            const mockSearchParams = new URLSearchParams({ sport: 'Basketball' });
            (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

            (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

            renderPage();

            await waitFor(() => {
                expect(screen.getByText('Network error')).toBeInTheDocument();
            });
        });
    });

    describe('Filter Changes and URL Updates', () => {
        it('should update URL when filters change', async () => {
            const mockSearchParams = new URLSearchParams({ sport: 'Basketball' });
            (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: async () => createApiResponse([], 0),
            });

            const { getByText } = renderPage();

            await waitFor(() => {
                expect(screen.getByTestId('search-filters-bar')).toBeInTheDocument();
            });

            const changeFilterButton = getByText('Change Filter');
            changeFilterButton.click();

            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith(
                    expect.stringContaining('/coach/coach-123/dashboard/search?sport=Basketball')
                );
            });
        });

        it('should clear all filters and update URL', async () => {
            const mockSearchParams = new URLSearchParams({
                sport: 'Basketball',
                gpaMin: '3.0',
            });
            (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: async () => createApiResponse([], 0),
            });

            const { getByText } = renderPage();

            await waitFor(() => {
                expect(screen.getByTestId('search-filters-bar')).toBeInTheDocument();
            });

            const clearAllButton = getByText('Clear All');
            clearAllButton.click();

            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith('/coach/coach-123/dashboard/search');
            });
        });

        it('should reset to page 1 when filters change', async () => {
            const mockSearchParams = new URLSearchParams({ sport: 'Basketball' });
            (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: async () => createApiResponse([], 0),
            });

            const { getByText } = renderPage();

            await waitFor(() => {
                expect(screen.getByTestId('search-filters-bar')).toBeInTheDocument();
            });

            const changeFilterButton = getByText('Change Filter');
            changeFilterButton.click();

            await waitFor(() => {
                expect(mockPush).toHaveBeenCalled();
            });
        });
    });

    describe('Pagination', () => {
        it('should handle page changes', async () => {
            const mockSearchParams = new URLSearchParams({ sport: 'Basketball' });
            (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: async () => createApiResponse(
                    [{ id: '1', firstName: 'John', lastName: 'Doe' }],
                    50
                ),
            });

            const { getByText } = renderPage();

            await waitFor(() => {
                expect(screen.getByTestId('athlete-search-results')).toBeInTheDocument();
            });

            const nextPageButton = getByText('Next Page');
            nextPageButton.click();

            await waitFor(() => {
                expect(global.scrollTo).toHaveBeenCalledWith({
                    top: 0,
                    behavior: 'smooth',
                });
            });
        });

        it('should include page number in API call', async () => {
            const mockSearchParams = new URLSearchParams({ sport: 'Basketball' });
            (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: async () => createApiResponse([], 0),
            });

            renderPage();

            await waitFor(() => {
                const fetchCall = (global.fetch as jest.Mock).mock.calls[0][0];
                expect(fetchCall).toContain('page=1');
            });
        });
    });

    describe('Browser Back Button Support', () => {
        it('should re-fetch results when URL parameters change', async () => {
            const mockSearchParams1 = new URLSearchParams({ sport: 'Basketball' });
            (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams1);

            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: async () => createApiResponse([], 0),
            });

            const { rerender } = renderPage();

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledTimes(1);
            });

            const mockSearchParams2 = new URLSearchParams({ sport: 'Football' });
            (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams2);

            rerender(<CoachSearchPage params={resolvedParams('coach-123')} />);

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledTimes(2);
            });
        });
    });

    describe('Loading States', () => {
        it('should show loading state initially', () => {
            const mockSearchParams = new URLSearchParams({ sport: 'Basketball' });
            (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

            (global.fetch as jest.Mock).mockImplementation(
                () => new Promise(() => { }) // Never resolves
            );

            renderPage();

            expect(screen.getByTestId('loading')).toBeInTheDocument();
            expect(screen.getByText('Searching for athletes...')).toBeInTheDocument();
        });

        it('should hide loading state after results load', async () => {
            const mockSearchParams = new URLSearchParams({ sport: 'Basketball' });
            (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => createApiResponse([], 0),
            });

            renderPage();

            await waitFor(() => {
                expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
            });
        });
    });

    describe('Result Count Display', () => {
        it('should display correct result count', async () => {
            const mockSearchParams = new URLSearchParams({ sport: 'Basketball' });
            (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => createApiResponse(
                    [
                        { id: '1', firstName: 'John', lastName: 'Doe' },
                        { id: '2', firstName: 'Jane', lastName: 'Smith' },
                    ],
                    2
                ),
            });

            renderPage();

            await waitFor(() => {
                expect(screen.getByText('Found 2 athletes')).toBeInTheDocument();
            });
        });

        it('should use singular form for single result', async () => {
            const mockSearchParams = new URLSearchParams({ sport: 'Basketball' });
            (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => createApiResponse(
                    [{ id: '1', firstName: 'John', lastName: 'Doe' }],
                    1
                ),
            });

            renderPage();

            await waitFor(() => {
                expect(screen.getByText('Found 1 athlete')).toBeInTheDocument();
            });
        });
    });
});
