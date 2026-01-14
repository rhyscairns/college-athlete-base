# Profile Validation Utilities

This directory contains validation utilities for the player profile form.

## Overview

The validation system provides field-level and form-level validation for the player profile, ensuring data integrity before submission.

## Features

### Validation Functions

#### `validatePhone(phone: string): boolean`
Validates phone number format. Accepts various formats:
- `(123) 456-7890`
- `123-456-7890`
- `1234567890`
- `+1 123 456 7890`

Empty values are considered valid (optional field).

#### `validateURL(url: string): boolean`
Validates URL format. Must start with `http://` or `https://`.
Empty values are considered valid (optional field).

#### `validateGPA(gpa: string | number): boolean`
Validates GPA is within the range 0.0 to 4.0.

#### `validateField(fieldName: string, value: string | undefined | null): string | undefined`
Validates a single field based on its name and value. Returns an error message if validation fails, or `undefined` if valid.

**Required Fields:**
- firstName
- lastName
- email
- sex
- sport
- position
- gpa
- country

**Field-Specific Validation:**
- `email`, `parentGuardianEmail`: Email format validation
- `gpa`: Range validation (0.0 - 4.0)
- `phone`, `parentGuardianPhone`: Phone format validation

#### `validateVideos(videos: VideoLink[] | undefined): Record<string, string>`
Validates all video URLs in the videos array. Returns an object with error messages keyed by `video_{index}_url`.

#### `validateSocialMedia(socialMedia: SocialMediaLinks | undefined): Record<string, string>`
Validates all social media URLs. Returns an object with error messages keyed by `socialMedia_{platform}`.

## Usage

### In PlayerProfile Component

```typescript
import { validateField, validateVideos, validateSocialMedia } from '../utils/validation';

// Field-level validation on blur
const handleBlur = (field: string, value: string | undefined | null) => {
    const error = validateField(field, value);
    setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        if (error) {
            newErrors[field] = error;
        } else {
            delete newErrors[field];
        }
        return newErrors;
    });
};

// Form-level validation on submit
const validateForm = (): boolean => {
    const newErrors: ProfileValidationErrors = {};
    
    // Validate required fields
    requiredFields.forEach((field) => {
        const error = validateField(field, formData[field]);
        if (error) {
            newErrors[field] = error;
        }
    });
    
    // Validate videos
    const videoErrors = validateVideos(formData.videos);
    Object.assign(newErrors, videoErrors);
    
    // Validate social media
    const socialMediaErrors = validateSocialMedia(formData.socialMedia);
    Object.assign(newErrors, socialMediaErrors);
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
};
```

### In Section Components

```typescript
import type { ProfileValidationErrors } from '../../types';

interface SectionProps {
    formData: PlayerProfileFormData;
    setFormData: React.Dispatch<React.SetStateAction<PlayerProfileFormData>>;
    errors?: ProfileValidationErrors;
    handleBlur?: (field: string, value: string | undefined | null) => void;
    isEditing: boolean;
}

// Pass error and onBlur to input components
<TextInput
    label="First Name"
    name="firstName"
    value={formData.firstName}
    onChange={(value) => handleChange('firstName', value)}
    onBlur={() => handleBlur?.('firstName', formData.firstName)}
    error={errors?.firstName}
    required
/>
```

## Error Messages

All error messages are user-friendly and provide clear guidance:

- **Required field:** "This field is required"
- **Invalid email:** "Please enter a valid email address"
- **Invalid GPA:** "GPA must be between 0.0 and 4.0"
- **Invalid phone:** "Please enter a valid phone number"
- **Invalid URL:** "Please enter a valid URL (must start with http:// or https://)"

## Testing

Comprehensive unit tests are available in `__tests__/validation.test.ts` covering:
- Phone number validation
- URL validation
- GPA validation
- Field-level validation
- Video URL validation
- Social media URL validation

Run tests with:
```bash
npm test -- src/profile/player/utils/__tests__/validation.test.ts
```
