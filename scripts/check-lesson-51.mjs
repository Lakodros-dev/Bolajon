import { MongoClient, ObjectId } from 'mongodb';
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

async function checkLesson51() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('✅ MongoDB ga ulandi\n');

        const db = client.db();
        const lessonsCollection = db.collection('lessons');

        // Get lesson 51
        const lesson = await lessonsCollection.findOne({ order: 51 });
        
        if (!lesson) {
            console.log('❌ Dars 51 topilmadi');
            return;
        }

        console.log('📋 Dars 51 ma\'lumotlari:\n');
        console.log(`ID: ${lesson._id}`);
        console.log(`Nomi: ${lesson.title}`);
        console.log(`O'yin: ${lesson.gameType}`);
        console.log(`Lug'at soni: ${lesson.vocabulary?.length || 0}\n`);
        
        if (lesson.vocabulary && lesson.vocabulary.length > 0) {
            console.log('Lug\'at so\'zlari:');
            lesson.vocabulary.forEach((word, i) => {
                console.log(`${i + 1}. ${word.english} - ${word.uzbek}`);
            });
        } else {
            console.log('❌ Lug\'at bo\'sh!');
        }

        console.log('\n\nTo\'liq JSON:');
        console.log(JSON.stringify(lesson, null, 2));

    } catch (error) {
        console.error('❌ Xatolik:', error);
    } finally {
        await client.close();
    }
}

checkLesson51();
