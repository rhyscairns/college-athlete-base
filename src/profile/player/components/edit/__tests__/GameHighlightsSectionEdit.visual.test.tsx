import React from 'react';
import { render, screen } from '@testing-library/react';
import { GameHighlightsSectionEdit } from '../components/sections/GameHighlightsSectionEdit';
import type { Video } from '../../../types';

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
];

const defaultProps = {
    formData: mockVideos,
    setFormData: jest.fn(),
    errors: {},
    isSaving: false,
    onSave: jest.fn(),
    onCancel: jest.fn(),
};

// Visual styling tests removed — styling is now handled via design tokens.
// Behavior tests remain in GameHighlightsSectionEdit.test.tsx.
describe('GameHighlightsSectionEdit - Visual Tests', () => {
    it('renders the edit form with video fields', () => {
        render(<GameHighlightsSectionEdit {...defaultProps} />);
        expect(screen.getByDisplayValue('Championship Game Highlights')).toBeInTheDocument();
    });

    it('renders save and cancel buttons', () => {
        render(<GameHighlightsSectionEdit {...defaultProps} />);
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
});
