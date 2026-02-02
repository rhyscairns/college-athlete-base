import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HeroSection } from '../HeroSection';
import { AcademicProfileSection } from '../AcademicProfileSection';
import { StatsShowcase } from '../StatsShowcase';

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

describe('Keyboard Navigation', () => {
    const mockPlayer = {
        firstName: 'Marcus',
        lastName: 'Johnson',
        initials: 'MJ',
        position: 'Wide Receiver',
        school: 'Westlake High School',
        location: 'Austin, TX',
        classYear: '2025',
        height: "6'2\"",
        weight: '185 lbs',
        academic: { gpa: 3.8 },
        performanceMetrics: [
            { label: '4.45s 40-Yard Dash', value: '4.45s' },
            { label: '36" Vertical', value: '36"' },
        ],
        profileImage: '/images/player.jpg',
    } as any;

    const mockAcademic = {
        gpa: 3.8,
        gpaScale: '4.0 Scale',
        satScore: 1350,
        satMath: 680,
        satReading: 670,
        actScore: 30,
        classRank: 'Top 10%',
        classRankDetail: '45 out of 450 Students',
        ncaaEligibilityCenter: '#2345678901',
        ncaaQualifier: true,
        coursework: ['AP Calculus AB', 'AP Physics', 'National Honor Society'],
    } as any;

    const mockStats = {
        receivingYards: 1250,
        touchdowns: 12,
        receptions: 68,
        yardsPerCatch: 18.4,
        longestReception: 75,
    } as any;

    describe('Escape key handling', () => {
        it('should cancel editing in HeroSection when Escape is pressed', async () => {
            const onCancel = jest.fn();
            const onEdit = jest.fn();
            const onSave = jest.fn();

            render(
                <HeroSection
                    player={mockPlayer}
                    isOwner={true}
                    isEditing={true}
                    isAnyOtherSectionEditing={false}
                    onEdit={onEdit}
                    onSave={onSave}
                    onCancel={onCancel}
                />
            );

            // Press Escape key
            fireEvent.keyDown(document, { key: 'Escape' });

            await waitFor(() => {
                expect(onCancel).toHaveBeenCalledTimes(1);
            });
        });

        it('should cancel editing in AcademicProfileSection when Escape is pressed', async () => {
            const onCancel = jest.fn();
            const onEdit = jest.fn();
            const onSave = jest.fn();

            render(
                <AcademicProfileSection
                    academic={mockAcademic}
                    isOwner={true}
                    isEditing={true}
                    isAnyOtherSectionEditing={false}
                    onEdit={onEdit}
                    onSave={onSave}
                    onCancel={onCancel}
                />
            );

            // Press Escape key
            fireEvent.keyDown(document, { key: 'Escape' });

            await waitFor(() => {
                expect(onCancel).toHaveBeenCalledTimes(1);
            });
        });

        it('should cancel editing in StatsShowcase when Escape is pressed', async () => {
            const onCancel = jest.fn();
            const onEdit = jest.fn();
            const onSave = jest.fn();

            render(
                <StatsShowcase
                    stats={mockStats}
                    isOwner={true}
                    isEditing={true}
                    isAnyOtherSectionEditing={false}
                    onEdit={onEdit}
                    onSave={onSave}
                    onCancel={onCancel}
                />
            );

            // Press Escape key
            fireEvent.keyDown(document, { key: 'Escape' });

            await waitFor(() => {
                expect(onCancel).toHaveBeenCalledTimes(1);
            });
        });

        it('should not cancel editing when Escape is pressed and section is not editing', () => {
            const onCancel = jest.fn();
            const onEdit = jest.fn();
            const onSave = jest.fn();

            render(
                <HeroSection
                    player={mockPlayer}
                    isOwner={true}
                    isEditing={false}
                    isAnyOtherSectionEditing={false}
                    onEdit={onEdit}
                    onSave={onSave}
                    onCancel={onCancel}
                />
            );

            // Press Escape key
            fireEvent.keyDown(document, { key: 'Escape' });

            expect(onCancel).not.toHaveBeenCalled();
        });
    });

    describe('Enter key handling on buttons', () => {
        it('should call onSave when Enter is pressed on Save button', async () => {
            const onCancel = jest.fn();
            const onEdit = jest.fn();
            const onSave = jest.fn();

            render(
                <HeroSection
                    player={mockPlayer}
                    isOwner={true}
                    isEditing={true}
                    isAnyOtherSectionEditing={false}
                    onEdit={onEdit}
                    onSave={onSave}
                    onCancel={onCancel}
                />
            );

            const saveButton = screen.getByRole('button', { name: /save/i });

            // Press Enter key on Save button
            fireEvent.keyDown(saveButton, { key: 'Enter' });

            await waitFor(() => {
                expect(onSave).toHaveBeenCalledTimes(1);
            });
        });

        it('should call onCancel when Enter is pressed on Cancel button', async () => {
            const onCancel = jest.fn();
            const onEdit = jest.fn();
            const onSave = jest.fn();

            render(
                <HeroSection
                    player={mockPlayer}
                    isOwner={true}
                    isEditing={true}
                    isAnyOtherSectionEditing={false}
                    onEdit={onEdit}
                    onSave={onSave}
                    onCancel={onCancel}
                />
            );

            const cancelButton = screen.getByRole('button', { name: /cancel/i });

            // Press Enter key on Cancel button
            fireEvent.keyDown(cancelButton, { key: 'Enter' });

            await waitFor(() => {
                expect(onCancel).toHaveBeenCalledTimes(1);
            });
        });

        it('should not call onSave when Enter is pressed while saving', async () => {
            const onCancel = jest.fn();
            const onEdit = jest.fn();
            const onSave = jest.fn();

            render(
                <HeroSection
                    player={mockPlayer}
                    isOwner={true}
                    isEditing={true}
                    isAnyOtherSectionEditing={false}
                    onEdit={onEdit}
                    onSave={onSave}
                    onCancel={onCancel}
                />
            );

            const saveButton = screen.getByRole('button', { name: /save/i });

            // Click save to start saving
            fireEvent.click(saveButton);

            // Try to press Enter while saving
            const savingButton = await screen.findByRole('button', { name: /saving/i });
            fireEvent.keyDown(savingButton, { key: 'Enter' });

            // Should only be called once from the click, not from the Enter key
            await waitFor(() => {
                expect(onSave).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe('Focus management', () => {
        it('should focus first input when entering edit mode', async () => {
            const { rerender } = render(
                <HeroSection
                    player={mockPlayer}
                    isOwner={true}
                    isEditing={false}
                    isAnyOtherSectionEditing={false}
                    onEdit={jest.fn()}
                    onSave={jest.fn()}
                    onCancel={jest.fn()}
                />
            );

            // Enter edit mode
            rerender(
                <HeroSection
                    player={mockPlayer}
                    isOwner={true}
                    isEditing={true}
                    isAnyOtherSectionEditing={false}
                    onEdit={jest.fn()}
                    onSave={jest.fn()}
                    onCancel={jest.fn()}
                />
            );

            // Wait for focus to be set (with timeout for the 300ms delay)
            await waitFor(
                () => {
                    const firstInput = screen.getAllByRole('textbox')[0];
                    expect(document.activeElement).toBe(firstInput);
                },
                { timeout: 500 }
            );
        });

        it('should allow tab navigation through form fields', async () => {
            render(
                <HeroSection
                    player={mockPlayer}
                    isOwner={true}
                    isEditing={true}
                    isAnyOtherSectionEditing={false}
                    onEdit={jest.fn()}
                    onSave={jest.fn()}
                    onCancel={jest.fn()}
                />
            );

            const inputs = screen.getAllByRole('textbox');

            // Focus first input
            inputs[0].focus();
            expect(document.activeElement).toBe(inputs[0]);

            // Tab to next input
            fireEvent.keyDown(inputs[0], { key: 'Tab' });

            // The browser handles tab navigation, so we just verify inputs are focusable
            inputs[1].focus();
            expect(document.activeElement).toBe(inputs[1]);
        });
    });

    describe('Event listener cleanup', () => {
        it('should remove Escape key listener when component unmounts', () => {
            const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

            const { unmount } = render(
                <HeroSection
                    player={mockPlayer}
                    isOwner={true}
                    isEditing={true}
                    isAnyOtherSectionEditing={false}
                    onEdit={jest.fn()}
                    onSave={jest.fn()}
                    onCancel={jest.fn()}
                />
            );

            unmount();

            expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

            removeEventListenerSpy.mockRestore();
        });

        it('should remove Escape key listener when exiting edit mode', () => {
            const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

            const { rerender } = render(
                <HeroSection
                    player={mockPlayer}
                    isOwner={true}
                    isEditing={true}
                    isAnyOtherSectionEditing={false}
                    onEdit={jest.fn()}
                    onSave={jest.fn()}
                    onCancel={jest.fn()}
                />
            );

            // Exit edit mode
            rerender(
                <HeroSection
                    player={mockPlayer}
                    isOwner={true}
                    isEditing={false}
                    isAnyOtherSectionEditing={false}
                    onEdit={jest.fn()}
                    onSave={jest.fn()}
                    onCancel={jest.fn()}
                />
            );

            expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

            removeEventListenerSpy.mockRestore();
        });
    });
});
