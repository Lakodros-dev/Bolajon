import { MongoClient } from 'mongodb';
import { readFileSync } from 'fs';

const envContent = readFileSync('.env', 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
    }
});

const uri = envVars.MONGODB_URI || process.env.MONGODB_URI;

async function listLessons() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db();
        const lessons = await db.collection('lessons')
            .find({ order: { $gte: 51, $lte: 60 } })
            .sort({ order: 1 })
            .toArray();

        console.log(`\n📋 51-60 darslar (${lessons.length} ta):\n`);
        
        lessons.forEach(lesson => {
            console.log(`Dars ${lesson.order}: ${lesson.title}`);
            console.log(`  ID: ${lesson._id}`);
            console.log(`  Lug'at: ${lesson.vocabulary?.length || 0} ta`);
            console.log(`  Yaratilgan: ${lesson.createdAt}`);
            console.log('');
        });

        await client.close();
    } catch (error) {
        console.error('Xatolik:', error);
    }
}

listLessons();
