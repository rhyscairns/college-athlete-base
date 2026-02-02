/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RecruitingContactSection } from '../RecruitingContactSection';
import type { Contact } from '../../../types';

// Mock the profile-helpers module
jest.mock('../../../utils/profile-helpers', () => ({
    hasSectionData: jest.fn(),
}));

// Mock the EmptySection component
jest.mock('../../EmptySection', () => ({
    EmptySection: ({ title, description, isOwner, icon }: any) => (
        <div data-testid="empty-section">
            <div data-testid="empty-title">{title}</div>
            <div data-testid="empty-description">{description}</div>
            <div data-testid="empty-is-owner">{isOwner ? 'true' : 'false'}</div>
            <div data-testid="empty-icon">{icon}</div>
        </div>
    ),
}));

// Mock the edit components
jest.mock('../../edit/components/sections/RecruitingContactSectionEdit', () => ({
    RecruitingContactSectionEdit: () => <div data-testid="edit-mode">Edit Mode</div>,
}));

jest.mock('../EditButton', () => ({
    EditButton: ({ onClick, disabled }: any) => (
        <button onClick={onClick} disabled={disabled} data-testid="edit-button">
            Edit
        </button>
    ),
}));

describe('RecruitingContactSection - Empty State Handling', () => {
    const { hasSectionData } = require('../../../utils/profile-helpers');

    const minimalContact: Contact = {
        email: 'player@example.com',
        phone: '',
        parentGuardianName: '',
        parentGuardianPhone: '',
        parentGuardianEmail: '',
        socialMedia: {
            twitter: '',
            instagram: '',
            youtube: '',
            tiktok: '',
        },
        preferredContactMethod: '',
        headCoach: {
            name: '',
            email: '',
            phone: '',
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Completely Empty Contact (Owner View)', () => {
        it('should show EmptySection when no optional contact data exists and user is owner', () => {
            hasSectionData.mockReturnValue(false);

            render(
                <RecruitingContactSection
                    contact={minimalContact}
                    isOwner={true}
                    isEditing={false}
                />
            );

            expect(screen.getByTestId('empty-section')).toBeInTheDocument();
            expect(screen.getByTestId('empty-title')).toHaveTextContent('No Contact Information Yet');
            expect(screen.getByTestId('empty-description')).toHaveTextContent(
                'Add your contact details, social media links, and coach information to make it easy for recruiters to reach you.'
            );
            expect(screen.getByTestId('empty-is-owner')).toHaveTextContent('true');
            expect(screen.getByTestId('empty-icon')).toHaveTextContent('📞');
        });

        it('should call hasSectionData with correct parameters', () => {
            hasSectionData.mockReturnValue(false);

            render(
                <RecruitingContactSection
                    contact={minimalContact}
                    isOwner={true}
                    isEditing={false}
                />
            );

            expect(hasSectionData).toHaveBeenCalledWith(minimalContact, 'contact');
        });
    });

    describe('Completely Empty Contact (Non-Owner View)', () => {
        it('should hide section when no optional contact data exists and user is not owner', () => {
            hasSectionData.mockReturnValue(false);

            render(
                <RecruitingContactSection
                    contact={minimalContact}
                    isOwner={false}
                    isEditing={false}
                />
            );

            // EmptySection component is rendered but returns null for non-owners
            // The mock shows it but the real component would return null
            // Should not show the contact cards either
            expect(screen.queryByText('Player Contact')).not.toBeInTheDocument();
        });
    });

    describe('Partial Contact Data - Phone Only', () => {
        const contactWithPhone: Contact = {
            ...minimalContact,
            phone: '555-1234',
        };

        it('should show phone field when provided (owner view)', () => {
            hasSectionData.mockReturnValue(true);

            render(
                <RecruitingContactSection
                    contact={contactWithPhone}
                    isOwner={true}
                    isEditing={false}
                />
            );

            expect(screen.getByText('Player Contact')).toBeInTheDocument();
            expect(screen.getByText('555-1234')).toBeInTheDocument();
        });

        it('should show phone field when provided (non-owner view)', () => {
            hasSectionData.mockReturnValue(true);

            render(
                <RecruitingContactSection
                    contact={contactWithPhone}
                    isOwner={false}
                    isEditing={false}
                />
            );

            expect(screen.getByText('Player Contact')).toBeInTheDocument();
            expect(screen.getByText('555-1234')).toBeInTheDocument();
        });

        it('should show "Not provided" for missing phone when owner', () => {
            hasSectionData.mockReturnValue(true);

            render(
                <RecruitingContactSection
                    contact={minimalContact}
                    isOwner={true}
                    isEditing={false}
                />
            );

            const notProvidedElements = screen.getAllByText('Not provided');
            expect(notProvidedElements.length).toBeGreaterThan(0);
        });

        it('should not show phone field when missing and not owner', () => {
            hasSectionData.mockReturnValue(true);

            render(
                <RecruitingContactSection
                    contact={{ ...minimalContact, headCoach: { name: 'Coach', email: 'coach@example.com', phone: '555-0000' } }}
                    isOwner={false}
                    isEditing={false}
                />
            );

            // Phone section should not be rendered for non-owners when empty
            const phoneLabels = screen.queryAllByText('Phone');
            // Should only have coach's phone, not player's
            expect(phoneLabels.length).toBeLessThanOrEqual(1);
        });
    });

    describe('Partial Contact Data - Parent/Guardian Info', () => {
        const contactWithParent: Contact = {
            ...minimalContact,
            parentGuardianName: 'John Doe',
            parentGuardianEmail: 'parent@example.com',
        };

        it('should show parent/guardian section when any field is provided (owner view)', () => {
            hasSectionData.mockReturnValue(true);

            render(
                <RecruitingContactSection
                    contact={contactWithParent}
                    isOwner={true}
                    isEditing={false}
                />
            );

            expect(screen.getByText('Parent/Guardian Contact')).toBeInTheDocument();
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('parent@example.com')).toBeInTheDocument();
        });

        it('should show "Not provided" for missing parent fields when owner', () => {
            hasSectionData.mockReturnValue(true);

            const partialParent: Contact = {
                ...minimalContact,
                parentGuardianName: 'John Doe',
            };

            render(
                <RecruitingContactSection
                    contact={partialParent}
                    isOwner={true}
                    isEditing={false}
                />
            );

            expect(screen.getByText('John Doe')).toBeInTheDocument();
            const notProvidedElements = screen.getAllByText('Not provided');
            expect(notProvidedElements.length).toBeGreaterThan(0);
        });

        it('should not show parent/guardian section when all fields empty and not owner', () => {
            hasSectionData.mockReturnValue(true);

            render(
                <RecruitingContactSection
                    contact={{ ...minimalContact, phone: '555-1234' }}
                    isOwner={false}
                    isEditing={false}
                />
            );

            expect(screen.queryByText('Parent/Guardian Contact')).not.toBeInTheDocument();
        });
    });

    describe('Partial Contact Data - Social Media', () => {
        const contactWithSocial: Contact = {
            ...minimalContact,
            socialMedia: {
                twitter: 'https://twitter.com/player',
                instagram: '',
                youtube: 'https://youtube.com/player',
                tiktok: '',
            },
        };

        it('should show social media section when any link is provided', () => {
            hasSectionData.mockReturnValue(true);

            render(
                <RecruitingContactSection
                    contact={contactWithSocial}
                    isOwner={false}
                    isEditing={false}
                />
            );

            expect(screen.getByText('Follow on social media')).toBeInTheDocument();
            // Should have links for twitter and youtube
            const socialLinks = screen.getAllByRole('link');
            const socialMediaLinks = socialLinks.filter(
                (link) =>
                    link.getAttribute('href')?.includes('twitter') ||
                    link.getAttribute('href')?.includes('youtube')
            );
            expect(socialMediaLinks.length).toBe(2);
        });

        it('should show "No social media links added" when all empty and owner', () => {
            hasSectionData.mockReturnValue(true);

            render(
                <RecruitingContactSection
                    contact={minimalContact}
                    isOwner={true}
                    isEditing={false}
                />
            );

            expect(screen.getByText('No social media links added')).toBeInTheDocument();
        });

        it('should not show social media section when all empty and not owner', () => {
            hasSectionData.mockReturnValue(true);

            render(
                <RecruitingContactSection
                    contact={{ ...minimalContact, phone: '555-1234' }}
                    isOwner={false}
                    isEditing={false}
                />
            );

            expect(screen.queryByText('Follow on social media')).not.toBeInTheDocument();
        });
    });

    describe('Partial Contact Data - Head Coach', () => {
        const contactWithCoach: Contact = {
            ...minimalContact,
            headCoach: {
                name: 'Coach Smith',
                email: 'coach@school.edu',
                phone: '555-9999',
            },
        };

        it('should show head coach section when any field is provided', () => {
            hasSectionData.mockReturnValue(true);

            render(
                <RecruitingContactSection
                    contact={contactWithCoach}
                    isOwner={false}
                    isEditing={false}
                />
            );

            expect(screen.getByText('Head Coach')).toBeInTheDocument();
            expect(screen.getByText('Coach Smith')).toBeInTheDocument();
            expect(screen.getByText('coach@school.edu')).toBeInTheDocument();
            expect(screen.getByText('555-9999')).toBeInTheDocument();
        });

        it('should show "Not provided" for missing coach fields when owner', () => {
            hasSectionData.mockReturnValue(true);

            const partialCoach: Contact = {
                ...minimalContact,
                headCoach: {
                    name: 'Coach Smith',
                    email: '',
                    phone: '',
                },
            };

            render(
                <RecruitingContactSection
                    contact={partialCoach}
                    isOwner={true}
                    isEditing={false}
                />
            );

            expect(screen.getByText('Coach Smith')).toBeInTheDocument();
            const notProvidedElements = screen.getAllByText('Not provided');
            expect(notProvidedElements.length).toBeGreaterThan(0);
        });

        it('should not show head coach section when all fields empty and not owner', () => {
            hasSectionData.mockReturnValue(true);

            render(
                <RecruitingContactSection
                    contact={{ ...minimalContact, phone: '555-1234' }}
                    isOwner={false}
                    isEditing={false}
                />
            );

            expect(screen.queryByText('Head Coach')).not.toBeInTheDocument();
        });
    });

    describe('Preferred Contact Method', () => {
        const contactWithPreferred: Contact = {
            ...minimalContact,
            preferredContactMethod: 'Email',
        };

        it('should show preferred contact method when provided', () => {
            hasSectionData.mockReturnValue(true);

            render(
                <RecruitingContactSection
                    contact={contactWithPreferred}
                    isOwner={false}
                    isEditing={false}
                />
            );

            expect(screen.getByText('Preferred Contact Method')).toBeInTheDocument();
            // Use getAllByText since "Email" appears in both the email field label and the preferred method value
            const emailTexts = screen.getAllByText('Email');
            expect(emailTexts.length).toBeGreaterThan(0);
        });

        it('should show "Not specified" when empty and owner', () => {
            hasSectionData.mockReturnValue(true);

            render(
                <RecruitingContactSection
                    contact={minimalContact}
                    isOwner={true}
                    isEditing={false}
                />
            );

            expect(screen.getByText('Not specified')).toBeInTheDocument();
        });

        it('should not show preferred contact method when empty and not owner', () => {
            hasSectionData.mockReturnValue(true);

            render(
                <RecruitingContactSection
                    contact={{ ...minimalContact, phone: '555-1234' }}
                    isOwner={false}
                    isEditing={false}
                />
            );

            expect(screen.queryByText('Preferred Contact Method')).not.toBeInTheDocument();
        });
    });

    describe('Email Field (Required)', () => {
        it('should always show email field when provided', () => {
            hasSectionData.mockReturnValue(true);

            render(
                <RecruitingContactSection
                    contact={minimalContact}
                    isOwner={false}
                    isEditing={false}
                />
            );

            expect(screen.getByText('player@example.com')).toBeInTheDocument();
        });

        it('should show "Not provided" for missing email when owner', () => {
            hasSectionData.mockReturnValue(true);

            const noEmail: Contact = {
                ...minimalContact,
                email: '',
                phone: '555-1234',
            };

            render(
                <RecruitingContactSection
                    contact={noEmail}
                    isOwner={true}
                    isEditing={false}
                />
            );

            const notProvidedElements = screen.getAllByText('Not provided');
            expect(notProvidedElements.length).toBeGreaterThan(0);
        });
    });

    describe('Edit Mode', () => {
        it('should not show empty state when in edit mode', () => {
            hasSectionData.mockReturnValue(false);

            // Mock scrollIntoView
            Element.prototype.scrollIntoView = jest.fn();

            render(
                <RecruitingContactSection
                    contact={minimalContact}
                    isOwner={true}
                    isEditing={true}
                />
            );

            expect(screen.queryByTestId('empty-section')).not.toBeInTheDocument();
            expect(screen.getByTestId('edit-mode')).toBeInTheDocument();
        });
    });

    describe('Full Contact Data', () => {
        const fullContact: Contact = {
            email: 'player@example.com',
            phone: '555-1234',
            parentGuardianName: 'John Doe',
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
                email: 'coach@school.edu',
                phone: '555-9999',
            },
        };

        it('should show all sections when all data is provided', () => {
            hasSectionData.mockReturnValue(true);

            render(
                <RecruitingContactSection
                    contact={fullContact}
                    isOwner={false}
                    isEditing={false}
                />
            );

            expect(screen.getByText('Player Contact')).toBeInTheDocument();
            expect(screen.getByText('player@example.com')).toBeInTheDocument();
            expect(screen.getByText('555-1234')).toBeInTheDocument();
            expect(screen.getByText('Parent/Guardian Contact')).toBeInTheDocument();
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('Follow on social media')).toBeInTheDocument();
            expect(screen.getByText('Preferred Contact Method')).toBeInTheDocument();
            expect(screen.getByText('Head Coach')).toBeInTheDocument();
            expect(screen.getByText('Coach Smith')).toBeInTheDocument();
        });

        it('should not show any "Not provided" messages when all data is complete', () => {
            hasSectionData.mockReturnValue(true);

            render(
                <RecruitingContactSection
                    contact={fullContact}
                    isOwner={true}
                    isEditing={false}
                />
            );

            expect(screen.queryByText('Not provided')).not.toBeInTheDocument();
            expect(screen.queryByText('Not specified')).not.toBeInTheDocument();
            expect(screen.queryByText('No social media links added')).not.toBeInTheDocument();
        });
    });
});
