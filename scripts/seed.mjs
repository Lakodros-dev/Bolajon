/**
 * Database Seed Script
 * Run with: node scripts/seed.mjs
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = 'mongodb+srv://Lakodros:Lakodros01@thebase.bx3mew2.mongodb.net/bolajon-uz?retryWrites=true&w=majority&appName=TheBase';

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Drop the users collection to remove old indexes
        console.log('Dropping users collection...');
        try {
            await mongoose.connection.db.dropCollection('users');
            console.log('✅ Users collection dropped');
        } catch (e) {
            console.log('Users collection does not exist, continuing...');
        }

        // Define schemas
        const UserSchema = new mongoose.Schema({
            name: String,
            phone: { type: String, unique: true, trim: true },
            password: String,
            role: { type: String, enum: ['admin', 'teacher'], default: 'teacher' },
            isActive: { type: Boolean, default: true }
        }, { timestamps: true });

        const LessonSchema = new mongoose.Schema({
            title: String,
            description: String,
            videoUrl: String,
            thumbnail: { type: String, default: '' },
            level: Number,
            duration: { type: Number, default: 0 },
            order: { type: Number, default: 0 },
            isActive: { type: Boolean, default: true }
        }, { timestamps: true });

        const RewardSchema = new mongoose.Schema({
            title: String,
            description: { type: String, default: '' },
            cost: Number,
            image: { type: String, default: '' },
            category: { type: String, default: 'other' },
            stock: { type: Number, default: -1 },
            isActive: { type: Boolean, default: true }
        }, { timestamps: true });

        // Create models
        const User = mongoose.model('User', UserSchema);
        const Lesson = mongoose.models.Lesson || mongoose.model('Lesson', LessonSchema);
        const Reward = mongoose.models.Reward || mongoose.model('Reward', RewardSchema);

        // Clear lessons and rewards
        console.log('Clearing lessons and rewards...');
        await Lesson.deleteMany({});
        await Reward.deleteMany({});

        // Create admin user
        const adminPassword = await bcrypt.hash('Lakodros01', 10);
        await User.create({
            name: 'Admin',
            phone: '+998900000000',
            password: adminPassword,
            role: 'admin'
        });
        console.log('✅ Admin: +998900000000 / Lakodros01');

        // Create sample teacher
        const teacherPassword = await bcrypt.hash('Lakodros01', 10);
        await User.create({
            name: 'Aziza Karimova',
            phone: '+998901234567',
            password: teacherPassword,
            role: 'teacher'
        });
        console.log('✅ Teacher: +998901234567 / Lakodros01');

        // Create sample lessons
        const lessons = [
            { title: 'Salomlashish!', description: "Salomlashish va tanishishni o'rganing. Hello, Hi, Good morning!", videoUrl: 'https://www.youtube.com/watch?v=tVlcKp3bWH8', level: 1, duration: 3, order: 1 },
            { title: '1 dan 10 gacha sanash', description: 'Raqamlarni ingliz tilida sanashni o\'rganing.', videoUrl: 'https://www.youtube.com/watch?v=DR-cfDsHCGA', level: 1, duration: 5, order: 2 },
            { title: 'Alifbo qo\'shig\'i', description: 'A dan Z gacha harflarni qo\'shiq bilan o\'rganing.', videoUrl: 'https://www.youtube.com/watch?v=75p-N9YKqNo', level: 1, duration: 4, order: 3 },
            { title: 'Ranglar', description: 'Asosiy ranglarni ingliz tilida o\'rganing: Red, Blue, Green, Yellow.', videoUrl: 'https://www.youtube.com/watch?v=jYAWf8Y91hA', level: 2, duration: 4, order: 1 },
            { title: 'Hayvonlar', description: 'Uy va yovvoyi hayvonlar nomlarini o\'rganing.', videoUrl: 'https://www.youtube.com/watch?v=zXEq-QO3xTg', level: 2, duration: 6, order: 2 },
            { title: 'Oila a\'zolari', description: 'Mother, Father, Sister, Brother - oila haqida.', videoUrl: 'https://www.youtube.com/watch?v=FHaObkHEkHQ', level: 2, duration: 5, order: 3 },
            { title: 'Mevalar', description: 'Apple, Banana, Orange - mevalar nomlarini o\'rganing.', videoUrl: 'https://www.youtube.com/watch?v=mfReSbQ7jzE', level: 3, duration: 4, order: 1 },
            { title: 'Kunlar va oylar', description: 'Hafta kunlari va yil oylarini o\'rganing.', videoUrl: 'https://www.youtube.com/watch?v=3tx0rvuXIRg', level: 3, duration: 6, order: 2 },
        ];
        await Lesson.insertMany(lessons);
        console.log(`✅ Created ${lessons.length} lessons`);

        // Create sample rewards
        const rewards = [
            { title: 'Yulduz stikeri', description: 'Daftaringiz uchun yulduz stikeri!', cost: 5, category: 'other' },
            { title: 'Rangli qalam', description: 'Chiroyli rangli qalam.', cost: 15, category: 'other' },
            { title: 'Kichik o\'yinchoq', description: 'Sovg\'a qutisidan kichik o\'yinchoq.', cost: 30, category: 'toy' },
            { title: 'Rangli kitob', description: 'Inglizcha alifbo kitobi.', cost: 50, category: 'book' },
            { title: 'Sertifikat', description: 'Yutuq sertifikati.', cost: 100, category: 'certificate' },
            { title: 'Katta sovg\'a', description: 'Maxsus katta sovg\'a!', cost: 200, category: 'toy' },
        ];
        await Reward.insertMany(rewards);
        console.log(`✅ Created ${rewards.length} rewards`);

        console.log('\n🎉 Seed completed successfully!');
        console.log('\nLogin credentials:');
        console.log('  Admin: +998900000000 / Lakodros01');
        console.log('  Teacher: +998901234567 / Lakodros01');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
}

seed();
