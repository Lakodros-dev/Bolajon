import mongoose from 'mongoose';
import { readFileSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import path from 'path';

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
 * Calculate level based on lesson order
 * 1-15: Level 1
 * 16-30: Level 2
 * 31-45: Level 3
 * 46-60: Level 4
 */
function calculateLevel(order) {
    if (order <= 15) return 1;
    if (order <= 30) return 2;
    if (order <= 45) return 3;
    if (order <= 60) return 4;
    return Math.ceil(order / 15); // For future lessons
}

/**
 * Get video duration from file (estimate based on file size)
 * This is a rough estimate: ~1MB per minute for compressed video
 */
function estimateVideoDuration(filePath) {
    try {
        const stats = statSync(filePath);
        const fileSizeMB = stats.size / (1024 * 1024);
        // Rough estimate: 1-2 MB per minute
        const estimatedMinutes = Math.floor(fileSizeMB / 1.5);
        return Math.max(1, estimatedMinutes); // At least 1 minute
    } catch (error) {
        console.error('Error getting file size:', error);
        return 5; // Default 5 minutes
    }
}

/**
 * Main function
 */
async function updateLessons51to60() {
    try {
        console.log('🚀 Update Lessons 51-60 with Videos and Levels\n');
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected!\n');

        let updatedCount = 0;

        // Process lessons 51-60
        for (let order = 51; order <= 60; order++) {
            console.log(`\n📚 Dars ${order}`);
            
            const lesson = await Lesson.findOne({ order });
            if (!lesson) {
                console.log(`   ❌ Dars topilmadi`);
                continue;
            }

            console.log(`   ✅ ${lesson.title}`);

            // Video file path
            const videoFileName = `${order}_complate.mp4`;
            const videoPath = path.join(process.cwd(), 'public', 'video', videoFileName);
            const videoUrl = `/video/${videoFileName}`;

            // Calculate level
            const level = calculateLevel(order);

            // Estimate duration
            const duration = estimateVideoDuration(videoPath);

            console.log(`   📹 Video: ${videoFileName}`);
            console.log(`   📊 Level: ${level}`);
            console.log(`   ⏱️  Duration: ~${duration} daqiqa`);

            // Update lesson
            lesson.videoUrl = videoUrl;
            lesson.level = level;
            lesson.duration = duration;

            await lesson.save();
            updatedCount++;
            console.log(`   💾 Saqlandi`);
        }

        console.log('\n\n✅ Barcha darslar yangilandi!');
        console.log(`📊 Jami: ${updatedCount} ta dars`);
        
        console.log('\n📋 DARAJA TAQSIMOTI:');
        console.log('   1-daraja: 1-15 darslar');
        console.log('   2-daraja: 16-30 darslar');
        console.log('   3-daraja: 31-45 darslar');
        console.log('   4-daraja: 46-60 darslar');

    } catch (error) {
        console.error('❌ Xatolik:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n👋 MongoDB dan uzildi');
    }
}

// Run the script
updateLessons51to60();
