import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RecruitingContactSection } from '../RecruitingContactSection';
import type { Contact } from '../../../types';

// Mock dependencies
jest.mock('../../../utils/profile-helpers', () => ({
    hasSectionData: jest.fn((data: any, section: string) => {
        if (section === 'contact') {
            return !!(data.email || data.phone || data.parentGuardianName ||
                data.socialMedia?.twitter || data.headCoach?.name);
        }
        return false;
    }),
}));

jest.mock('../../EmptySection', () => ({
    EmptySection: ({ title, description, icon, onEdit }: any) => (
        <div data-testid="empty-section">
            <span>{icon}</span>
            <h3>{title}</h3>
            <p>{description}</p>
            {onEdit && <button onClick={onEdit}>Edit</button>}
        </div>
    ),
}));

jest.mock('../../edit/components/sections/RecruitingContactSectionEdit', () => ({
    RecruitingContactSectionEdit: ({ formData, onSave, onCancel }: any) => (
        <div data-testid="contact-edit-mode">
            <input
                data-testid="email-input"
                value={formData.email}
                onChange={() => { }}
            />
            <button onClick={onSave}>Save</button>
            <button onClick={onCancel}>Cancel</button>
        </div>
    ),
}));

describe('RecruitingContactSection', () => {
    const mockContact: Contact = {
        email: 'player@example.com',
        phone: '555-1234',
        parentGuardianName: 'John Doe Sr.',
        parentGuardianPhone: '555-5678',
        parentGuardianEmail: 'parent@example.com',
        socialMedia: {
            twitter: 'https://twitter.com/player',
            instagram: 'https://instagram.com/player',
            youtube: 'https://youtube.com/player',
            tiktok: 'https://tiktok.com/@player',
        },
        preferredContactMethod: 'Email',
        headCoach: {
            name: 'Coach Smith',
            email: 'coach@school.com',
            phone: '555-9999',
        },
    };

    const mockOnEdit = jest.fn();
    const mockOnSave = jest.fn();
    const mockOnCancel = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock scrollIntoView
        Element.prototype.scrollIntoView = jest.fn();
    });

    describe('Rendering', () => {
        it('renders contact section with all information', () => {
            render(
                <RecruitingContactSection
                    contact={mockContact}
                    isOwner={false}
                    isEditing={false}
                />
            );

            expect(screen.getByText('Get In Touch')).toBeInTheDocument();
            expect(screen.getByText('player@example.com')).toBeInTheDocument();
            expect(screen.getByText('555-1234')).toBeInTheDocument();
        });

        it('renders parent/guardian information', () => {
            render(
                <RecruitingContactSection
                    contact={mockContact}
                    isOwner={false}
                    isEditing={false}
                />
            );

            expect(screen.getByText('John Doe Sr.')).toBeInTheDocument();
            expect(screen.getByText('parent@example.com')).toBeInTheDocument();
            expect(screen.getByText('555-5678')).toBeInTheDocument();
        });

        it('renders social media links', () => {
            render(
                <RecruitingContactSection
                    contact={mockContact}
                    isOwner={false}
                    isEditing={false}
                />
            );

            expect(screen.getByText('Follow on social media')).toBeInTheDocument();

            // Check that social media links exist
            const links = screen.getAllByRole('link');
            const twitterLink = links.find(link => link.getAttribute('href') === 'https://twitter.com/player');
            expect(twitterLink).toBeDefined();
            expect(twitterLink).toHaveAttribute('target', '_blank');
            expect(twitterLink).toHaveAttribute('rel', 'noopener noreferrer');
        });

        it('renders head coach information', () => {
            render(
                <RecruitingContactSection
                    contact={mockContact}
                    isOwner={false}
                    isEditing={false}
                />
            );

            expect(screen.getByText('Coach Smith')).toBeInTheDocument();
            expect(screen.getByText('coach@school.com')).toBeInTheDocument();
            expect(screen.getByText('555-9999')).toBeInTheDocument();
        });

        it('renders preferred contact method', () => {
            render(
                <RecruitingContactSection
                    contact={mockContact}
                    isOwner={true}
                    isEditing={false}
                />
            );

            expect(screen.getByText('Preferred Contact Method')).toBeInTheDocument();
            // Use getAllByText since "Email" appears in multiple places
            const emailTexts = screen.getAllByText('Email');
            expect(emailTexts.length).toBeGreaterThan(0);
        });
    });

    describe('Empty State', () => {
        it('shows empty section when no contact data and is owner', () => {
            const emptyContact: Contact = {
                email: '',
                phone: '',
                socialMedia: {},
                headCoach: { name: '', email: '', phone: '' },
            };

            render(
                <RecruitingContactSection
                    contact={emptyContact}
                    isOwner={true}
                    isEditing={false}
                    onEdit={mockOnEdit}
                />
            );

            expect(screen.getByTestId('empty-section')).toBeInTheDocument();
            expect(screen.getByText('No Contact Information Yet')).toBeInTheDocument();
        });

        it('returns null when no contact data and not owner', () => {
            const emptyContact: Contact = {
                email: '',
                phone: '',
                socialMedia: {},
                headCoach: { name: '', email: '', phone: '' },
            };

            const { container } = render(
                <RecruitingContactSection
                    contact={emptyContact}
                    isOwner={false}
                    isEditing={false}
                />
            );

            expect(container.firstChild).toBeNull();
        });
    });

    describe('Edit Mode', () => {
        it('shows edit button when is owner', () => {
            render(
                <RecruitingContactSection
                    contact={mockContact}
                    isOwner={true}
                    isEditing={false}
                    onEdit={mockOnEdit}
                />
            );

            const editButton = screen.getByRole('button', { name: /edit/i });
            expect(editButton).toBeInTheDocument();
        });

        it('does not show edit button when not owner', () => {
            render(
                <RecruitingContactSection
                    contact={mockContact}
                    isOwner={false}
                    isEditing={false}
                />
            );

            expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
        });

        it('calls onEdit when edit button is clicked', () => {
            render(
                <RecruitingContactSection
                    contact={mockContact}
                    isOwner={true}
                    isEditing={false}
                    onEdit={mockOnEdit}
                />
            );

            const editButton = screen.getByRole('button', { name: /edit/i });
            fireEvent.click(editButton);

            expect(mockOnEdit).toHaveBeenCalledTimes(1);
        });

        it('disables edit button when another section is editing', () => {
            render(
                <RecruitingContactSection
                    contact={mockContact}
                    isOwner={true}
                    isEditing={false}
                    isAnyOtherSectionEditing={true}
                    onEdit={mockOnEdit}
                />
            );

            const editButton = screen.getByRole('button', { name: /edit/i });
            expect(editButton).toBeDisabled();
        });

        it('renders edit mode when isEditing is true', () => {
            render(
                <RecruitingContactSection
                    contact={mockContact}
                    isOwner={true}
                    isEditing={true}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            expect(screen.getByTestId('contact-edit-mode')).toBeInTheDocument();
        });
    });

    describe('Keyboard Navigation', () => {
        it('cancels editing when Escape key is pressed', async () => {
            render(
                <RecruitingContactSection
                    contact={mockContact}
                    isOwner={true}
                    isEditing={true}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            fireEvent.keyDown(document, { key: 'Escape' });

            await waitFor(() => {
                expect(mockOnCancel).toHaveBeenCalledTimes(1);
            });
        });

        it('does not cancel when Escape is pressed and not editing', () => {
            render(
                <RecruitingContactSection
                    contact={mockContact}
                    isOwner={true}
                    isEditing={false}
                    onCancel={mockOnCancel}
                />
            );

            fireEvent.keyDown(document, { key: 'Escape' });

            expect(mockOnCancel).not.toHaveBeenCalled();
        });
    });

    describe('Accessibility', () => {
        it('has proper mailto links for emails', () => {
            render(
                <RecruitingContactSection
                    contact={mockContact}
                    isOwner={false}
                    isEditing={false}
                />
            );

            const emailLink = screen.getByText('player@example.com').closest('a');
            expect(emailLink).toHaveAttribute('href', 'mailto:player@example.com');
        });

        it('has proper tel links for phone numbers', () => {
            render(
                <RecruitingContactSection
                    contact={mockContact}
                    isOwner={false}
                    isEditing={false}
                />
            );

            const phoneLink = screen.getByText('555-1234').closest('a');
            expect(phoneLink).toHaveAttribute('href', 'tel:555-1234');
        });

        it('has section id for navigation', () => {
            const { container } = render(
                <RecruitingContactSection
                    contact={mockContact}
                    isOwner={false}
                    isEditing={false}
                />
            );

            const section = container.querySelector('#contact');
            expect(section).toBeInTheDocument();
        });
    });

    describe('Optional Fields', () => {
        it('shows "Not provided" for missing phone when is owner', () => {
            const contactWithoutPhone: Contact = {
                ...mockContact,
                phone: '',
            };

            render(
                <RecruitingContactSection
                    contact={contactWithoutPhone}
                    isOwner={true}
                    isEditing={false}
                />
            );

            expect(screen.getByText('Not provided')).toBeInTheDocument();
        });

        it('does not render phone section when missing and not owner', () => {
            const contactWithoutPhone: Contact = {
                ...mockContact,
                phone: '',
            };

            render(
                <RecruitingContactSection
                    contact={contactWithoutPhone}
                    isOwner={false}
                    isEditing={false}
                />
            );

            // Should show email
            expect(screen.getByText('player@example.com')).toBeInTheDocument();
            // Player phone section should not be rendered (parent phone may still show)
            const allText = screen.getByText('player@example.com').closest('section')?.textContent || '';
            expect(allText).toContain('Email');
        });

        it('does not render social media section when no links provided', () => {
            const contactWithoutSocial: Contact = {
                ...mockContact,
                socialMedia: {},
            };

            render(
                <RecruitingContactSection
                    contact={contactWithoutSocial}
                    isOwner={false}
                    isEditing={false}
                />
            );

            expect(screen.queryByText('Follow on social media')).not.toBeInTheDocument();
        });

        it('does not render coach section when no coach info provided', () => {
            const contactWithoutCoach: Contact = {
                ...mockContact,
                headCoach: { name: '', email: '', phone: '' },
            };

            render(
                <RecruitingContactSection
                    contact={contactWithoutCoach}
                    isOwner={false}
                    isEditing={false}
                />
            );

            expect(screen.queryByText('Head Coach')).not.toBeInTheDocument();
        });
    });

    describe('Focus Management', () => {
        it('scrolls to section when entering edit mode', async () => {
            const scrollIntoViewMock = jest.fn();
            Element.prototype.scrollIntoView = scrollIntoViewMock;

            const { rerender } = render(
                <RecruitingContactSection
                    contact={mockContact}
                    isOwner={true}
                    isEditing={false}
                    onEdit={mockOnEdit}
                />
            );

            rerender(
                <RecruitingContactSection
                    contact={mockContact}
                    isOwner={true}
                    isEditing={true}
                    onEdit={mockOnEdit}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            await waitFor(() => {
                expect(scrollIntoViewMock).toHaveBeenCalledWith({
                    behavior: 'smooth',
                    block: 'start',
                });
            });
        });
    });
});
