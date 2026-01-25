import { MongoClient } from 'mongodb';
import { readFileSync } from 'fs';

// Read .env
const envContent = readFileSync('.env', 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
    }
});

const uri = envVars.MONGODB_URI || process.env.MONGODB_URI;

// 10 ta dars - PDF dan ANIQ lug'atlar bilan
const correctLessons = [
    {
        order: 51,
        title: "Takrorlash 47-51",
        description: "47-51 darslarni takrorlash. Mevalar, yoqtirish va J harfi.",
        gameType: "vocabulary",
        vocabulary: [
            // Dars 47 - fruits
            { english: "apple", uzbek: "olma", imageUrl: "" },
            { english: "peach", uzbek: "shaftoli", imageUrl: "" },
            { english: "banana", uzbek: "banan", imageUrl: "" },
            { english: "pear", uzbek: "nok", imageUrl: "" },
            { english: "grapes", uzbek: "uzum", imageUrl: "" },
            // Dars 50 - J alphabet
            { english: "jump", uzbek: "sakramoq", imageUrl: "" },
            { english: "job", uzbek: "ish", imageUrl: "" },
            { english: "joy", uzbek: "quvonch", imageUrl: "" }
        ],
        videoUrl: ""
    },
    {
        order: 52,
        title: "I can - Men qila olaman",
        description: "Siz bu darsda 'I can' (men qila olaman) fe'llarini o'rganasiz.",
        gameType: "vocabulary",
        vocabulary: [
            { english: "swim", uzbek: "suzmoq", imageUrl: "" },
            { english: "dance", uzbek: "raqsga tushmoq", imageUrl: "" },
            { english: "run", uzbek: "yugurmoq", imageUrl: "" },
            { english: "jump", uzbek: "sakramoq", imageUrl: "" },
            { english: "fly", uzbek: "uchmoq", imageUrl: "" }
        ],
        videoUrl: ""
    },
    {
        order: 53,
        title: "I can - Gaplar",
        description: "I can bilan gaplar tuzish. Men suza olaman, yugura olaman.",
        gameType: "vocabulary",
        vocabulary: [
            { english: "I can swim", uzbek: "men suza olaman", imageUrl: "" },
            { english: "I can run", uzbek: "men yugura olaman", imageUrl: "" },
            { english: "I can dance", uzbek: "men raqsga tusha olaman", imageUrl: "" },
            { english: "I can jump", uzbek: "men sakray olaman", imageUrl: "" }
        ],
        videoUrl: ""
    },
    {
        order: 54,
        title: "Breakfast - Nonushta",
        description: "Siz bu darsda nonushta ovqatlari haqida o'rganasiz.",
        gameType: "shopping-basket",
        vocabulary: [
            { english: "bread", uzbek: "non", imageUrl: "" },
            { english: "milk", uzbek: "sut", imageUrl: "" },
            { english: "cheese", uzbek: "pishloq", imageUrl: "" },
            { english: "honey", uzbek: "asal", imageUrl: "" },
            { english: "butter", uzbek: "sariyog'", imageUrl: "" }
        ],
        videoUrl: ""
    },
    {
        order: 55,
        title: "K - Alphabet",
        description: "Siz bu darsda K harfi bilan boshlanadigan so'zlarni o'rganasiz.",
        gameType: "vocabulary",
        vocabulary: [
            { english: "key", uzbek: "kalit", imageUrl: "" },
            { english: "kid", uzbek: "bola", imageUrl: "" },
            { english: "king", uzbek: "qirol", imageUrl: "" }
        ],
        videoUrl: ""
    },
    {
        order: 56,
        title: "Takrorlash 52-56",
        description: "52-56 darslarni takrorlash. I can, nonushta va K harfi.",
        gameType: "vocabulary",
        vocabulary: [
            // Dars 52 - I can
            { english: "swim", uzbek: "suzmoq", imageUrl: "" },
            { english: "dance", uzbek: "raqsga tushmoq", imageUrl: "" },
            { english: "run", uzbek: "yugurmoq", imageUrl: "" },
            // Dars 54 - breakfast
            { english: "bread", uzbek: "non", imageUrl: "" },
            { english: "milk", uzbek: "sut", imageUrl: "" },
            { english: "cheese", uzbek: "pishloq", imageUrl: "" },
            // Dars 55 - K alphabet
            { english: "key", uzbek: "kalit", imageUrl: "" },
            { english: "kid", uzbek: "bola", imageUrl: "" },
            { english: "king", uzbek: "qirol", imageUrl: "" }
        ],
        videoUrl: ""
    },
    {
        order: 57,
        title: "It's a - Bu nimadir",
        description: "Siz bu darsda 'It's a' (bu) iborasini o'rganasiz.",
        gameType: "vocabulary",
        vocabulary: [
            { english: "toy", uzbek: "o'yinchoq", imageUrl: "" },
            { english: "car", uzbek: "mashina", imageUrl: "" },
            { english: "elephant", uzbek: "fil", imageUrl: "" },
            { english: "dog", uzbek: "it", imageUrl: "" }
        ],
        videoUrl: ""
    },
    {
        order: 58,
        title: "Numbers 26-30 - Raqamlar",
        description: "Siz bu darsda 26 dan 30 gacha raqamlarni o'rganasiz.",
        gameType: "catch-the-number",
        vocabulary: [],
        videoUrl: ""
    },
    {
        order: 59,
        title: "What is red? - Qaysi qizil?",
        description: "Siz bu darsda ranglar haqida savol berishni o'rganasiz.",
        gameType: "vocabulary",
        vocabulary: [
            { english: "red", uzbek: "qizil", imageUrl: "" },
            { english: "green", uzbek: "yashil", imageUrl: "" },
            { english: "yellow", uzbek: "sariq", imageUrl: "" },
            { english: "apple", uzbek: "olma", imageUrl: "" },
            { english: "banana", uzbek: "banan", imageUrl: "" }
        ],
        videoUrl: ""
    },
    {
        order: 60,
        title: "L - Alphabet",
        description: "Siz bu darsda L harfi bilan boshlanadigan so'zlarni o'rganasiz.",
        gameType: "vocabulary",
        vocabulary: [
            { english: "lemon", uzbek: "limon", imageUrl: "" },
            { english: "laugh", uzbek: "kulgu", imageUrl: "" },
            { english: "letter", uzbek: "xat", imageUrl: "" }
        ],
        videoUrl: ""
    }
];

