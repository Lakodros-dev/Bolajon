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
    order: Number,
    level: Number,
}, { timestamps: true });

const Lesson = mongoose.models.Lesson || mongoose.model('Lesson', lessonSchema);

async function fixLevels() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB ga ulandi\n');

        console.log('📝 Darajalarni to\'g\'rilayman...\n');

        let updatedCount = 0;

        // 61-75: 5-daraja
        for (let order = 61; order <= 75; order++) {
            const lesson = await Lesson.findOne({ order });
            if (lesson && lesson.level !== 5) {
                lesson.level = 5;
                await lesson.save();
                console.log(`✅ Dars ${order}: ${lesson.title} → 5-daraja`);
                updatedCount++;
            }
        }

        // 76-90: 6-daraja
        for (let order = 76; order <= 90; order++) {
            const lesson = await Lesson.findOne({ order });
            if (lesson && lesson.level !== 6) {
                lesson.level = 6;
                await lesson.save();
                console.log(`✅ Dars ${order}: ${lesson.title} → 6-daraja`);
                updatedCount++;
            }
        }

        // 91-105: 7-daraja
        for (let order = 91; order <= 105; order++) {
            const lesson = await Lesson.findOne({ order });
            if (lesson && lesson.level !== 7) {
                lesson.level = 7;
                await lesson.save();
                console.log(`✅ Dars ${order}: ${lesson.title} → 7-daraja`);
                updatedCount++;
            }
        }

        console.log(`\n🎉 Jami ${updatedCount} ta dars yangilandi\n`);

        // Show summary
        console.log('📊 Daraja bo\'yicha taqsimot:\n');
        for (let level = 1; level <= 7; level++) {
            const count = await Lesson.countDocuments({ level });
            const lessons = await Lesson.find({ level }).sort({ order: 1 });
            const range = lessons.length > 0 
                ? `${lessons[0].order}-${lessons[lessons.length - 1].order}`
                : 'yo\'q';
            console.log(`${level}-daraja: ${count} ta dars (${range})`);
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Xatolik:', error);
        process.exit(1);
    }
}

fixLevels();
