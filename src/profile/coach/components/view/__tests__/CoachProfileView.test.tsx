import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { CoachProfileView } from '../CoachProfileView';
import type { CoachProfile } from '../../../types';

// Mock child components
jest.mock('../CoachHeroSection', () => ({
    CoachHeroSection: ({ coach, isOwner, isEditing, onEdit }: any) => (
        <div data-testid="coach-hero-section">
            <div data-testid="coach-name">{coach.firstName} {coach.lastName}</div>
            <div data-testid="is-owner">{isOwner ? 'true' : 'false'}</div>
            <div data-testid="is-editing">{isEditing ? 'true' : 'false'}</div>
            {onEdit && (
                <button data-testid="edit-button" onClick={onEdit}>
                    Edit
                </button>
            )}
        </div>
    ),
}));

jest.mock('../../edit/CoachHeroSectionEdit', () => ({
    CoachHeroSectionEdit: ({ formData, errors, isSaving, onSave, onCancel }: any) => (
        <div data-testid="coach-hero-section-edit">
            <div data-testid="form-first-name">{formData.firstName}</div>
            <div data-testid="is-saving">{isSaving ? 'true' : 'false'}</div>
            <div data-testid="errors">{JSON.stringify(errors)}</div>
            <button data-testid="save-button" onClick={onSave}>
                Save
            </button>
            <button data-testid="cancel-button" onClick={onCancel}>
                Cancel
            </button>
        </div>
    ),
}));

jest.mock('../../../../player/components/view-page/SuccessNotification', () => ({
    SuccessNotification: ({ message, onDismiss }: { message: string; onDismiss: () => void }) => (
        <div data-testid="success-notification" onClick={onDismiss}>
            {message}
        </div>
    ),
}));

// Mock validation utility
jest.mock('../../../utils/validation', () => ({
    validateCoachProfile: jest.fn(() => ({})),
}));

const mockCoachData: CoachProfile = {
    id: 'coach-123',
    firstName: 'John',
    lastName: 'Smith',
    initials: 'JS',
    email: 'john.smith@university.edu',
    phone: '+1-555-0123',
    university: 'State University',
    position: 'Head Coach',
    sport: 'Basketball',
    profileImage: 'https://example.com/image.jpg',
    teamWebsiteUrl: 'https://university.edu/basketball',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
};

