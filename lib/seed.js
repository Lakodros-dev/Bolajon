/**
 * Database Seed Script
 * Run with: node lib/seed.js
 * Creates sample data for development
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Lakodros:Lakodros01@thebase.bx3mew2.mongodb.net/bolajon-uz?retryWrites=true&w=majority&appName=TheBase';

// Define schemas inline for seed script
const UserSchema = new mongoose.Schema({
    name: String,
    phone: String,
    password: String,
    role: { type: String, enum: ['admin', 'teacher'], default: 'teacher' },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const StudentSchema = new mongoose.Schema({
    name: String,
    age: Number,
    teacherId: mongoose.Schema.Types.ObjectId,
    stars: { type: Number, default: 0 },
    parentName: String,
    parentPhone: String,
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const LessonSchema = new mongoose.Schema({
    title: String,
    description: String,
    videoUrl: String,
    thumbnail: String,
    level: Number,
    duration: Number,
    order: Number,
    category: String,
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const RewardSchema = new mongoose.Schema({
    title: String,
    description: String,
    cost: Number,
    image: String,
    category: String,
    stock: { type: Number, default: -1 },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const ProgressSchema = new mongoose.Schema({
    studentId: mongoose.Schema.Types.ObjectId,
    lessonId: mongoose.Schema.Types.ObjectId,
    teacherId: mongoose.Schema.Types.ObjectId,
    stars: Number,
    completedAt: Date,
    notes: String
}, { timestamps: true });

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const User = mongoose.models.User || mongoose.model('User', UserSchema);
        const Student = mongoose.models.Student || mongoose.model('Student', StudentSchema);
        const Lesson = mongoose.models.Lesson || mongoose.model('Lesson', LessonSchema);
        const Reward = mongoose.models.Reward || mongoose.model('Reward', RewardSchema);
        const Progress = mongoose.models.Progress || mongoose.model('Progress', ProgressSchema);

        // Clear existing data
        await User.deleteMany({});
        await Student.deleteMany({});
        await Lesson.deleteMany({});
        await Reward.deleteMany({});
        await Progress.deleteMany({});
        console.log('Cleared existing data');

        // Create admin user - phone: +998000000000, password: Lakodros01
        const adminPassword = await bcrypt.hash('Lakodros01', 10);
        const admin = await User.create({
            name: 'Admin',
            phone: '+998000000000',
            password: adminPassword,
            role: 'admin'
        });
        console.log('Created admin user: +998000000000 / Lakodros01');

        // Create sample teachers
        const teacherPassword = await bcrypt.hash('teacher123', 10);
        const teacher1 = await User.create({
            name: 'Aziza Karimova',
            phone: '+998901234567',
            password: teacherPassword,
            role: 'teacher'
        });

        const teacher2 = await User.create({
            name: 'Bobur Aliyev',
            phone: '+998901234568',
            password: teacherPassword,
            role: 'teacher'
        });
        console.log('Created teacher users');

        // Create students for teacher1
        const students = await Student.insertMany([
            { name: 'Azizbek', age: 7, teacherId: teacher1._id, stars: 85, parentName: 'Karim Azizov', parentPhone: '+998901111111' },
            { name: 'Madina', age: 6, teacherId: teacher1._id, stars: 124, parentName: 'Dilnoza Madiyeva', parentPhone: '+998902222222' },
            { name: 'Jasur', age: 8, teacherId: teacher1._id, stars: 32, parentName: 'Rustam Jasurov', parentPhone: '+998903333333' },
            { name: 'Laylo', age: 5, teacherId: teacher1._id, stars: 54, parentName: 'Gulnora Layloyeva', parentPhone: '+998904444444' },
            { name: 'Sardor', age: 7, teacherId: teacher1._id, stars: 67, parentName: 'Anvar Sardorov', parentPhone: '+998905555555' },
        ]);
        console.log('Created students for teacher1');

        // Create students for teacher2
        await Student.insertMany([
            { name: 'Nilufar', age: 6, teacherId: teacher2._id, stars: 45, parentName: 'Shirin Nilufar', parentPhone: '+998906666666' },
            { name: 'Temur', age: 8, teacherId: teacher2._id, stars: 78, parentName: 'Akbar Temurov', parentPhone: '+998907777777' },
        ]);
        console.log('Created students for teacher2');


        // Create lessons - real YouTube videos for kids English learning
        const lessons = await Lesson.insertMany([
            // Level 1 - Boshlang'ich
            {
                title: 'Salomlashish - Hello!',
                description: "Ingliz tilida salomlashishni o'rganamiz: Hello, Hi, Good morning, Good afternoon, Good evening",
                videoUrl: 'https://www.youtube.com/watch?v=tVlcKp3bWH8',
                thumbnail: 'https://img.youtube.com/vi/tVlcKp3bWH8/maxresdefault.jpg',
                level: 1,
                duration: 5,
                order: 1,
                category: 'greetings'
            },
            {
                title: 'Raqamlar 1-10',
                description: "1 dan 10 gacha raqamlarni ingliz tilida o'rganamiz",
                videoUrl: 'https://www.youtube.com/watch?v=DR-cfDsHCGA',
                thumbnail: 'https://img.youtube.com/vi/DR-cfDsHCGA/maxresdefault.jpg',
                level: 1,
                duration: 8,
                order: 2,
                category: 'numbers'
            },
            {
                title: 'Ranglar - Colors',
                description: "Asosiy ranglarni ingliz tilida o'rganamiz: Red, Blue, Green, Yellow",
                videoUrl: 'https://www.youtube.com/watch?v=ybt2jhCQ3lA',
                thumbnail: 'https://img.youtube.com/vi/ybt2jhCQ3lA/maxresdefault.jpg',
                level: 1,
                duration: 6,
                order: 3,
                category: 'colors'
            },
            {
                title: 'Alifbo qo\'shig\'i - ABC Song',
                description: "Ingliz alifbosini qo'shiq orqali o'rganamiz",
                videoUrl: 'https://www.youtube.com/watch?v=75p-N9YKqNo',
                thumbnail: 'https://img.youtube.com/vi/75p-N9YKqNo/maxresdefault.jpg',
                level: 1,
                duration: 4,
                order: 4,
                category: 'alphabet'
            },
            // Level 2 - O'rta
            {
                title: 'Hayvonlar - Animals',
                description: "Uy va yovvoyi hayvonlarni ingliz tilida o'rganamiz",
                videoUrl: 'https://www.youtube.com/watch?v=zXEq-QO3xTg',
                thumbnail: 'https://img.youtube.com/vi/zXEq-QO3xTg/maxresdefault.jpg',
                level: 2,
                duration: 10,
                order: 1,
                category: 'animals'
            },
            {
                title: 'Oila a\'zolari - Family',
                description: "Oila a'zolarini ingliz tilida o'rganamiz: Mother, Father, Sister, Brother",
                videoUrl: 'https://www.youtube.com/watch?v=FHaObkHEkHQ',
                thumbnail: 'https://img.youtube.com/vi/FHaObkHEkHQ/maxresdefault.jpg',
                level: 2,
                duration: 7,
                order: 2,
                category: 'family'
            },
            {
                title: 'Mevalar - Fruits',
                description: "Mevalarni ingliz tilida o'rganamiz: Apple, Banana, Orange",
                videoUrl: 'https://www.youtube.com/watch?v=mfReSbQ7jzE',
                thumbnail: 'https://img.youtube.com/vi/mfReSbQ7jzE/maxresdefault.jpg',
                level: 2,
                duration: 6,
                order: 3,
                category: 'food'
            },
            // Level 3 - Yuqori
            {
                title: 'Tana a\'zolari - Body Parts',
                description: "Tana a'zolarini ingliz tilida o'rganamiz: Head, Shoulders, Knees, Toes",
                videoUrl: 'https://www.youtube.com/watch?v=ZanHgPprl-0',
                thumbnail: 'https://img.youtube.com/vi/ZanHgPprl-0/maxresdefault.jpg',
                level: 3,
                duration: 5,
                order: 1,
                category: 'body'
            },
            {
                title: 'Kiyimlar - Clothes',
                description: "Kiyimlarni ingliz tilida o'rganamiz: Shirt, Pants, Shoes",
                videoUrl: 'https://www.youtube.com/watch?v=xqZsoMgqjCU',
                thumbnail: 'https://img.youtube.com/vi/xqZsoMgqjCU/maxresdefault.jpg',
                level: 3,
                duration: 8,
                order: 2,
                category: 'clothes'
            },
            {
                title: 'Ob-havo - Weather',
                description: "Ob-havo haqida ingliz tilida gaplashamiz: Sunny, Rainy, Cloudy",
                videoUrl: 'https://www.youtube.com/watch?v=rD6FRDd9Hew',
                thumbnail: 'https://img.youtube.com/vi/rD6FRDd9Hew/maxresdefault.jpg',
                level: 3,
                duration: 7,
                order: 3,
                category: 'weather'
            }
        ]);
        console.log('Created lessons');

        // Create rewards
        await Reward.insertMany([
            {
                title: 'Yulduz stikeri',
                description: 'Oltin yulduz stikeri - daftaringizga yopishtiring!',
                cost: 5,
                category: 'other',
                stock: -1
            },
            {
                title: 'Rangli qalam',
                description: 'Chiroyli rangli qalam to\'plami',
                cost: 15,
                category: 'other',
                stock: 50
            },
            {
                title: 'Inglizcha kitobcha',
                description: 'Bolalar uchun inglizcha hikoyalar kitobi',
                cost: 30,
                category: 'book',
                stock: 20
            },
            {
                title: 'Kichik o\'yinchoq',
                description: 'Sovg\'a qutisidan kichik o\'yinchoq tanlang!',
                cost: 50,
                category: 'toy',
                stock: 30
            },
            {
                title: 'Sertifikat',
                description: 'Chiroyli yutuq sertifikati',
                cost: 100,
                category: 'certificate',
                stock: -1
            },
            {
                title: 'Katta o\'yinchoq',
                description: 'Maxsus katta o\'yinchoq - eng yaxshi o\'quvchilar uchun!',
                cost: 200,
                category: 'toy',
                stock: 10
            }
        ]);
        console.log('Created rewards');

        // Create some progress records for students
        const progressRecords = [];

        // Student 1 (Azizbek) - completed 3 lessons
        progressRecords.push(
            { studentId: students[0]._id, lessonId: lessons[0]._id, teacherId: teacher1._id, stars: 5, completedAt: new Date('2024-12-01'), notes: 'Juda yaxshi!' },
            { studentId: students[0]._id, lessonId: lessons[1]._id, teacherId: teacher1._id, stars: 4, completedAt: new Date('2024-12-05'), notes: '' },
            { studentId: students[0]._id, lessonId: lessons[2]._id, teacherId: teacher1._id, stars: 3, completedAt: new Date('2024-12-10'), notes: '' }
        );

        // Student 2 (Madina) - completed 5 lessons
        progressRecords.push(
            { studentId: students[1]._id, lessonId: lessons[0]._id, teacherId: teacher1._id, stars: 5, completedAt: new Date('2024-12-01'), notes: 'Ajoyib!' },
            { studentId: students[1]._id, lessonId: lessons[1]._id, teacherId: teacher1._id, stars: 5, completedAt: new Date('2024-12-03'), notes: '' },
            { studentId: students[1]._id, lessonId: lessons[2]._id, teacherId: teacher1._id, stars: 5, completedAt: new Date('2024-12-06'), notes: '' },
            { studentId: students[1]._id, lessonId: lessons[3]._id, teacherId: teacher1._id, stars: 4, completedAt: new Date('2024-12-09'), notes: '' },
            { studentId: students[1]._id, lessonId: lessons[4]._id, teacherId: teacher1._id, stars: 5, completedAt: new Date('2024-12-12'), notes: 'Eng yaxshi o\'quvchi!' }
        );

        // Student 3 (Jasur) - completed 1 lesson
        progressRecords.push(
            { studentId: students[2]._id, lessonId: lessons[0]._id, teacherId: teacher1._id, stars: 3, completedAt: new Date('2024-12-08'), notes: '' }
        );

        // Student 4 (Laylo) - completed 2 lessons
        progressRecords.push(
            { studentId: students[3]._id, lessonId: lessons[0]._id, teacherId: teacher1._id, stars: 4, completedAt: new Date('2024-12-02'), notes: '' },
            { studentId: students[3]._id, lessonId: lessons[1]._id, teacherId: teacher1._id, stars: 5, completedAt: new Date('2024-12-07'), notes: '' }
        );

        await Progress.insertMany(progressRecords);
        console.log('Created progress records');

        console.log('\n✅ Seed completed successfully!');
        console.log('\n📋 Login credentials:');
        console.log('   Admin: +998000000000 / Lakodros01');
        console.log('   Teacher: +998901234567 / teacher123');

        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
}

seed();
