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

// 71-100 qadamlar - PDF dan to'liq ma'lumot
const lessons71_100 = [
    {
        order: 71,
        title: "Takrorlash 66-71",
        description: "66-71 darslarni takrorlash",
        level: 5,
        gameType: "vocabulary",
        vocabulary: [],
        videoUrl: "",
        duration: 5
    },
    {
        order: 72,
        title: "Basic Products - Asosiy mahsulotlar",
        description: "Nonushta mahsulotlari",
        level: 5,
        gameType: "vocabulary",
        vocabulary: [
            { word: "bread", translation: "non", image: "" },
            { word: "rice", translation: "guruch", image: "" },
            { word: "egg", translation: "tuxum", image: "" },
            { word: "chicken", translation: "tovuq", image: "" },
            { word: "fish", translation: "baliq", image: "" }
        ],
        videoUrl: "",
        duration: 5
    },
    {
        order: 73,
        title: "Important Activities - Muhim faoliyatlar",
        description: "Kundalik faoliyatlar",
        level: 5,
        gameType: "vocabulary",
        vocabulary: [
            { word: "I drink water", translation: "men suv ichaman", image: "" },
            { word: "I eat egg", translation: "men tuxum yeyman", image: "" },
            { word: "I play game", translation: "men o'yin o'ynayman", image: "" },
            { word: "I read books", translation: "men kitob o'qiyman", image: "" },
            { word: "I sleep", translation: "men uxlayman", image: "" }
        ],
        videoUrl: "",
        duration: 5
    },
    {
        order: 74,
        title: "Numbers 41-50 - Raqamlar",
        description: "41 dan 50 gacha raqamlar",
        level: 5,
        gameType: "catch-the-number",
        vocabulary: [],
        videoUrl: "",
        duration: 5
    },
    {
        order: 75,
        title: "O - Alphabet",
        description: "O harfi bilan boshlanadigan so'zlar",
        level: 5,
        gameType: "vocabulary",
        vocabulary: [
            { word: "open", translation: "ochiq", image: "" },
            { word: "orange", translation: "apelsin", image: "" },
            { word: "ostrich", translation: "tuya qush", image: "" }
        ],
        videoUrl: "",
        duration: 5
    },
    {
        order: 76,
        title: "Takrorlash 72-76",
        description: "72-76 darslarni takrorlash",
        level: 5,
        gameType: "vocabulary",
        vocabulary: [],
        videoUrl: "",
        duration: 5
    },
    {
        order: 77,
        title: "Weather - Ob-havo",
        description: "Ob-havo holatlari",
        level: 6,
        gameType: "vocabulary",
        vocabulary: [
            { word: "rain", translation: "yomg'ir", image: "" },
            { word: "snow", translation: "qor", image: "" },
            { word: "hot", translation: "issiq", image: "" },
            { word: "cold", translation: "sovuq", image: "" },
            { word: "cool", translation: "salqin", image: "" }
        ],
        videoUrl: "",
        duration: 5
    },
    {
        order: 78,
        title: "Places - Joylar",
        description: "Turli joylar",
        level: 6,
        gameType: "vocabulary",
        vocabulary: [
            { word: "house", translation: "uy", image: "" },
            { word: "school", translation: "maktab", image: "" },
            { word: "park", translation: "istirohat bog'i", image: "" },
            { word: "hospital", translation: "shifoxona", image: "" },
            { word: "garden", translation: "bog'", image: "" }
        ],
        videoUrl: "",
        duration: 5
    },
    {
        order: 79,
        title: "It is... - Bu...",
        description: "Ob-havo haqida gapirish",
        level: 6,
        gameType: "vocabulary",
        vocabulary: [
            { word: "It is sunny", translation: "quyoshli", image: "" },
            { word: "It is rainy", translation: "yomg'irli", image: "" },
            { word: "It is snowy", translation: "qorli", image: "" },
            { word: "It is hot", translation: "issiq", image: "" },
            { word: "It is cold", translation: "sovuq", image: "" }
        ],
        videoUrl: "",
        duration: 5
    },
    {
        order: 80,
        title: "P - Alphabet",
        description: "P harfi bilan boshlanadigan so'zlar",
        level: 6,
        gameType: "vocabulary",
        vocabulary: [
            { word: "panda", translation: "panda", image: "" },
            { word: "parents", translation: "ota-onalar", image: "" },
            { word: "pink", translation: "pushti", image: "" },
            { word: "park", translation: "istirohat bog'i", image: "" }
        ],
        videoUrl: "",
        duration: 5
    },
    {
        order: 81,
        title: "Takrorlash 77-81",
        description: "77-81 darslarni takrorlash",
        level: 6,
        gameType: "vocabulary",
        vocabulary: [],
        videoUrl: "",
        duration: 5
    },
    {
        order: 82,
        title: "Jobs - Kasblar",
        description: "Turli kasblar",
        level: 6,
        gameType: "vocabulary",
        vocabulary: [
            { word: "teacher", translation: "o'qituvchi", image: "" },
            { word: "doctor", translation: "shifokor", image: "" },
            { word: "farmer", translation: "fermer", image: "" },
            { word: "policeman", translation: "politsiyachi", image: "" }
        ],
        videoUrl: "",
        duration: 5
    },
    {
        order: 83,
        title: "Transports - Avtomobillar",
        description: "Transport vositalari",
        level: 6,
        gameType: "vocabulary",
        vocabulary: [
            { word: "car", translation: "mashina", image: "" },
            { word: "bike", translation: "mototsikl", image: "" },
            { word: "bus", translation: "avtobus", image: "" },
            { word: "train", translation: "poyezd", image: "" },
            { word: "plane", translation: "samolyot", image: "" }
        ],
        videoUrl: "",
        duration: 5
    },
    {
        order: 84,
        title: "Numbers 51-60 - Raqamlar",
        description: "51 dan 60 gacha raqamlar",
        level: 6,
        gameType: "catch-the-number",
        vocabulary: [],
        videoUrl: "",
        duration: 5
    },
    {
        order: 85,
        title: "Q - Alphabet",
        description: "Q harfi bilan boshlanadigan so'zlar",
        level: 6,
        gameType: "vocabulary",
        vocabulary: [
            { word: "queue", translation: "navbat", image: "" },
            { word: "question", translation: "savol", image: "" }
        ],
        videoUrl: "",
        duration: 5
    },
    {
        order: 86,
        title: "Takrorlash 82-86",
        description: "82-86 darslarni takrorlash",
        level: 6,
        gameType: "vocabulary",
        vocabulary: [],
        videoUrl: "",
        duration: 5
    },
    {
        order: 87,
        title: "Days of Week - Hafta kunlari",
        description: "Hafta kunlari 1-qism",
        level: 6,
        gameType: "vocabulary",
        vocabulary: [
            { word: "monday", translation: "dushanba", image: "" },
            { word: "tuesday", translation: "seshanba", image: "" },
            { word: "wednesday", translation: "chorshamba", image: "" },
            { word: "it's monday", translation: "bu dushanba", image: "" }
        ],
        videoUrl: "",
        duration: 5
    },
    {
        order: 88,
        title: "About Myself - Men haqimda",
        description: "O'zim haqimda gapirish",
        level: 6,
        gameType: "vocabulary",
        vocabulary: [
            { word: "I am", translation: "men", image: "" },
            { word: "I am 7 years old", translation: "mening 7 yoshdaman", image: "" },
            { word: "I am from Bukhara", translation: "men Buxorodanman", image: "" },
            { word: "I am good", translation: "men yaxshiman", image: "" }
        ],
        videoUrl: "",
        duration: 5
    },
    {
        order: 89,
        title: "Days of Week 2 - Hafta kunlari 2",
        description: "Hafta kunlari 2-qism",
        level: 6,
        gameType: "vocabulary",
        vocabulary: [
            { word: "thursday", translation: "payshanba", image: "" },
            { word: "friday", translation: "juma", image: "" },
            { word: "saturday", translation: "shanba", image: "" },
            { word: "sunday", translation: "yakshanba", image: "" },
            { word: "it's friday", translation: "bu juma", image: "" }
        ],
        videoUrl: "",
        duration: 5
    },
    {
        order: 90,
        title: "R - Alphabet",
        description: "R harfi bilan boshlanadigan so'zlar",
        level: 6,
        gameType: "vocabulary",
        vocabulary: [
            { word: "rabbit", translation: "quyon", image: "" },
            { word: "run", translation: "yugurmoq", image: "" },
            { word: "rooster", translation: "xo'roz", image: "" }
        ],
        videoUrl: "",
        duration: 5
    },
    {
        order: 91,
        title: "Takrorlash 87-91",
        description: "87-91 darslarni takrorlash",
        level: 6,
        gameType: "vocabulary",
        vocabulary: [],
        videoUrl: "",
        duration: 5
    },
    {
        order: 92,
        title: "My Family Jobs - Oilam kasblari",
        description: "Oila a'zolarining kasblari",
        level: 7,
        gameType: "vocabulary",
        vocabulary: [
            { word: "My mother is a doctor", translation: "mening oyim shifokor", image: "" },
            { word: "My father is a farmer", translation: "mening dadam fermer", image: "" },
            { word: "My sister is a teacher", translation: "mening opam o'qituvchi", image: "" },
            { word: "My brother is a policeman", translation: "mening akam politsiyachi", image: "" }
        ],
        videoUrl: "",
        duration: 5
    },
    {
        order: 93,
        title: "Kitchen Items - Oshxona buyumlari",
        description: "Oshxona jihozlari",
        level: 7,
        gameType: "vocabulary",
        vocabulary: [
            { word: "pot", translation: "qozon", image: "" },
            { word: "kettle", translation: "tefal", image: "" },
            { word: "pan", translation: "tova", image: "" },
            { word: "glass", translation: "shisha", image: "" },
            { word: "knife", translation: "pichoq", image: "" }
        ],
        videoUrl: "",
        duration: 5
    },
    {
        order: 94,
        title: "Numbers 61-70 - Raqamlar",
        description: "61 dan 70 gacha raqamlar",
        level: 7,
        gameType: "catch-the-number",
        vocabulary: [],
        videoUrl: "",
        duration: 5
    },
    {
        order: 95,
        title: "S - Alphabet",
        description: "S harfi bilan boshlanadigan so'zlar",
        level: 7,
        gameType: "vocabulary",
        vocabulary: [
            { word: "sun", translation: "quyosh", image: "" },
            { word: "sorry", translation: "uzur", image: "" },
            { word: "socks", translation: "paypoqlar", image: "" }
        ],
        videoUrl: "",
        duration: 5
    },
    {
        order: 96,
        title: "Takrorlash 92-96",
        description: "92-96 darslarni takrorlash",
        level: 7,
        gameType: "vocabulary",
        vocabulary: [],
        videoUrl: "",
        duration: 5
    },
    {
        order: 97,
        title: "Clothes - Kiyimlar",
        description: "Kiyim-kechak",
        level: 7,
        gameType: "vocabulary",
        vocabulary: [
            { word: "dress", translation: "ko'ylak", image: "" },
            { word: "hat", translation: "bosh kiyim", image: "" },
            { word: "T-shirt", translation: "futbolka", image: "" },
            { word: "cap", translation: "kepka", image: "" },
            { word: "shoes", translation: "oyoq kiyim", image: "" }
        ],
        videoUrl: "",
        duration: 5
    },
    {
        order: 98,
        title: "Jobs 2 - Kasblar 2",
        description: "Qo'shimcha kasblar",
        level: 7,
        gameType: "vocabulary",
        vocabulary: [
            { word: "driver", translation: "haydovchi", image: "" },
            { word: "builder", translation: "quruvchi", image: "" },
            { word: "cook", translation: "oshpaz", image: "" },
            { word: "nurse", translation: "hamshira", image: "" }
        ],
        videoUrl: "",
        duration: 5
    },
    {
        order: 99,
        title: "This is... - Bu...",
        description: "Narsalarni ko'rsatish",
        level: 7,
        gameType: "vocabulary",
        vocabulary: [
            { word: "this is book", translation: "bu kitob", image: "" },
            { word: "this is pencil", translation: "bu qalam", image: "" },
            { word: "this is tree", translation: "bu daraxt", image: "" }
        ],
        videoUrl: "",
        duration: 5
    },
    {
        order: 100,
        title: "T - Alphabet",
        description: "T harfi bilan boshlanadigan so'zlar",
        level: 7,
        gameType: "vocabulary",
        vocabulary: [
            { word: "tall", translation: "uzun", image: "" },
            { word: "tiger", translation: "yo'lbars", image: "" },
            { word: "tree", translation: "daraxt", image: "" }
        ],
        videoUrl: "",
        duration: 5
    }
];

