/**
 * POST /api/upload/image
 * Upload image file to server (for vocabulary)
 */
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { authorize } from '@/middleware/authMiddleware';
import { successResponse, errorResponse, serverError } from '@/lib/apiResponse';

// Image upload directory
const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'images');

// Allowed image types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request) {
    try {
        // Auth check - only admin can upload
        const auth = await authorize(request, ['admin']);
        if (!auth.success) {
            return errorResponse(auth.error, 401);
        }

        const formData = await request.formData();
        const file = formData.get('image');

        if (!file) {
            return errorResponse('Rasm tanlanmagan', 400);
        }

        // Check file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return errorResponse('Faqat JPG, PNG, GIF, WebP formatlar qabul qilinadi', 400);
        }

        // Check file size
        if (file.size > MAX_SIZE) {
            return errorResponse('Rasm hajmi 5MB dan oshmasligi kerak', 400);
        }

        // Create upload directory if not exists
        if (!existsSync(UPLOAD_DIR)) {
            await mkdir(UPLOAD_DIR, { recursive: true });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const ext = file.name.split('.').pop();
        const filename = `img_${timestamp}_${randomStr}.${ext}`;
        const filepath = path.join(UPLOAD_DIR, filename);

        // Save file
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);

        // Return the image URL
        const imageUrl = `/api/image/${filename}`;

        return successResponse({
            message: 'Rasm muvaffaqiyatli yuklandi',
            imageUrl,
            filename,
            size: file.size
        });

    } catch (error) {
        console.error('Image upload error:', error);
        return serverError('Rasm yuklashda xatolik');
    }
}
