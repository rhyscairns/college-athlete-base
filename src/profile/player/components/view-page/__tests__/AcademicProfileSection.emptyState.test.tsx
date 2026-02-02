/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AcademicProfileSection } from '../AcademicProfileSection';
import type { Academic } from '../../../types';

describe('AcademicProfileSection - Empty State Handling', () => {
    const emptyAcademic: Academic = {
        gpa: 0,
        gpaScale: '4.0 Scale',
        coursework: [],
        ncaaEligibilityCenter: '',
        ncaaQualifier: false,
        satScore: 0,
        satMath: 0,
        satReading: 0,
        actScore: undefined,
        classRank: '',
        classRankDetail: '',
    };

    const partialAcademic: Academic = {
        gpa: 3.8,
        gpaScale: '4.0 Scale',
        coursework: [],
        ncaaEligibilityCenter: '',
        ncaaQualifier: false,
        satScore: 0,
        satMath: 0,
        satReading: 0,
        actScore: undefined,
        classRank: '',
        classRankDetail: '',
    };

    const fullAcademic: Academic = {
        gpa: 3.8,
        gpaScale: '4.0 Scale',
        coursework: ['AP Calculus', 'AP Physics', 'AP English'],
        ncaaEligibilityCenter: '1234567890',
        ncaaQualifier: true,
        satScore: 1450,
        satMath: 750,
        satReading: 700,
        actScore: 32,
        classRank: 'Top 5%',
        classRankDetail: '15 out of 300 students',
    };

    describe('Completely Empty Academic Data', () => {
        it('should show empty state for owner when all fields are empty', () => {
            const mockOnEdit = jest.fn();
            render(
                <AcademicProfileSection
                    academic={emptyAcademic}
                    isOwner={true}
                    isEditing={false}
                    onEdit={mockOnEdit}
                />
            );

            expect(screen.getByText('No Academic Information Yet')).toBeInTheDocument();
            expect(
                screen.getByText(/Add your GPA, test scores, class rank, and coursework/i)
            ).toBeInTheDocument();
            expect(screen.getByText('Add Content')).toBeInTheDocument();
        });

        it('should hide section for non-owner when all fields are empty', () => {
            const { container } = render(
                <AcademicProfileSection
                    academic={emptyAcademic}
                    isOwner={false}
                    isEditing={false}
                />
            );

            // EmptySection returns null for non-owners
            const emptySection = container.querySelector('.border-dashed');
            expect(emptySection).not.toBeInTheDocument();
        });

        it('should call onEdit when Add Content button is clicked', () => {
            const mockOnEdit = jest.fn();
            render(
                <AcademicProfileSection
                    academic={emptyAcademic}
                    isOwner={true}
                    isEditing={false}
                    onEdit={mockOnEdit}
                />
            );

            const addButton = screen.getByText('Add Content');
            fireEvent.click(addButton);

            expect(mockOnEdit).toHaveBeenCalledTimes(1);
        });
    });

    describe('Partial Academic Data', () => {
        it('should show GPA when provided for owner', () => {
            render(
                <AcademicProfileSection
                    academic={partialAcademic}
                    isOwner={true}
                    isEditing={false}
                />
            );

            expect(screen.getByText('3.8')).toBeInTheDocument();
            expect(screen.getByText('4.0 Scale')).toBeInTheDocument();
        });

        it('should show GPA when provided for non-owner', () => {
            render(
                <AcademicProfileSection
                    academic={partialAcademic}
                    isOwner={false}
                    isEditing={false}
                />
            );

            expect(screen.getByText('3.8')).toBeInTheDocument();
            expect(screen.getByText('4.0 Scale')).toBeInTheDocument();
        });

        it('should show "Not provided" for missing test scores when owner', () => {
            render(
                <AcademicProfileSection
                    academic={partialAcademic}
                    isOwner={true}
                    isEditing={false}
                />
            );

            expect(screen.getByText(/SAT scores not provided/i)).toBeInTheDocument();
        });

        it('should hide test scores section for non-owner when empty', () => {
            render(
                <AcademicProfileSection
                    academic={partialAcademic}
                    isOwner={false}
                    isEditing={false}
                />
            );

            expect(screen.queryByText(/Test Scores/i)).not.toBeInTheDocument();
        });

        it('should show "Not provided" for missing class rank when owner', () => {
            render(
                <AcademicProfileSection
                    academic={partialAcademic}
                    isOwner={true}
                    isEditing={false}
                />
            );

            const classRankSection = screen.getByText('Class Rank').closest('div');
            expect(classRankSection).toHaveTextContent('Not provided');
        });

        it('should show "Not registered yet" for missing NCAA ID when owner', () => {
            render(
                <AcademicProfileSection
                    academic={partialAcademic}
                    isOwner={true}
                    isEditing={false}
                />
            );

            expect(screen.getByText(/Not registered yet/i)).toBeInTheDocument();
        });

        it('should show "No advanced courses listed" when coursework is empty for owner', () => {
            render(
                <AcademicProfileSection
                    academic={partialAcademic}
                    isOwner={true}
                    isEditing={false}
                />
            );

            expect(screen.getByText(/No advanced courses listed/i)).toBeInTheDocument();
        });
    });

    describe('Full Academic Data', () => {
        it('should display all academic information when provided', () => {
            render(
                <AcademicProfileSection
                    academic={fullAcademic}
                    isOwner={false}
                    isEditing={false}
                />
            );

            // GPA
            expect(screen.getByText('3.8')).toBeInTheDocument();

            // Test Scores
            expect(screen.getByText(/SAT: 1450/i)).toBeInTheDocument();
            expect(screen.getByText(/Math: 750/i)).toBeInTheDocument();
            expect(screen.getByText(/Reading: 700/i)).toBeInTheDocument();
            expect(screen.getByText(/ACT: 32/i)).toBeInTheDocument();

            // Class Rank
            expect(screen.getByText('Top 5%')).toBeInTheDocument();
            expect(screen.getByText('15 out of 300 students')).toBeInTheDocument();

            // NCAA
            expect(screen.getByText('1234567890')).toBeInTheDocument();

            // Coursework
            expect(screen.getByText('AP Calculus')).toBeInTheDocument();
            expect(screen.getByText('AP Physics')).toBeInTheDocument();
            expect(screen.getByText('AP English')).toBeInTheDocument();
        });

        it('should not show empty state when data is complete', () => {
            render(
                <AcademicProfileSection
                    academic={fullAcademic}
                    isOwner={true}
                    isEditing={false}
                />
            );

            expect(screen.queryByText('No Academic Information Yet')).not.toBeInTheDocument();
        });
    });

    describe('Optional Fields Handling', () => {
        it('should handle missing SAT breakdown gracefully', () => {
            const academicWithoutBreakdown: Academic = {
                ...partialAcademic,
                satScore: 1400,
                satMath: undefined,
                satReading: undefined,
            };

            render(
                <AcademicProfileSection
                    academic={academicWithoutBreakdown}
                    isOwner={false}
                    isEditing={false}
                />
            );

            expect(screen.getByText(/SAT: 1400/i)).toBeInTheDocument();
            expect(screen.queryByText(/Math:/i)).not.toBeInTheDocument();
        });

        it('should handle missing class rank detail gracefully', () => {
            const academicWithoutDetail: Academic = {
                ...partialAcademic,
                classRank: 'Top 10%',
                classRankDetail: '',
            };

            render(
                <AcademicProfileSection
                    academic={academicWithoutDetail}
                    isOwner={false}
                    isEditing={false}
                />
            );

            expect(screen.getByText('Top 10%')).toBeInTheDocument();
            expect(screen.queryByText(/out of/i)).not.toBeInTheDocument();
        });

        it('should show ACT score when SAT is missing', () => {
            const academicWithACT: Academic = {
                ...partialAcademic,
                satScore: 0,
                actScore: 30,
            };

            render(
                <AcademicProfileSection
                    academic={academicWithACT}
                    isOwner={false}
                    isEditing={false}
                />
            );

            expect(screen.getByText(/ACT: 30/i)).toBeInTheDocument();
        });
    });

    describe('Owner vs Non-Owner Views', () => {
        it('should show edit button in header for owner when not editing', () => {
            const mockOnEdit = jest.fn();
            render(
                <AcademicProfileSection
                    academic={fullAcademic}
                    isOwner={true}
                    isEditing={false}
                    onEdit={mockOnEdit}
                />
            );

            const editButtons = screen.getAllByRole('button', { name: /edit/i });
            expect(editButtons.length).toBeGreaterThan(0);
        });

        it('should not show edit button for non-owner', () => {
            render(
                <AcademicProfileSection
                    academic={fullAcademic}
                    isOwner={false}
                    isEditing={false}
                />
            );

            expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
        });

        it('should show placeholder text for owner with partial data', () => {
            render(
                <AcademicProfileSection
                    academic={partialAcademic}
                    isOwner={true}
                    isEditing={false}
                />
            );

            // Should show placeholders for missing data
            const notProvidedTexts = screen.getAllByText(/Not provided/i);
            expect(notProvidedTexts.length).toBeGreaterThan(0);
        });

        it('should hide empty sections for non-owner with partial data', () => {
            render(
                <AcademicProfileSection
                    academic={partialAcademic}
                    isOwner={false}
                    isEditing={false}
                />
            );

            // Should not show test scores section at all
            expect(screen.queryByText('Test Scores')).not.toBeInTheDocument();
        });
    });
});
