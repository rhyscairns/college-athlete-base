import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AcademicProfileSectionEdit } from '../AcademicProfileSectionEdit';
import type { AcademicData, ValidationErrors } from '../../../types';

describe('AcademicProfileSectionEdit', () => {
    const mockFormData: AcademicData = {
        gpa: 3.8,
        gpaScale: '4.0 Scale',
        satScore: 1350,
        satMath: 680,
        satReading: 670,
        actScore: undefined,
        classRank: 'Top 10%',
        classRankDetail: '45 out of 450 Students',
        ncaaEligibilityCenter: '#2345678901',
        ncaaQualifier: true,
        coursework: ['AP Calculus AB', 'AP Physics'],
    };

    const mockSetFormData = jest.fn();
    const mockOnSave = jest.fn();
    const mockOnCancel = jest.fn();
    const mockErrors: ValidationErrors = {};

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders all form fields with correct values', () => {
        render(
            <AcademicProfileSectionEdit
                formData={mockFormData}
                setFormData={mockSetFormData}
                errors={mockErrors}
                isSaving={false}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        );

        expect(screen.getByDisplayValue('3.8')).toBeInTheDocument();
        expect(screen.getByDisplayValue('4.0 Scale')).toBeInTheDocument();
        expect(screen.getByDisplayValue('1350')).toBeInTheDocument();
        expect(screen.getByDisplayValue('680')).toBeInTheDocument();
        expect(screen.getByDisplayValue('670')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Top 10%')).toBeInTheDocument();
        expect(screen.getByDisplayValue('45 out of 450 Students')).toBeInTheDocument();
        expect(screen.getByDisplayValue('#2345678901')).toBeInTheDocument();
    });

    it('renders coursework list', () => {
        render(
            <AcademicProfileSectionEdit
                formData={mockFormData}
                setFormData={mockSetFormData}
                errors={mockErrors}
                isSaving={false}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        );

        expect(screen.getByDisplayValue('AP Calculus AB')).toBeInTheDocument();
        expect(screen.getByDisplayValue('AP Physics')).toBeInTheDocument();
    });

    it('calls onSave when Save button is clicked', () => {
        render(
            <AcademicProfileSectionEdit
                formData={mockFormData}
                setFormData={mockSetFormData}
                errors={mockErrors}
                isSaving={false}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        );

        const saveButton = screen.getByRole('button', { name: /save/i });
        fireEvent.click(saveButton);

        expect(mockOnSave).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when Cancel button is clicked', () => {
        render(
            <AcademicProfileSectionEdit
                formData={mockFormData}
                setFormData={mockSetFormData}
                errors={mockErrors}
                isSaving={false}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        );

        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        fireEvent.click(cancelButton);

        expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('adds a new coursework item when Add Course button is clicked', () => {
        render(
            <AcademicProfileSectionEdit
                formData={mockFormData}
                setFormData={mockSetFormData}
                errors={mockErrors}
                isSaving={false}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        );

        const addButton = screen.getByRole('button', { name: /add course/i });
        fireEvent.click(addButton);

        expect(mockSetFormData).toHaveBeenCalledWith(expect.any(Function));
    });

    it('removes a coursework item when Remove button is clicked', () => {
        render(
            <AcademicProfileSectionEdit
                formData={mockFormData}
                setFormData={mockSetFormData}
                errors={mockErrors}
                isSaving={false}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        );

        const removeButtons = screen.getAllByRole('button', { name: /remove/i });
        fireEvent.click(removeButtons[0]);

        expect(mockSetFormData).toHaveBeenCalledWith(expect.any(Function));
    });

    it('displays validation errors', () => {
        const errorsWithMessages: ValidationErrors = {
            gpa: 'GPA is required',
            satScore: 'Invalid SAT score',
        };

        render(
            <AcademicProfileSectionEdit
                formData={mockFormData}
                setFormData={mockSetFormData}
                errors={errorsWithMessages}
                isSaving={false}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        );

        expect(screen.getByText('GPA is required')).toBeInTheDocument();
        expect(screen.getByText('Invalid SAT score')).toBeInTheDocument();
    });

    it('disables all inputs when isSaving is true', () => {
        render(
            <AcademicProfileSectionEdit
                formData={mockFormData}
                setFormData={mockSetFormData}
                errors={mockErrors}
                isSaving={true}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        );

        const gpaInput = screen.getByDisplayValue('3.8');
        expect(gpaInput).toBeDisabled();

        const saveButton = screen.getByRole('button', { name: /saving/i });
        expect(saveButton).toBeDisabled();
    });

    it('uses grid layout for test scores', () => {
        const { container } = render(
            <AcademicProfileSectionEdit
                formData={mockFormData}
                setFormData={mockSetFormData}
                errors={mockErrors}
                isSaving={false}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        );

        // Check for the grid layout class on test scores container
        const gridContainers = container.querySelectorAll('.grid.grid-cols-1.md\\:grid-cols-3');
        expect(gridContainers.length).toBeGreaterThan(0);
    });

    it('applies edit mode container styling', () => {
        const { container } = render(
            <AcademicProfileSectionEdit
                formData={mockFormData}
                setFormData={mockSetFormData}
                errors={mockErrors}
                isSaving={false}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        );

        const editContainer = container.querySelector('.space-y-6.p-4.sm\\:p-6.bg-white\\/5.rounded-2xl.border.border-white\\/10');
        expect(editContainer).toBeInTheDocument();
    });
});
