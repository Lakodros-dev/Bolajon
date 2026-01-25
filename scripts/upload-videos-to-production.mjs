import mongoose from 'mongoose';
import { readFileSync, existsSync, statSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env file
const envPath = path.join(__dirname, '..', '.env');
const envContent = readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
    }
});

const MONGODB_URI = envVars.MONGODB_URI;

const lessonSchema = new mongoose.Schema({
    title: String,
    description: String,
    videoUrl: String,
    thumbnail: String,
    level: Number,
    order: Number,
    duration: Number,
    vocabulary: [{
        word: String,
        translation: String,
        image: String,
    }],
    gameSettings: {
        type: {
            type: String,
            enum: ['vocabulary', 'catch-the-number', 'drop-to-basket', 'shopping-basket', 'pop-the-balloon', 'build-the-body'],
        },
        numberRange: {
            min: Number,
            max: Number,
        },
        duration: Number,
    },
}, { timestamps: true });

const Lesson = mongoose.models.Lesson || mongoose.model('Lesson', lessonSchema);

async function checkVideos() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB ga ulandi\n');

        const lessons = await Lesson.find({ order: { $gte: 51, $lte: 60 } }).sort({ order: 1 });

        console.log('📋 51-60 darslar video holati:\n');

        const publicDir = path.join(process.cwd(), 'public', 'video');
        
        lessons.forEach((lesson) => {
            const videoUrl = lesson.videoUrl || '';
            const filename = videoUrl.split('/').pop();
            const localPath = path.join(publicDir, filename);
            const exists = existsSync(localPath);
            
            console.log(`Dars ${lesson.order}: ${lesson.title}`);
            console.log(`  Video URL: ${videoUrl}`);
            console.log(`  Local file: ${exists ? '✅ Mavjud' : '❌ Yo\'q'}`);
            if (exists) {
                const stats = statSync(localPath);
                console.log(`  Hajmi: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
            }
            console.log('');
        });

        console.log('\n📝 YECHIM:');
        console.log('1. public/video/ papkasidagi videolarni production serverga yuklash kerak');
        console.log('2. Yoki admin paneldan har bir darsga video qayta yuklash');
        console.log('3. Yoki deploy scriptida public/video/ papkasini ham yuklash\n');

        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Xatolik:', error);
        process.exit(1);
    }
}

checkVideos();
