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
}, { collection: 'lessons', strict: false });

const Lesson = mongoose.models.L
esson || mongoose.model('Lesson', lessonSchema);

// Video mapping (51-150)
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
  100: '/video/100.mp4',
  101: '/video/101.mp4',
  102: '/video/102.mp4',
  103: '/video/103.mp4',
  104: '/video/104Mp4.mp4',
  105: '/video/105.mp4',
  106: '/video/106.1.mp4',
  107: '/video/107.mp4',
  108: '/video/108.mp4',
  109: '/video/109.mp4',
  110: '/video/110.mp4',
  111: '/video/111.mp4',
  112: '/video/112.mp4',
  113: '/video/113.mp4',
  114: '/video/114.mp4',
  115: '/video/115.mp4',
  116: '/video/116.mp4',
  117: '/video/117.mp4',
  118: '/video/118.mp4',
  119: '/video/119.mp4',
  120: '/video/120.mp4',
  121: '/video/121.mp4',
  122: '/video/122.mp4',
  123: '/video/123.mp4',
  125: '/video/125.mp4',
  126: '/video/126.mp4',
  127: '/video/127.mp4',
  128: '/video/128.mp4',
  129: '/video/129.mp4',
  130: '/video/130.mp4',
  131: '/video/131.mp4',
  132: '/video/132.mp4',
  133: '/video/133.mp4',
  134: '/video/134.mp4',
  135: '/video/135.mp4',
  136: '/video/136.mp4',
  137: '/video/137.mp4',
  138: '/video/138.mp4',
  139: '/video/139.mp4',
  140: '/video/140.mp4',
  141: '/video/141.mp4',
  142: '/video/142.mp4',
  143: '/video/143.mp4',
  144: '/video/144.mp4',
  145: '/video/145.mp4',
  146: '/video/146.mp4',
  147: '/video/147.mp4',
  148: '/video/148.mp4',
  149: '/video/149.mp4',
  150: '/video/150.mp4'
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
