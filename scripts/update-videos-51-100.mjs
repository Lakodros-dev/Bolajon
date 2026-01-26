import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI topilmadi .env faylida');
  process.exit(1);
}

// Lesson Schema
const lessonSchema = new mongoose.Schema({
  lessonNumber: Number,
  title: String,
  videoUrl: String,
  level: Number,
  vocabulary: [{
    uzbek: String,
    english: String,
    imageUrl: String
  }]
}, { collection: 'lessons' });

const Lesson = mongoose.models.Lesson || mongoose.model('Lesson', lessonSchema);

// Video mapping (51-100)
const videoMapping = {
  51: '/video/51 Complate.mp4',
  52: '/video/52 Complate.mp4',
  53: '/video/53 Complate.mp4',
  54: '/video/54 Complate.mp4',
  57: '/video/57_Complate.mp4',
  58: '/video/58 Complate.mp4',
  59: '/video/59 Complate.mp4',
  60: '/video/60 Complate.mp4',
  61: '/video/61 Complate.mp4',
  62: '/video/62 Complate.mp4',
  63: '/video/63 Complate.mp4',
  64: '/video/64 Complate.mp4',
  65: '/video/65 Complate.mp4',
  66: '/video/66 Complate.mp4',
  67: '/video/67 Complate.mp4',
  68: '/video/68 Complate.mp4',
  69: '/video/69 Complate.mp4',
  70: '/video/70 Complate.mp4',
  71: '/video/71 Complate.mp4',
  72: '/video/72 Complate.mp4',
  73: '/video/73 Coomplate.mp4',
  74: '/video/74 Complate.mp4',
  75: '/video/75 Coomplate.mp4',
  76: '/video/76 Coomplate.mp4',
  77: '/video/77 Complate.mp4',
  78: '/video/78 Complate.mp4',
  79: '/video/79 Complate.mp4',
  80: '/video/80 Complate.mp4',
  81: '/video/81 Complate.mp4',
  83: '/video/83 Complate.mp4',
  84: '/video/84 Coomplate.mp4',
  85: '/video/85 Complate.mp4',
  86: '/video/86 Coomplate.mp4',
  87: '/video/87 Complatee.mp4',
  88: '/video/88 Complate.mp4',
  89: '/video/89 Complate.mp4',
  90: '/video/90 Complate.mp4',
  91: '/video/91 Ready.mp4',
  92: '/video/92 Ready.mp4',
  94: '/video/94 Blajon.mp4',
  95: '/video/95 Ready.mp4',
  96: '/video/96.mp4',
  97: '/video/97.mp4',
  100: '/video/100.mp4'
};

async function updateVideos() {
  try {
    console.log('🔌 MongoDB ga ulanish...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB ga ulandi\n');

    let updatedCount = 0;
    let notFoundCount = 0;

    for (const [lessonNum, videoUrl] of Object.entries(videoMapping)) {
      const lesson = await Lesson.findOne({ lessonNumber: parseInt(lessonNum) });
      
      if (lesson) {
        lesson.videoUrl = videoUrl;
        await lesson.save();
        console.log(`✅ ${lessonNum}-dars: ${videoUrl}`);
        updatedCount++;
      } else {
        console.log(`⚠️  ${lessonNum}-dars topilmadi`);
        notFoundCount++;
      }
    }

    console.log(`\n📊 Natija:`);
    console.log(`   Yangilandi: ${updatedCount} ta`);
    console.log(`   Topilmadi: ${notFoundCount} ta`);

  } catch (error) {
    console.error('❌ Xatolik:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB ulanish yopildi');
  }
}

updateVideos();
