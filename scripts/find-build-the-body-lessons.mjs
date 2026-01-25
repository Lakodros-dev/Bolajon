import { MongoClient } from 'mongodb';
import { readFileSync } from 'fs';

// Read .env file manually
const envContent = readFileSync('.env', 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
    }
});

const uri = envVars.MONGODB_URI || process.env.MONGODB_URI;

async function findBuildTheBodyLessons() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('✅ MongoDB ga ulandi\n');

        const db = client.db();
        const lessonsCollection = db.collection('lessons');

        // Build-the-body o'yini bo'lgan darslarni topish
        const lessons = await lessonsCollection.find({
            gameType: 'build-the-body'
        }).toArray();

        console.log(`📊 Topilgan darslar soni: ${lessons.length}\n`);

        if (lessons.length === 0) {
            console.log('❌ "build-the-body" o\'yini bo\'lgan darslar topilmadi');
        } else {
            console.log('📋 Build-the-body o\'yini bo\'lgan darslar:\n');
            lessons.forEach((lesson, index) => {
                console.log(`${index + 1}. ${lesson.title}`);
                console.log(`   ID: ${lesson._id}`);
                console.log(`   Mavzu: ${lesson.topic || 'Mavzu ko\'rsatilmagan'}`);
                console.log(`   Tartib raqami: ${lesson.order || 'Tartib yo\'q'}`);
                console.log(`   Game Type: ${lesson.gameType}`);
                console.log(`   Vocabulary: ${lesson.vocabulary?.length || 0} ta so'z`);
                console.log(`   Video: ${lesson.videoUrl ? '✅' : '❌'}`);
                console.log(`   Tavsif: ${lesson.description || 'Tavsif yo\'q'}`);
                console.log('');
            });
        }

        // Barcha o'yin turlari statistikasi
        console.log('\n📊 Barcha o\'yin turlari statistikasi:');
        const gameTypes = await lessonsCollection.aggregate([
            {
                $group: {
                    _id: '$gameType',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]).toArray();

        gameTypes.forEach(type => {
            console.log(`   ${type._id}: ${type.count} ta dars`);
        });

    } catch (error) {
        console.error('❌ Xatolik:', error);
    } finally {
        await client.close();
        console.log('\n✅ MongoDB ulanish yopildi');
    }
}

findBuildTheBodyLessons();
