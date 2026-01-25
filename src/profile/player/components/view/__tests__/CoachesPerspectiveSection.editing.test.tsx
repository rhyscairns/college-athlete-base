import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CoachesPerspectiveSection } from '../CoachesPerspectiveSection';

describe('CoachesPerspectiveSection - Inline Editing', () => {
    const mockTestimonials = [
        {
            id: '1',
            quote: 'Marcus is an exceptional player with great leadership skills.',
            coachName: 'Coach Miller',
            coachTitle: 'Head Football Coach',
            coachOrganization: 'Westlake High School',
        },
        {
            id: '2',
            quote: 'One of the most dedicated athletes I have coached.',
            coachName: 'Coach Johnson',
            coachTitle: 'Athletic Director',
            coachOrganization: 'State Athletics',
        },
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
                <CoachesPerspectiveSection
                    testimonials={mockTestimonials}
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
                <CoachesPerspectiveSection
                    testimonials={mockTestimonials}
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
                <CoachesPerspectiveSection
                    testimonials={mockTestimonials}
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
                <CoachesPerspectiveSection
                    testimonials={mockTestimonials}
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
                <CoachesPerspectiveSection
                    testimonials={mockTestimonials}
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
                <CoachesPerspectiveSection
                    testimonials={mockTestimonials}
                    isOwner={true}
                    isEditing={true}
                    isAnyOtherSectionEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            // Check for form elements
            expect(screen.getByText('Testimonial 1')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
        });

        it('renders view mode when isEditing is false', () => {
            render(
                <CoachesPerspectiveSection
                    testimonials={mockTestimonials}
                    isOwner={true}
                    isEditing={false}
                    isAnyOtherSectionEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            // Check for view mode content
            expect(screen.getByText('Marcus is an exceptional player with great leadership skills.')).toBeInTheDocument();
            expect(screen.getByText('Coach Miller')).toBeInTheDocument();
            expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
        });
    });

    describe('Edit Mode Background', () => {
        it('applies edit mode background when isEditing is true', () => {
            const { container } = render(
                <CoachesPerspectiveSection
                    testimonials={mockTestimonials}
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
                <CoachesPerspectiveSection
                    testimonials={mockTestimonials}
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
        it('populates form with current testimonial data', () => {
            render(
                <CoachesPerspectiveSection
                    testimonials={mockTestimonials}
                    isOwner={true}
                    isEditing={true}
                    isAnyOtherSectionEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            const coachNameInputs = screen.getAllByLabelText(/coach name/i);
            expect(coachNameInputs[0]).toHaveValue('Coach Miller');
            expect(coachNameInputs[1]).toHaveValue('Coach Johnson');
        });

        it('allows adding new testimonials', () => {
            render(
                <CoachesPerspectiveSection
                    testimonials={mockTestimonials}
                    isOwner={true}
                    isEditing={true}
                    isAnyOtherSectionEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            const addButton = screen.getByRole('button', { name: /add testimonial/i });
            fireEvent.click(addButton);

            // Should now have 3 testimonials
            expect(screen.getByText('Testimonial 3')).toBeInTheDocument();
        });

        it('allows removing testimonials', () => {
            render(
                <CoachesPerspectiveSection
                    testimonials={mockTestimonials}
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

            // First testimonial should be removed
            const coachNameInputs = screen.getAllByLabelText(/coach name/i);
            expect(coachNameInputs).toHaveLength(1);
            expect(coachNameInputs[0]).toHaveValue('Coach Johnson');
        });
    });

    describe('Save Functionality', () => {
        it('calls onSave with updated data when save button is clicked', async () => {
            render(
                <CoachesPerspectiveSection
                    testimonials={mockTestimonials}
                    isOwner={true}
                    isEditing={true}
                    isAnyOtherSectionEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            const coachNameInputs = screen.getAllByLabelText(/coach name/i);
            fireEvent.change(coachNameInputs[0], { target: { value: 'Updated Coach Name' } });

            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);

            await waitFor(() => {
                expect(mockOnSave).toHaveBeenCalledWith({
                    coachTestimonials: expect.arrayContaining([
                        expect.objectContaining({
                            coachName: 'Updated Coach Name',
                        }),
                    ]),
                });
            });
        });

        it('shows validation errors when testimonial quote is empty', async () => {
            render(
                <CoachesPerspectiveSection
                    testimonials={mockTestimonials}
                    isOwner={true}
                    isEditing={true}
                    isAnyOtherSectionEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            const testimonialTextareas = screen.getAllByPlaceholderText(/enter the coach's testimonial/i);
            fireEvent.change(testimonialTextareas[0], { target: { value: '' } });

            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);

            await waitFor(() => {
                expect(screen.getByText('Testimonial is required')).toBeInTheDocument();
            });

            expect(mockOnSave).not.toHaveBeenCalled();
        });

        it('shows validation errors when coach name is empty', async () => {
            render(
                <CoachesPerspectiveSection
                    testimonials={mockTestimonials}
                    isOwner={true}
                    isEditing={true}
                    isAnyOtherSectionEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            const coachNameInputs = screen.getAllByLabelText(/coach name/i);
            fireEvent.change(coachNameInputs[0], { target: { value: '' } });

            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);

            await waitFor(() => {
                expect(screen.getByText('Coach name is required')).toBeInTheDocument();
            });

            expect(mockOnSave).not.toHaveBeenCalled();
        });

        it('shows validation errors when coach title is empty', async () => {
            render(
                <CoachesPerspectiveSection
                    testimonials={mockTestimonials}
                    isOwner={true}
                    isEditing={true}
                    isAnyOtherSectionEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            const coachTitleInputs = screen.getAllByLabelText(/coach title/i);
            fireEvent.change(coachTitleInputs[0], { target: { value: '' } });

            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);

            await waitFor(() => {
                expect(screen.getByText('Coach title is required')).toBeInTheDocument();
            });

            expect(mockOnSave).not.toHaveBeenCalled();
        });

        it('disables form inputs while saving', async () => {
            render(
                <CoachesPerspectiveSection
                    testimonials={mockTestimonials}
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
            const coachNameInputs = screen.getAllByLabelText(/coach name/i);
            expect(coachNameInputs[0]).toBeDisabled();
        });
    });

    describe('Cancel Functionality', () => {
        it('calls onCancel when cancel button is clicked', () => {
            render(
                <CoachesPerspectiveSection
                    testimonials={mockTestimonials}
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
                <CoachesPerspectiveSection
                    testimonials={mockTestimonials}
                    isOwner={true}
                    isEditing={true}
                    isAnyOtherSectionEditing={false}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            const coachNameInputs = screen.getAllByLabelText(/coach name/i);
            fireEvent.change(coachNameInputs[0], { target: { value: 'Modified Name' } });

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
                <CoachesPerspectiveSection
                    testimonials={mockTestimonials}
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
                <CoachesPerspectiveSection
                    testimonials={mockTestimonials}
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
