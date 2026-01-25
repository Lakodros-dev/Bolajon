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
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Lesson = mongoose.models.Lesson || mongoose.model('Lesson', lessonSchema);

// 61-70 qadamlar - PDF dan to'liq ma'lumot
const lessons61_70 = [
    {
        order: 61,
        title: "Takrorlash 56-61",
        description: "56-61 darslarni takrorlash",
        level: 5,
        gameType: "vocabulary",
        vocabulary: [], // Takrorlash - admin paneldan rasmlar qo'shiladi
        videoUrl: "",
        duration: 5
    },
    {
        order: 62,
        title: "Vegetables - Sabzavotlar",
        description: "Sabzavotlar nomlari",
        level: 5,
        gameType: "vocabulary",
        vocabulary: [
            { word: "onion", translation: "piyoz", image: "" },
            { word: "carrot", translation: "sabzi", image: "" },
            { word: "potato", translation: "kartoshka", image: "" },
            { word: "cucumber", translation: "bodring", image: "" },
            { word: "tomato", translation: "pamidor", image: "" }
        ],
        videoUrl: "",
        duration: 5
    },
    {
        order: 63,
        title: "Adjectives - Sifatlar",
        description: "Asosiy sifatlar",
        level: 5,
        gameType: "vocabulary",
        vocabulary: [
            { word: "big", translation: "katta", image: "" },
            { word: "small", translation: "kichkina", image: "" },
            { word: "hot", translation: "issiq", image: "" },
            { word: "cold", translation: "sovuq", image: "" }
        ],
        videoUrl: "",
        duration: 5
    },
    {
        order: 64,
        title: "Numbers 31-40 - Raqamlar",
        description: "31 dan 40 gacha raqamlar",
        level: 5,
        gameType: "catch-the-number",
        vocabulary: [],
        videoUrl: "",
        duration: 5
    },
    {
        order: 65,
        title: "M - Alphabet",
        description: "M harfi bilan boshlanadigan so'zlar",
        level: 5,
        gameType: "vocabulary",
        vocabulary: [
            { word: "map", translation: "xarita", image: "" },
            { word: "my", translation: "mening", image: "" },
            { word: "melon", translation: "qovun", image: "" }
        ],
        videoUrl: "",
        duration: 5
    },
    {
        order: 66,
        title: "Takrorlash 62-66",
        description: "62-66 darslarni takrorlash",
        level: 5,
        gameType: "vocabulary",
        vocabulary: [], // Takrorlash - admin paneldan rasmlar qo'shiladi
        videoUrl: "",
        duration: 5
    },
    {
        order: 67,
        title: "Adjectives - Sifatlar 2",
        description: "Qo'shimcha sifatlar",
        level: 5,
        gameType: "vocabulary",
        vocabulary: [
            { word: "happy", translation: "xursand", image: "" },
            { word: "sad", translation: "xafa", image: "" },
            { word: "good", translation: "yaxshi", image: "" },
            { word: "bad", translation: "yomon", image: "" },
            { word: "fast", translation: "tez", image: "" },
            { word: "slow", translation: "sekin", image: "" }
        ],
        videoUrl: "",
        duration: 5
    },
    {
        order: 68,
        title: "Comparative Adjectives - Qiyosiy sifatlar",
        description: "Sifatlarning qiyosiy shakllari",
        level: 5,
        gameType: "vocabulary",
        vocabulary: [
            { word: "bigger", translation: "kattaroq", image: "" },
            { word: "smaller", translation: "kichkinaroq", image: "" },
            { word: "hotter", translation: "issiqroq", image: "" },
            { word: "colder", translation: "sovuqroq", image: "" },
            { word: "faster", translation: "tezroq", image: "" },
            { word: "slower", translation: "sekinroq", image: "" }
        ],
        videoUrl: "",
        duration: 5
    },
    {
        order: 69,
        title: "Which is bigger? - Qaysi kattaroq?",
        description: "Qiyoslash savollari",
        level: 5,
        gameType: "vocabulary",
        vocabulary: [
            { word: "which is bigger?", translation: "qaysi biri kattaroq?", image: "" },
            { word: "elephant or horse", translation: "fil yoki ot", image: "" },
            { word: "cow or sheep", translation: "sigir yoki qo'y", image: "" }
        ],
        videoUrl: "",
        duration: 5
    },
    {
        order: 70,
        title: "N - Alphabet",
        description: "N harfi bilan boshlanadigan so'zlar",
        level: 5,
        gameType: "vocabulary",
        vocabulary: [
            { word: "nest", translation: "uya", image: "" },
            { word: "nine", translation: "to'qqiz", image: "" },
            { word: "nose", translation: "burun", image: "" }
        ],
        videoUrl: "",
        duration: 5
    }
];

async function addLessons61_70() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB ga ulandi\n');

        console.log('📝 61-70 darslarni qo\'shyapman...\n');

        for (const lessonData of lessons61_70) {
            // Check if lesson already exists
            const existing = await Lesson.findOne({ order: lessonData.order });
            
            if (existing) {
                console.log(`⚠️  Dars ${lessonData.order} allaqachon mavjud: ${lessonData.title}`);
                continue;
            }

            // Create lesson
            const lesson = new Lesson({
                title: lessonData.title,
                description: lessonData.description,
                level: lessonData.level,
                order: lessonData.order,
                duration: lessonData.duration,
                vocabulary: lessonData.vocabulary,
                videoUrl: lessonData.videoUrl,
                thumbnail: "",
                gameSettings: lessonData.gameType === 'catch-the-number' ? {
                    type: 'catch-the-number',
                    numberRange: { min: 31, max: 40 },
                    duration: 60
                } : {
                    type: lessonData.gameType
                },
                isActive: true
            });

            await lesson.save();

            console.log(`✅ Dars ${lessonData.order}: ${lessonData.title}`);
            console.log(`   O'yin: ${lessonData.gameType}`);
            console.log(`   Lug'at: ${lessonData.vocabulary.length} ta so'z\n`);
        }

        const totalLessons = await Lesson.countDocuments();
        console.log(`\n🎉 Jami darslar: ${totalLessons} ta`);
        console.log(`📈 61-70 qadamlar qo'shildi!\n`);

        console.log('💡 Keyingi qadamlar:');
        console.log('1. Admin paneldan har bir darsga video qo\'shing');
        console.log('2. Lug\'at so\'zlariga rasm/GIF qo\'shing');
        console.log('3. Takrorlash darslariga (61, 66) faqat rasmlar qo\'shing');
        console.log('4. Darslarni test qiling\n');

        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Xatolik:', error);
        process.exit(1);
    }
}

addLessons61_70();
