import { extractYouTubeThumbnail } from '../video-helpers';

describe('extractYouTubeThumbnail', () => {
    describe('YouTube watch URLs', () => {
        it('returns thumbnail for standard youtube.com/watch?v= URL', () => {
            const result = extractYouTubeThumbnail('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
            expect(result).toBe('https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
        });

        it('returns thumbnail for youtube.com/watch?v= URL without www', () => {
            const result = extractYouTubeThumbnail('https://youtube.com/watch?v=dQw4w9WgXcQ');
            expect(result).toBe('https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
        });

        it('returns thumbnail when URL has additional query params', () => {
            const result = extractYouTubeThumbnail('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s');
            expect(result).toBe('https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
        });
    });

    describe('YouTube short URLs (youtu.be)', () => {
        it('returns thumbnail for youtu.be/ short URL', () => {
            const result = extractYouTubeThumbnail('https://youtu.be/dQw4w9WgXcQ');
            expect(result).toBe('https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
        });

        it('returns thumbnail for youtu.be/ URL with query params', () => {
            const result = extractYouTubeThumbnail('https://youtu.be/dQw4w9WgXcQ?t=30');
            expect(result).toBe('https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
        });
    });

    describe('YouTube Shorts URLs', () => {
        it('returns thumbnail for youtube.com/shorts/ URL', () => {
            const result = extractYouTubeThumbnail('https://www.youtube.com/shorts/dQw4w9WgXcQ');
            expect(result).toBe('https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
        });

        it('returns thumbnail for youtube.com/shorts/ URL without www', () => {
            const result = extractYouTubeThumbnail('https://youtube.com/shorts/dQw4w9WgXcQ');
            expect(result).toBe('https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
        });
    });

    describe('non-YouTube URLs', () => {
        it('returns null for Vimeo URL', () => {
            const result = extractYouTubeThumbnail('https://vimeo.com/123456789');
            expect(result).toBeNull();
        });

        it('returns null for a direct video link', () => {
            const result = extractYouTubeThumbnail('https://example.com/video.mp4');
            expect(result).toBeNull();
        });
    });

    describe('edge cases', () => {
        it('returns null for empty string', () => {
            const result = extractYouTubeThumbnail('');
            expect(result).toBeNull();
        });

        it('returns null for a malformed URL', () => {
            const result = extractYouTubeThumbnail('not-a-url');
            expect(result).toBeNull();
        });

        it('returns null for a URL with no video ID', () => {
            const result = extractYouTubeThumbnail('https://www.youtube.com/watch');
            expect(result).toBeNull();
        });

        it('returns null for youtube.com with no path', () => {
            const result = extractYouTubeThumbnail('https://www.youtube.com/');
            expect(result).toBeNull();
        });
    });
});
