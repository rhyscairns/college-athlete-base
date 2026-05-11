import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScholarshipForm } from '../ScholarshipForm';
import type { Scholarship } from '../../types';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: mockPush }),
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

const existingScholarship: Scholarship = {
    id: 'sch-1',
    coachId: 'coach-1',
    playerId: 'player-1',
    status: 'pending',
    schoolName: 'State University',
    sport: 'Football',
    scholarshipAmount: 25000,
    requiredGpa: 3.0,
    division: 'NCAA D1',
    startYear: 2025,
    durationYears: 4,
    notes: 'Some notes',
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

// Helper: mock a successful player lookup response
function mockLookupSuccess(player = { id: 'player-1', firstName: 'Alex', lastName: 'Johnson', email: 'alex@example.com' }) {
    mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: player }),
    });
}

// Helper: mock a 404 player lookup response
function mockLookupNotFound() {
    mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ success: false, error: 'No player found with that email address' }),
    });
}

beforeEach(() => {
    jest.clearAllMocks();
});

describe('ScholarshipForm — email lookup', () => {
    it('shows hint text before email is entered', () => {
        render(<ScholarshipForm coachId="coach-1" />);
        expect(screen.getByText(/enter the player's registered email/i)).toBeInTheDocument();
    });

    it('calls lookup API on email blur with valid email', async () => {
        mockLookupSuccess();
        render(<ScholarshipForm coachId="coach-1" />);

        const emailInput = screen.getByLabelText(/player email/i);
        await userEvent.type(emailInput, 'alex@example.com');
        await userEvent.tab(); // trigger blur

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith(
                '/api/players/lookup?email=alex%40example.com'
            );
        });
    });

    it('auto-fills first and last name after successful lookup', async () => {
        mockLookupSuccess();
        render(<ScholarshipForm coachId="coach-1" />);

        await userEvent.type(screen.getByLabelText(/player email/i), 'alex@example.com');
        await userEvent.tab();

        await waitFor(() => {
            expect(screen.getByLabelText(/player first name/i)).toHaveValue('Alex');
            expect(screen.getByLabelText(/player last name/i)).toHaveValue('Johnson');
        });
    });

    it('shows not found message when player does not exist', async () => {
        mockLookupNotFound();
        render(<ScholarshipForm coachId="coach-1" />);

        await userEvent.type(screen.getByLabelText(/player email/i), 'unknown@example.com');
        await userEvent.tab();

        await waitFor(() => {
            expect(screen.getByText(/no player found with that email/i)).toBeInTheDocument();
        });
    });

    it('clears resolved player when email is changed', async () => {
        mockLookupSuccess();
        render(<ScholarshipForm coachId="coach-1" />);

        await userEvent.type(screen.getByLabelText(/player email/i), 'alex@example.com');
        await userEvent.tab();
        await waitFor(() => expect(screen.getByLabelText(/player first name/i)).toHaveValue('Alex'));

        // Now change the email — should clear the name
        await userEvent.clear(screen.getByLabelText(/player email/i));
        await userEvent.type(screen.getByLabelText(/player email/i), 'other@example.com');

        expect(screen.getByLabelText(/player first name/i)).toHaveValue('');
        expect(screen.getByLabelText(/player last name/i)).toHaveValue('');
    });

    it('does not call lookup when email format is invalid', async () => {
        render(<ScholarshipForm coachId="coach-1" />);
        await userEvent.type(screen.getByLabelText(/player email/i), 'not-an-email');
        await userEvent.tab();
        expect(mockFetch).not.toHaveBeenCalled();
    });

    it('keeps Send Offer button disabled until player is resolved', async () => {
        render(<ScholarshipForm coachId="coach-1" />);
        expect(screen.getByRole('button', { name: /send offer/i })).toBeDisabled();
    });

    it('enables Send Offer button after successful lookup', async () => {
        mockLookupSuccess();
        render(<ScholarshipForm coachId="coach-1" />);

        await userEvent.type(screen.getByLabelText(/player email/i), 'alex@example.com');
        await userEvent.tab();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /send offer/i })).not.toBeDisabled();
        });
    });
});

describe('ScholarshipForm — validation', () => {
    it('shows email required error when submitting empty form', async () => {
        render(<ScholarshipForm coachId="coach-1" existingScholarship={existingScholarship} />);
        await userEvent.clear(screen.getByLabelText(/school name/i));
        await userEvent.click(screen.getByRole('button', { name: /update offer/i }));
        expect(await screen.findByText('School name is required.')).toBeInTheDocument();
    });

    it('shows error when scholarship amount is 0', async () => {
        render(<ScholarshipForm coachId="coach-1" existingScholarship={existingScholarship} />);
        await userEvent.clear(screen.getByLabelText(/scholarship amount/i));
        await userEvent.type(screen.getByLabelText(/scholarship amount/i), '0');
        await userEvent.click(screen.getByRole('button', { name: /update offer/i }));
        expect(await screen.findByText('Scholarship amount must be greater than 0.')).toBeInTheDocument();
    });

    it('shows error when scholarship amount is negative', async () => {
        render(<ScholarshipForm coachId="coach-1" existingScholarship={existingScholarship} />);
        await userEvent.clear(screen.getByLabelText(/scholarship amount/i));
        await userEvent.type(screen.getByLabelText(/scholarship amount/i), '-100');
        await userEvent.click(screen.getByRole('button', { name: /update offer/i }));
        expect(await screen.findByText('Scholarship amount must be greater than 0.')).toBeInTheDocument();
    });

    it('shows error when GPA is above 4.0', async () => {
        render(<ScholarshipForm coachId="coach-1" existingScholarship={existingScholarship} />);
        await userEvent.clear(screen.getByLabelText(/required gpa/i));
        await userEvent.type(screen.getByLabelText(/required gpa/i), '4.5');
        await userEvent.click(screen.getByRole('button', { name: /update offer/i }));
        expect(await screen.findByText('GPA must be between 0.0 and 4.0.')).toBeInTheDocument();
    });

    it('shows error when GPA is negative', async () => {
        render(<ScholarshipForm coachId="coach-1" existingScholarship={existingScholarship} />);
        await userEvent.clear(screen.getByLabelText(/required gpa/i));
        await userEvent.type(screen.getByLabelText(/required gpa/i), '-1');
        await userEvent.click(screen.getByRole('button', { name: /update offer/i }));
        expect(await screen.findByText('GPA must be between 0.0 and 4.0.')).toBeInTheDocument();
    });

    it('shows error for invalid email format on submit', async () => {
        render(<ScholarshipForm coachId="coach-1" existingScholarship={{ ...existingScholarship, playerEmail: 'bad' }} />);
        await userEvent.click(screen.getByRole('button', { name: /update offer/i }));
        expect(await screen.findByText('Enter a valid email address.')).toBeInTheDocument();
    });

    it('does not call fetch when validation fails', async () => {
        render(<ScholarshipForm coachId="coach-1" existingScholarship={existingScholarship} />);
        await userEvent.clear(screen.getByLabelText(/school name/i));
        await userEvent.click(screen.getByRole('button', { name: /update offer/i }));
        // Only the submit fetch should not be called (lookup fetch is separate)
        expect(mockFetch).not.toHaveBeenCalledWith(
            expect.stringContaining('/api/coach/'),
            expect.anything()
        );
    });
});

