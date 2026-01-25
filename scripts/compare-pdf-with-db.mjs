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

async function comparePdfWithDb() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('✅ MongoDB ga ulandi\n');

        const db = client.db();
        const lessonsCollection = db.collection('lessons');

        // Get all lessons from DB
        const dbLessons = await lessonsCollection.find({})
            .sort({ order: 1 })
            .toArray();

        console.log(`📊 MongoDB da: ${dbLessons.length} ta dars\n`);

        // PDF dagi darslar ro'yxati (manual analysis based on typical English learning book structure)
        // Agar PDF ni to'liq o'qish kerak bo'lsa, pdf-parse kutubxonasi kerak
        
        console.log('📋 Mavjud darslar tahlili:\n');
        
        // Alphabet darslar (A-Z)
        const alphabetLessons = dbLessons.filter(l => 
            l.title.match(/^[A-Z]\s*-\s*alphabet/i)
        );
        console.log(`Alphabet darslar: ${alphabetLessons.length}/26`);
        console.log(`Mavjud harflar: ${alphabetLessons.map(l => l.title.charAt(0)).join(', ')}`);
        
        // Qolgan harflar
        const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        const existingLetters = alphabetLessons.map(l => l.title.charAt(0).toUpperCase());
        const missingLetters = allLetters.filter(l => !existingLetters.includes(l));
        
        console.log(`\n❌ Qo'shilmagan harflar: ${missingLetters.join(', ')}`);
        console.log(`   Jami: ${missingLetters.length} ta harf\n`);

        // Takrorlash darslar
        const reviewLessons = dbLessons.filter(l => 
            l.title.toLowerCase().includes('takrorlash')
        );
        console.log(`Takrorlash darslar: ${reviewLessons.length} ta`);

        // O'yin turlari statistikasi
        console.log('\n📊 O\'yin turlari:\n');
        const gameTypes = {};
        dbLessons.forEach(l => {
            gameTypes[l.gameType] = (gameTypes[l.gameType] || 0) + 1;
        });
        Object.entries(gameTypes).forEach(([type, count]) => {
            console.log(`${type}: ${count} ta`);
        });

        // Tavsiyalar
        console.log('\n💡 Tavsiyalar:\n');
        console.log(`1. ${missingLetters.length} ta alphabet darsi qo'shish kerak (${missingLetters.slice(0, 5).join(', ')}...)`);
        console.log(`2. Har 5-6 darsdan keyin takrorlash darsi qo'shish yaxshi`);
        console.log(`3. O'yin turlarini diversifikatsiya qilish (vocabulary juda ko'p)`);
        console.log(`4. Har bir mavzu uchun turli o'yin turlari ishlatish`);

        // Keyingi darslar uchun tartib raqami
        const maxOrder = Math.max(...dbLessons.map(l => l.order || 0));
        console.log(`\n📝 Keyingi dars tartib raqami: ${maxOrder + 1}`);

    } catch (error) {
        console.error('❌ Xatolik:', error);
    } finally {
        await client.close();
        console.log('\n✅ MongoDB ulanish yopildi');
    }
}

comparePdfWithDb();
