import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameHighlightsSectionEdit } from '../GameHighlightsSectionEdit';

describe('GameHighlightsSectionEdit', () => {
    const mockVideos = [
        {
            id: 'video-1',
            title: 'Test Video 1',
            description: 'Test description',
            url: 'https://youtube.com/watch?v=test1',
            thumbnail: 'https://example.com/thumb1.jpg',
            duration: '5:45',
            isFeatured: true,
            date: 'Sept 2023',
        },
        {
            id: 'video-2',
            title: 'Test Video 2',
            description: '',
            url: 'https://youtube.com/watch?v=test2',
            thumbnail: '',
            duration: '3:30',
            isFeatured: false,
            date: 'Oct 2023',
        },
    ];

    const defaultProps = {
        formData: mockVideos,
        setFormData: jest.fn(),
        errors: {},
        isSaving: false,
        onSave: jest.fn(),
        onCancel: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders video list with title and URL fields', () => {
        render(<GameHighlightsSectionEdit {...defaultProps} />);

        expect(screen.getByDisplayValue('Test Video 1')).toBeInTheDocument();
        expect(screen.getByDisplayValue('https://youtube.com/watch?v=test1')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Test Video 2')).toBeInTheDocument();
        expect(screen.getByDisplayValue('https://youtube.com/watch?v=test2')).toBeInTheDocument();
    });

    it('displays featured badge for featured videos', () => {
        render(<GameHighlightsSectionEdit {...defaultProps} />);

        expect(screen.getByText('FEATURED')).toBeInTheDocument();
    });

    it('renders all video fields', () => {
        render(<GameHighlightsSectionEdit {...defaultProps} />);

        // Check for labels
        expect(screen.getAllByText('Title').length).toBeGreaterThan(0);
        expect(screen.getAllByText('URL').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Description').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Duration').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Date').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Thumbnail URL').length).toBeGreaterThan(0);
    });

    it('has ability to add new videos', () => {
        render(<GameHighlightsSectionEdit {...defaultProps} />);

        const addButton = screen.getByText('+ Add Video');
        expect(addButton).toBeInTheDocument();
        expect(addButton).not.toBeDisabled();

        fireEvent.click(addButton);
        expect(defaultProps.setFormData).toHaveBeenCalled();
    });

    it('has ability to remove videos', () => {
        render(<GameHighlightsSectionEdit {...defaultProps} />);

        const removeButtons = screen.getAllByText('Remove');
        expect(removeButtons).toHaveLength(2);

        fireEvent.click(removeButtons[0]);
        expect(defaultProps.setFormData).toHaveBeenCalled();
    });

    it('validates URL format', () => {
        const propsWithInvalidUrl = {
            ...defaultProps,
            formData: [
                {
                    id: 'video-1',
                    title: 'Test Video',
                    url: 'invalid-url',
                    description: '',
                    thumbnail: '',
                    duration: '',
                    isFeatured: false,
                    date: '',
                },
            ],
        };

        render(<GameHighlightsSectionEdit {...propsWithInvalidUrl} />);

        expect(screen.getByText('Please enter a valid URL')).toBeInTheDocument();
    });

    it('does not show URL validation error for valid URLs', () => {
        render(<GameHighlightsSectionEdit {...defaultProps} />);

        expect(screen.queryByText('Please enter a valid URL')).not.toBeInTheDocument();
    });

    it('applies edit mode container styling', () => {
        const { container } = render(<GameHighlightsSectionEdit {...defaultProps} />);

        const editContainer = container.querySelector('.space-y-4.p-4.sm\\:p-6.bg-white\\/5.rounded-2xl.border.border-white\\/10');
        expect(editContainer).toBeInTheDocument();
    });

    it('renders ActionButtons component at bottom', () => {
        render(<GameHighlightsSectionEdit {...defaultProps} />);

        expect(screen.getByText('Save')).toBeInTheDocument();
        expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('calls onSave when Save button is clicked', () => {
        render(<GameHighlightsSectionEdit {...defaultProps} />);

        const saveButton = screen.getByText('Save');
        fireEvent.click(saveButton);

        expect(defaultProps.onSave).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when Cancel button is clicked', () => {
        render(<GameHighlightsSectionEdit {...defaultProps} />);

        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);

        expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
    });

    it('disables inputs when isSaving is true', () => {
        const savingProps = {
            ...defaultProps,
            isSaving: true,
        };

        render(<GameHighlightsSectionEdit {...savingProps} />);

        const titleInput = screen.getByDisplayValue('Test Video 1');
        expect(titleInput).toBeDisabled();

        const addButton = screen.getByText('+ Add Video');
        expect(addButton).toBeDisabled();

        const removeButtons = screen.getAllByText('Remove');
        removeButtons.forEach((button) => {
            expect(button).toBeDisabled();
        });
    });

    it('displays error messages', () => {
        const propsWithErrors = {
            ...defaultProps,
            errors: {
                'video-0-title': 'Title is required',
                'video-0-url': 'URL is required',
                videos: 'At least one video is required',
            },
        };

        render(<GameHighlightsSectionEdit {...propsWithErrors} />);

        expect(screen.getByText('Title is required')).toBeInTheDocument();
        expect(screen.getByText('URL is required')).toBeInTheDocument();
        expect(screen.getByText('At least one video is required')).toBeInTheDocument();
    });

    it('shows empty state message when no videos', () => {
        const emptyProps = {
            ...defaultProps,
            formData: [],
        };

        render(<GameHighlightsSectionEdit {...emptyProps} />);

        expect(screen.getByText('No videos added yet. Click "Add Video" to get started.')).toBeInTheDocument();
    });

    it('updates video title when input changes', () => {
        render(<GameHighlightsSectionEdit {...defaultProps} />);

        const titleInput = screen.getByDisplayValue('Test Video 1');
        fireEvent.change(titleInput, { target: { value: 'Updated Title' } });

        expect(defaultProps.setFormData).toHaveBeenCalled();
    });

    it('updates video URL when input changes', () => {
        render(<GameHighlightsSectionEdit {...defaultProps} />);

        const urlInput = screen.getByDisplayValue('https://youtube.com/watch?v=test1');
        fireEvent.change(urlInput, { target: { value: 'https://youtube.com/watch?v=updated' } });

        expect(defaultProps.setFormData).toHaveBeenCalled();
    });

    it('shows Saving... text when isSaving is true', () => {
        const savingProps = {
            ...defaultProps,
            isSaving: true,
        };

        render(<GameHighlightsSectionEdit {...savingProps} />);

        expect(screen.getByText('Saving...')).toBeInTheDocument();
    });
});
