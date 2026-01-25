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

async function fixVocabularyFields() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('✅ MongoDB ga ulandi\n');

        const db = client.db();
        const lessonsCollection = db.collection('lessons');

        // Get all lessons with vocabulary
        const lessons = await lessonsCollection.find({
            vocabulary: { $exists: true, $ne: [] }
        }).toArray();

        console.log(`📋 Topilgan darslar: ${lessons.length}\n`);

        let fixedCount = 0;

        for (const lesson of lessons) {
            let needsUpdate = false;
            const fixedVocabulary = lesson.vocabulary.map(item => {
                // Check if using old field names
                if (item.english || item.uzbek || item.imageUrl !== undefined) {
                    needsUpdate = true;
                    return {
                        word: item.english || item.word || '',
                        translation: item.uzbek || item.translation || '',
                        image: item.imageUrl || item.image || ''
                    };
                }
                return item;
            });

            if (needsUpdate) {
                await lessonsCollection.updateOne(
                    { _id: lesson._id },
                    { $set: { vocabulary: fixedVocabulary } }
                );
                console.log(`✅ Dars ${lesson.order}: ${lesson.title} - ${fixedVocabulary.length} ta so'z to'g'rilandi`);
                fixedCount++;
            }
        }

        console.log(`\n🎉 Jami ${fixedCount} ta dars to'g'rilandi`);

        await client.close();

    } catch (error) {
        console.error('❌ Xatolik:', error);
    }
}

fixVocabularyFields();
