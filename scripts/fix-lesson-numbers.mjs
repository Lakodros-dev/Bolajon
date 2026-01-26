import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
const envPath = join(__dirname, '..', '.env');
const envContent = readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const MONGODB_URI = envVars.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI topilmadi .env faylida');
  process.exit(1);
}

// Lesson Schema
const lessonSchema = new mongoose.Schema({
  lessonNumber: Number,
  order: Number,
  title: String,
  videoUrl: String,
  level: Number
}, { collection: 'lessons', strict: false });

const Lesson = mongoose.models.Lesson || mongoose.model('Lesson', lessonSchema);

async function fixLessonNumbers() {
  try {
    console.log('🔌 MongoDB ga ulanish...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB ga ulandi\n');

    // Barcha darslarni olish
    const lessons = await Lesson.find();
    console.log(`📚 Jami darslar: ${lessons.length} ta\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const lesson of lessons) {
      if (lesson.order && !lesson.lessonNumber) {
        // order dan lessonNumber ga ko'chirish
        lesson.lessonNumber = lesson.order;
        await lesson.save();
        console.log(`✅ ${lesson.order}. ${lesson.title} - lessonNumber qo'shildi`);
        updatedCount++;
      } else if (lesson.lessonNumber) {
        console.log(`⏭️  ${lesson.lessonNumber}. ${lesson.title} - allaqachon bor`);
        skippedCount++;
      } else {
        console.log(`⚠️  ${lesson.title} - order ham, lessonNumber ham yo'q`);
      }
    }

    console.log(`\n📊 Natija:`);
    console.log(`   Yangilandi: ${updatedCount} ta`);
    console.log(`   O'tkazildi: ${skippedCount} ta`);

    // Tekshirish
    console.log('\n🔍 Tekshirish...');
    const lessonsWithNumber = await Lesson.find({ lessonNumber: { $exists: true, $ne: null } })
      .sort({ lessonNumber: 1 })
      .select('lessonNumber title');

    console.log(`\n📚 lessonNumber bor darslar (${lessonsWithNumber.length} ta):`);
    lessonsWithNumber.slice(0, 10).forEach(l => {
      console.log(`   ${l.lessonNumber}. ${l.title}`);
    });
    if (lessonsWithNumber.length > 10) {
      console.log(`   ... va yana ${lessonsWithNumber.length - 10} ta`);
    }

  } catch (error) {
    console.error('❌ Xatolik:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB ulanish yopildi');
  }
}

fixLessonNumbers();
