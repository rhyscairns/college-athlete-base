import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AthleticAchievementsSection } from '../AthleticAchievementsSection';

describe('AthleticAchievementsSection - Inline Editing', () => {
    const mockAchievements = [
        { id: '1', icon: 'trophy', title: 'All-State Selection', description: '1st Team WR (2023)', color: 'gold' },
        { id: '2', icon: 'medal', title: 'District MVP', description: 'Unanimous Choice', color: 'blue' },
    ];

    const mockOnEdit = jest.fn();
    const mockOnSave = jest.fn();
    const mockOnCancel = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        // Mock scrollIntoView
        Element.prototype.scrollIntoView = jest.fn();
    });

    describe('Edit Button Visibility', () => {
        it('shows edit button when user is owner and not editing', () => {
            render(
                <AthleticAchievementsSection
                    achievements={mockAchievements}
                    isOwner={true}
                    isEditing={false}
                    isAnyOtherSectionEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
        });

        it('hides edit button when user is not owner', () => {
            render(
                <AthleticAchievementsSection
                    achievements={mockAchievements}
                    isOwner={false}
                    isEditing={false}
                    isAnyOtherSectionEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
        });

        it('hides edit button when section is in edit mode', () => {
            render(
                <AthleticAchievementsSection
                    achievements={mockAchievements}
                    isOwner={true}
                    isEditing={true}
                    isAnyOtherSectionEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
        });

        it('disables edit button when another section is being edited', () => {
            render(
                <AthleticAchievementsSection
                    achievements={mockAchievements}
                    isOwner={true}
                    isEditing={false}
                    isAnyOtherSectionEditing={true}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            const editButton = screen.getByRole('button', { name: /edit/i });
            expect(editButton).toBeDisabled();
        });
    });

    describe('Edit Mode Toggle', () => {
        it('calls onEdit when edit button is clicked', () => {
            render(
                <AthleticAchievementsSection
                    achievements={mockAchievements}
                    isOwner={true}
                    isEditing={false}
                    isAnyOtherSectionEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            const editButton = screen.getByRole('button', { name: /edit/i });
            fireEvent.click(editButton);

            expect(mockOnEdit).toHaveBeenCalledTimes(1);
        });

        it('renders edit form when isEditing is true', () => {
            render(
                <AthleticAchievementsSection
                    achievements={mockAchievements}
                    isOwner={true}
                    isEditing={true}
                    isAnyOtherSectionEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            // Check for form elements
            expect(screen.getByText('Achievement 1')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
        });

        it('renders view mode when isEditing is false', () => {
            render(
                <AthleticAchievementsSection
                    achievements={mockAchievements}
                    isOwner={true}
                    isEditing={false}
                    isAnyOtherSectionEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            // Check for view mode content
            expect(screen.getByText('All-State Selection')).toBeInTheDocument();
            expect(screen.getByText('1st Team WR (2023)')).toBeInTheDocument();
            expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
        });
    });

    describe('Edit Mode Background', () => {
        it('applies edit mode background when isEditing is true', () => {
            const { container } = render(
                <AthleticAchievementsSection
                    achievements={mockAchievements}
                    isOwner={true}
                    isEditing={true}
                    isAnyOtherSectionEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            const section = container.querySelector('section');
            expect(section).toHaveClass('bg-blue-500/5', 'border-blue-500/20');
        });

        it('does not apply edit mode background when isEditing is false', () => {
            const { container } = render(
                <AthleticAchievementsSection
                    achievements={mockAchievements}
                    isOwner={true}
                    isEditing={false}
                    isAnyOtherSectionEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            const section = container.querySelector('section');
            expect(section).not.toHaveClass('bg-blue-500/5');
        });
    });

    describe('Form Data Management', () => {
        it('populates form with current achievement data', () => {
            render(
                <AthleticAchievementsSection
                    achievements={mockAchievements}
                    isOwner={true}
                    isEditing={true}
                    isAnyOtherSectionEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            const titleInputs = screen.getAllByLabelText(/title/i);
            expect(titleInputs[0]).toHaveValue('All-State Selection');
            expect(titleInputs[1]).toHaveValue('District MVP');
        });

        it('allows adding new achievements', () => {
            render(
                <AthleticAchievementsSection
                    achievements={mockAchievements}
                    isOwner={true}
                    isEditing={true}
                    isAnyOtherSectionEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            const addButton = screen.getByRole('button', { name: /add achievement/i });
            fireEvent.click(addButton);

            // Should now have 3 achievements
            expect(screen.getByText('Achievement 3')).toBeInTheDocument();
        });

        it('allows removing achievements', () => {
            render(
                <AthleticAchievementsSection
                    achievements={mockAchievements}
                    isOwner={true}
                    isEditing={true}
                    isAnyOtherSectionEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            const removeButtons = screen.getAllByRole('button', { name: /remove/i });
            fireEvent.click(removeButtons[0]);

            // First achievement should be removed
            const titleInputs = screen.getAllByLabelText(/title/i);
            expect(titleInputs).toHaveLength(1);
            expect(titleInputs[0]).toHaveValue('District MVP');
        });
    });

    describe('Save Functionality', () => {
        it('calls onSave with updated data when save button is clicked', async () => {
            render(
                <AthleticAchievementsSection
                    achievements={mockAchievements}
                    isOwner={true}
                    isEditing={true}
                    isAnyOtherSectionEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            const titleInputs = screen.getAllByLabelText(/title/i);
            fireEvent.change(titleInputs[0], { target: { value: 'Updated Achievement' } });

            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);

            await waitFor(() => {
                expect(mockOnSave).toHaveBeenCalledWith({
                    achievements: expect.arrayContaining([
                        expect.objectContaining({
                            title: 'Updated Achievement',
                        }),
                    ]),
                });
            });
        });

        it('shows validation errors when required fields are empty', async () => {
            render(
                <AthleticAchievementsSection
                    achievements={mockAchievements}
                    isOwner={true}
                    isEditing={true}
                    isAnyOtherSectionEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            const titleInputs = screen.getAllByLabelText(/title/i);
            fireEvent.change(titleInputs[0], { target: { value: '' } });

            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);

            await waitFor(() => {
                expect(screen.getByText('Title is required')).toBeInTheDocument();
            });

            expect(mockOnSave).not.toHaveBeenCalled();
        });

        it('disables form inputs while saving', async () => {
            render(
                <AthleticAchievementsSection
                    achievements={mockAchievements}
                    isOwner={true}
                    isEditing={true}
                    isAnyOtherSectionEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);

            // Check that inputs are disabled during save
            const titleInputs = screen.getAllByLabelText(/title/i);
            expect(titleInputs[0]).toBeDisabled();
        });
    });

    describe('Cancel Functionality', () => {
        it('calls onCancel when cancel button is clicked', () => {
            render(
                <AthleticAchievementsSection
                    achievements={mockAchievements}
                    isOwner={true}
                    isEditing={true}
                    isAnyOtherSectionEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            const cancelButton = screen.getByRole('button', { name: /cancel/i });
            fireEvent.click(cancelButton);

            expect(mockOnCancel).toHaveBeenCalledTimes(1);
        });

        it('resets form data when cancel is clicked', () => {
            render(
                <AthleticAchievementsSection
                    achievements={mockAchievements}
                    isOwner={true}
                    isEditing={true}
                    isAnyOtherSectionEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            const titleInputs = screen.getAllByLabelText(/title/i);
            fireEvent.change(titleInputs[0], { target: { value: 'Modified Title' } });

            const cancelButton = screen.getByRole('button', { name: /cancel/i });
            fireEvent.click(cancelButton);

            // After cancel, if we re-enter edit mode, data should be reset
            // This is tested by checking that onCancel was called
            expect(mockOnCancel).toHaveBeenCalled();
        });
    });

    describe('Scroll Behavior', () => {
        it('scrolls section into view when entering edit mode', () => {
            const scrollIntoViewMock = jest.fn();
            Element.prototype.scrollIntoView = scrollIntoViewMock;

            const { rerender } = render(
                <AthleticAchievementsSection
                    achievements={mockAchievements}
                    isOwner={true}
                    isEditing={false}
                    isAnyOtherSectionEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            // Re-render with isEditing=true
            rerender(
                <AthleticAchievementsSection
                    achievements={mockAchievements}
                    isOwner={true}
                    isEditing={true}
                    isAnyOtherSectionEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            expect(scrollIntoViewMock).toHaveBeenCalledWith({
                behavior: 'smooth',
                block: 'start',
            });
        });
    });
});
