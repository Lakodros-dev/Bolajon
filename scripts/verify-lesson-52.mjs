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

async function verifyLesson() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db();
        
        const lesson = await db.collection('lessons').findOne({ order: 52 });
        
        console.log('\n📋 Dars 52 - MongoDB dan:\n');
        console.log(`Nomi: ${lesson.title}`);
        console.log(`ID: ${lesson._id}`);
        console.log(`Lug'at array turi: ${Array.isArray(lesson.vocabulary)}`);
        console.log(`Lug'at soni: ${lesson.vocabulary?.length || 0}\n`);
        
        if (lesson.vocabulary && lesson.vocabulary.length > 0) {
            console.log('Lug\'at ma\'lumotlari:\n');
            lesson.vocabulary.forEach((word, i) => {
                console.log(`${i + 1}. English: "${word.english}"`);
                console.log(`   Uzbek: "${word.uzbek}"`);
                console.log(`   ImageUrl: "${word.imageUrl}"`);
                console.log(`   Turi: ${typeof word}`);
                console.log('');
            });
        }
        
        console.log('\nTo\'liq JSON:');
        console.log(JSON.stringify(lesson.vocabulary, null, 2));
        
        await client.close();
        
    } catch (error) {
        console.error('Xatolik:', error);
    }
}

verifyLesson();
