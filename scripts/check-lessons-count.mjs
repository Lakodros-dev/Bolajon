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
  title: String,
  videoUrl: String,
  level: Number
}, { collection: 'lessons' });

const Lesson = mongoose.models.Lesson || mongoose.model('Lesson', lessonSchema);

async function checkLessons() {
  try {
    console.log('🔌 MongoDB ga ulanish...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB ga ulandi\n');

    const totalCount = await Lesson.countDocuments();
    console.log(`📊 Jami darslar: ${totalCount} ta\n`);

    // 51-100 oralig'idagi darslar
    const lessons51to100 = await Lesson.find({
      lessonNumber: { $gte: 51, $lte: 100 }
    }).sort({ lessonNumber: 1 }).select('lessonNumber title videoUrl');

    console.log('📚 51-100 oraligidagi darslar:');
    lessons51to100.forEach(lesson => {
      const hasVideo = lesson.videoUrl ? '✅' : '❌';
      console.log(`   ${hasVideo} ${lesson.lessonNumber}. ${lesson.title} - ${lesson.videoUrl || 'Video yoq'}`);
    });

    console.log(`\n📊 51-100 oraligida: ${lessons51to100.length} ta dars`);

  } catch (error) {
    console.error('❌ Xatolik:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB ulanish yopildi');
  }
}

checkLessons();
