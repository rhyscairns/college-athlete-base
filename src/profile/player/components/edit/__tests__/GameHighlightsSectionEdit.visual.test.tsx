import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameHighlightsSectionEdit } from '../components/sections/GameHighlightsSectionEdit';
import type { Video } from '../../../types';

describe('GameHighlightsSectionEdit - Light Theme Visual Tests', () => {
    const mockVideos: Video[] = [
        {
            id: 'video-1',
            title: 'Championship Game Highlights',
            description: 'Final game of the season',
            url: 'https://youtube.com/watch?v=test1',
            thumbnail: 'https://example.com/thumb1.jpg',
            duration: '5:45',
            isFeatured: true,
            date: 'Sept 2023',
        },
        {
            id: 'video-2',
            title: 'Season Highlights',
            description: 'Best plays from the season',
            url: 'https://youtube.com/watch?v=test2',
            thumbnail: 'https://example.com/thumb2.jpg',
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

    describe('Requirement 1.1, 1.2: Container with white card design', () => {
        it('renders with white background and shadow', () => {
            const { container } = render(<GameHighlightsSectionEdit {...defaultProps} />);

            const mainContainer = container.querySelector('.bg-white.rounded-2xl.shadow-lg');
            expect(mainContainer).toBeInTheDocument();
        });

        it('has proper padding on container', () => {
            const { container } = render(<GameHighlightsSectionEdit {...defaultProps} />);

            const mainContainer = container.querySelector('.p-6.sm\\:p-8');
            expect(mainContainer).toBeInTheDocument();
        });
    });

    describe('Requirement 5.1, 5.2: Video card backgrounds and borders', () => {
        it('renders video cards with gray-50 background', () => {
            const { container } = render(<GameHighlightsSectionEdit {...defaultProps} />);

            const videoCards = container.querySelectorAll('.bg-gray-50');
            expect(videoCards.length).toBeGreaterThan(0);
        });

        it('renders video cards with gray-200 borders', () => {
            const { container } = render(<GameHighlightsSectionEdit {...defaultProps} />);

            const videoCards = container.querySelectorAll('.border-gray-200');
            expect(videoCards.length).toBeGreaterThan(0);
        });

        it('renders video cards with rounded corners', () => {
            const { container } = render(<GameHighlightsSectionEdit {...defaultProps} />);

            const videoCards = container.querySelectorAll('.rounded-xl');
            expect(videoCards.length).toBeGreaterThan(0);
        });
    });

    describe('Requirement 4.1, 4.2: Text colors in dark theme', () => {
        it('renders video labels with dark text', () => {
            render(<GameHighlightsSectionEdit {...defaultProps} />);

            const videoLabel = screen.getByText('Video 1');
            expect(videoLabel).toHaveClass('text-gray-900');
        });

        it('renders all video labels with proper styling', () => {
            const { container } = render(<GameHighlightsSectionEdit {...defaultProps} />);

            const labels = container.querySelectorAll('.text-gray-900');
            expect(labels.length).toBeGreaterThan(0);
        });
    });

    describe('Requirement 5.5: Main video badge styling', () => {
        it('renders main video badge with light theme colors', () => {
            render(<GameHighlightsSectionEdit {...defaultProps} />);

            const mainVideoBadge = screen.getByText('MAIN VIDEO');
            expect(mainVideoBadge).toBeInTheDocument();
            expect(mainVideoBadge).toHaveClass('bg-yellow-100');
            expect(mainVideoBadge).toHaveClass('border-yellow-300');
            expect(mainVideoBadge).toHaveClass('text-yellow-700');
        });

        it('only shows main video badge for the featured video', () => {
            render(<GameHighlightsSectionEdit {...defaultProps} />);

            const mainVideoBadges = screen.getAllByText('MAIN VIDEO');
            expect(mainVideoBadges).toHaveLength(1);
        });

        it('renders radio button for main video selection', () => {
            render(<GameHighlightsSectionEdit {...defaultProps} />);

            const radioButtons = screen.getAllByRole('radio');
            expect(radioButtons).toHaveLength(2); // One for each video
            expect(radioButtons[0]).toBeChecked(); // First video is featured
            expect(radioButtons[1]).not.toBeChecked();
        });

        it('can change main video selection', () => {
            render(<GameHighlightsSectionEdit {...defaultProps} />);

            const radioButtons = screen.getAllByRole('radio');
            fireEvent.click(radioButtons[1]);

            expect(defaultProps.setFormData).toHaveBeenCalled();
        });
    });

    describe('Requirement 4.5: URL validation error message styling', () => {
        it('displays URL validation error in red-600', () => {
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

            const errorMessage = screen.getByText('Please enter a valid URL');
            expect(errorMessage).toHaveClass('text-red-600');
        });
    });

    describe('Requirement 3.4: Add/Remove button styles', () => {
        it('renders Add Video button with blue light theme', () => {
            render(<GameHighlightsSectionEdit {...defaultProps} />);

            const addButton = screen.getByText('+ Add Video');
            expect(addButton).toHaveClass('bg-blue-50');
            expect(addButton).toHaveClass('text-blue-600');
            expect(addButton).toHaveClass('border-blue-200');
        });

        it('renders Remove buttons with red light theme', () => {
            render(<GameHighlightsSectionEdit {...defaultProps} />);

            const removeButtons = screen.getAllByText('Remove');
            removeButtons.forEach((button) => {
                expect(button).toHaveClass('bg-red-50');
                expect(button).toHaveClass('text-red-600');
                expect(button).toHaveClass('border-red-200');
            });
        });

        it('Add button has hover state', () => {
            render(<GameHighlightsSectionEdit {...defaultProps} />);

            const addButton = screen.getByText('+ Add Video');
            expect(addButton).toHaveClass('hover:bg-blue-100');
        });

        it('Remove buttons have hover state', () => {
            render(<GameHighlightsSectionEdit {...defaultProps} />);

            const removeButtons = screen.getAllByText('Remove');
            removeButtons.forEach((button) => {
                expect(button).toHaveClass('hover:bg-red-100');
            });
        });
    });

    describe('Requirement 5.3: Empty state text color', () => {
        it('renders empty state with gray-500 text', () => {
            const emptyProps = {
                ...defaultProps,
                formData: [],
            };

            render(<GameHighlightsSectionEdit {...emptyProps} />);

            const emptyMessage = screen.getByText('No videos added yet. Click "Add Video" to get started.');
            expect(emptyMessage).toHaveClass('text-gray-500');
        });
    });

    describe('Requirement 8.1, 8.2, 8.3: Functionality tests', () => {
        it('can add a new video', () => {
            render(<GameHighlightsSectionEdit {...defaultProps} />);

            const addButton = screen.getByText('+ Add Video');
            fireEvent.click(addButton);

            expect(defaultProps.setFormData).toHaveBeenCalled();
        });

        it('can remove a video', () => {
            render(<GameHighlightsSectionEdit {...defaultProps} />);

            const removeButtons = screen.getAllByText('Remove');
            fireEvent.click(removeButtons[0]);

            expect(defaultProps.setFormData).toHaveBeenCalled();
        });

        it('can edit video title', () => {
            render(<GameHighlightsSectionEdit {...defaultProps} />);

            const titleInput = screen.getByDisplayValue('Championship Game Highlights');
            fireEvent.change(titleInput, { target: { value: 'Updated Title' } });

            expect(defaultProps.setFormData).toHaveBeenCalled();
        });

        it('can edit video URL', () => {
            render(<GameHighlightsSectionEdit {...defaultProps} />);

            const urlInput = screen.getByDisplayValue('https://youtube.com/watch?v=test1');
            fireEvent.change(urlInput, { target: { value: 'https://youtube.com/watch?v=updated' } });

            expect(defaultProps.setFormData).toHaveBeenCalled();
        });
    });

    describe('Requirement 8.4: URL validation', () => {
        it('validates URL format correctly', () => {
            const propsWithInvalidUrl = {
                ...defaultProps,
                formData: [
                    {
                        id: 'video-1',
                        title: 'Test Video',
                        url: 'not-a-valid-url',
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

        it('does not show error for valid URLs', () => {
            render(<GameHighlightsSectionEdit {...defaultProps} />);

            expect(screen.queryByText('Please enter a valid URL')).not.toBeInTheDocument();
        });

        it('does not show error for empty URLs', () => {
            const propsWithEmptyUrl = {
                ...defaultProps,
                formData: [
                    {
                        id: 'video-1',
                        title: 'Test Video',
                        url: '',
                        description: '',
                        thumbnail: '',
                        duration: '',
                        isFeatured: false,
                        date: '',
                    },
                ],
            };

            render(<GameHighlightsSectionEdit {...propsWithEmptyUrl} />);

            expect(screen.queryByText('Please enter a valid URL')).not.toBeInTheDocument();
        });
    });

    describe('Requirement 8.1, 8.2: Form validation and save/cancel', () => {
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

        it('disables all inputs when saving', () => {
            const savingProps = {
                ...defaultProps,
                isSaving: true,
            };

            render(<GameHighlightsSectionEdit {...savingProps} />);

            const titleInput = screen.getByDisplayValue('Championship Game Highlights');
            expect(titleInput).toBeDisabled();

            const addButton = screen.getByText('+ Add Video');
            expect(addButton).toBeDisabled();

            const removeButtons = screen.getAllByText('Remove');
            removeButtons.forEach((button) => {
                expect(button).toBeDisabled();
            });
        });

        it('displays form-level error messages', () => {
            const propsWithErrors = {
                ...defaultProps,
                errors: {
                    videos: 'At least one video is required',
                },
            };

            render(<GameHighlightsSectionEdit {...propsWithErrors} />);

            expect(screen.getByText('At least one video is required')).toBeInTheDocument();
        });
    });

    describe('Accessibility and responsive design', () => {
        it('has minimum touch target size for buttons', () => {
            render(<GameHighlightsSectionEdit {...defaultProps} />);

            const addButton = screen.getByText('+ Add Video');
            expect(addButton).toHaveClass('min-h-[44px]');

            const removeButtons = screen.getAllByText('Remove');
            removeButtons.forEach((button) => {
                expect(button).toHaveClass('min-h-[44px]');
            });
        });

        it('uses responsive grid layout', () => {
            const { container } = render(<GameHighlightsSectionEdit {...defaultProps} />);

            const grids = container.querySelectorAll('.grid-cols-1.sm\\:grid-cols-2');
            expect(grids.length).toBeGreaterThan(0);
        });

        it('has transition effects on buttons', () => {
            render(<GameHighlightsSectionEdit {...defaultProps} />);

            const addButton = screen.getByText('+ Add Video');
            expect(addButton).toHaveClass('transition-colors');

            const removeButtons = screen.getAllByText('Remove');
            removeButtons.forEach((button) => {
                expect(button).toHaveClass('transition-colors');
            });
        });
    });
});
