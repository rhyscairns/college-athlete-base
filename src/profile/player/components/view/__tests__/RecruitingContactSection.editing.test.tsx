import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RecruitingContactSection } from '../RecruitingContactSection';

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

const mockContact = {
    email: 'player@example.com',
    phone: '(555) 123-4567',
    socialMedia: {
        twitter: 'https://twitter.com/player',
        instagram: 'https://instagram.com/player',
        hudl: 'https://hudl.com/player',
    },
    headCoach: {
        name: 'Coach Smith',
        email: 'coach@example.com',
        phone: '(555) 987-6543',
    },
};

describe('RecruitingContactSection - Inline Editing', () => {
    describe('Edit Button Visibility', () => {
        it('shows edit button when user is owner and not editing', () => {
            const onEdit = jest.fn();
            render(
                <RecruitingContactSection
                    contact={mockContact}
                    isOwner={true}
                    isEditing={false}
                    isAnyOtherSectionEditing={false}
                    onEdit={onEdit}
                />
            );

            const editButton = screen.getByRole('button', { name: /edit/i });
            expect(editButton).toBeInTheDocument();
            expect(editButton).not.toBeDisabled();
        });

        it('hides edit button when user is not owner', () => {
            render(
                <RecruitingContactSection
                    contact={mockContact}
                    isOwner={false}
                    isEditing={false}
                    isAnyOtherSectionEditing={false}
                />
            );

            const editButton = screen.queryByRole('button', { name: /edit/i });
            expect(editButton).not.toBeInTheDocument();
        });

        it('hides edit button when section is in edit mode', () => {
            render(
                <RecruitingContactSection
                    contact={mockContact}
                    isOwner={true}
                    isEditing={true}
                    isAnyOtherSectionEditing={false}
                />
            );

            const editButton = screen.queryByRole('button', { name: /edit/i });
            expect(editButton).not.toBeInTheDocument();
        });

        it('disables edit button when another section is being edited', () => {
            render(
                <RecruitingContactSection
                    contact={mockContact}
                    isOwner={true}
                    isEditing={false}
                    isAnyOtherSectionEditing={true}
                />
            );

            const editButton = screen.getByRole('button', { name: /edit/i });
            expect(editButton).toBeDisabled();
        });
    });

    describe('Edit Mode Activation', () => {
        it('calls onEdit when edit button is clicked', () => {
            const onEdit = jest.fn();
            render(
                <RecruitingContactSection
                    contact={mockContact}
                    isOwner={true}
                    isEditing={false}
                    isAnyOtherSectionEditing={false}
                    onEdit={onEdit}
                />
            );

            const editButton = screen.getByRole('button', { name: /edit/i });
            fireEvent.click(editButton);

            expect(onEdit).toHaveBeenCalledTimes(1);
        });

        it('renders edit form when isEditing is true', () => {
            render(
                <RecruitingContactSection
                    contact={mockContact}
                    isOwner={true}
                    isEditing={true}
                    isAnyOtherSectionEditing={false}
                />
            );

            // Check for form inputs by their values
            expect(screen.getByDisplayValue(mockContact.email)).toBeInTheDocument();
            expect(screen.getByDisplayValue(mockContact.phone)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
        });

        it('applies edit mode styling when isEditing is true', () => {
            const { container } = render(
                <RecruitingContactSection
                    contact={mockContact}
                    isOwner={true}
                    isEditing={true}
                    isAnyOtherSectionEditing={false}
                />
            );

            const section = container.querySelector('section');
            expect(section).toHaveClass('bg-blue-500/5');
            expect(section).toHaveClass('border-blue-500/20');
        });
    });

    describe('Form Data Management', () => {
        it('populates form with current contact data', () => {
            render(
                <RecruitingContactSection
                    contact={mockContact}
                    isOwner={true}
                    isEditing={true}
                    isAnyOtherSectionEditing={false}
                />
            );

            // Use id to select specific inputs
            const emailInput = screen.getByDisplayValue(mockContact.email) as HTMLInputElement;
            const phoneInput = screen.getByDisplayValue(mockContact.phone) as HTMLInputElement;

            expect(emailInput.value).toBe(mockContact.email);
            expect(phoneInput.value).toBe(mockContact.phone);
        });

        it('updates form data when inputs change', () => {
            render(
                <RecruitingContactSection
                    contact={mockContact}
                    isOwner={true}
                    isEditing={true}
                    isAnyOtherSectionEditing={false}
                />
            );

            const emailInput = screen.getByDisplayValue(mockContact.email) as HTMLInputElement;
            fireEvent.change(emailInput, { target: { value: 'newemail@example.com' } });

            expect(emailInput.value).toBe('newemail@example.com');
        });
    });

    describe('Save Functionality', () => {
        it('calls onSave with updated data when save button is clicked', async () => {
            const onSave = jest.fn();
            render(
                <RecruitingContactSection
                    contact={mockContact}
                    isOwner={true}
                    isEditing={true}
                    isAnyOtherSectionEditing={false}
                    onSave={onSave}
                />
            );

            const emailInput = screen.getByDisplayValue(mockContact.email);
            fireEvent.change(emailInput, { target: { value: 'updated@example.com' } });

            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);

            await waitFor(() => {
                expect(onSave).toHaveBeenCalledTimes(1);
                expect(onSave).toHaveBeenCalledWith(
                    expect.objectContaining({
                        contact: expect.objectContaining({
                            email: 'updated@example.com',
                        }),
                    })
                );
            });
        });

        it('shows loading state while saving', async () => {
            render(
                <RecruitingContactSection
                    contact={mockContact}
                    isOwner={true}
                    isEditing={true}
                    isAnyOtherSectionEditing={false}
                />
            );

            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);

            // Check for loading state (button should be disabled)
            expect(saveButton).toBeDisabled();

            // Wait for save to complete
            await waitFor(() => {
                expect(saveButton).not.toBeDisabled();
            });
        });

        it('disables form inputs while saving', async () => {
            render(
                <RecruitingContactSection
                    contact={mockContact}
                    isOwner={true}
                    isEditing={true}
                    isAnyOtherSectionEditing={false}
                />
            );

            const emailInput = screen.getByDisplayValue(mockContact.email);
            const saveButton = screen.getByRole('button', { name: /save/i });

            fireEvent.click(saveButton);

            // Inputs should be disabled during save
            expect(emailInput).toBeDisabled();

            // Wait for save to complete
            await waitFor(() => {
                expect(emailInput).not.toBeDisabled();
            });
        });
    });

    describe('Cancel Functionality', () => {
        it('calls onCancel when cancel button is clicked', () => {
            const onCancel = jest.fn();
            render(
                <RecruitingContactSection
                    contact={mockContact}
                    isOwner={true}
                    isEditing={true}
                    isAnyOtherSectionEditing={false}
                    onCancel={onCancel}
                />
            );

            const cancelButton = screen.getByRole('button', { name: /cancel/i });
            fireEvent.click(cancelButton);

            expect(onCancel).toHaveBeenCalledTimes(1);
        });

        it('resets form data to original values when cancelled', () => {
            const { rerender } = render(
                <RecruitingContactSection
                    contact={mockContact}
                    isOwner={true}
                    isEditing={true}
                    isAnyOtherSectionEditing={false}
                />
            );

            const emailInput = screen.getByDisplayValue(mockContact.email) as HTMLInputElement;
            fireEvent.change(emailInput, { target: { value: 'changed@example.com' } });
            expect(emailInput.value).toBe('changed@example.com');

            const cancelButton = screen.getByRole('button', { name: /cancel/i });
            fireEvent.click(cancelButton);

            // Simulate exiting edit mode
            rerender(
                <RecruitingContactSection
                    contact={mockContact}
                    isOwner={true}
                    isEditing={false}
                    isAnyOtherSectionEditing={false}
                />
            );

            // Re-enter edit mode
            rerender(
                <RecruitingContactSection
                    contact={mockContact}
                    isOwner={true}
                    isEditing={true}
                    isAnyOtherSectionEditing={false}
                />
            );

            const emailInputAfter = screen.getByDisplayValue(mockContact.email) as HTMLInputElement;
            expect(emailInputAfter.value).toBe(mockContact.email);
        });
    });

    describe('View Mode Display', () => {
        it('displays contact information in view mode', () => {
            render(
                <RecruitingContactSection
                    contact={mockContact}
                    isOwner={true}
                    isEditing={false}
                    isAnyOtherSectionEditing={false}
                />
            );

            expect(screen.getByText(mockContact.email)).toBeInTheDocument();
            expect(screen.getByText(mockContact.phone)).toBeInTheDocument();
            expect(screen.getByText(mockContact.headCoach.name)).toBeInTheDocument();
        });

        it('does not show form inputs in view mode', () => {
            render(
                <RecruitingContactSection
                    contact={mockContact}
                    isOwner={true}
                    isEditing={false}
                    isAnyOtherSectionEditing={false}
                />
            );

            // In view mode, there should be no input elements
            const inputs = document.querySelectorAll('input');
            expect(inputs.length).toBe(0);
            expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
            expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
        });
    });

    describe('Scroll Behavior', () => {
        it('scrolls section into view when entering edit mode', () => {
            const scrollIntoViewMock = jest.fn();
            Element.prototype.scrollIntoView = scrollIntoViewMock;

            const { rerender } = render(
                <RecruitingContactSection
                    contact={mockContact}
                    isOwner={true}
                    isEditing={false}
                    isAnyOtherSectionEditing={false}
                />
            );

            // Enter edit mode
            rerender(
                <RecruitingContactSection
                    contact={mockContact}
                    isOwner={true}
                    isEditing={true}
                    isAnyOtherSectionEditing={false}
                />
            );

            expect(scrollIntoViewMock).toHaveBeenCalledWith({
                behavior: 'smooth',
                block: 'start',
            });
        });
    });
});
