import { readFileSync, writeFileSync } from 'fs';
import { MongoClient } from 'mongodb';

// Read .env
const envContent = readFileSync('.env', 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
    }
});

const uri = envVars.MONGODB_URI || process.env.MONGODB_URI;

async function readPdfFull() {
    try {
        console.log('📖 PDF faylni o\'qiyapman...\n');
        
        // Use pdfjs-dist
        const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
        
        const data = new Uint8Array(readFileSync('public/book/bolajon-darslik.pdf'));
        const loadingTask = pdfjsLib.getDocument({ data });
        const pdfDocument = await loadingTask.promise;
        
        console.log(`📄 Sahifalar soni: ${pdfDocument.numPages}\n`);
        
        let fullText = '';
        
        // Extract text from all pages
        for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
            const page = await pdfDocument.getPage(pageNum);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += `\n--- Sahifa ${pageNum} ---\n${pageText}\n`;
            
            if (pageNum % 10 === 0) {
                console.log(`✅ ${pageNum}/${pdfDocument.numPages} sahifa o'qildi`);
            }
        }
        
        console.log(`\n📝 Jami matn uzunligi: ${fullText.length} belgi\n`);
        
        // Save to file
        writeFileSync('pdf-full-content.txt', fullText, 'utf-8');
        console.log('✅ PDF matn pdf-full-content.txt ga saqlandi\n');
        
        // Analyze content
        console.log('🔍 Tarkibni tahlil qilyapman...\n');
        
        const lines = fullText.split('\n').filter(l => l.trim().length > 0);
        
        // Find lesson titles and vocabulary
        const lessons = [];
        const vocabularyWords = [];
        
        // Pattern 1: Lesson numbers (1-100)
        for (let i = 1; i <= 100; i++) {
            const lessonPattern = new RegExp(`\\b${i}\\s*[.:]\\s*([A-Za-z\\s-]+)`, 'gi');
            lines.forEach(line => {
                const match = lessonPattern.exec(line);
                if (match && match[1].trim().length > 3) {
                    lessons.push({
                        number: i,
                        title: match[1].trim(),
                        line: line.trim()
                    });
                }
            });
        }
        
        // Pattern 2: English - Uzbek pairs
        const vocabPattern = /([A-Za-z]{2,})\s*[-–—]\s*([а-яА-ЯўғқҳЎҒҚҲ\s]{2,})/g;
        let match;
        while ((match = vocabPattern.exec(fullText)) !== null) {
            vocabularyWords.push({
                english: match[1].trim(),
                uzbek: match[2].trim()
            });
        }
        
        console.log(`📋 Topilgan darslar: ${lessons.length}`);
        console.log(`📚 Topilgan lug'at so'zlari: ${vocabularyWords.length}\n`);
        
        // Show first 30 lessons
        if (lessons.length > 0) {
            console.log('Birinchi 30 ta dars:\n');
            const uniqueLessons = [];
            const seen = new Set();
            
            lessons.forEach(lesson => {
                const key = `${lesson.number}-${lesson.title}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    uniqueLessons.push(lesson);
                }
            });
            
            uniqueLessons.slice(0, 30).forEach(lesson => {
                console.log(`${lesson.number}. ${lesson.title}`);
            });
        }
        
        // Show first 50 vocabulary words
        if (vocabularyWords.length > 0) {
            console.log('\n\nBirinchi 50 ta lug\'at so\'zi:\n');
            vocabularyWords.slice(0, 50).forEach((word, i) => {
                console.log(`${i + 1}. ${word.english} - ${word.uzbek}`);
            });
        }
        
        // Compare with database
        const client = new MongoClient(uri);
        await client.connect();
        
        const db = client.db();
        const dbLessons = await db.collection('lessons').find({}).sort({ order: 1 }).toArray();
        
        console.log(`\n\n📊 Solishtirish:\n`);
        console.log(`PDF da darslar: ${lessons.length}`);
        console.log(`MongoDB da darslar: ${dbLessons.length}`);
        console.log(`PDF da lug'at: ${vocabularyWords.length} ta so'z`);
        
        // Save structured data
        const analysis = {
            pdfPages: pdfDocument.numPages,
            lessonsFound: lessons.length,
            vocabularyFound: vocabularyWords.length,
            lessons: lessons.slice(0, 100),
            vocabulary: vocabularyWords.slice(0, 200),
            dbLessons: dbLessons.length
        };
        
        writeFileSync('pdf-analysis.json', JSON.stringify(analysis, null, 2), 'utf-8');
        console.log('\n✅ Tahlil pdf-analysis.json ga saqlandi');
        
        await client.close();
        
    } catch (error) {
        console.error('❌ Xatolik:', error);
        console.error(error.stack);
    }
}

readPdfFull();
