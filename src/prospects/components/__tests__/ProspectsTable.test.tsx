import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ProspectsTable } from '../ProspectsTable';
import type { ProspectPlayerData } from '../../types';

// Mock Next.js router
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

// Mock VideoModal
jest.mock('@/dashboard/common/components/VideoModal', () => ({
    VideoModal: ({ isOpen, onClose, videoTitle }: { isOpen: boolean; onClose: () => void; videoTitle?: string }) =>
        isOpen ? (
            <div role="dialog" aria-label="video modal">
                <span>{videoTitle}</span>
                <button onClick={onClose}>Close</button>
            </div>
        ) : null,
}));

const makeProspect = (overrides: Partial<ProspectPlayerData> = {}): ProspectPlayerData => ({
    playerId: 'player-1',
    firstName: 'Jane',
    lastName: 'Doe',
    sport: 'Soccer',
    position: 'Forward',
    gpa: 3.8,
    highSchool: 'Lincoln High',
    scholarshipAmount: 15000,
    videoUrl: null,
    videoTitle: null,
    profileImage: null,
    ...overrides,
});

describe('ProspectsTable', () => {
    const coachId = 'coach-abc';

    describe('Empty state', () => {
        it('renders empty state message when no prospects', () => {
            render(<ProspectsTable prospects={[]} coachId={coachId} />);
            expect(screen.getByTestId('empty-prospects')).toBeInTheDocument();
        });
    });

    describe('Column headers', () => {
        it('renders all required column headers', () => {
            render(<ProspectsTable prospects={[makeProspect()]} coachId={coachId} />);
            expect(screen.getByText('Name')).toBeInTheDocument();
            expect(screen.getByText('Sport')).toBeInTheDocument();
            expect(screen.getByText('Position')).toBeInTheDocument();
            expect(screen.getByText('GPA')).toBeInTheDocument();
            expect(screen.getByText('High School')).toBeInTheDocument();
            expect(screen.getByText('Scholarship Required')).toBeInTheDocument();
            expect(screen.getByText('Actions')).toBeInTheDocument();
        });
    });

    describe('Row data rendering', () => {
        it('renders player name, sport, position, gpa, high school, and scholarship', () => {
            render(<ProspectsTable prospects={[makeProspect()]} coachId={coachId} />);
            expect(screen.getAllByText('Jane Doe')[0]).toBeInTheDocument();
            expect(screen.getAllByText('Soccer')[0]).toBeInTheDocument();
            expect(screen.getAllByText('Forward')[0]).toBeInTheDocument();
            expect(screen.getAllByText('3.8')[0]).toBeInTheDocument();
            expect(screen.getAllByText('Lincoln High')[0]).toBeInTheDocument();
            expect(screen.getAllByText('$15,000')[0]).toBeInTheDocument();
        });

        it('renders multiple rows', () => {
            const prospects = [
                makeProspect({ playerId: 'p1', firstName: 'Alice', lastName: 'Smith' }),
                makeProspect({ playerId: 'p2', firstName: 'Bob', lastName: 'Jones' }),
            ];
            render(<ProspectsTable prospects={prospects} coachId={coachId} />);
            expect(screen.getAllByText('Alice Smith')[0]).toBeInTheDocument();
            expect(screen.getAllByText('Bob Jones')[0]).toBeInTheDocument();
        });
    });

    describe('Null field handling (Requirement 6.6)', () => {
        it('shows dash for null sport', () => {
            render(<ProspectsTable prospects={[makeProspect({ sport: null })]} coachId={coachId} />);
            const cells = screen.getAllByText('—');
            expect(cells.length).toBeGreaterThan(0);
        });

        it('shows dash for null position', () => {
            render(<ProspectsTable prospects={[makeProspect({ position: null })]} coachId={coachId} />);
            const cells = screen.getAllByText('—');
            expect(cells.length).toBeGreaterThan(0);
        });

        it('shows dash for null gpa', () => {
            render(<ProspectsTable prospects={[makeProspect({ gpa: null })]} coachId={coachId} />);
            const cells = screen.getAllByText('—');
            expect(cells.length).toBeGreaterThan(0);
        });

        it('shows dash for null highSchool', () => {
            render(<ProspectsTable prospects={[makeProspect({ highSchool: null })]} coachId={coachId} />);
            const cells = screen.getAllByText('—');
            expect(cells.length).toBeGreaterThan(0);
        });

        it('shows dash for null scholarshipAmount', () => {
            render(<ProspectsTable prospects={[makeProspect({ scholarshipAmount: null })]} coachId={coachId} />);
            const cells = screen.getAllByText('—');
            expect(cells.length).toBeGreaterThan(0);
        });
    });

    describe('Watch Video button (Requirements 7.1, 7.2)', () => {
        it('does not render Watch Video button when videoUrl is null', () => {
            render(<ProspectsTable prospects={[makeProspect({ videoUrl: null })]} coachId={coachId} />);
            expect(screen.queryByRole('button', { name: /watch video/i })).not.toBeInTheDocument();
        });

        it('renders Watch Video button when videoUrl is present', () => {
            const prospect = makeProspect({ videoUrl: 'https://youtube.com/watch?v=abc', videoTitle: 'Highlights' });
            render(<ProspectsTable prospects={[prospect]} coachId={coachId} />);
            expect(screen.getAllByRole('button', { name: /watch video for jane doe/i })[0]).toBeInTheDocument();
        });

        it('opens VideoModal when Watch Video is clicked', () => {
            const prospect = makeProspect({ videoUrl: 'https://youtube.com/watch?v=abc', videoTitle: 'My Highlights' });
            render(<ProspectsTable prospects={[prospect]} coachId={coachId} />);

            fireEvent.click(screen.getAllByRole('button', { name: /watch video for jane doe/i })[0]);

            expect(screen.getByRole('dialog', { name: /video modal/i })).toBeInTheDocument();
            expect(screen.getByText('My Highlights')).toBeInTheDocument();
        });

        it('closes VideoModal when close is triggered', () => {
            const prospect = makeProspect({ videoUrl: 'https://youtube.com/watch?v=abc', videoTitle: 'Highlights' });
            render(<ProspectsTable prospects={[prospect]} coachId={coachId} />);

            fireEvent.click(screen.getAllByRole('button', { name: /watch video for jane doe/i })[0]);
            expect(screen.getByRole('dialog')).toBeInTheDocument();

            fireEvent.click(screen.getByRole('button', { name: /close/i }));
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
    });

    describe('View Profile button', () => {
        it('renders View Profile button for each row', () => {
            render(<ProspectsTable prospects={[makeProspect()]} coachId={coachId} />);
            expect(screen.getAllByRole('button', { name: /view profile for jane doe/i })[0]).toBeInTheDocument();
        });

        it('navigates to player profile on click', () => {
            const pushMock = jest.fn();
            jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({ push: pushMock });

            render(<ProspectsTable prospects={[makeProspect({ playerId: 'player-1' })]} coachId={coachId} />);
            fireEvent.click(screen.getAllByRole('button', { name: /view profile for jane doe/i })[0]);

            expect(pushMock).toHaveBeenCalledWith(`/coach/${coachId}/dashboard/player-profile/player-1`);
        });
    });

    describe('Unfavorite button (Requirement 7.4)', () => {
        beforeEach(() => {
            global.fetch = jest.fn();
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('renders unfavorite button for each row', () => {
            render(<ProspectsTable prospects={[makeProspect()]} coachId={coachId} />);
            expect(screen.getAllByRole('button', { name: /remove jane doe from prospects/i })[0]).toBeInTheDocument();
        });

        it('calls DELETE endpoint when unfavorite is clicked', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

            render(<ProspectsTable prospects={[makeProspect({ playerId: 'player-1' })]} coachId={coachId} />);
            await act(async () => {
                fireEvent.click(screen.getAllByRole('button', { name: /remove jane doe from prospects/i })[0]);
            });

            expect(global.fetch).toHaveBeenCalledWith(
                `/api/coach/${coachId}/prospects/player-1`,
                { method: 'DELETE' }
            );
        });

        it('removes the row from the table after successful DELETE', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

            render(<ProspectsTable prospects={[makeProspect()]} coachId={coachId} />);
            expect(screen.getAllByText('Jane Doe')[0]).toBeInTheDocument();

            await act(async () => {
                fireEvent.click(screen.getAllByRole('button', { name: /remove jane doe from prospects/i })[0]);
            });

            await waitFor(() => {
                expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument();
            });
        });

        it('shows empty state after last prospect is removed', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

            render(<ProspectsTable prospects={[makeProspect()]} coachId={coachId} />);

            await act(async () => {
                fireEvent.click(screen.getAllByRole('button', { name: /remove jane doe from prospects/i })[0]);
            });

            await waitFor(() => {
                expect(screen.getByTestId('empty-prospects')).toBeInTheDocument();
            });
        });

        it('shows error message and keeps row when DELETE fails', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });

            render(<ProspectsTable prospects={[makeProspect()]} coachId={coachId} />);

            await act(async () => {
                fireEvent.click(screen.getAllByRole('button', { name: /remove jane doe from prospects/i })[0]);
            });

            await waitFor(() => {
                expect(screen.getByRole('alert')).toBeInTheDocument();
                expect(screen.getAllByText('Jane Doe')[0]).toBeInTheDocument();
            });
        });

        it('shows error message when fetch throws', async () => {
            (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

            render(<ProspectsTable prospects={[makeProspect()]} coachId={coachId} />);

            await act(async () => {
                fireEvent.click(screen.getAllByRole('button', { name: /remove jane doe from prospects/i })[0]);
            });

            await waitFor(() => {
                expect(screen.getByRole('alert')).toBeInTheDocument();
            });
        });

        it('disables unfavorite button while removal is in-flight', async () => {
            let resolve!: () => void;
            (global.fetch as jest.Mock).mockReturnValueOnce(
                new Promise<{ ok: boolean }>((res) => { resolve = () => res({ ok: true }); })
            );

            render(<ProspectsTable prospects={[makeProspect()]} coachId={coachId} />);
            const btn = screen.getAllByRole('button', { name: /remove jane doe from prospects/i })[0];

            fireEvent.click(btn);

            await waitFor(() => {
                expect(screen.getAllByRole('button', { name: /remove jane doe from prospects/i })[0]).toBeDisabled();
            });

            await act(async () => { resolve(); });
        });
    });
});
