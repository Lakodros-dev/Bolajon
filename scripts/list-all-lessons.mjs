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

async function listLessons() {
  try {
    console.log('🔌 MongoDB ga ulanish...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB ga ulandi\n');

    const lessons = await Lesson.find().sort({ lessonNumber: 1 }).select('lessonNumber title level');

    console.log(`📚 Barcha darslar (${lessons.length} ta):\n`);
    
    let currentLevel = 0;
    lessons.forEach(lesson => {
      if (lesson.level !== currentLevel) {
        currentLevel = lesson.level;
        console.log(`\n--- ${currentLevel}-daraja ---`);
      }
      console.log(`   ${lesson.lessonNumber}. ${lesson.title}`);
    });

  } catch (error) {
    console.error('❌ Xatolik:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB ulanish yopildi');
  }
}

listLessons();
