/**
 * Add Lessons Only - Don't delete existing data
 * Run with: node scripts/add-lessons-only.mjs
 */
import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://Bolajon:mr.ozodbek2410@cluster0.dlopces.mongodb.net/bolajon-uz?retryWrites=true&w=majority';

async function addLessons() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const LessonSchema = new mongoose.Schema({
            title: String,
            description: String,
            videoUrl: String,
            thumbnail: { type: String, default: '' },
            level: Number,
            duration: { type: Number, default: 0 },
            order: { type: Number, default: 0 },
            isActive: { type: Boolean, default: true },
            vocabulary: [{ 
                word: String, 
                translation: String, 
                image: String 
            }],
            gameType: String
        }, { timestamps: true });

        const Lesson = mongoose.models.Lesson || mongoose.model('Lesson', LessonSchema);

        // Check existing lessons
        const existingCount = await Lesson.countDocuments();
        console.log(`📚 Existing lessons: ${existingCount}`);

        if (existingCount > 0) {
            console.log('⚠️  Lessons already exist. Skipping...');
        } else {
            console.log('➕ Adding new lessons...\n');

            const lessons = [
                // Level 1 - Boshlang'ich
                {
                    title: 'Salomlashish - Hello!',
                    description: "Ingliz tilida salomlashishni o'rganamiz: Hello, Hi, Good morning, Good afternoon, Good evening",
                    videoUrl: 'https://www.youtube.com/watch?v=tVlcKp3bWH8',
                    thumbnail: 'https://img.youtube.com/vi/tVlcKp3bWH8/maxresdefault.jpg',
                    level: 1,
                    duration: 5,
                    order: 1,
                    isActive: true
                },
                {
                    title: 'Raqamlar 1-10',
                    description: "1 dan 10 gacha raqamlarni ingliz tilida o'rganamiz",
                    videoUrl: 'https://www.youtube.com/watch?v=DR-cfDsHCGA',
                    thumbnail: 'https://img.youtube.com/vi/DR-cfDsHCGA/maxresdefault.jpg',
                    level: 1,
                    duration: 8,
                    order: 2,
                    isActive: true
                },
                {
                    title: 'Ranglar - Colors',
                    description: "Asosiy ranglarni ingliz tilida o'rganamiz: Red, Blue, Green, Yellow",
                    videoUrl: 'https://www.youtube.com/watch?v=ybt2jhCQ3lA',
                    thumbnail: 'https://img.youtube.com/vi/ybt2jhCQ3lA/maxresdefault.jpg',
                    level: 1,
                    duration: 6,
                    order: 3,
                    isActive: true
                },
                {
                    title: 'Alifbo qo\'shig\'i - ABC Song',
                    description: "Ingliz alifbosini qo'shiq orqali o'rganamiz",
                    videoUrl: 'https://www.youtube.com/watch?v=75p-N9YKqNo',
                    thumbnail: 'https://img.youtube.com/vi/75p-N9YKqNo/maxresdefault.jpg',
                    level: 1,
                    duration: 4,
                    order: 4,
                    isActive: true
                },
                // Level 2 - O'rta
                {
                    title: 'Hayvonlar - Animals',
                    description: "Uy va yovvoyi hayvonlarni ingliz tilida o'rganamiz",
                    videoUrl: 'https://www.youtube.com/watch?v=zXEq-QO3xTg',
                    thumbnail: 'https://img.youtube.com/vi/zXEq-QO3xTg/maxresdefault.jpg',
                    level: 2,
                    duration: 10,
                    order: 1,
                    isActive: true
                },
                {
                    title: 'Oila a\'zolari - Family',
                    description: "Oila a'zolarini ingliz tilida o'rganamiz: Mother, Father, Sister, Brother",
                    videoUrl: 'https://www.youtube.com/watch?v=FHaObkHEkHQ',
                    thumbnail: 'https://img.youtube.com/vi/FHaObkHEkHQ/maxresdefault.jpg',
                    level: 2,
                    duration: 7,
                    order: 2,
                    isActive: true
                },
                {
                    title: 'Mevalar - Fruits',
                    description: "Mevalarni ingliz tilida o'rganamiz: Apple, Banana, Orange",
                    videoUrl: 'https://www.youtube.com/watch?v=mfReSbQ7jzE',
                    thumbnail: 'https://img.youtube.com/vi/mfReSbQ7jzE/maxresdefault.jpg',
                    level: 2,
                    duration: 6,
                    order: 3,
                    isActive: true
                },
                // Level 3 - Yuqori
                {
                    title: 'Tana a\'zolari - Body Parts',
                    description: "Tana a'zolarini ingliz tilida o'rganamiz: Head, Shoulders, Knees, Toes",
                    videoUrl: 'https://www.youtube.com/watch?v=ZanHgPprl-0',
                    thumbnail: 'https://img.youtube.com/vi/ZanHgPprl-0/maxresdefault.jpg',
                    level: 3,
                    duration: 5,
                    order: 1,
                    isActive: true
                },
                {
                    title: 'Kiyimlar - Clothes',
                    description: "Kiyimlarni ingliz tilida o'rganamiz: Shirt, Pants, Shoes",
                    videoUrl: 'https://www.youtube.com/watch?v=xqZsoMgqjCU',
                    thumbnail: 'https://img.youtube.com/vi/xqZsoMgqjCU/maxresdefault.jpg',
                    level: 3,
                    duration: 8,
                    order: 2,
                    isActive: true
                },
                {
                    title: 'Ob-havo - Weather',
                    description: "Ob-havo haqida ingliz tilida gaplashamiz: Sunny, Rainy, Cloudy",
                    videoUrl: 'https://www.youtube.com/watch?v=rD6FRDd9Hew',
                    thumbnail: 'https://img.youtube.com/vi/rD6FRDd9Hew/maxresdefault.jpg',
                    level: 3,
                    duration: 7,
                    order: 3,
                    isActive: true
                }
            ];

            await Lesson.insertMany(lessons);
            console.log(`✅ Added ${lessons.length} lessons successfully!\n`);
        }

        // Check admin user
        console.log('👤 Checking admin user...');
        const db = mongoose.connection.db;
        const admin = await db.collection('users').findOne({ role: 'admin' });
        
        if (admin) {
            console.log('✅ Admin found:');
            console.log(`   Name: ${admin.name}`);
            console.log(`   Phone: ${admin.phone}`);
            console.log(`   Role: ${admin.role}`);
            console.log('\n📱 Admin login ma\'lumotlari:');
            console.log(`   Telefon: ${admin.phone}`);
            console.log('   Parol: Lakodros01');
        } else {
            console.log('❌ Admin user not found!');
        }

        console.log('\n✅ Done!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

addLessons();
