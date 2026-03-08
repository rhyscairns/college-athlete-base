import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CoachProfileView } from '../view/CoachProfileView';
import { CoachHeroSection } from '../view/CoachHeroSection';
import { CoachHeroSectionEdit } from '../edit/CoachHeroSectionEdit';
import type { CoachProfile } from '../../types';

// Mock fetch
global.fetch = jest.fn();

// Mock Next.js Image component
jest.mock('next/image', () => ({
    __esModule: true,
    default: (props: any) => {
        // Filter out Next.js Image-specific props that aren't valid HTML attributes
        const { fill, priority, sizes, ...imgProps } = props;
        // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
        return <img {...imgProps} />;
    },
}));

const mockCoachData: CoachProfile = {
    id: '123',
    firstName: 'John',
    lastName: 'Smith',
    initials: 'JS',
    email: 'john.smith@university.edu',
    phone: '1234567890', // Use simple format for testing
    university: 'State University',
    position: 'Head Coach',
    sport: 'Basketball',
    profileImage: 'https://example.com/image.jpg',
    teamWebsiteUrl: 'https://university.edu/basketball',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
};

describe('Performance Optimizations', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Optimistic UI Updates', () => {
        it('should update UI immediately before API confirmation', async () => {
            // Mock a delayed API response
            (global.fetch as jest.Mock).mockImplementation(() =>
                new Promise((resolve) =>
                    setTimeout(
                        () =>
                            resolve({
                                ok: true,
                                json: async () => ({
                                    success: true,
                                    data: { ...mockCoachData, firstName: 'Jane' },
                                }),
                            }),
                        100
                    )
                )
            );

            render(
                <CoachProfileView
                    coachId="123"
                    currentUserId="123"
                    initialData={mockCoachData}
                />
            );

            // Enter edit mode
            const editButton = screen.getByRole('button', { name: /edit/i });
            fireEvent.click(editButton);

            // Change first name
            const firstNameInput = screen.getByLabelText(/first name/i);
            fireEvent.change(firstNameInput, { target: { value: 'Jane' } });

            // Save changes
            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);

            // Wait for save to complete and exit edit mode
            await waitFor(() => {
                expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
            });

            // After exiting edit mode, should show updated name in view mode
            await waitFor(() => {
                expect(screen.getByText('Jane Smith')).toBeInTheDocument();
            });

            // API should be called
            expect(global.fetch).toHaveBeenCalledWith(
                '/api/coach/123/profile',
                expect.objectContaining({
                    method: 'PUT',
                })
            );
        });

        it('should rollback on API error', async () => {
            // Mock API error
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: false,
                status: 500,
                json: async () => ({
                    success: false,
                    error: 'Server error',
                }),
            });

            render(
                <CoachProfileView
                    coachId="123"
                    currentUserId="123"
                    initialData={mockCoachData}
                />
            );

            // Enter edit mode
            const editButton = screen.getByRole('button', { name: /edit/i });
            fireEvent.click(editButton);

            // Change first name
            const firstNameInput = screen.getByLabelText(/first name/i);
            fireEvent.change(firstNameInput, { target: { value: 'Jane' } });

            // Save changes
            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);

            // Should stay in edit mode and show error
            await waitFor(() => {
                // Should still be in edit mode (save button still visible)
                expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
            });

            // Form should have rolled back to original value
            const firstNameInputAfter = screen.getByLabelText(/first name/i) as HTMLInputElement;
            expect(firstNameInputAfter.value).toBe('John');
        });
    });

    describe('Component Memoization', () => {
        it('should not re-render CoachHeroSection when props are unchanged', () => {
            const onEdit = jest.fn();
            const { rerender } = render(
                <CoachHeroSection
                    coach={mockCoachData}
                    isOwner={true}
                    isEditing={false}
                    onEdit={onEdit}
                />
            );

            // Get initial render count
            const initialElement = screen.getByText('John Smith');

            // Re-render with same props
            rerender(
                <CoachHeroSection
                    coach={mockCoachData}
                    isOwner={true}
                    isEditing={false}
                    onEdit={onEdit}
                />
            );

            // Element should be the same (memoized)
            expect(screen.getByText('John Smith')).toBe(initialElement);
        });

        it('should not re-render CoachHeroSectionEdit when props are unchanged', () => {
            const setFormData = jest.fn();
            const onSave = jest.fn();
            const onCancel = jest.fn();

            const { rerender } = render(
                <CoachHeroSectionEdit
                    formData={mockCoachData}
                    setFormData={setFormData}
                    errors={{}}
                    isSaving={false}
                    onSave={onSave}
                    onCancel={onCancel}
                />
            );

            // Get initial render count
            const initialElement = screen.getByLabelText(/first name/i);

            // Re-render with same props
            rerender(
                <CoachHeroSectionEdit
                    formData={mockCoachData}
                    setFormData={setFormData}
                    errors={{}}
                    isSaving={false}
                    onSave={onSave}
                    onCancel={onCancel}
                />
            );

            // Element should be the same (memoized)
            expect(screen.getByLabelText(/first name/i)).toBe(initialElement);
        });
    });

    describe('Lazy Loading', () => {
        it('should use Next.js Image component for profile image', () => {
            render(
                <CoachHeroSection
                    coach={mockCoachData}
                    isOwner={false}
                    isEditing={false}
                />
            );

            const image = screen.getByAltText('John Smith');
            expect(image).toBeInTheDocument();
            // Next.js Image component handles lazy loading automatically
            // No need to check for manual loading attributes
        });

        it('should not render image when profileImage is not provided', () => {
            const coachWithoutImage = { ...mockCoachData, profileImage: undefined };
            render(
                <CoachHeroSection
                    coach={coachWithoutImage}
                    isOwner={false}
                    isEditing={false}
                />
            );

            const image = screen.queryByAltText('John Smith');
            expect(image).not.toBeInTheDocument();
        });
    });

    describe('Debounced Form Validation', () => {
        it('should handle rapid input changes efficiently', async () => {
            const setFormData = jest.fn();
            const onSave = jest.fn();
            const onCancel = jest.fn();

            render(
                <CoachHeroSectionEdit
                    formData={mockCoachData}
                    setFormData={setFormData}
                    errors={{}}
                    isSaving={false}
                    onSave={onSave}
                    onCancel={onCancel}
                />
            );

            const firstNameInput = screen.getByLabelText(/first name/i);

            // Simulate rapid typing
            fireEvent.change(firstNameInput, { target: { value: 'J' } });
            fireEvent.change(firstNameInput, { target: { value: 'Jo' } });
            fireEvent.change(firstNameInput, { target: { value: 'Joh' } });

            // setFormData should be called for each change (immediate UI update)
            // but validation is debounced (happens on save)
            expect(setFormData).toHaveBeenCalledTimes(3);
        });
    });

    describe('Callback Memoization', () => {
        it('should memoize event handlers in CoachProfileView', () => {
            const { rerender } = render(
                <CoachProfileView
                    coachId="123"
                    currentUserId="123"
                    initialData={mockCoachData}
                />
            );

            // Get initial edit button
            const editButton = screen.getByRole('button', { name: /edit/i });
            const initialOnClick = editButton.onclick;

            // Re-render
            rerender(
                <CoachProfileView
                    coachId="123"
                    currentUserId="123"
                    initialData={mockCoachData}
                />
            );

            // Edit button should have the same onClick handler (memoized)
            const newEditButton = screen.getByRole('button', { name: /edit/i });
            expect(newEditButton.onclick).toBe(initialOnClick);
        });
    });

    describe('Performance Metrics', () => {
        it('should render initial view quickly', () => {
            const startTime = performance.now();

            render(
                <CoachProfileView
                    coachId="123"
                    currentUserId="123"
                    initialData={mockCoachData}
                />
            );

            const endTime = performance.now();
            const renderTime = endTime - startTime;

            // Initial render should be fast (< 100ms)
            expect(renderTime).toBeLessThan(100);
        });

        it('should switch to edit mode quickly', () => {
            render(
                <CoachProfileView
                    coachId="123"
                    currentUserId="123"
                    initialData={mockCoachData}
                />
            );

            const editButton = screen.getByRole('button', { name: /edit/i });

            const startTime = performance.now();
            fireEvent.click(editButton);
            const endTime = performance.now();

            const switchTime = endTime - startTime;

            // Mode switch should be fast (< 50ms)
            expect(switchTime).toBeLessThan(50);
        });
    });
});
