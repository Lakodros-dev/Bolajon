/**
 * POST /api/upload/video
 * Upload video file to server
 * Note: Duration must be set manually in the form
 */
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { authorize } from '@/middleware/authMiddleware';
import { successResponse, errorResponse, serverError } from '@/lib/apiResponse';

// Video upload directory
const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'videos');

// Allowed video types
const ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
const MAX_SIZE = 500 * 1024 * 1024; // 500MB

export async function POST(request) {
    try {
        // Auth check - only admin can upload
        const auth = await authorize(request, ['admin']);
        if (!auth.success) {
            return errorResponse(auth.error, 401);
        }

        const formData = await request.formData();
        const file = formData.get('video');

        if (!file) {
            return errorResponse('Video fayl tanlanmagan', 400);
        }

        // Check file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return errorResponse('Faqat MP4, WebM, OGG formatlar qabul qilinadi', 400);
        }

        // Check file size
        if (file.size > MAX_SIZE) {
            return errorResponse('Video hajmi 500MB dan oshmasligi kerak', 400);
        }

        // Create upload directory if not exists
        if (!existsSync(UPLOAD_DIR)) {
            await mkdir(UPLOAD_DIR, { recursive: true });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const ext = file.name.split('.').pop();
        const filename = `video_${timestamp}_${randomStr}.${ext}`;
        const filepath = path.join(UPLOAD_DIR, filename);

        // Save file
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);

        console.log('✅ Video uploaded successfully');

        // Return the internal video URL
        const videoUrl = `/api/video/${filename}`;

        return successResponse({
            message: 'Video muvaffaqiyatli yuklandi. Davomiylikni qo\'lda kiriting.',
            videoUrl,
            filename,
            size: file.size
        });

    } catch (error) {
        console.error('Video upload error:', error);
        return serverError('Video yuklashda xatolik');
    }
}
