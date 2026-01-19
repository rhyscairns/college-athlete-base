import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SocialMediaSection } from '../SocialMediaSection';
import type { PlayerProfileFormData, ProfileValidationErrors } from '../../../../types';

describe('SocialMediaSection', () => {
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
        socialMedia: {
            instagram: 'https://instagram.com/johndoe',
            twitter: 'https://twitter.com/johndoe',
            facebook: 'https://facebook.com/johndoe',
            tiktok: 'https://tiktok.com/@johndoe',
            linkedin: 'https://linkedin.com/in/johndoe',
            youtube: 'https://youtube.com/@johndoe',
        },
    };

    beforeEach(() => {
        mockSetFormData.mockClear();
        mockHandleBlur.mockClear();
    });

    describe('Component Rendering', () => {
        it('renders with correct initial values', () => {
            render(
                <SocialMediaSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            expect(screen.getByDisplayValue('https://instagram.com/johndoe')).toBeInTheDocument();
            expect(screen.getByDisplayValue('https://twitter.com/johndoe')).toBeInTheDocument();
            expect(screen.getByDisplayValue('https://facebook.com/johndoe')).toBeInTheDocument();
            expect(screen.getByDisplayValue('https://tiktok.com/@johndoe')).toBeInTheDocument();
            expect(screen.getByDisplayValue('https://linkedin.com/in/johndoe')).toBeInTheDocument();
            expect(screen.getByDisplayValue('https://youtube.com/@johndoe')).toBeInTheDocument();
        });

        it('renders section heading in edit mode', () => {
            render(
                <SocialMediaSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            // In edit mode, there's no h2/h3 heading, just the separator
            const { container } = render(
                <SocialMediaSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );
            expect(container.querySelector('hr')).toBeInTheDocument();
        });

        it('renders all social media fields', () => {
            render(
                <SocialMediaSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            expect(screen.getByLabelText(/Instagram/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Twitter \/ X/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Facebook/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/TikTok/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/LinkedIn/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/YouTube/i)).toBeInTheDocument();
        });

        it('renders with empty values when not provided', () => {
            const emptyFormData = {
                ...defaultFormData,
                socialMedia: undefined,
            };

            render(
                <SocialMediaSection
                    formData={emptyFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const instagramInput = screen.getByLabelText(/Instagram/i) as HTMLInputElement;
            const twitterInput = screen.getByLabelText(/Twitter \/ X/i) as HTMLInputElement;

            expect(instagramInput.value).toBe('');
            expect(twitterInput.value).toBe('');
        });

        it('renders optional placeholder for all fields', () => {
            render(
                <SocialMediaSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            expect(screen.getByLabelText(/Instagram/i)).toHaveAttribute('placeholder', 'Optional');
            expect(screen.getByLabelText(/Twitter \/ X/i)).toHaveAttribute('placeholder', 'Optional');
            expect(screen.getByLabelText(/Facebook/i)).toHaveAttribute('placeholder', 'Optional');
            expect(screen.getByLabelText(/TikTok/i)).toHaveAttribute('placeholder', 'Optional');
            expect(screen.getByLabelText(/LinkedIn/i)).toHaveAttribute('placeholder', 'Optional');
            expect(screen.getByLabelText(/YouTube/i)).toHaveAttribute('placeholder', 'Optional');
        });
    });

    describe('Field Updates and State Changes', () => {
        it('triggers state change when Instagram is updated', async () => {
            const user = userEvent.setup();
            render(
                <SocialMediaSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const instagramInput = screen.getByLabelText(/Instagram/i);
            await user.clear(instagramInput);
            await user.type(instagramInput, 'https://instagram.com/newuser');

            expect(mockSetFormData).toHaveBeenCalled();
        });

        it('triggers state change when Twitter is updated', async () => {
            const user = userEvent.setup();
            render(
                <SocialMediaSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const twitterInput = screen.getByLabelText(/Twitter \/ X/i);
            await user.clear(twitterInput);
            await user.type(twitterInput, 'https://twitter.com/newuser');

            expect(mockSetFormData).toHaveBeenCalled();
        });

        it('triggers state change when Facebook is updated', async () => {
            const user = userEvent.setup();
            render(
                <SocialMediaSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const facebookInput = screen.getByLabelText(/Facebook/i);
            await user.clear(facebookInput);
            await user.type(facebookInput, 'https://facebook.com/newuser');

            expect(mockSetFormData).toHaveBeenCalled();
        });

        it('triggers state change when TikTok is updated', async () => {
            const user = userEvent.setup();
            render(
                <SocialMediaSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const tiktokInput = screen.getByLabelText(/TikTok/i);
            await user.clear(tiktokInput);
            await user.type(tiktokInput, 'https://tiktok.com/@newuser');

            expect(mockSetFormData).toHaveBeenCalled();
        });

        it('triggers state change when LinkedIn is updated', async () => {
            const user = userEvent.setup();
            render(
                <SocialMediaSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const linkedinInput = screen.getByLabelText(/LinkedIn/i);
            await user.clear(linkedinInput);
            await user.type(linkedinInput, 'https://linkedin.com/in/newuser');

            expect(mockSetFormData).toHaveBeenCalled();
        });

        it('triggers state change when YouTube is updated', async () => {
            const user = userEvent.setup();
            render(
                <SocialMediaSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const youtubeInput = screen.getByLabelText(/YouTube/i);
            await user.clear(youtubeInput);
            await user.type(youtubeInput, 'https://youtube.com/@newuser');

            expect(mockSetFormData).toHaveBeenCalled();
        });
    });

    describe('Validation on Blur', () => {
        it('calls handleBlur when Instagram field loses focus', async () => {
            const user = userEvent.setup();
            render(
                <SocialMediaSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    handleBlur={mockHandleBlur}
                    isEditing={true}
                />
            );

            const instagramInput = screen.getByLabelText(/Instagram/i);
            await user.click(instagramInput);
            await user.tab();

            expect(mockHandleBlur).toHaveBeenCalledWith('socialMedia_instagram', 'https://instagram.com/johndoe');
        });

        it('calls handleBlur when Twitter field loses focus', async () => {
            const user = userEvent.setup();
            render(
                <SocialMediaSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    handleBlur={mockHandleBlur}
                    isEditing={true}
                />
            );

            const twitterInput = screen.getByLabelText(/Twitter \/ X/i);
            await user.click(twitterInput);
            await user.tab();

            expect(mockHandleBlur).toHaveBeenCalledWith('socialMedia_twitter', 'https://twitter.com/johndoe');
        });

        it('calls handleBlur when Facebook field loses focus', async () => {
            const user = userEvent.setup();
            render(
                <SocialMediaSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    handleBlur={mockHandleBlur}
                    isEditing={true}
                />
            );

            const facebookInput = screen.getByLabelText(/Facebook/i);
            await user.click(facebookInput);
            await user.tab();

            expect(mockHandleBlur).toHaveBeenCalledWith('socialMedia_facebook', 'https://facebook.com/johndoe');
        });

        it('does not call handleBlur when handleBlur prop is not provided', async () => {
            const user = userEvent.setup();
            render(
                <SocialMediaSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const instagramInput = screen.getByLabelText(/Instagram/i);
            await user.click(instagramInput);
            await user.tab();

            expect(mockHandleBlur).not.toHaveBeenCalled();
        });
    });

    describe('Error Messages Display', () => {
        it('displays error message for Instagram when error is provided', () => {
            const errors: ProfileValidationErrors = {
                socialMedia_instagram: 'Invalid URL format',
            };

            render(
                <SocialMediaSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    errors={errors}
                    isEditing={true}
                />
            );

            expect(screen.getByText('Invalid URL format')).toBeInTheDocument();
        });

        it('displays error message for Twitter when error is provided', () => {
            const errors: ProfileValidationErrors = {
                socialMedia_twitter: 'Invalid URL format',
            };

            render(
                <SocialMediaSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    errors={errors}
                    isEditing={true}
                />
            );

            expect(screen.getByText('Invalid URL format')).toBeInTheDocument();
        });

        it('displays multiple error messages simultaneously', () => {
            const errors: ProfileValidationErrors = {
                socialMedia_instagram: 'Invalid URL format',
                socialMedia_twitter: 'Invalid URL format',
            };

            render(
                <SocialMediaSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    errors={errors}
                    isEditing={true}
                />
            );

            const errorMessages = screen.getAllByText('Invalid URL format');
            expect(errorMessages.length).toBe(2);
        });
    });

    describe('View Mode', () => {
        it('displays social media in view mode when isEditing is false', () => {
            render(
                <SocialMediaSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={false}
                />
            );

            expect(screen.getByText('Social Media')).toBeInTheDocument();
            expect(screen.getByText('https://instagram.com/johndoe')).toBeInTheDocument();
            expect(screen.getByText('https://twitter.com/johndoe')).toBeInTheDocument();
        });

        it('displays "Not provided" for empty social media fields in view mode', () => {
            const emptyFormData = {
                ...defaultFormData,
                socialMedia: undefined,
            };

            render(
                <SocialMediaSection
                    formData={emptyFormData}
                    setFormData={mockSetFormData}
                    isEditing={false}
                />
            );

            const notProvidedTexts = screen.getAllByText('Not provided');
            expect(notProvidedTexts.length).toBe(6); // One for each social media platform
        });
    });

    describe('Field Attributes', () => {
        it('has correct type for all social media fields', () => {
            render(
                <SocialMediaSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            expect(screen.getByLabelText(/Instagram/i)).toHaveAttribute('type', 'text');
            expect(screen.getByLabelText(/Twitter \/ X/i)).toHaveAttribute('type', 'text');
            expect(screen.getByLabelText(/Facebook/i)).toHaveAttribute('type', 'text');
            expect(screen.getByLabelText(/TikTok/i)).toHaveAttribute('type', 'text');
            expect(screen.getByLabelText(/LinkedIn/i)).toHaveAttribute('type', 'text');
            expect(screen.getByLabelText(/YouTube/i)).toHaveAttribute('type', 'text');
        });
    });
});