async function addLessons71_100() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB ga ulandi\n');

        console.log('📝 71-100 darslarni qo\'shyapman...\n');

        let addedCount = 0;
        let skippedCount = 0;

        for (const lessonData of lessons71_100) {
            // Check if lesson already exists
            const existing = await Lesson.findOne({ order: lessonData.order });
            
            if (existing) {
                console.log(`⚠️  Dars ${lessonData.order} allaqachon mavjud`);
                skippedCount++;
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
                    numberRange: { 
                        min: lessonData.order === 74 ? 41 : lessonData.order === 84 ? 51 : lessonData.order === 94 ? 61 : 1,
                        max: lessonData.order === 74 ? 50 : lessonData.order === 84 ? 60 : lessonData.order === 94 ? 70 : 10
                    },
                    duration: 60
                } : {
                    type: lessonData.gameType
                },
                isActive: true
            });

            await lesson.save();
            addedCount++;

            if (lessonData.order % 5 === 0) {
                console.log(`✅ Dars ${lessonData.order}: ${lessonData.title}`);
            }
        }

        const totalLessons = await Lesson.countDocuments();
        console.log(`\n🎉 Jami darslar: ${totalLessons} ta`);
        console.log(`📈 Qo'shildi: ${addedCount} ta`);
        console.log(`⏭️  O'tkazildi: ${skippedCount} ta\n`);

        console.log('💡 Keyingi qadamlar:');
        console.log('1. Admin paneldan har bir darsga video qo\'shing');
        console.log('2. Lug\'at so\'zlariga rasm/GIF qo\'shing');
        console.log('3. Takrorlash darslariga faqat rasmlar qo\'shing');
        console.log('4. Darslarni test qiling\n');

        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Xatolik:', error);
        process.exit(1);
    }
}

addLessons71_100();
