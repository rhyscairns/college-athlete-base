import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CoachHeroSection } from '../CoachHeroSection';
import { CoachHeroSectionEdit } from '../../edit/CoachHeroSectionEdit';
import type { CoachProfile } from '../../../types';

describe('Coach Profile - Responsive Behavior', () => {
    const mockCoach: CoachProfile = {
        id: '123',
        firstName: 'John',
        lastName: 'Smith',
        initials: 'JS',
        email: 'john.smith@university.edu',
        phone: '+1-555-0123',
        university: 'State University',
        position: 'Head Coach',
        sport: 'Basketball',
        profileImage: undefined,
        teamWebsiteUrl: 'https://university.edu/basketball',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    describe('CoachHeroSection - View Mode', () => {
        it('should use responsive text sizes for coach name', () => {
            const { container } = render(
                <CoachHeroSection coach={mockCoach} isOwner={false} />
            );

            const firstName = container.querySelector('h1');
            expect(firstName).toHaveClass('text-3xl');
            expect(firstName).toHaveClass('sm:text-4xl');
            expect(firstName).toHaveClass('md:text-5xl');
            expect(firstName).toHaveClass('lg:text-6xl');
        });

        it('should use responsive spacing for content', () => {
            const { container } = render(
                <CoachHeroSection coach={mockCoach} isOwner={false} />
            );

            const contentContainer = container.querySelector('.space-y-3');
            expect(contentContainer).toHaveClass('sm:space-y-4');
        });

        it('should use responsive padding for mobile', () => {
            const { container } = render(
                <CoachHeroSection coach={mockCoach} isOwner={false} />
            );

            const contentContainer = container.querySelector('.space-y-3');
            expect(contentContainer).toHaveClass('px-4');
            expect(contentContainer).toHaveClass('sm:px-6');
        });

        it('should hide profile image on mobile (< lg breakpoint)', () => {
            const { container } = render(
                <CoachHeroSection coach={mockCoach} isOwner={false} />
            );

            const imageContainer = container.querySelector('.hidden.lg\\:block');
            expect(imageContainer).toBeInTheDocument();
        });

        it('should have touch-friendly team website link (min 44px)', () => {
            render(<CoachHeroSection coach={mockCoach} isOwner={false} />);

            const link = screen.getByRole('link', { name: /visit team website/i });
            expect(link).toHaveClass('min-h-[44px]');
            expect(link).toHaveClass('touch-manipulation');
        });

        it('should use responsive grid layout', () => {
            const { container } = render(
                <CoachHeroSection coach={mockCoach} isOwner={false} />
            );

            const grid = container.querySelector('.grid');
            expect(grid).toHaveClass('lg:grid-cols-2');
            expect(grid).toHaveClass('gap-6');
            expect(grid).toHaveClass('sm:gap-8');
        });

        it('should break long email addresses on mobile', () => {
            const { container } = render(
                <CoachHeroSection coach={mockCoach} isOwner={false} />
            );

            const emailSpan = container.querySelector('.break-all');
            expect(emailSpan).toBeInTheDocument();
            expect(emailSpan).toHaveTextContent(mockCoach.email);
        });

        it('should have responsive margin for content on different screen sizes', () => {
            const { container } = render(
                <CoachHeroSection coach={mockCoach} isOwner={false} />
            );

            const contentContainer = container.querySelector('.md\\:ml-8');
            expect(contentContainer).toHaveClass('lg:ml-12');
            expect(contentContainer).toHaveClass('xl:ml-16');
        });
    });

    describe('CoachHeroSectionEdit - Edit Mode', () => {
        const mockFormData: CoachProfile = {
            ...mockCoach,
        };

        it('should have responsive padding (p-3 sm:p-4)', () => {
            const { container } = render(
                <CoachHeroSectionEdit
                    formData={mockFormData}
                    setFormData={() => { }}
                    errors={{}}
                    isSaving={false}
                    onSave={() => { }}
                    onCancel={() => { }}
                />
            );

            const editContainer = container.firstChild;
            expect(editContainer).toHaveClass('p-3');
            expect(editContainer).toHaveClass('sm:p-4');
        });

        it('should use single column grid on mobile for paired fields', () => {
            const { container } = render(
                <CoachHeroSectionEdit
                    formData={mockFormData}
                    setFormData={() => { }}
                    errors={{}}
                    isSaving={false}
                    onSave={() => { }}
                    onCancel={() => { }}
                />
            );

            const grids = container.querySelectorAll('.grid');
            grids.forEach((grid) => {
                expect(grid).toHaveClass('grid-cols-1');
                expect(grid).toHaveClass('md:grid-cols-2');
            });
        });

        it('should have full width inputs', () => {
            render(
                <CoachHeroSectionEdit
                    formData={mockFormData}
                    setFormData={() => { }}
                    errors={{}}
                    isSaving={false}
                    onSave={() => { }}
                    onCancel={() => { }}
                />
            );

            const firstNameInput = screen.getByLabelText(/first name/i);
            expect(firstNameInput).toHaveClass('w-full');
        });

        it('should have minimum touch target size for Save button (44px)', () => {
            render(
                <CoachHeroSectionEdit
                    formData={mockFormData}
                    setFormData={() => { }}
                    errors={{}}
                    isSaving={false}
                    onSave={() => { }}
                    onCancel={() => { }}
                />
            );

            const saveButton = screen.getByRole('button', { name: /save/i });
            expect(saveButton).toHaveClass('min-h-[44px]');
            expect(saveButton).toHaveClass('touch-manipulation');
        });

        it('should have minimum touch target size for Cancel button (44px)', () => {
            render(
                <CoachHeroSectionEdit
                    formData={mockFormData}
                    setFormData={() => { }}
                    errors={{}}
                    isSaving={false}
                    onSave={() => { }}
                    onCancel={() => { }}
                />
            );

            const cancelButton = screen.getByRole('button', { name: /cancel/i });
            expect(cancelButton).toHaveClass('min-h-[44px]');
            expect(cancelButton).toHaveClass('touch-manipulation');
        });

        it('should stack buttons vertically on mobile (flex-col)', () => {
            const { container } = render(
                <CoachHeroSectionEdit
                    formData={mockFormData}
                    setFormData={() => { }}
                    errors={{}}
                    isSaving={false}
                    onSave={() => { }}
                    onCancel={() => { }}
                />
            );

            const buttonContainer = container.querySelector('.flex-col');
            expect(buttonContainer).toHaveClass('sm:flex-row');
        });

        it('should make buttons full width on mobile', () => {
            render(
                <CoachHeroSectionEdit
                    formData={mockFormData}
                    setFormData={() => { }}
                    errors={{}}
                    isSaving={false}
                    onSave={() => { }}
                    onCancel={() => { }}
                />
            );

            const saveButton = screen.getByRole('button', { name: /save/i });
            const cancelButton = screen.getByRole('button', { name: /cancel/i });

            expect(saveButton).toHaveClass('w-full');
            expect(saveButton).toHaveClass('sm:w-auto');
            expect(cancelButton).toHaveClass('w-full');
            expect(cancelButton).toHaveClass('sm:w-auto');
        });

        it('should have sufficient height for touch interaction on inputs (min 44px)', () => {
            render(
                <CoachHeroSectionEdit
                    formData={mockFormData}
                    setFormData={() => { }}
                    errors={{}}
                    isSaving={false}
                    onSave={() => { }}
                    onCancel={() => { }}
                />
            );

            const firstNameInput = screen.getByLabelText(/first name/i);
            // h-12 = 48px which is > 44px minimum
            expect(firstNameInput).toHaveClass('h-12');
        });
    });

    describe('Mobile Viewport Considerations', () => {
        it('should use responsive breakpoints (sm: 640px, md: 768px, lg: 1024px)', () => {
            const { container } = render(
                <CoachHeroSection coach={mockCoach} isOwner={false} />
            );

            const html = container.innerHTML;
            expect(html).toContain('sm:');
            expect(html).toContain('md:');
            expect(html).toContain('lg:');
        });

        it('should have appropriate spacing on mobile', () => {
            const { container } = render(
                <CoachHeroSection coach={mockCoach} isOwner={false} />
            );

            const section = container.querySelector('section');
            expect(section).toHaveClass('py-6');
            expect(section).toHaveClass('px-4');
        });
    });

    describe('Tablet Layout (768px - 1024px)', () => {
        const mockFormData: CoachProfile = {
            ...mockCoach,
        };

        it('should use medium breakpoint styles', () => {
            const { container } = render(
                <CoachHeroSection coach={mockCoach} isOwner={false} />
            );

            const html = container.innerHTML;
            expect(html).toContain('md:');
        });

        it('should have two-column grid for paired inputs on tablet', () => {
            const { container } = render(
                <CoachHeroSectionEdit
                    formData={mockFormData}
                    setFormData={() => { }}
                    errors={{}}
                    isSaving={false}
                    onSave={() => { }}
                    onCancel={() => { }}
                />
            );

            const grids = container.querySelectorAll('.grid');
            grids.forEach((grid) => {
                expect(grid).toHaveClass('md:grid-cols-2');
            });
        });
    });

    describe('Desktop Layout (> 1024px)', () => {
        it('should show profile image on desktop', () => {
            const { container } = render(
                <CoachHeroSection coach={mockCoach} isOwner={false} />
            );

            const imageContainer = container.querySelector('.lg\\:block');
            expect(imageContainer).toBeInTheDocument();
        });

        it('should use two-column grid layout on desktop', () => {
            const { container } = render(
                <CoachHeroSection coach={mockCoach} isOwner={false} />
            );

            const grid = container.querySelector('.grid');
            expect(grid).toHaveClass('lg:grid-cols-2');
        });
    });

    describe('Accessibility - Touch Targets', () => {
        const mockFormData: CoachProfile = {
            ...mockCoach,
        };

        it('should have all interactive elements meet 44px minimum', () => {
            render(
                <CoachHeroSectionEdit
                    formData={mockFormData}
                    setFormData={() => { }}
                    errors={{}}
                    isSaving={false}
                    onSave={() => { }}
                    onCancel={() => { }}
                />
            );

            const buttons = screen.getAllByRole('button');
            buttons.forEach((button) => {
                expect(button).toHaveClass('min-h-[44px]');
            });
        });

        it('should have touch-manipulation class on all buttons', () => {
            render(
                <CoachHeroSectionEdit
                    formData={mockFormData}
                    setFormData={() => { }}
                    errors={{}}
                    isSaving={false}
                    onSave={() => { }}
                    onCancel={() => { }}
                />
            );

            const buttons = screen.getAllByRole('button');
            buttons.forEach((button) => {
                expect(button).toHaveClass('touch-manipulation');
            });
        });
    });
});
