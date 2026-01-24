/**
 * POST /api/upload/image
 * Upload image file to server (for vocabulary)
 * Automatically compresses images to WebP format with high quality
 */
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import sharp from 'sharp';
import sharpGif from 'sharp-gif2';
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

        // Handle animated formats separately (preserve animation but resize)
        if (file.type === 'image/gif') {
            filename = `img_${timestamp}_${randomStr}.gif`;
            filepath = path.join(UPLOAD_DIR, filename);
            
            try {
                // Resize GIF while preserving animation
                finalBuffer = await sharpGif(buffer, {
                    resize: {
                        width: 400,
                        height: 400,
                        fit: 'inside',
                        withoutEnlargement: true
                    }
                }).toBuffer();
            } catch (error) {
                console.log('GIF resize failed, using original:', error.message);
                // Fallback to original if resize fails
                finalBuffer = buffer;
            }
        } else if (file.type === 'image/webp') {
            // Keep WebP as WebP (may be animated)
            filename = `img_${timestamp}_${randomStr}.webp`;
            filepath = path.join(UPLOAD_DIR, filename);
            
            try {
                // Resize WebP (preserves animation if present)
                finalBuffer = await sharp(buffer, { animated: true })
                    .resize(400, 400, {
                        fit: 'inside',
                        withoutEnlargement: true
                    })
                    .webp({ 
                        quality: 85,
                        effort: 6
                    })
                    .toBuffer();
            } catch (error) {
                console.log('WebP resize failed, using original:', error.message);
                finalBuffer = buffer;
            }
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
                ? 'GIF muvaffaqiyatli yuklandi va kichraytirildi (animatsiya saqlanadi)' 
                : file.type === 'image/webp'
                ? 'WebP muvaffaqiyatli yuklandi va kichraytirildi (animatsiya saqlanadi)'
                : 'Rasm muvaffaqiyatli yuklandi va siqildi',
            imageUrl,
            filename,
            originalSize: file.size,
            compressedSize: finalBuffer.length,
            savings: `${Math.round((1 - finalBuffer.length / file.size) * 100)}%`
        });

    } catch (error) {
        console.error('Image upload error:', error);
        return serverError('Rasm yuklashda xatolik');
    }
}