async function deleteAndReaddLessons() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('✅ MongoDB ga ulandi\n');

        const db = client.db();
        const lessonsCollection = db.collection('lessons');

        // Delete lessons 51-60
        console.log('🗑️  51-60 darslarni o\'chiryapman...\n');
        const deleteResult = await lessonsCollection.deleteMany({
            order: { $gte: 51, $lte: 60 }
        });
        console.log(`✅ ${deleteResult.deletedCount} ta dars o'chirildi\n`);

        // Add correct lessons
        console.log('📝 To\'g\'ri lug\'atlar bilan qayta qo\'shyapman...\n');

        for (const lesson of correctLessons) {
            const result = await lessonsCollection.insertOne({
                ...lesson,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            console.log(`✅ Dars ${lesson.order}: ${lesson.title}`);
            console.log(`   O'yin: ${lesson.gameType}`);
            console.log(`   Lug'at: ${lesson.vocabulary.length} ta so'z`);
            if (lesson.vocabulary.length > 0) {
                console.log(`   So'zlar: ${lesson.vocabulary.slice(0, 3).map(v => v.english).join(', ')}...`);
            }
            console.log('');
        }

        // Final count
        const finalCount = await lessonsCollection.countDocuments();
        console.log(`\n🎉 Jami darslar: ${finalCount} ta`);

        console.log('\n💡 Keyingi qadamlar:\n');
        console.log('1. Admin paneldan har bir darsga video qo\'shing');
        console.log('2. Lug\'at so\'zlariga rasm/GIF qo\'shing');
        console.log('3. Darslarni test qiling');

    } catch (error) {
        console.error('❌ Xatolik:', error);
    } finally {
        await client.close();
        console.log('\n✅ MongoDB ulanish yopildi');
    }
}

deleteAndReaddLessons();
