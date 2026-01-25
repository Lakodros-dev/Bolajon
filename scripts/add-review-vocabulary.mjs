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
    order: Number,
    vocabulary: [{
        word: String,
        translation: String,
        image: String,
    }],
}, { timestamps: true });

const Lesson = mongoose.models.Lesson || mongoose.model('Lesson', lessonSchema);

// Takrorlash darslari uchun lug'atlar
const reviewVocabulary = {
    61: [ // Takrorlash 56-61 (57-60 darslardan)
        { word: "it's a toy", translation: "bu o'yinchoq", image: "" },
        { word: "it's a car", translation: "bu mashina", image: "" },
        { word: "what is red?", translation: "qaysi biri qizil?", image: "" },
        { word: "what is yellow?", translation: "qaysi biri sariq?", image: "" },
        { word: "lemon", translation: "limon", image: "" },
        { word: "laugh", translation: "kulgu", image: "" }
    ],
    66: [ // Takrorlash 62-66
        { word: "onion", translation: "piyoz", image: "" },
        { word: "carrot", translation: "sabzi", image: "" },
        { word: "big", translation: "katta", image: "" },
        { word: "small", translation: "kichkina", image: "" },
        { word: "hot", translation: "issiq", image: "" },
        { word: "cold", translation: "sovuq", image: "" },
        { word: "map", translation: "xarita", image: "" },
        { word: "melon", translation: "qovun", image: "" }
    ],
    71: [ // Takrorlash 66-71
        { word: "happy", translation: "xursand", image: "" },
        { word: "sad", translation: "xafa", image: "" },
        { word: "bigger", translation: "kattaroq", image: "" },
        { word: "smaller", translation: "kichkinaroq", image: "" },
        { word: "which is bigger?", translation: "qaysi biri kattaroq?", image: "" },
        { word: "nest", translation: "uya", image: "" },
        { word: "nose", translation: "burun", image: "" }
    ],
    76: [ // Takrorlash 72-76
        { word: "bread", translation: "non", image: "" },
        { word: "rice", translation: "guruch", image: "" },
        { word: "egg", translation: "tuxum", image: "" },
        { word: "I drink water", translation: "men suv ichaman", image: "" },
        { word: "I sleep", translation: "men uxlayman", image: "" },
        { word: "open", translation: "ochiq", image: "" },
        { word: "orange", translation: "apelsin", image: "" }
    ],
    81: [ // Takrorlash 77-81
        { word: "rain", translation: "yomg'ir", image: "" },
        { word: "snow", translation: "qor", image: "" },
        { word: "house", translation: "uy", image: "" },
        { word: "school", translation: "maktab", image: "" },
        { word: "It is sunny", translation: "quyoshli", image: "" },
        { word: "It is rainy", translation: "yomg'irli", image: "" },
        { word: "panda", translation: "panda", image: "" },
        { word: "pink", translation: "pushti", image: "" }
    ],
    86: [ // Takrorlash 82-86
        { word: "teacher", translation: "o'qituvchi", image: "" },
        { word: "doctor", translation: "shifokor", image: "" },
        { word: "car", translation: "mashina", image: "" },
        { word: "bus", translation: "avtobus", image: "" },
        { word: "train", translation: "poyezd", image: "" },
        { word: "queue", translation: "navbat", image: "" },
        { word: "question", translation: "savol", image: "" }
    ],
    91: [ // Takrorlash 87-91
        { word: "monday", translation: "dushanba", image: "" },
        { word: "tuesday", translation: "seshanba", image: "" },
        { word: "friday", translation: "juma", image: "" },
        { word: "I am good", translation: "men yaxshiman", image: "" },
        { word: "rabbit", translation: "quyon", image: "" },
        { word: "run", translation: "yugurmoq", image: "" }
    ],
    96: [ // Takrorlash 92-96
        { word: "My mother is a doctor", translation: "mening oyim shifokor", image: "" },
        { word: "My father is a farmer", translation: "mening dadam fermer", image: "" },
        { word: "pot", translation: "qozon", image: "" },
        { word: "glass", translation: "shisha", image: "" },
        { word: "sun", translation: "quyosh", image: "" },
        { word: "sorry", translation: "uzur", image: "" }
    ]
};

async function addReviewVocabulary() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB ga ulandi\n');

        console.log('📝 Takrorlash darslariga lug\'atlar qo\'shyapman...\n');

        for (const [order, vocab] of Object.entries(reviewVocabulary)) {
            const lesson = await Lesson.findOne({ order: parseInt(order) });
            
            if (!lesson) {
                console.log(`⚠️  Dars ${order} topilmadi`);
                continue;
            }

            lesson.vocabulary = vocab;
            await lesson.save();

            console.log(`✅ Dars ${order}: ${lesson.title}`);
            console.log(`   Lug'at: ${vocab.length} ta so'z qo'shildi\n`);
        }

        console.log('🎉 Takrorlash darslariga lug\'atlar qo\'shildi!\n');
        console.log('💡 Keyingi qadam:');
        console.log('Admin paneldan har bir so\'zga rasm/GIF qo\'shing.\n');

        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Xatolik:', error);
        process.exit(1);
    }
}

addReviewVocabulary();
