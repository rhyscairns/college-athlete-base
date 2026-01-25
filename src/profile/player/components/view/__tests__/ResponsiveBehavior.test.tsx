import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EditButton } from '../EditButton';
import { ActionButtons } from '../ActionButtons';
import { HeroSectionEdit } from '../HeroSectionEdit';
import { StatsShowcaseEdit } from '../StatsShowcaseEdit';
import type { HeroData } from '../../../types';

describe('Responsive Behavior', () => {
    describe('EditButton', () => {
        it('should have minimum touch target size of 44x44px', () => {
            render(<EditButton onClick={() => { }} />);
            const button = screen.getByRole('button', { name: /edit section/i });

            const styles = window.getComputedStyle(button);
            expect(button).toHaveClass('min-h-[44px]');
            expect(button).toHaveClass('min-w-[44px]');
        });

        it('should have touch-manipulation class for better mobile interaction', () => {
            render(<EditButton onClick={() => { }} />);
            const button = screen.getByRole('button', { name: /edit section/i });

            expect(button).toHaveClass('touch-manipulation');
        });
    });

    describe('ActionButtons', () => {
        it('should have minimum touch target size for Save button', () => {
            render(
                <ActionButtons
                    onSave={() => { }}
                    onCancel={() => { }}
                    isSaving={false}
                />
            );
            const saveButton = screen.getByRole('button', { name: /save/i });

            expect(saveButton).toHaveClass('min-h-[44px]');
            expect(saveButton).toHaveClass('touch-manipulation');
        });

        it('should have minimum touch target size for Cancel button', () => {
            render(
                <ActionButtons
                    onSave={() => { }}
                    onCancel={() => { }}
                    isSaving={false}
                />
            );
            const cancelButton = screen.getByRole('button', { name: /cancel/i });

            expect(cancelButton).toHaveClass('min-h-[44px]');
            expect(cancelButton).toHaveClass('touch-manipulation');
        });

        it('should stack buttons vertically on mobile (flex-col)', () => {
            render(
                <ActionButtons
                    onSave={() => { }}
                    onCancel={() => { }}
                    isSaving={false}
                />
            );
            const container = screen.getByRole('button', { name: /save/i }).parentElement;

            expect(container).toHaveClass('flex-col');
            expect(container).toHaveClass('sm:flex-row');
        });

        it('should make buttons full width on mobile', () => {
            render(
                <ActionButtons
                    onSave={() => { }}
                    onCancel={() => { }}
                    isSaving={false}
                />
            );
            const saveButton = screen.getByRole('button', { name: /save/i });
            const cancelButton = screen.getByRole('button', { name: /cancel/i });

            expect(saveButton).toHaveClass('w-full');
            expect(saveButton).toHaveClass('sm:w-auto');
            expect(cancelButton).toHaveClass('w-full');
            expect(cancelButton).toHaveClass('sm:w-auto');
        });
    });

    describe('HeroSectionEdit', () => {
        const mockFormData: HeroData = {
            firstName: 'John',
            lastName: 'Doe',
            position: 'Wide Receiver',
            school: 'Test High School',
            location: 'Austin, TX',
            classYear: '2025',
            height: '6\'2"',
            weight: '185 lbs',
        };

        it('should have responsive padding (p-4 sm:p-6)', () => {
            const { container } = render(
                <HeroSectionEdit
                    formData={mockFormData}
                    setFormData={() => { }}
                    errors={{}}
                    isSaving={false}
                    onSave={() => { }}
                    onCancel={() => { }}
                />
            );

            const editContainer = container.firstChild;
            expect(editContainer).toHaveClass('p-4');
            expect(editContainer).toHaveClass('sm:p-6');
        });

        it('should use single column grid on mobile for paired fields', () => {
            const { container } = render(
                <HeroSectionEdit
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
                <HeroSectionEdit
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
    });

    describe('StatsShowcaseEdit', () => {
        const mockStats = {
            'Receiving Yards': '1250',
            'Touchdowns': '15',
        };

        it('should have responsive padding', () => {
            const { container } = render(
                <StatsShowcaseEdit
                    formData={mockStats}
                    setFormData={() => { }}
                    errors={{}}
                    isSaving={false}
                    onSave={() => { }}
                    onCancel={() => { }}
                />
            );

            const editContainer = container.firstChild;
            expect(editContainer).toHaveClass('p-4');
            expect(editContainer).toHaveClass('sm:p-6');
        });

        it('should stack stat fields vertically on mobile', () => {
            const { container } = render(
                <StatsShowcaseEdit
                    formData={mockStats}
                    setFormData={() => { }}
                    errors={{}}
                    isSaving={false}
                    onSave={() => { }}
                    onCancel={() => { }}
                />
            );

            const statContainers = container.querySelectorAll('.flex-col');
            expect(statContainers.length).toBeGreaterThan(0);
        });

        it('should have touch-friendly Add Stat button', () => {
            render(
                <StatsShowcaseEdit
                    formData={mockStats}
                    setFormData={() => { }}
                    errors={{}}
                    isSaving={false}
                    onSave={() => { }}
                    onCancel={() => { }}
                />
            );

            const addButton = screen.getByRole('button', { name: /add stat/i });
            expect(addButton).toHaveClass('min-h-[44px]');
            expect(addButton).toHaveClass('touch-manipulation');
            expect(addButton).toHaveClass('w-full');
            expect(addButton).toHaveClass('sm:w-auto');
        });

        it('should have touch-friendly Remove buttons', () => {
            render(
                <StatsShowcaseEdit
                    formData={mockStats}
                    setFormData={() => { }}
                    errors={{}}
                    isSaving={false}
                    onSave={() => { }}
                    onCancel={() => { }}
                />
            );

            const removeButtons = screen.getAllByRole('button', { name: /remove/i });
            removeButtons.forEach((button) => {
                expect(button).toHaveClass('min-h-[44px]');
                expect(button).toHaveClass('touch-manipulation');
            });
        });
    });

    describe('Input Fields', () => {
        it('should have sufficient height for touch interaction (min 44px)', () => {
            const mockFormData: HeroData = {
                firstName: 'John',
                lastName: 'Doe',
                position: 'Wide Receiver',
                school: 'Test High School',
                location: 'Austin, TX',
                classYear: '2025',
                height: '6\'2"',
                weight: '185 lbs',
            };

            render(
                <HeroSectionEdit
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
        it('should use responsive breakpoints (sm: 640px, md: 768px)', () => {
            const mockFormData: HeroData = {
                firstName: 'John',
                lastName: 'Doe',
                position: 'Wide Receiver',
                school: 'Test High School',
                location: 'Austin, TX',
                classYear: '2025',
                height: '6\'2"',
                weight: '185 lbs',
            };

            const { container } = render(
                <HeroSectionEdit
                    formData={mockFormData}
                    setFormData={() => { }}
                    errors={{}}
                    isSaving={false}
                    onSave={() => { }}
                    onCancel={() => { }}
                />
            );

            // Check for sm: and md: breakpoint classes
            const html = container.innerHTML;
            expect(html).toContain('sm:');
            expect(html).toContain('md:');
        });
    });
});
