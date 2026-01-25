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

async function cleanDuplicates() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('✅ MongoDB ga ulandi\n');

        const db = client.db();
        const lessonsCollection = db.collection('lessons');

        // Get all lessons with order 51-60
        const lessons = await lessonsCollection
            .find({ order: { $gte: 51, $lte: 60 } })
            .sort({ createdAt: 1 }) // Oldest first
            .toArray();

        console.log(`📋 Topilgan: ${lessons.length} ta dars (51-60)\n`);

        // Group by order
        const grouped = {};
        lessons.forEach(lesson => {
            if (!grouped[lesson.order]) {
                grouped[lesson.order] = [];
            }
            grouped[lesson.order].push(lesson);
        });

        // Delete older duplicates, keep newest
        let deletedCount = 0;
        for (const [order, lessonGroup] of Object.entries(grouped)) {
            if (lessonGroup.length > 1) {
                console.log(`\n🔍 Dars ${order}: ${lessonGroup.length} ta nusxa topildi`);
                
                // Sort by createdAt, keep the newest
                lessonGroup.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                const newest = lessonGroup[0];
                const toDelete = lessonGroup.slice(1);

                console.log(`  ✅ Saqlanadi: ${newest._id} (${newest.vocabulary?.length || 0} so'z, ${newest.createdAt})`);
                
                for (const old of toDelete) {
                    console.log(`  ❌ O'chiriladi: ${old._id} (${old.vocabulary?.length || 0} so'z, ${old.createdAt})`);
                    await lessonsCollection.deleteOne({ _id: old._id });
                    deletedCount++;
                }
            } else {
                console.log(`✅ Dars ${order}: 1 ta nusxa (to'g'ri)`);
            }
        }

        console.log(`\n🎉 Jami o'chirildi: ${deletedCount} ta eski dars`);
        
        // Final list
        const finalLessons = await lessonsCollection
            .find({ order: { $gte: 51, $lte: 60 } })
            .sort({ order: 1 })
            .toArray();

        console.log(`\n📊 Qolgan darslar:\n`);
        finalLessons.forEach(lesson => {
            console.log(`Dars ${lesson.order}: ${lesson.title}`);
            console.log(`  ID: ${lesson._id}`);
            console.log(`  Lug'at: ${lesson.vocabulary?.length || 0} ta so'z`);
            console.log('');
        });

        await client.close();
        console.log('✅ Tayyor! Endi admin panelni yangilang (F5)');

    } catch (error) {
        console.error('❌ Xatolik:', error);
    }
}

cleanDuplicates();
