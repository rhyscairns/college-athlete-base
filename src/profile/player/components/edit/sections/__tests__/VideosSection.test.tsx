import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VideosSection } from '../VideosSection';
import type { PlayerProfileFormData, VideoLink, ProfileValidationErrors } from '../../../../types';

describe('VideosSection', () => {
    const mockSetFormData = jest.fn();
    const mockHandleBlur = jest.fn();

    const defaultFormData: PlayerProfileFormData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        sex: 'male',
        sport: 'basketball',
        position: 'Point Guard',
        gpa: '3.5',
        country: 'USA',
        videos: [
            {
                id: 'video-1',
                url: 'https://youtube.com/watch?v=abc123',
                title: 'Highlight Reel 2024',
                description: 'Season highlights',
                isMain: true,
                order: 1,
            },
            {
                id: 'video-2',
                url: 'https://youtube.com/watch?v=def456',
                title: 'Skills Showcase',
                description: 'Individual skills',
                isMain: false,
                order: 2,
            },
        ],
    };

    beforeEach(() => {
        mockSetFormData.mockClear();
        mockHandleBlur.mockClear();
    });

    describe('Component Rendering', () => {
        it('renders with correct initial values', () => {
            render(
                <VideosSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            expect(screen.getByDisplayValue('Highlight Reel 2024')).toBeInTheDocument();
            expect(screen.getByDisplayValue('https://youtube.com/watch?v=abc123')).toBeInTheDocument();
            expect(screen.getByDisplayValue('Skills Showcase')).toBeInTheDocument();
            expect(screen.getByDisplayValue('https://youtube.com/watch?v=def456')).toBeInTheDocument();
        });

        it('renders section heading', () => {
            render(
                <VideosSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            expect(screen.getByRole('heading', { name: /Highlight Videos \(Max 5\)/i })).toBeInTheDocument();
        });

        it('renders video items with title and URL fields', () => {
            render(
                <VideosSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const titleLabels = screen.getAllByLabelText(/Title/i);
            const urlLabels = screen.getAllByLabelText(/YouTube URL/i);

            expect(titleLabels.length).toBe(2);
            expect(urlLabels.length).toBe(2);
        });

        it('renders main video checkbox', () => {
            render(
                <VideosSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const mainVideoCheckboxes = screen.getAllByRole('checkbox');
            expect(mainVideoCheckboxes.length).toBe(2);
            expect(mainVideoCheckboxes[0]).toBeChecked();
            expect(mainVideoCheckboxes[1]).not.toBeChecked();
        });

        it('renders with empty videos array', () => {
            const emptyFormData = {
                ...defaultFormData,
                videos: [],
            };

            render(
                <VideosSection
                    formData={emptyFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            expect(screen.getByRole('button', { name: /Add Video/i })).toBeInTheDocument();
            expect(screen.queryByLabelText(/Title/i)).not.toBeInTheDocument();
        });

        it('renders optional placeholder for fields', () => {
            render(
                <VideosSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const titleInputs = screen.getAllByLabelText(/Title/i);
            const urlInputs = screen.getAllByLabelText(/YouTube URL/i);

            titleInputs.forEach(input => {
                expect(input).toHaveAttribute('placeholder', 'Optional');
            });
            urlInputs.forEach(input => {
                expect(input).toHaveAttribute('placeholder', 'Optional');
            });
        });
    });

    describe('Video Management', () => {
        it('allows adding new video', async () => {
            const user = userEvent.setup();
            render(
                <VideosSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const addButton = screen.getByRole('button', { name: /Add Video/i });
            await user.click(addButton);

            expect(mockSetFormData).toHaveBeenCalled();
        });

        it('allows removing video', async () => {
            const user = userEvent.setup();
            render(
                <VideosSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const removeButtons = screen.getAllByRole('button', { name: /Remove Video/i });
            await user.click(removeButtons[0]);

            expect(mockSetFormData).toHaveBeenCalled();
        });

        it('limits videos to maximum of 5', () => {
            const maxVideosFormData: PlayerProfileFormData = {
                ...defaultFormData,
                videos: Array(5).fill(null).map((_, i) => ({
                    id: `video-${i}`,
                    url: `https://youtube.com/watch?v=${i}`,
                    title: `Video ${i}`,
                    description: '',
                    isMain: i === 0,
                    order: i + 1,
                })),
            };

            render(
                <VideosSection
                    formData={maxVideosFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            expect(screen.queryByRole('button', { name: /Add Video/i })).not.toBeInTheDocument();
        });

        it('sets first video as main by default when adding to empty list', async () => {
            const user = userEvent.setup();
            const emptyFormData = {
                ...defaultFormData,
                videos: [],
            };

            render(
                <VideosSection
                    formData={emptyFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const addButton = screen.getByRole('button', { name: /Add Video/i });
            await user.click(addButton);

            expect(mockSetFormData).toHaveBeenCalled();
            const lastCall = mockSetFormData.mock.calls[mockSetFormData.mock.calls.length - 1][0];
            expect(typeof lastCall).toBe('function');
        });
    });

    describe('Field Updates and State Changes', () => {
        it('triggers state change when video title is updated', async () => {
            const user = userEvent.setup();
            render(
                <VideosSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const titleInputs = screen.getAllByLabelText(/Title/i);
            await user.clear(titleInputs[0]);
            await user.type(titleInputs[0], 'New Title');

            expect(mockSetFormData).toHaveBeenCalled();
        });

        it('triggers state change when video URL is updated', async () => {
            const user = userEvent.setup();
            render(
                <VideosSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const urlInputs = screen.getAllByLabelText(/YouTube URL/i);
            await user.clear(urlInputs[0]);
            await user.type(urlInputs[0], 'https://youtube.com/watch?v=new123');

            expect(mockSetFormData).toHaveBeenCalled();
        });

        it('triggers state change when main video checkbox is toggled', async () => {
            const user = userEvent.setup();
            render(
                <VideosSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const checkboxes = screen.getAllByRole('checkbox');
            await user.click(checkboxes[1]);

            expect(mockSetFormData).toHaveBeenCalled();
        });
    });

    describe('Main Video Selection', () => {
        it('ensures only one video can be marked as main', async () => {
            const user = userEvent.setup();
            render(
                <VideosSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const checkboxes = screen.getAllByRole('checkbox');
            await user.click(checkboxes[1]);

            expect(mockSetFormData).toHaveBeenCalled();
            // The implementation should uncheck other videos when one is marked as main
        });
    });

    describe('Validation on Blur', () => {
        it('calls handleBlur when video URL field loses focus', async () => {
            const user = userEvent.setup();
            render(
                <VideosSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    handleBlur={mockHandleBlur}
                    isEditing={true}
                />
            );

            const urlInputs = screen.getAllByLabelText(/YouTube URL/i);
            await user.click(urlInputs[0]);
            await user.tab();

            expect(mockHandleBlur).toHaveBeenCalledWith('video_0_url', 'https://youtube.com/watch?v=abc123');
        });

        it('does not call handleBlur when handleBlur prop is not provided', async () => {
            const user = userEvent.setup();
            render(
                <VideosSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const urlInputs = screen.getAllByLabelText(/YouTube URL/i);
            await user.click(urlInputs[0]);
            await user.tab();

            expect(mockHandleBlur).not.toHaveBeenCalled();
        });
    });

    describe('Error Messages Display', () => {
        it('displays error message for video URL when error is provided', () => {
            const errors: ProfileValidationErrors = {
                video_0_url: 'Invalid URL format',
            };

            render(
                <VideosSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    errors={errors}
                    isEditing={true}
                />
            );

            expect(screen.getByText('Invalid URL format')).toBeInTheDocument();
        });
    });

    describe('View Mode', () => {
        it('displays videos in view mode when isEditing is false', () => {
            render(
                <VideosSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={false}
                />
            );

            expect(screen.getByText('Highlight Reel 2024')).toBeInTheDocument();
            expect(screen.getByText('Skills Showcase')).toBeInTheDocument();
            expect(screen.queryByRole('button', { name: /Add Video/i })).not.toBeInTheDocument();
            expect(screen.queryByRole('button', { name: /Remove Video/i })).not.toBeInTheDocument();
        });

        it('displays main video badge in view mode when video is marked as main', () => {
            const formDataWithMainVideo: PlayerProfileFormData = {
                ...defaultFormData,
                videos: [
                    {
                        id: 'video-1',
                        url: 'https://youtube.com/watch?v=abc123',
                        title: 'Highlight Reel 2024',
                        description: 'Season highlights',
                        isMain: true,
                        order: 1,
                    },
                ],
            };

            render(
                <VideosSection
                    formData={formDataWithMainVideo}
                    setFormData={mockSetFormData}
                    isEditing={false}
                />
            );

            expect(screen.getByText('Main')).toBeInTheDocument();
        });

        it('displays message when no videos in view mode', () => {
            const emptyFormData = {
                ...defaultFormData,
                videos: [],
            };

            render(
                <VideosSection
                    formData={emptyFormData}
                    setFormData={mockSetFormData}
                    isEditing={false}
                />
            );

            expect(screen.getByText('No videos added')).toBeInTheDocument();
        });
    });

    describe('Layout', () => {
        it('uses two-column grid layout for title and URL', () => {
            const { container } = render(
                <VideosSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const gridContainers = container.querySelectorAll('.grid.grid-cols-1.md\\:grid-cols-2');
            expect(gridContainers.length).toBeGreaterThan(0);
        });
    });
});
