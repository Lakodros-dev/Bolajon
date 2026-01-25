import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '..', '.env');
const envContent = readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
    }
});

const MONGODB_URI = envVars.MONGODB_URI;

const lessonSchema = new mongoose.Schema({
    title: String,
    description: String,
    order: Number,
    vocabulary: [{
        word: String,
        translation: String,
        image: String,
    }],
}, { timestamps: true });

const Lesson = mongoose.models.Lesson || mongoose.model('Lesson', lessonSchema);

// PDF ga muvofiq to'g'ri lug'atlar
const correctVocabulary = {
    51: [], // Takrorlash - faqat rasmlar, so'zlar yo'q
    52: [
        { word: "swim", translation: "suzmoq", image: "" },
        { word: "dance", translation: "raqsga tushmoq", image: "" },
        { word: "run", translation: "yugurmoq", image: "" },
        { word: "jump", translation: "sakramoq", image: "" },
        { word: "fly", translation: "uchmoq", image: "" }
    ],
    53: [
        { word: "I can swim", translation: "men suza olaman", image: "" },
        { word: "I can run", translation: "men yugura olaman", image: "" },
        { word: "I can dance", translation: "men raqsga tusha olaman", image: "" },
        { word: "I can jump", translation: "men sakray olaman", image: "" }
    ],
    54: [
        { word: "bread", translation: "non", image: "" },
        { word: "milk", translation: "sut", image: "" },
        { word: "cheese", translation: "pishloq", image: "" },
        { word: "honey", translation: "asal", image: "" },
        { word: "butter", translation: "sariyog'", image: "" }
    ],
    55: [
        { word: "key", translation: "kalit", image: "" },
        { word: "kid", translation: "bola", image: "" },
        { word: "king", translation: "qirol", image: "" }
    ],
    56: [], // Takrorlash - faqat rasmlar, so'zlar yo'q
    57: [
        { word: "it's a toy", translation: "bu o'yinchoq", image: "" },
        { word: "it's a car", translation: "bu mashina", image: "" },
        { word: "it's an elephant", translation: "bu fil", image: "" },
        { word: "it's a dog", translation: "bu it", image: "" }
    ],
    58: [], // Numbers - catch-the-number o'yini, lug'at yo'q
    59: [
        { word: "what is red?", translation: "qaysi biri qizil?", image: "" },
        { word: "what is yellow?", translation: "qaysi biri sariq?", image: "" },
        { word: "what is green?", translation: "qaysi biri yashil?", image: "" },
        { word: "apple or banana", translation: "olma yoki banan", image: "" },
        { word: "banana or apple", translation: "banan yoki olma", image: "" },
        { word: "kiwi or banana", translation: "kivi yoki banan", image: "" }
    ],
    60: [
        { word: "lemon", translation: "limon", image: "" },
        { word: "laugh", translation: "kulgu", image: "" },
        { word: "letter", translation: "xat", image: "" }
    ]
};

async function fixAllVocabulary() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB ga ulandi\n');

        console.log('📝 51-60 darslar lug\'atlarini to\'g\'rilayman...\n');

        for (let order = 51; order <= 60; order++) {
            const lesson = await Lesson.findOne({ order });

            if (!lesson) {
                console.log(`⚠️  Dars ${order} topilmadi`);
                continue;
            }

            const oldCount = lesson.vocabulary?.length || 0;
            const newVocab = correctVocabulary[order] || [];

            // Keep existing images if they exist
            const updatedVocab = newVocab.map(newItem => {
                const existing = lesson.vocabulary?.find(v => v.word === newItem.word);
                return {
                    word: newItem.word,
                    translation: newItem.translation,
                    image: existing?.image || newItem.image
                };
            });

            lesson.vocabulary = updatedVocab;
            await lesson.save();

            console.log(`✅ Dars ${order}: ${lesson.title}`);
            console.log(`   Avval: ${oldCount} ta → Keyin: ${updatedVocab.length} ta`);
            
            if (updatedVocab.length > 0) {
                updatedVocab.forEach((item, index) => {
                    const imageStatus = item.image ? '🖼️' : '❌';
                    console.log(`   ${index + 1}. ${item.word} - ${item.translation} ${imageStatus}`);
                });
            } else {
                console.log(`   💡 Lug'at yo'q (${order === 51 || order === 56 ? 'Takrorlash - faqat rasmlar' : order === 58 ? 'Raqamlar o\'yini' : 'Noma\'lum'})`);
            }
            console.log('');
        }

        console.log('✅ Barcha darslar to\'g\'rilandi!\n');
        console.log('💡 Keyingi qadamlar:');
        console.log('1. Admin paneldan har bir so\'zga rasm/GIF qo\'shing');
        console.log('2. Takrorlash darslariga (51, 56) faqat rasmlar qo\'shing (so\'zsiz)');
        console.log('3. Darslarni test qiling\n');

        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Xatolik:', error);
        process.exit(1);
    }
}

fixAllVocabulary();