describe('CoachProfileView', () => {
    const defaultProps = {
        coachId: 'coach-123',
        currentUserId: 'coach-123',
        initialData: mockCoachData,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('initial render', () => {
        it('renders with coach data', () => {
            render(<CoachProfileView {...defaultProps} />);

            expect(screen.getByTestId('coach-hero-section')).toBeInTheDocument();
            expect(screen.getByTestId('coach-name')).toHaveTextContent('John Smith');
        });

        it('does not show edit form initially', () => {
            render(<CoachProfileView {...defaultProps} />);

            expect(screen.queryByTestId('coach-hero-section-edit')).not.toBeInTheDocument();
        });

        it('does not show success notification initially', () => {
            render(<CoachProfileView {...defaultProps} />);

            expect(screen.queryByTestId('success-notification')).not.toBeInTheDocument();
        });
    });

    describe('isOwner calculation', () => {
        it('sets isOwner to true when currentUserId matches coachId', () => {
            render(<CoachProfileView {...defaultProps} />);

            expect(screen.getByTestId('is-owner')).toHaveTextContent('true');
        });

        it('sets isOwner to false when currentUserId does not match coachId', () => {
            render(<CoachProfileView {...defaultProps} currentUserId="different-user" />);

            expect(screen.getByTestId('is-owner')).toHaveTextContent('false');
        });

        it('sets isOwner to false when currentUserId is undefined', () => {
            render(<CoachProfileView {...defaultProps} currentUserId={undefined} />);

            expect(screen.getByTestId('is-owner')).toHaveTextContent('false');
        });
    });

    describe('edit mode toggle', () => {
        it('enters edit mode when edit button is clicked', () => {
            render(<CoachProfileView {...defaultProps} />);

            const editButton = screen.getByTestId('edit-button');

            act(() => {
                fireEvent.click(editButton);
            });

            expect(screen.getByTestId('coach-hero-section-edit')).toBeInTheDocument();
            expect(screen.queryByTestId('coach-hero-section')).not.toBeInTheDocument();
        });

        it('shows form with current coach data in edit mode', () => {
            render(<CoachProfileView {...defaultProps} />);

            act(() => {
                fireEvent.click(screen.getByTestId('edit-button'));
            });

            expect(screen.getByTestId('form-first-name')).toHaveTextContent('John');
        });

        it('exits edit mode when cancel button is clicked', () => {
            render(<CoachProfileView {...defaultProps} />);

            // Enter edit mode
            act(() => {
                fireEvent.click(screen.getByTestId('edit-button'));
            });

            expect(screen.getByTestId('coach-hero-section-edit')).toBeInTheDocument();

            // Cancel editing
            act(() => {
                fireEvent.click(screen.getByTestId('cancel-button'));
            });

            expect(screen.getByTestId('coach-hero-section')).toBeInTheDocument();
            expect(screen.queryByTestId('coach-hero-section-edit')).not.toBeInTheDocument();
        });

        it('clears errors when entering edit mode', () => {
            const { validateCoachProfile } = require('../../../utils/validation');
            validateCoachProfile.mockReturnValue({ email: 'Invalid email' });

            render(<CoachProfileView {...defaultProps} />);

            // Enter edit mode and try to save with errors
            act(() => {
                fireEvent.click(screen.getByTestId('edit-button'));
            });

            act(() => {
                fireEvent.click(screen.getByTestId('save-button'));
            });

            // Errors should be shown
            expect(screen.getByTestId('errors')).toHaveTextContent('email');

            // Cancel and re-enter edit mode
            act(() => {
                fireEvent.click(screen.getByTestId('cancel-button'));
            });

            act(() => {
                fireEvent.click(screen.getByTestId('edit-button'));
            });

            // Errors should be cleared
            expect(screen.getByTestId('errors')).toHaveTextContent('{}');
        });
    });

    describe('save handler', () => {
        it('validates form data before API call', async () => {
            const { validateCoachProfile } = require('../../../utils/validation');
            validateCoachProfile.mockReturnValue({ email: 'Invalid email format' });

            render(<CoachProfileView {...defaultProps} />);

            act(() => {
                fireEvent.click(screen.getByTestId('edit-button'));
            });

            act(() => {
                fireEvent.click(screen.getByTestId('save-button'));
            });

            // Should show validation errors
            expect(screen.getByTestId('errors')).toHaveTextContent('Invalid email format');

            // Should not call API
            expect(global.fetch).not.toHaveBeenCalled();
        });

        it('calls API with correct data on successful validation', async () => {
            const { validateCoachProfile } = require('../../../utils/validation');
            validateCoachProfile.mockReturnValue({});

            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: async () => ({
                    success: true,
                    data: { ...mockCoachData, firstName: 'Updated' },
                }),
            });

            render(<CoachProfileView {...defaultProps} />);

            act(() => {
                fireEvent.click(screen.getByTestId('edit-button'));
            });

            await act(async () => {
                fireEvent.click(screen.getByTestId('save-button'));
            });

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith(
                    '/api/coach/coach-123/profile',
                    expect.objectContaining({
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: expect.any(String),
                    })
                );
            });
        });

        it('updates state and shows notification on successful save', async () => {
            const { validateCoachProfile } = require('../../../utils/validation');
            validateCoachProfile.mockReturnValue({});

            const updatedData = { ...mockCoachData, firstName: 'Updated' };

            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: async () => ({
                    success: true,
                    data: updatedData,
                }),
            });

            render(<CoachProfileView {...defaultProps} />);

            act(() => {
                fireEvent.click(screen.getByTestId('edit-button'));
            });

            await act(async () => {
                fireEvent.click(screen.getByTestId('save-button'));
            });

            await waitFor(() => {
                expect(screen.getByTestId('success-notification')).toBeInTheDocument();
                expect(screen.getByTestId('success-notification')).toHaveTextContent('Profile updated successfully!');
            });

            // Should exit edit mode
            expect(screen.getByTestId('coach-hero-section')).toBeInTheDocument();
            expect(screen.queryByTestId('coach-hero-section-edit')).not.toBeInTheDocument();
        });

        it('handles API validation errors', async () => {
            const { validateCoachProfile } = require('../../../utils/validation');
            validateCoachProfile.mockReturnValue({});

            (global.fetch as jest.Mock).mockResolvedValue({
                ok: false,
                status: 400,
                json: async () => ({
                    success: false,
                    error: 'Validation failed',
                    validationErrors: {
                        email: 'Email already in use',
                    },
                }),
            });

            render(<CoachProfileView {...defaultProps} />);

            act(() => {
                fireEvent.click(screen.getByTestId('edit-button'));
            });

            await act(async () => {
                fireEvent.click(screen.getByTestId('save-button'));
            });

            await waitFor(() => {
                expect(screen.getByTestId('errors')).toHaveTextContent('Email already in use');
            });

            // Should stay in edit mode
            expect(screen.getByTestId('coach-hero-section-edit')).toBeInTheDocument();
        });

        it('handles API errors with rollback', async () => {
            const { validateCoachProfile } = require('../../../utils/validation');
            validateCoachProfile.mockReturnValue({});

            (global.fetch as jest.Mock).mockResolvedValue({
                ok: false,
                status: 500,
                json: async () => ({
                    success: false,
                    error: 'Internal server error',
                }),
            });

            render(<CoachProfileView {...defaultProps} />);

            act(() => {
                fireEvent.click(screen.getByTestId('edit-button'));
            });

            await act(async () => {
                fireEvent.click(screen.getByTestId('save-button'));
            });

            await waitFor(() => {
                expect(screen.getByTestId('errors')).toHaveTextContent('Internal server error');
            });

            // Data should be rolled back
            expect(screen.getByTestId('form-first-name')).toHaveTextContent('John');
        });

        it('handles network errors with rollback', async () => {
            const { validateCoachProfile } = require('../../../utils/validation');
            validateCoachProfile.mockReturnValue({});

            (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

            render(<CoachProfileView {...defaultProps} />);

            act(() => {
                fireEvent.click(screen.getByTestId('edit-button'));
            });

            await act(async () => {
                fireEvent.click(screen.getByTestId('save-button'));
            });

            await waitFor(() => {
                expect(screen.getByTestId('errors')).toHaveTextContent('Network error');
            });
        });

        it('calls onDataUpdate callback when provided', async () => {
            const { validateCoachProfile } = require('../../../utils/validation');
            validateCoachProfile.mockReturnValue({});

            const onDataUpdate = jest.fn();

            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: async () => ({
                    success: true,
                    data: mockCoachData,
                }),
            });

            render(<CoachProfileView {...defaultProps} onDataUpdate={onDataUpdate} />);

            act(() => {
                fireEvent.click(screen.getByTestId('edit-button'));
            });

            await act(async () => {
                fireEvent.click(screen.getByTestId('save-button'));
            });

            await waitFor(() => {
                expect(onDataUpdate).toHaveBeenCalledWith(mockCoachData);
            });
        });

        it('shows saving state during API call', async () => {
            const { validateCoachProfile } = require('../../../utils/validation');
            validateCoachProfile.mockReturnValue({});

            let resolvePromise: any;
            const promise = new Promise((resolve) => {
                resolvePromise = resolve;
            });

            (global.fetch as jest.Mock).mockReturnValue(promise);

            render(<CoachProfileView {...defaultProps} />);

            act(() => {
                fireEvent.click(screen.getByTestId('edit-button'));
            });

            act(() => {
                fireEvent.click(screen.getByTestId('save-button'));
            });

            // Should show saving state
            await waitFor(() => {
                expect(screen.getByTestId('is-saving')).toHaveTextContent('true');
            });

            // Resolve the promise
            await act(async () => {
                resolvePromise({
                    ok: true,
                    json: async () => ({
                        success: true,
                        data: mockCoachData,
                    }),
                });
            });

            // Saving state should be cleared
            await waitFor(() => {
                expect(screen.queryByTestId('is-saving')).not.toBeInTheDocument();
            });
        });
    });

    describe('success notification', () => {
        it('shows success notification after save', async () => {
            const { validateCoachProfile } = require('../../../utils/validation');
            validateCoachProfile.mockReturnValue({});

            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: async () => ({
                    success: true,
                    data: mockCoachData,
                }),
            });

            render(<CoachProfileView {...defaultProps} />);

            act(() => {
                fireEvent.click(screen.getByTestId('edit-button'));
            });

            await act(async () => {
                fireEvent.click(screen.getByTestId('save-button'));
            });

            await waitFor(() => {
                expect(screen.getByTestId('success-notification')).toBeInTheDocument();
            });
        });

        it('dismisses notification when clicked', async () => {
            const { validateCoachProfile } = require('../../../utils/validation');
            validateCoachProfile.mockReturnValue({});

            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: async () => ({
                    success: true,
                    data: mockCoachData,
                }),
            });

            render(<CoachProfileView {...defaultProps} />);

            act(() => {
                fireEvent.click(screen.getByTestId('edit-button'));
            });

            await act(async () => {
                fireEvent.click(screen.getByTestId('save-button'));
            });

            await waitFor(() => {
                expect(screen.getByTestId('success-notification')).toBeInTheDocument();
            });

            act(() => {
                fireEvent.click(screen.getByTestId('success-notification'));
            });

            expect(screen.queryByTestId('success-notification')).not.toBeInTheDocument();
        });
    });

    describe('Empty State Handling', () => {
        describe('required field validation', () => {
            it('prevents saving when firstName is empty', async () => {
                const { validateCoachProfile } = require('../../../utils/validation');
                validateCoachProfile.mockReturnValue({
                    firstName: 'This field is required',
                });

                render(<CoachProfileView {...defaultProps} />);

                act(() => {
                    fireEvent.click(screen.getByTestId('edit-button'));
                });

                act(() => {
                    fireEvent.click(screen.getByTestId('save-button'));
                });

                // Should show validation error
                expect(screen.getByTestId('errors')).toHaveTextContent('This field is required');

                // Should not call API
                expect(global.fetch).not.toHaveBeenCalled();

                // Should stay in edit mode
                expect(screen.getByTestId('coach-hero-section-edit')).toBeInTheDocument();
            });

            it('prevents saving when lastName is empty', async () => {
                const { validateCoachProfile } = require('../../../utils/validation');
                validateCoachProfile.mockReturnValue({
                    lastName: 'This field is required',
                });

                render(<CoachProfileView {...defaultProps} />);

                act(() => {
                    fireEvent.click(screen.getByTestId('edit-button'));
                });

                act(() => {
                    fireEvent.click(screen.getByTestId('save-button'));
                });

                // Should show validation error
                expect(screen.getByTestId('errors')).toHaveTextContent('This field is required');

                // Should not call API
                expect(global.fetch).not.toHaveBeenCalled();
            });

            it('prevents saving when email is empty', async () => {
                const { validateCoachProfile } = require('../../../utils/validation');
                validateCoachProfile.mockReturnValue({
                    email: 'This field is required',
                });

                render(<CoachProfileView {...defaultProps} />);

                act(() => {
                    fireEvent.click(screen.getByTestId('edit-button'));
                });

                act(() => {
                    fireEvent.click(screen.getByTestId('save-button'));
                });

                // Should show validation error
                expect(screen.getByTestId('errors')).toHaveTextContent('This field is required');

                // Should not call API
                expect(global.fetch).not.toHaveBeenCalled();
            });

            it('prevents saving when multiple required fields are empty', async () => {
                const { validateCoachProfile } = require('../../../utils/validation');
                validateCoachProfile.mockReturnValue({
                    firstName: 'This field is required',
                    lastName: 'This field is required',
                    email: 'This field is required',
                });

                render(<CoachProfileView {...defaultProps} />);

                act(() => {
                    fireEvent.click(screen.getByTestId('edit-button'));
                });

                act(() => {
                    fireEvent.click(screen.getByTestId('save-button'));
                });

                // Should show all validation errors
                const errorsText = screen.getByTestId('errors').textContent;
                expect(errorsText).toContain('firstName');
                expect(errorsText).toContain('lastName');
                expect(errorsText).toContain('email');

                // Should not call API
                expect(global.fetch).not.toHaveBeenCalled();
            });
        });

        describe('optional field handling', () => {
            it('allows saving with empty optional fields', async () => {
                const { validateCoachProfile } = require('../../../utils/validation');
                validateCoachProfile.mockReturnValue({});

                const minimalCoach: CoachProfile = {
                    id: 'coach-123',
                    firstName: 'John',
                    lastName: 'Smith',
                    initials: 'JS',
                    email: 'john.smith@university.edu',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                (global.fetch as jest.Mock).mockResolvedValue({
                    ok: true,
                    json: async () => ({
                        success: true,
                        data: minimalCoach,
                    }),
                });

                render(<CoachProfileView {...defaultProps} initialData={minimalCoach} />);

                act(() => {
                    fireEvent.click(screen.getByTestId('edit-button'));
                });

                await act(async () => {
                    fireEvent.click(screen.getByTestId('save-button'));
                });

                // Should call API successfully
                await waitFor(() => {
                    expect(global.fetch).toHaveBeenCalled();
                });

                // Should show success notification
                await waitFor(() => {
                    expect(screen.getByTestId('success-notification')).toBeInTheDocument();
                });
            });

            it('allows saving when phone is empty', async () => {
                const { validateCoachProfile } = require('../../../utils/validation');
                validateCoachProfile.mockReturnValue({});

                const coachWithoutPhone = { ...mockCoachData, phone: undefined };

                (global.fetch as jest.Mock).mockResolvedValue({
                    ok: true,
                    json: async () => ({
                        success: true,
                        data: coachWithoutPhone,
                    }),
                });

                render(<CoachProfileView {...defaultProps} initialData={coachWithoutPhone} />);

                act(() => {
                    fireEvent.click(screen.getByTestId('edit-button'));
                });

                await act(async () => {
                    fireEvent.click(screen.getByTestId('save-button'));
                });

                await waitFor(() => {
                    expect(global.fetch).toHaveBeenCalled();
                    expect(screen.getByTestId('success-notification')).toBeInTheDocument();
                });
            });

            it('allows saving when university, position, and sport are empty', async () => {
                const { validateCoachProfile } = require('../../../utils/validation');
                validateCoachProfile.mockReturnValue({});

                const coachWithoutOptionalFields = {
                    ...mockCoachData,
                    university: undefined,
                    position: undefined,
                    sport: undefined,
                };

                (global.fetch as jest.Mock).mockResolvedValue({
                    ok: true,
                    json: async () => ({
                        success: true,
                        data: coachWithoutOptionalFields,
                    }),
                });

                render(<CoachProfileView {...defaultProps} initialData={coachWithoutOptionalFields} />);

                act(() => {
                    fireEvent.click(screen.getByTestId('edit-button'));
                });

                await act(async () => {
                    fireEvent.click(screen.getByTestId('save-button'));
                });

                await waitFor(() => {
                    expect(global.fetch).toHaveBeenCalled();
                    expect(screen.getByTestId('success-notification')).toBeInTheDocument();
                });
            });

            it('allows saving when profileImage and teamWebsiteUrl are empty', async () => {
                const { validateCoachProfile } = require('../../../utils/validation');
                validateCoachProfile.mockReturnValue({});

                const coachWithoutUrls = {
                    ...mockCoachData,
                    profileImage: undefined,
                    teamWebsiteUrl: undefined,
                };

                (global.fetch as jest.Mock).mockResolvedValue({
                    ok: true,
                    json: async () => ({
                        success: true,
                        data: coachWithoutUrls,
                    }),
                });

                render(<CoachProfileView {...defaultProps} initialData={coachWithoutUrls} />);

                act(() => {
                    fireEvent.click(screen.getByTestId('edit-button'));
                });

                await act(async () => {
                    fireEvent.click(screen.getByTestId('save-button'));
                });

                await waitFor(() => {
                    expect(global.fetch).toHaveBeenCalled();
                    expect(screen.getByTestId('success-notification')).toBeInTheDocument();
                });
            });
        });
    });
});
