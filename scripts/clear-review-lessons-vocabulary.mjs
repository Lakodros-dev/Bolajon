import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    order: Number,
    vocabulary: [{
        word: String,
        translation: String,
        image: String,
    }],
}, { timestamps: true });

const Lesson = mongoose.models.Lesson || mongoose.model('Lesson', lessonSchema);

async function clearReviewVocabulary() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB ga ulandi\n');

        // Find review lessons (Takrorlash)
        const reviewLessons = await Lesson.find({
            $or: [
                { order: 51 }, // Takrorlash 47-51
                { order: 56 }  // Takrorlash 52-56
            ]
        }).sort({ order: 1 });

        console.log(`📋 Takrorlash darslari: ${reviewLessons.length} ta\n`);

        for (const lesson of reviewLessons) {
            console.log(`Dars ${lesson.order}: ${lesson.title}`);
            console.log(`  Hozirgi lug'at: ${lesson.vocabulary?.length || 0} ta`);
            
            // Clear vocabulary
            lesson.vocabulary = [];
            await lesson.save();
            
            console.log(`  ✅ Lug'at tozalandi\n`);
        }

        console.log('✅ Takrorlash darslaridan lug\'atlar o\'chirildi');
        console.log('\n💡 Eslatma:');
        console.log('Takrorlash darslarida faqat rasmlar bo\'lishi kerak.');
        console.log('Admin paneldan har bir takrorlash darsiga faqat rasmlar qo\'shing (so\'zsiz).\n');

        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Xatolik:', error);
        process.exit(1);
    }
}

clearReviewVocabulary();
