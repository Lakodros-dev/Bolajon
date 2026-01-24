/**
 * POST /api/upload/image
 * Upload image file to server (for vocabulary)
 * Automatically compresses images to WebP format with high quality
 */
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import sharp from 'sharp';
import { authorize } from '@/middleware/authMiddleware';
import { successResponse, errorResponse, serverError } from '@/lib/apiResponse';

// Image upload directory
const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'images');

// Allowed image types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB (before compression)

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
            return errorResponse('Rasm hajmi 10MB dan oshmasligi kerak', 400);
        }

        // Create upload directory if not exists
        if (!existsSync(UPLOAD_DIR)) {
            await mkdir(UPLOAD_DIR, { recursive: true });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        
        // Convert image to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        let finalBuffer;
        let filename;
        let filepath;

        // Handle GIF separately (preserve animation)
        if (file.type === 'image/gif') {
            filename = `img_${timestamp}_${randomStr}.gif`;
            filepath = path.join(UPLOAD_DIR, filename);
            
            // For GIF, save as-is (no compression to preserve animation)
            finalBuffer = buffer;
        } else {
            // For other formats, compress and convert to WebP
            filename = `img_${timestamp}_${randomStr}.webp`;
            filepath = path.join(UPLOAD_DIR, filename);
            
            finalBuffer = await sharp(buffer)
                .resize(800, 800, { // Max 800x800, maintain aspect ratio
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .webp({ 
                    quality: 85, // High quality (85%)
                    effort: 6    // Higher effort = better compression
                })
                .toBuffer();
        }

        // Save file
        await writeFile(filepath, finalBuffer);

        // Return the image URL
        const imageUrl = `/api/image/${filename}`;

        return successResponse({
            message: file.type === 'image/gif' 
                ? 'GIF muvaffaqiyatli yuklandi (animatsiya saqlanadi)' 
                : 'Rasm muvaffaqiyatli yuklandi va siqildi',
            imageUrl,
            filename,
            originalSize: file.size,
            compressedSize: finalBuffer.length,
            savings: file.type === 'image/gif' 
                ? 'GIF siqilmadi' 
                : `${Math.round((1 - finalBuffer.length / file.size) * 100)}%`
        });

    } catch (error) {
        console.error('Image upload error:', error);
        return serverError('Rasm yuklashda xatolik');
    }
}