describe('ScholarshipForm — pre-population', () => {
    it('pre-populates fields from initialData with playerId', () => {
        render(
            <ScholarshipForm
                coachId="coach-1"
                initialData={{ playerId: 'player-1', playerFirstName: 'Jane', playerLastName: 'Doe', playerEmail: 'jane@example.com' }}
            />
        );
        expect(screen.getByLabelText(/player first name/i)).toHaveValue('Jane');
        expect(screen.getByLabelText(/player last name/i)).toHaveValue('Doe');
        expect(screen.getByLabelText(/player email/i)).toHaveValue('jane@example.com');
    });

    it('pre-populates all fields from existingScholarship', () => {
        render(<ScholarshipForm coachId="coach-1" existingScholarship={existingScholarship} />);
        expect(screen.getByLabelText(/player first name/i)).toHaveValue('Alex');
        expect(screen.getByLabelText(/player last name/i)).toHaveValue('Johnson');
        expect(screen.getByLabelText(/school name/i)).toHaveValue('State University');
    });

    it('shows "Update Offer" button when editing', () => {
        render(<ScholarshipForm coachId="coach-1" existingScholarship={existingScholarship} />);
        expect(screen.getByRole('button', { name: /update offer/i })).toBeInTheDocument();
    });

    it('shows "Send Offer" button when creating', () => {
        render(<ScholarshipForm coachId="coach-1" />);
        expect(screen.getByRole('button', { name: /send offer/i })).toBeInTheDocument();
    });

    it('does not trigger lookup on email blur when editing', async () => {
        render(<ScholarshipForm coachId="coach-1" existingScholarship={existingScholarship} />);
        // Email field is read-only in edit mode — no blur handler
        const emailInput = screen.getByLabelText(/player email/i);
        expect(emailInput).toHaveAttribute('readonly');
        expect(mockFetch).not.toHaveBeenCalled();
    });
});

describe('ScholarshipForm — submission', () => {
    it('calls PATCH API on successful update', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ data: existingScholarship }),
        });

        const onSuccess = jest.fn();
        render(<ScholarshipForm coachId="coach-1" existingScholarship={existingScholarship} onSuccess={onSuccess} />);

        await userEvent.click(screen.getByRole('button', { name: /update offer/i }));

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith(
                '/api/coach/coach-1/scholarships/player-1',
                expect.objectContaining({ method: 'PATCH' })
            );
            expect(onSuccess).toHaveBeenCalledWith(existingScholarship);
        });
    });

    it('calls POST API after email lookup on successful create', async () => {
        // First call: lookup, second call: POST
        mockLookupSuccess();
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ data: existingScholarship }),
        });

        const onSuccess = jest.fn();
        render(<ScholarshipForm coachId="coach-1" onSuccess={onSuccess} />);

        await userEvent.type(screen.getByLabelText(/player email/i), 'alex@example.com');
        await userEvent.tab(); // trigger lookup

        await waitFor(() => expect(screen.getByLabelText(/player first name/i)).toHaveValue('Alex'));

        await userEvent.type(screen.getByLabelText(/school name/i), 'State University');
        await userEvent.selectOptions(screen.getByLabelText(/^sport/i), 'Football');
        await userEvent.type(screen.getByLabelText(/scholarship amount/i), '25000');
        await userEvent.type(screen.getByLabelText(/required gpa/i), '3.0');
        await userEvent.selectOptions(screen.getByLabelText(/start year/i), '2026');
        await userEvent.selectOptions(screen.getByLabelText(/duration/i), '4');

        await userEvent.click(screen.getByRole('button', { name: /send offer/i }));

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith(
                '/api/coach/coach-1/scholarships',
                expect.objectContaining({ method: 'POST' })
            );
            expect(onSuccess).toHaveBeenCalledWith(existingScholarship);
        });
    });

    it('shows server error message on API failure', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            json: async () => ({ error: 'Server error occurred' }),
        });

        render(<ScholarshipForm coachId="coach-1" existingScholarship={existingScholarship} />);
        await userEvent.click(screen.getByRole('button', { name: /update offer/i }));

        expect(await screen.findByText('Server error occurred')).toBeInTheDocument();
    });
});
