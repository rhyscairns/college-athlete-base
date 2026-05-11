import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScholarshipsTable } from '../ScholarshipsTable';
import type { Scholarship } from '../../types';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: mockPush }),
}));

const baseScholarship: Scholarship = {
    id: 'sch-1',
    coachId: 'coach-1',
    playerId: 'player-1',
    status: 'pending',
    schoolName: 'State University',
    sport: 'Football',
    scholarshipAmount: 25000,
    requiredGpa: 3.0,
    division: 'Division I',
    startYear: 2025,
    durationYears: 4,
    notes: null,
    counterAmount: null,
    counterGpa: null,
    counterNotes: null,
    playerFirstName: 'Alex',
    playerLastName: 'Johnson',
    playerEmail: 'alex@example.com',
    coachFirstName: 'Coach',
    coachLastName: 'Smith',
    coachUniversity: 'State University',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
};

describe('ScholarshipsTable — empty state', () => {
    it('renders empty state for coach with no scholarships', () => {
        render(<ScholarshipsTable scholarships={[]} userType="coach" currentUserId="coach-1" />);
        expect(screen.getByTestId('empty-scholarships')).toBeInTheDocument();
        expect(screen.getByText('No scholarships yet')).toBeInTheDocument();
        expect(screen.getByText(/No scholarship offers sent yet/)).toBeInTheDocument();
    });

    it('renders empty state for player with no scholarships', () => {
        render(<ScholarshipsTable scholarships={[]} userType="player" currentUserId="player-1" />);
        expect(screen.getByTestId('empty-scholarships')).toBeInTheDocument();
        expect(screen.getByText(/No scholarship offers received yet/)).toBeInTheDocument();
    });
});

describe('ScholarshipsTable — coach view', () => {
    it('renders player name in the table', () => {
        render(<ScholarshipsTable scholarships={[baseScholarship]} userType="coach" currentUserId="coach-1" />);
        expect(screen.getAllByText('Alex Johnson').length).toBeGreaterThan(0);
    });

    it('renders sport, amount, and GPA', () => {
        render(<ScholarshipsTable scholarships={[baseScholarship]} userType="coach" currentUserId="coach-1" />);
        expect(screen.getAllByText('Football').length).toBeGreaterThan(0);
        expect(screen.getAllByText('$25,000').length).toBeGreaterThan(0);
        expect(screen.getAllByText('3').length).toBeGreaterThan(0);
    });

    it('renders status badge', () => {
        render(<ScholarshipsTable scholarships={[baseScholarship]} userType="coach" currentUserId="coach-1" />);
        expect(screen.getAllByTestId('status-badge-pending').length).toBeGreaterThan(0);
    });

    it('navigates to coach scholarship detail on View click', async () => {
        render(<ScholarshipsTable scholarships={[baseScholarship]} userType="coach" currentUserId="coach-1" />);
        const viewButtons = screen.getAllByRole('button', { name: /view scholarship for alex johnson/i });
        await userEvent.click(viewButtons[0]);
        expect(mockPush).toHaveBeenCalledWith('/coach/coach-1/scholarships/player-1');
    });
});

describe('ScholarshipsTable — player view', () => {
    it('renders school/university name in the table', () => {
        render(<ScholarshipsTable scholarships={[baseScholarship]} userType="player" currentUserId="player-1" />);
        expect(screen.getAllByText('State University').length).toBeGreaterThan(0);
    });

    it('navigates to player offer detail on View click', async () => {
        render(<ScholarshipsTable scholarships={[baseScholarship]} userType="player" currentUserId="player-1" />);
        const viewButtons = screen.getAllByRole('button', { name: /view scholarship for state university/i });
        await userEvent.click(viewButtons[0]);
        expect(mockPush).toHaveBeenCalledWith('/player/player-1/scholarship-offers/coach-1');
    });

    it('renders accepted status badge', () => {
        const accepted = { ...baseScholarship, status: 'accepted' as const };
        render(<ScholarshipsTable scholarships={[accepted]} userType="player" currentUserId="player-1" />);
        expect(screen.getAllByTestId('status-badge-accepted').length).toBeGreaterThan(0);
    });

    it('renders rejected status badge', () => {
        const rejected = { ...baseScholarship, status: 'rejected' as const };
        render(<ScholarshipsTable scholarships={[rejected]} userType="player" currentUserId="player-1" />);
        expect(screen.getAllByTestId('status-badge-rejected').length).toBeGreaterThan(0);
    });

    it('renders countered status badge', () => {
        const countered = { ...baseScholarship, status: 'countered' as const };
        render(<ScholarshipsTable scholarships={[countered]} userType="player" currentUserId="player-1" />);
        expect(screen.getAllByTestId('status-badge-countered').length).toBeGreaterThan(0);
    });
});
