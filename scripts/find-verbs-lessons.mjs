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

async function findVerbsLessons() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('✅ MongoDB ga ulandi\n');

        const db = client.db();
        const lessonsCollection = db.collection('lessons');

        // Fe'llar mavzusidagi darslarni topish
        const lessons = await lessonsCollection.find({
            $or: [
                { title: /fe'l/i },
                { title: /verb/i },
                { description: /fe'l/i },
                { description: /verb/i },
                { topic: /fe'l/i },
                { topic: /verb/i }
            ]
        }).sort({ order: 1 }).toArray();

        console.log(`📊 Topilgan darslar soni: ${lessons.length}\n`);

        if (lessons.length === 0) {
            console.log('❌ Fe\'llar mavzusida darslar topilmadi');
        } else {
            console.log('📋 Fe\'llar mavzusidagi darslar:\n');
            lessons.forEach((lesson, index) => {
                console.log(`${index + 1}. ${lesson.title}`);
                console.log(`   ID: ${lesson._id}`);
                console.log(`   Tartib: ${lesson.order || 'Tartib yo\'q'}`);
                console.log(`   Mavzu: ${lesson.topic || 'Mavzu ko\'rsatilmagan'}`);
                console.log(`   O'yin turi: ${lesson.gameType}`);
                console.log(`   Vocabulary: ${lesson.vocabulary?.length || 0} ta so'z`);
                console.log(`   Video: ${lesson.videoUrl ? '✅' : '❌'}`);
                console.log(`   Tavsif: ${lesson.description || 'Tavsif yo\'q'}`);
                console.log('');
            });
        }

    } catch (error) {
        console.error('❌ Xatolik:', error);
    } finally {
        await client.close();
        console.log('\n✅ MongoDB ulanish yopildi');
    }
}

findVerbsLessons();
