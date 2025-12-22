/**
 * GET /api/image/:filename
 * Serve uploaded images
 */
import { createReadStream, existsSync, statSync } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'images');

// MIME types
const MIME_TYPES = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp'
};

export async function GET(request, { params }) {
    try {
        const { filename } = params;

        // Security: prevent directory traversal
        if (filename.includes('..') || filename.includes('/')) {
            return new NextResponse('Not Found', { status: 404 });
        }

        const filepath = path.join(UPLOAD_DIR, filename);

        // Check if file exists
        if (!existsSync(filepath)) {
            return new NextResponse('Not Found', { status: 404 });
        }

        // Get file stats
        const stat = statSync(filepath);
        const ext = filename.split('.').pop().toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        // Read file
        const { readFile } = await import('fs/promises');
        const buffer = await readFile(filepath);

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Length': stat.size.toString(),
                'Cache-Control': 'public, max-age=31536000',
            }
        });

    } catch (error) {
        console.error('Image serve error:', error);
        return new NextResponse('Server Error', { status: 500 });
    }
}
