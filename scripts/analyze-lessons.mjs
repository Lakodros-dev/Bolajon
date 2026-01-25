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

async function analyzeLessons() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('✅ MongoDB ga ulandi\n');

        const db = client.db();
        const lessonsCollection = db.collection('lessons');

        // Get all lessons sorted by order
        const lessons = await lessonsCollection.find({})
            .sort({ order: 1 })
            .toArray();

        console.log(`📊 Jami darslar: ${lessons.length}\n`);

        // Group by game type
        const byGameType = {};
        lessons.forEach(lesson => {
            const type = lesson.gameType || 'unknown';
            if (!byGameType[type]) byGameType[type] = [];
            byGameType[type].push(lesson);
        });

        console.log('📋 O\'yin turlari bo\'yicha:\n');
        Object.keys(byGameType).sort().forEach(type => {
            console.log(`${type}: ${byGameType[type].length} ta dars`);
        });

        console.log('\n📝 Barcha darslar ro\'yxati:\n');
        lessons.forEach((lesson, index) => {
            console.log(`${lesson.order || index + 1}. ${lesson.title}`);
            console.log(`   O'yin: ${lesson.gameType}`);
            console.log(`   Lug'at: ${lesson.vocabulary?.length || 0} ta so'z`);
            console.log(`   Video: ${lesson.videoUrl ? '✅' : '❌'}`);
            if (lesson.vocabulary && lesson.vocabulary.length > 0) {
                console.log(`   So'zlar: ${lesson.vocabulary.slice(0, 3).map(v => v.uzbek).join(', ')}...`);
            }
            console.log('');
        });

        // Analyze patterns
        console.log('\n🔍 Pattern tahlili:\n');
        
        const withVideo = lessons.filter(l => l.videoUrl).length;
        const withVocabulary = lessons.filter(l => l.vocabulary && l.vocabulary.length > 0).length;
        const avgVocabSize = lessons
            .filter(l => l.vocabulary && l.vocabulary.length > 0)
            .reduce((sum, l) => sum + l.vocabulary.length, 0) / withVocabulary;

        console.log(`Video bor: ${withVideo}/${lessons.length}`);
        console.log(`Lug'at bor: ${withVocabulary}/${lessons.length}`);
        console.log(`O'rtacha lug'at hajmi: ${avgVocabSize.toFixed(1)} ta so'z`);

    } catch (error) {
        console.error('❌ Xatolik:', error);
    } finally {
        await client.close();
        console.log('\n✅ MongoDB ulanish yopildi');
    }
}

analyzeLessons();
