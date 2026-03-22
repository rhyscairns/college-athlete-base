/**
 * Extracts YouTube video ID from various URL formats and converts to embed URL
 * @param url - YouTube URL in various formats
 * @returns Embed URL for YouTube iframe
 * @throws Error if URL is invalid or video ID cannot be extracted
 */
export function getYouTubeEmbedUrl(url: string): string {
    if (!url || typeof url !== 'string') {
        throw new Error('Invalid YouTube URL: URL must be a non-empty string');
    }

    // Handle various YouTube URL formats:
    // - https://youtube.com/watch?v=VIDEO_ID
    // - https://www.youtube.com/watch?v=VIDEO_ID&other=params
    // - https://youtu.be/VIDEO_ID
    // - https://www.youtube.com/embed/VIDEO_ID
    // - http://youtube.com/watch?v=VIDEO_ID (http)
    // - youtube.com/watch?v=VIDEO_ID (no protocol)

    const videoIdMatch = url.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
    );

    const videoId = videoIdMatch ? videoIdMatch[1] : null;

    if (!videoId) {
        throw new Error('Invalid YouTube URL: Unable to extract video ID');
    }

    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
}
