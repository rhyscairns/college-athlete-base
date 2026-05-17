/**
 * Video Helper Utilities
 *
 * Utilities for working with video URLs and thumbnails
 */

/**
 * Extracts a YouTube video ID from a URL and returns the standard hqdefault thumbnail URL.
 *
 * Supported formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://youtube.com/shorts/VIDEO_ID
 *
 * @param url - The video URL to extract a thumbnail from
 * @returns The YouTube thumbnail URL, or null if the URL is not a recognised YouTube format
 */
export function extractYouTubeThumbnail(url: string): string | null {
    if (!url) return null;

    try {
        const parsed = new URL(url);
        let videoId: string | null = null;

        if (parsed.hostname.includes('youtube.com')) {
            // watch?v=VIDEO_ID
            videoId = parsed.searchParams.get('v');

            // /shorts/VIDEO_ID or other path-based formats
            if (!videoId) {
                const pathParts = parsed.pathname.split('/').filter(Boolean);
                const shortsIndex = pathParts.indexOf('shorts');
                if (shortsIndex !== -1 && pathParts[shortsIndex + 1]) {
                    videoId = pathParts[shortsIndex + 1];
                }
            }
        } else if (parsed.hostname === 'youtu.be') {
            // youtu.be/VIDEO_ID
            videoId = parsed.pathname.slice(1) || null;
        }

        if (!videoId) return null;
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    } catch {
        return null;
    }
}
