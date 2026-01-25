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

async function checkVocabulary() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected!\n');

        // Check lessons 51-60
        console.log('=== CHECKING LESSONS 51-60 ===\n');
        
        for (let order = 51; order <= 60; order++) {
            const lesson = await Lesson.findOne({ order }).lean();
            
            if (!lesson) {
                console.log(`❌ Dars ${order}: TOPILMADI`);
                continue;
            }

            console.log(`\n📚 Dars ${order}: ${lesson.title}`);
            console.log(`   Game Type: ${lesson.gameType || 'none'}`);
            console.log(`   Vocabulary count: ${lesson.vocabulary?.length || 0}`);
            
            if (lesson.vocabulary && lesson.vocabulary.length > 0) {
                console.log(`   ✅ Lug'atlar:`);
                lesson.vocabulary.forEach((item, idx) => {
                    console.log(`      ${idx + 1}. word: "${item.word || 'EMPTY'}", translation: "${item.translation || 'EMPTY'}", image: "${item.image || 'EMPTY'}"`);
                });
            } else {
                console.log(`   ⚠️  Lug'at yo'q`);
            }
        }

        console.log('\n\n=== RAW DATA CHECK (Dars 51) ===');
        const lesson51 = await Lesson.findOne({ order: 51 }).lean();
        if (lesson51) {
            console.log('Full vocabulary array:');
            console.log(JSON.stringify(lesson51.vocabulary, null, 2));
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

checkVocabulary();
