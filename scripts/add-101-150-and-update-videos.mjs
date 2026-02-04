import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

const lessonSchema = new mongoose.Schema({
  lessonNumber: Number,
  title: String,
  description: String,
  videoUrl: String,
  level: Number,
  order: Number,
  duration: Number,
  vocabulary: [{
    word: String,
    translation: String,
    image: String,
  }],
  gameSettings: {
    type: String,
    numberRange: { min: Number, max: Number },
    duration: Number,
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true, collection: 'lessons', strict: false });

const Lesson = mongoose.models.Lesson || mongoose.model('Lesson', lessonSchema);

// 101-150 darslar (qisqartirilgan)
const lessons101_150 = [
  { order: 101, title: "Takrorlash 96-101", level: 7, gameType: "vocabulary", vocabulary: [] },
  { order: 102, title: "Active words - Faol sozlar", level: 8, gameType: "vocabulary" },
  { order: 103, title: "Numbers 71-80 - Raqamlar", level: 8, gameType: "catch-the-number" },
  { order: 104, title: "My family - Mening oilam", level: 8, gameType: "vocabulary" },
  { order: 105, title: "U - Alphabet", level: 8, gameType: "vocabulary" },
