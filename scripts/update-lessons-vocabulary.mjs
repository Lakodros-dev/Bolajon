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

async function updateVocabulary() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('✅ MongoDB ga ulandi\n');

        const db = client.db();
        const lessonsCollection = db.collection('lessons');

        // Update each lesson with correct vocabulary
        const updates = [
            {
                order: 52,
                vocabulary: [
                    { english: "swim", uzbek: "suzmoq", imageUrl: "" },
                    { english: "dance", uzbek: "raqsga tushmoq", imageUrl: "" },
                    { english: "run", uzbek: "yugurmoq", imageUrl: "" },
                    { english: "jump", uzbek: "sakramoq", imageUrl: "" },
                    { english: "fly", uzbek: "uchmoq", imageUrl: "" }
                ]
            },
            {
                order: 53,
                vocabulary: [
                    { english: "I can swim", uzbek: "men suza olaman", imageUrl: "" },
                    { english: "I can run", uzbek: "men yugura olaman", imageUrl: "" },
                    { english: "I can dance", uzbek: "men raqsga tusha olaman", imageUrl: "" },
                    { english: "I can jump", uzbek: "men sakray olaman", imageUrl: "" }
                ]
            },
            {
                order: 54,
                vocabulary: [
                    { english: "bread", uzbek: "non", imageUrl: "" },
                    { english: "milk", uzbek: "sut", imageUrl: "" },
                    { english: "cheese", uzbek: "pishloq", imageUrl: "" },
                    { english: "honey", uzbek: "asal", imageUrl: "" },
                    { english: "butter", uzbek: "sariyog'", imageUrl: "" }
                ]
            },
            {
                order: 55,
                vocabulary: [
                    { english: "key", uzbek: "kalit", imageUrl: "" },
                    { english: "kid", uzbek: "bola", imageUrl: "" },
                    { english: "king", uzbek: "qirol", imageUrl: "" }
                ]
            },
            {
                order: 56,
                vocabulary: [
                    { english: "swim", uzbek: "suzmoq", imageUrl: "" },
                    { english: "dance", uzbek: "raqsga tushmoq", imageUrl: "" },
                    { english: "run", uzbek: "yugurmoq", imageUrl: "" },
                    { english: "bread", uzbek: "non", imageUrl: "" },
                    { english: "milk", uzbek: "sut", imageUrl: "" },
                    { english: "cheese", uzbek: "pishloq", imageUrl: "" },
                    { english: "key", uzbek: "kalit", imageUrl: "" },
                    { english: "kid", uzbek: "bola", imageUrl: "" },
                    { english: "king", uzbek: "qirol", imageUrl: "" }
                ]
            },
            {
                order: 57,
                vocabulary: [
                    { english: "toy", uzbek: "o'yinchoq", imageUrl: "" },
                    { english: "car", uzbek: "mashina", imageUrl: "" },
                    { english: "elephant", uzbek: "fil", imageUrl: "" },
                    { english: "dog", uzbek: "it", imageUrl: "" }
                ]
            },
            {
                order: 59,
                vocabulary: [
                    { english: "red", uzbek: "qizil", imageUrl: "" },
                    { english: "green", uzbek: "yashil", imageUrl: "" },
                    { english: "yellow", uzbek: "sariq", imageUrl: "" },
                    { english: "apple", uzbek: "olma", imageUrl: "" },
                    { english: "banana", uzbek: "banan", imageUrl: "" }
                ]
            },
            {
                order: 60,
                vocabulary: [
                    { english: "lemon", uzbek: "limon", imageUrl: "" },
                    { english: "laugh", uzbek: "kulgu", imageUrl: "" },
                    { english: "letter", uzbek: "xat", imageUrl: "" }
                ]
            }
        ];

        for (const update of updates) {
            const result = await lessonsCollection.updateOne(
                { order: update.order },
                { 
                    $set: { 
                        vocabulary: update.vocabulary,
                        updatedAt: new Date()
                    } 
                }
            );

            if (result.modifiedCount > 0) {
                console.log(`✅ Dars ${update.order} yangilandi - ${update.vocabulary.length} ta so'z`);
            } else {
                console.log(`⚠️  Dars ${update.order} topilmadi yoki o'zgarmadi`);
            }
        }

        console.log('\n🎉 Barcha darslar yangilandi!');
        console.log('\n💡 Endi admin panelni yangilang (F5) va tekshiring');

        await client.close();

    } catch (error) {
        console.error('❌ Xatolik:', error);
    }
}

updateVocabulary();
