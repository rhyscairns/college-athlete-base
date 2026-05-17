import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameHighlightsSectionEdit } from '../components/sections/GameHighlightsSectionEdit';
import type { Video } from '../../../types';

describe('GameHighlightsSectionEdit', () => {
    const mockVideos: Video[] = [
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

    it('displays main video badge for featured videos', () => {
        render(<GameHighlightsSectionEdit {...defaultProps} />);

        expect(screen.getByText('MAIN VIDEO')).toBeInTheDocument();
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
        expect(container.firstChild).toBeInTheDocument();
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

    // ── Auto-feature logic (Requirements 1.1, 1.2, 1.3) ──────────────────────

    it('sets isFeatured: true on the first added video', () => {
        let captured: Video[] = [];
        const setFormData = jest.fn((updater) => {
            captured = updater([]);
        });

        render(
            <GameHighlightsSectionEdit
                {...defaultProps}
                formData={[]}
                setFormData={setFormData}
            />
        );

        fireEvent.click(screen.getByText('+ Add Video'));

        expect(setFormData).toHaveBeenCalled();
        expect(captured).toHaveLength(1);
        expect(captured[0].isFeatured).toBe(true);
    });

    it('does not change the existing featured video when a second video is added', () => {
        const existingVideo: Video = {
            id: 'video-1',
            title: 'First',
            description: '',
            url: '',
            thumbnail: '',
            duration: '',
            isFeatured: true,
            date: '',
        };

        let captured: Video[] = [];
        const setFormData = jest.fn((updater) => {
            captured = updater([existingVideo]);
        });

        render(
            <GameHighlightsSectionEdit
                {...defaultProps}
                formData={[existingVideo]}
                setFormData={setFormData}
            />
        );

        fireEvent.click(screen.getByText('+ Add Video'));

        expect(captured).toHaveLength(2);
        expect(captured[0].isFeatured).toBe(true);
        expect(captured[1].isFeatured).toBe(false);
    });

    it('promotes the first remaining video to featured when the featured video is removed', () => {
        const videos: Video[] = [
            { id: 'v1', title: 'A', description: '', url: '', thumbnail: '', duration: '', isFeatured: true, date: '' },
            { id: 'v2', title: 'B', description: '', url: '', thumbnail: '', duration: '', isFeatured: false, date: '' },
        ];

        let captured: Video[] = [];
        const setFormData = jest.fn((updater) => {
            captured = updater(videos);
        });

        render(
            <GameHighlightsSectionEdit
                {...defaultProps}
                formData={videos}
                setFormData={setFormData}
            />
        );

        // Remove the first (featured) video
        fireEvent.click(screen.getAllByText('Remove')[0]);

        expect(captured).toHaveLength(1);
        expect(captured[0].id).toBe('v2');
        expect(captured[0].isFeatured).toBe(true);
    });

    // ── Radio button visibility (Requirements 1.4, 1.5) ──────────────────────

    it('hides the "Set as main video" radio when only one video exists', () => {
        const singleVideo: Video[] = [
            { id: 'v1', title: 'Only Video', description: '', url: '', thumbnail: '', duration: '', isFeatured: true, date: '' },
        ];

        render(
            <GameHighlightsSectionEdit
                {...defaultProps}
                formData={singleVideo}
            />
        );

        expect(screen.queryByText('Set as main video (appears on player card)')).not.toBeInTheDocument();
    });

    it('shows the "Set as main video" radio when two or more videos exist', () => {
        render(<GameHighlightsSectionEdit {...defaultProps} />);

        // defaultProps has two videos
        const radios = screen.getAllByText('Set as main video (appears on player card)');
        expect(radios.length).toBeGreaterThanOrEqual(2);
    });

    // ── Auto-thumbnail from YouTube URL (Requirements 2.1, 2.3, 2.4, 2.5) ───

    it('auto-populates thumbnail when a YouTube URL is entered', () => {
        const emptyVideo: Video = {
            id: 'v1', title: '', description: '', url: '', thumbnail: '', duration: '', isFeatured: true, date: '',
        };

        let captured: Video[] = [];
        const setFormData = jest.fn((updater) => {
            captured = updater([emptyVideo]);
        });

        render(
            <GameHighlightsSectionEdit
                {...defaultProps}
                formData={[emptyVideo]}
                setFormData={setFormData}
            />
        );

        const urlInput = screen.getByPlaceholderText('https://youtube.com/watch?v=...');
        fireEvent.change(urlInput, { target: { value: 'https://youtube.com/watch?v=abc123' } });

        expect(captured[0].thumbnail).toBe('https://img.youtube.com/vi/abc123/hqdefault.jpg');
    });

    it('leaves thumbnail empty when a non-YouTube URL is entered', () => {
        const emptyVideo: Video = {
            id: 'v1', title: '', description: '', url: '', thumbnail: '', duration: '', isFeatured: true, date: '',
        };

        let captured: Video[] = [];
        const setFormData = jest.fn((updater) => {
            captured = updater([emptyVideo]);
        });

        render(
            <GameHighlightsSectionEdit
                {...defaultProps}
                formData={[emptyVideo]}
                setFormData={setFormData}
            />
        );

        const urlInput = screen.getByPlaceholderText('https://youtube.com/watch?v=...');
        fireEvent.change(urlInput, { target: { value: 'https://vimeo.com/123456' } });

        expect(captured[0].thumbnail).toBe('');
    });

    it('does not overwrite a manually entered thumbnail when the URL changes', () => {
        const videoWithManualThumb: Video = {
            id: 'v1',
            title: '',
            description: '',
            url: 'https://youtube.com/watch?v=old',
            thumbnail: 'https://my-custom-cdn.com/thumb.jpg', // manually entered — does not match auto-derived
            duration: '',
            isFeatured: true,
            date: '',
        };

        let captured: Video[] = [];
        const setFormData = jest.fn((updater) => {
            captured = updater([videoWithManualThumb]);
        });

        render(
            <GameHighlightsSectionEdit
                {...defaultProps}
                formData={[videoWithManualThumb]}
                setFormData={setFormData}
            />
        );

        const urlInput = screen.getByDisplayValue('https://youtube.com/watch?v=old');
        fireEvent.change(urlInput, { target: { value: 'https://youtube.com/watch?v=newid' } });

        // Manual thumbnail must be preserved
        expect(captured[0].thumbnail).toBe('https://my-custom-cdn.com/thumb.jpg');
    });
});
