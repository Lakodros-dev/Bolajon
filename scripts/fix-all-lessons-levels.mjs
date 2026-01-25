import mongoose from 'mongoose';
import { readFileSync } from 'fs';
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
 * Main function
 */
async function fixAllLessonsLevels() {
    try {
        console.log('🚀 Fix All Lessons Levels\n');
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected!\n');

        // Get all lessons
        const allLessons = await Lesson.find({}).sort({ order: 1 });
        console.log(`📚 Jami darslar: ${allLessons.length}\n`);

        let updatedCount = 0;
        const levelCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };

        for (const lesson of allLessons) {
            const correctLevel = calculateLevel(lesson.order);
            
            if (lesson.level !== correctLevel) {
                console.log(`📝 Dars ${lesson.order}: "${lesson.title}"`);
                console.log(`   ❌ Eski level: ${lesson.level}`);
                console.log(`   ✅ Yangi level: ${correctLevel}`);
                
                lesson.level = correctLevel;
                await lesson.save();
                updatedCount++;
            }
            
            levelCounts[correctLevel]++;
        }

        console.log('\n\n✅ Barcha darslar tekshirildi!');
        console.log(`📊 Yangilandi: ${updatedCount} ta dars`);
        
        console.log('\n📋 DARAJA TAQSIMOTI:');
        console.log(`   1-daraja (1-15): ${levelCounts[1]} ta dars`);
        console.log(`   2-daraja (16-30): ${levelCounts[2]} ta dars`);
        console.log(`   3-daraja (31-45): ${levelCounts[3]} ta dars`);
        console.log(`   4-daraja (46-60): ${levelCounts[4]} ta dars`);

        if (levelCounts[1] !== 15) {
            console.log(`\n⚠️  DIQQAT: 1-daraja da ${levelCounts[1]} ta dars bor, 15 ta bo'lishi kerak!`);
        }
        if (levelCounts[2] !== 15) {
            console.log(`⚠️  DIQQAT: 2-daraja da ${levelCounts[2]} ta dars bor, 15 ta bo'lishi kerak!`);
        }
        if (levelCounts[3] !== 15) {
            console.log(`⚠️  DIQQAT: 3-daraja da ${levelCounts[3]} ta dars bor, 15 ta bo'lishi kerak!`);
        }
        if (levelCounts[4] !== 15) {
            console.log(`⚠️  DIQQAT: 4-daraja da ${levelCounts[4]} ta dars bor, 15 ta bo'lishi kerak!`);
        }

    } catch (error) {
        console.error('❌ Xatolik:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n👋 MongoDB dan uzildi');
    }
}

// Run the script
fixAllLessonsLevels();
