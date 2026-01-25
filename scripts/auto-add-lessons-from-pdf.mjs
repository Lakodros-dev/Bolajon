import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import sharp from 'sharp';
import sharpGif from 'sharp-gif2';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables manually
const envPath = join(__dirname, '..', '.env');
const envContent = readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length) {
        envVars[key.trim()] = valueParts.join('=').trim();
    }
});
process.env.MONGODB_URI = envVars.MONGODB_URI;

const UPLOAD_DIR_IMAGES = path.join(process.cwd(), 'uploads', 'images');
const UPLOAD_DIR_VIDEOS = path.join(process.cwd(), 'uploads', 'videos');

const LessonSchema = new mongoose.Schema({
    title: String,
    description: String,
    videoUrl: String,
    thumbnail: String,
    level: Number,
    duration: Number,
    order: Number,
    isActive: Boolean,
    vocabulary: [{
        word: String,
        translation: String,
        image: String
    }],
    gameType: String,
    gameSettings: {
        numberRange: {
            min: Number,
            max: Number
        },
        duration: Number
    }
}, { timestamps: true });

const Lesson = mongoose.models.Lesson || mongoose.model('Lesson', LessonSchema);

/**
 * Process and compress image
 */
async function processImage(buffer, mimeType) {
    let finalBuffer;
    let extension;

    if (mimeType === 'image/gif') {
        extension = 'gif';
        try {
            finalBuffer = await sharpGif(buffer, {
                resize: {
                    width: 400,
                    height: 400,
                    fit: 'inside',
                    withoutEnlargement: true
                }
            }).toBuffer();
        } catch (error) {
            finalBuffer = buffer;
        }
    } else if (mimeType === 'image/webp') {
        extension = 'webp';
        try {
            finalBuffer = await sharp(buffer, { animated: true })
                .resize(400, 400, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .webp({ quality: 85, effort: 6 })
                .toBuffer();
        } catch (error) {
            finalBuffer = buffer;
        }
    } else {
        extension = 'webp';
        finalBuffer = await sharp(buffer)
            .resize(800, 800, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .webp({ quality: 85, effort: 6 })
            .toBuffer();
    }

    return { buffer: finalBuffer, extension };
}

/**
 * Upload image from file path
 */
async function uploadImage(imagePath) {
    try {
        if (!existsSync(imagePath)) {
            console.log(`      ⚠️  Rasm topilmadi: ${imagePath}`);
            return '';
        }

        const buffer = readFileSync(imagePath);
        const ext = path.extname(imagePath).toLowerCase();
        const mimeTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
        };
        const mimeType = mimeTypes[ext] || 'image/jpeg';

        const { buffer: finalBuffer, extension } = await processImage(buffer, mimeType);

        if (!existsSync(UPLOAD_DIR_IMAGES)) {
            await mkdir(UPLOAD_DIR_IMAGES, { recursive: true });
        }

        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const filename = `img_${timestamp}_${randomStr}.${extension}`;
        const filepath = path.join(UPLOAD_DIR_IMAGES, filename);

        await writeFile(filepath, finalBuffer);

        const savings = Math.round((1 - finalBuffer.length / buffer.length) * 100);
        console.log(`      ✅ Yuklandi: ${(buffer.length / 1024).toFixed(1)}KB → ${(finalBuffer.length / 1024).toFixed(1)}KB (${savings}% tejaldi)`);

        return `/api/image/${filename}`;
    } catch (error) {
        console.error(`      ❌ Xatolik: ${error.message}`);
        return '';
    }
}

/**
 * Upload video from file path (no compression, just copy)
 */
async function uploadVideo(videoPath) {
    try {
        if (!existsSync(videoPath)) {
            console.log(`      ⚠️  Video topilmadi: ${videoPath}`);
            return '';
        }

        const buffer = readFileSync(videoPath);

        if (!existsSync(UPLOAD_DIR_VIDEOS)) {
            await mkdir(UPLOAD_DIR_VIDEOS, { recursive: true });
        }

        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const ext = path.extname(videoPath);
        const filename = `video_${timestamp}_${randomStr}${ext}`;
        const filepath = path.join(UPLOAD_DIR_VIDEOS, filename);

        await writeFile(filepath, buffer);

        console.log(`      ✅ Video yuklandi: ${(buffer.length / 1024 / 1024).toFixed(1)}MB`);

        return `/api/video/${filename}`;
    } catch (error) {
        console.error(`      ❌ Xatolik: ${error.message}`);
        return '';
    }
}

/**
 * Main function to auto-add lessons from PDF data
 */
async function autoAddLessonsFromPDF() {
    try {
        console.log('🚀 Auto Add Lessons from PDF Script\n');
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected!\n');

        // LESSON DATA STRUCTURE
        // Modify this array to add new lessons
        const lessonsData = [
            {
                order: 61,
                title: 'Yangi dars nomi',
                description: 'Dars tavsifi',
                videoPath: './assets/videos/lesson61.mp4', // Optional
                videoUrl: 'https://youtube.com/...', // Or use URL
                thumbnail: '',
                level: 1,
                duration: 10,
                gameType: 'vocabulary', // vocabulary, catch-the-number, shopping-basket, etc.
                gameSettings: {
                    numberRange: { min: 1, max: 10 },
                    duration: 60
                },
                vocabulary: [
                    {
                        word: 'hello',
                        translation: 'salom',
                        imagePath: './assets/images/hello.jpg' // Optional
                    },
                    // Add more vocabulary...
                ]
            },
            // Add more lessons...
        ];

        console.log('📝 INSTRUCTIONS:');
        console.log('1. Rasmlarni ./assets/images/ papkasiga joylashtiring');
        console.log('2. Videolarni ./assets/videos/ papkasiga joylashtiring');
        console.log('3. Script ichidagi lessonsData arrayini to\'ldiring');
        console.log('4. Script avtomatik rasmlar va videolarni yuklaydi\n');

        let addedCount = 0;
        let skippedCount = 0;

        for (const lessonData of lessonsData) {
            console.log(`\n📚 Dars ${lessonData.order}: ${lessonData.title}`);

            // Check if lesson already exists
            const existing = await Lesson.findOne({ order: lessonData.order });
            if (existing) {
                console.log(`   ⚠️  Dars allaqachon mavjud, o'tkazib yuborildi`);
                skippedCount++;
                continue;
            }

            // Upload video if path provided
            let videoUrl = lessonData.videoUrl || '';
            if (lessonData.videoPath && existsSync(lessonData.videoPath)) {
                console.log(`   📹 Video yuklanmoqda...`);
                videoUrl = await uploadVideo(lessonData.videoPath);
            }

            // Process vocabulary images
            const vocabulary = [];
            if (lessonData.vocabulary && lessonData.vocabulary.length > 0) {
                console.log(`   📖 ${lessonData.vocabulary.length} ta lug'at so'zi...`);
                
                for (const vocab of lessonData.vocabulary) {
                    console.log(`      🔤 "${vocab.word}" - "${vocab.translation}"`);
                    
                    let imageUrl = '';
                    if (vocab.imagePath) {
                        imageUrl = await uploadImage(vocab.imagePath);
                    }

                    vocabulary.push({
                        word: vocab.word,
                        translation: vocab.translation,
                        image: imageUrl
                    });
                }
            }

            // Create lesson
            const newLesson = new Lesson({
                title: lessonData.title,
                description: lessonData.description,
                videoUrl: videoUrl,
                thumbnail: lessonData.thumbnail || '',
                level: lessonData.level || 1,
                duration: lessonData.duration || 0,
                order: lessonData.order,
                isActive: true,
                vocabulary: vocabulary,
                gameType: lessonData.gameType || 'vocabulary',
                gameSettings: lessonData.gameSettings || {
                    numberRange: { min: 1, max: 10 },
                    duration: 60
                }
            });

            await newLesson.save();
            addedCount++;
            console.log(`   ✅ Dars muvaffaqiyatli qo'shildi!`);
        }

        console.log('\n\n✅ Script yakunlandi!');
        console.log(`📊 STATISTIKA:`);
        console.log(`   Qo'shildi: ${addedCount}`);
        console.log(`   O'tkazib yuborildi: ${skippedCount}`);
        console.log(`   Jami: ${lessonsData.length}`);

    } catch (error) {
        console.error('❌ Xatolik:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n👋 MongoDB dan uzildi');
    }
}

// Run the script
autoAddLessonsFromPDF();
