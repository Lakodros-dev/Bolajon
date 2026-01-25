'use client';

import { useState, useRef } from 'react';
import { VideoOff, AlertCircle } from 'lucide-react';

/**
 * Universal Video Player Component
 * Supports: YouTube, Vimeo, direct video files (mp4, webm, etc.)
 */
export default function VideoPlayer({ url, title = 'Video' }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [error, setError] = useState(false);
    const videoRef = useRef(null);

    if (!url) {
        return (
            <div className="ratio ratio-16x9 bg-dark rounded-4 d-flex align-items-center justify-content-center">
                <div className="text-center text-white">
                    <VideoOff size={48} style={{ opacity: 0.5 }} className="mb-2" />
                    <p className="mb-0 small">Video mavjud emas</p>
                </div>
            </div>
        );
    }

    // Detect video type
    const videoType = getVideoType(url);

    // YouTube embed
    if (videoType === 'youtube') {
        const embedUrl = getYouTubeEmbedUrl(url);
        return (
            <div className="ratio ratio-16x9 rounded-4 overflow-hidden shadow-sm">
                <iframe
                    src={embedUrl}
                    title={title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="rounded-4"
                    style={{ border: 'none' }}
                />
            </div>
        );
    }

    // Vimeo embed
    if (videoType === 'vimeo') {
        const embedUrl = getVimeoEmbedUrl(url);
        return (
            <div className="ratio ratio-16x9 rounded-4 overflow-hidden shadow-sm">
                <iframe
                    src={embedUrl}
                    title={title}
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    className="rounded-4"
                    style={{ border: 'none' }}
                />
            </div>
        );
    }

    // Direct video file (mp4, webm, etc.)
    // Convert /video/ URLs to /api/video/ for proper streaming
    let videoUrl = url;
    if (url.startsWith('/video/')) {
        const filename = url.split('/video/')[1];
        videoUrl = `/api/video/${filename}`;
    }

    return (
        <div className="ratio ratio-16x9 rounded-4 overflow-hidden shadow-sm bg-black">
            {error ? (
                <div className="d-flex align-items-center justify-content-center text-white">
                    <div className="text-center">
                        <AlertCircle size={48} style={{ opacity: 0.5 }} className="mb-2" />
                        <p className="mb-0 small">Video yuklanmadi</p>
                        <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-light mt-2">
                            Havolani ochish
                        </a>
                    </div>
                </div>
            ) : (
                <video
                    ref={videoRef}
                    src={videoUrl}
                    title={title}
                    controls
                    controlsList="nodownload"
                    playsInline
                    className="w-100 h-100 rounded-4"
                    style={{ objectFit: 'contain', backgroundColor: '#000' }}
                    onError={() => setError(true)}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                >
                    <source src={videoUrl} />
                    Brauzeringiz video elementini qo'llab-quvvatlamaydi.
                </video>
            )}
        </div>
    );
}

// Detect video type from URL
function getVideoType(url) {
    if (!url) return 'unknown';

    const lowerUrl = url.toLowerCase();

    // YouTube
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
        return 'youtube';
    }

    // Vimeo
    if (lowerUrl.includes('vimeo.com')) {
        return 'vimeo';
    }

    // Direct video files
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.m4v'];
    if (videoExtensions.some(ext => lowerUrl.includes(ext))) {
        return 'direct';
    }

    // Check if it's a blob or data URL
    if (url.startsWith('blob:') || url.startsWith('data:')) {
        return 'direct';
    }

    // Default to direct video (try to play it)
    return 'direct';
}

// Convert YouTube URL to embed URL
function getYouTubeEmbedUrl(url) {
    if (!url) return null;

    // Already embed URL
    if (url.includes('/embed/')) {
        return url.includes('?') ? url : `${url}?rel=0&modestbranding=1`;
    }

    let videoId = null;

    // youtube.com/watch?v=VIDEO_ID
    if (url.includes('youtube.com/watch')) {
        try {
            const urlParams = new URL(url).searchParams;
            videoId = urlParams.get('v');
        } catch {
            const match = url.match(/[?&]v=([^&]+)/);
            videoId = match ? match[1] : null;
        }
    }
    // youtu.be/VIDEO_ID
    else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0]?.split('&')[0];
    }
    // youtube.com/v/VIDEO_ID
    else if (url.includes('youtube.com/v/')) {
        videoId = url.split('youtube.com/v/')[1]?.split('?')[0]?.split('&')[0];
    }
    // youtube.com/shorts/VIDEO_ID
    else if (url.includes('youtube.com/shorts/')) {
        videoId = url.split('youtube.com/shorts/')[1]?.split('?')[0]?.split('&')[0];
    }

    if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
    }

    return url;
}

// Convert Vimeo URL to embed URL
function getVimeoEmbedUrl(url) {
    if (!url) return null;

    // Already embed URL
    if (url.includes('player.vimeo.com')) {
        return url;
    }

    // Extract video ID from vimeo.com/VIDEO_ID
    const match = url.match(/vimeo\.com\/(\d+)/);
    if (match) {
        return `https://player.vimeo.com/video/${match[1]}?title=0&byline=0&portrait=0`;
    }

    return url;
}
