/**
 * GET /api/video/[filename]
 * Secure video streaming endpoint
 * Supports both uploads/videos/ and public/video/ directories
 */
import { createReadStream, statSync, existsSync } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'videos');
const PUBLIC_DIR = path.join(process.cwd(), 'public', 'video');

export async function GET(request, { params }) {
    try {
        const { filename } = params;

        // Security: only allow specific characters in filename
        if (!/^[a-zA-Z0-9_.-]+$/.test(filename)) {
            return new NextResponse('Invalid filename', { status: 400 });
        }

        // Try uploads directory first, then public directory
        let filepath = path.join(UPLOAD_DIR, filename);
        if (!existsSync(filepath)) {
            filepath = path.join(PUBLIC_DIR, filename);
        }

        // Check if file exists
        if (!existsSync(filepath)) {
            return new NextResponse('Video topilmadi', { status: 404 });
        }

        const stat = statSync(filepath);
        const fileSize = stat.size;

        // Get range header for video streaming
        const range = request.headers.get('range');

        if (range) {
            // Partial content (video seeking)
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            let end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            
            // Validate range
            if (isNaN(start) || start < 0 || start >= fileSize) {
                return new NextResponse('Invalid range', { status: 416 });
            }
            
            // Ensure end is within bounds
            if (end >= fileSize) {
                end = fileSize - 1;
            }
            
            const chunkSize = end - start + 1;

            const stream = createReadStream(filepath, { start, end });
            const chunks = [];

            for await (const chunk of stream) {
                chunks.push(chunk);
            }

            const buffer = Buffer.concat(chunks);

            return new NextResponse(buffer, {
                status: 206,
                headers: {
                    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': chunkSize.toString(),
                    'Content-Type': getContentType(filename),
                    'Cache-Control': 'private, max-age=3600',
                },
            });
        } else {
            // Full file
            const stream = createReadStream(filepath);
            const chunks = [];

            for await (const chunk of stream) {
                chunks.push(chunk);
            }

            const buffer = Buffer.concat(chunks);

            return new NextResponse(buffer, {
                status: 200,
                headers: {
                    'Content-Length': fileSize.toString(),
                    'Content-Type': getContentType(filename),
                    'Accept-Ranges': 'bytes',
                    'Cache-Control': 'private, max-age=3600',
                },
            });
        }
    } catch (error) {
        console.error('Video stream error:', error);
        return new NextResponse('Video yuklashda xatolik', { status: 500 });
    }
}

function getContentType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const types = {
        mp4: 'video/mp4',
        webm: 'video/webm',
        ogg: 'video/ogg',
        mov: 'video/quicktime',
    };
    return types[ext] || 'video/mp4';
}
