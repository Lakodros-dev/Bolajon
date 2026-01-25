import { MongoClient } from 'mongodb';
import { readFileSync, writeFileSync } from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

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

async function extractPdfContent() {
    try {
        console.log('📖 PDF faylni o\'qiyapman...\n');
        
        // Read PDF file
        const dataBuffer = readFileSync('public/book/bolajon-darslik.pdf');
        const data = await pdfParse(dataBuffer);
        
        console.log(`📄 Sahifalar soni: ${data.numpages}`);
        console.log(`📝 Matn uzunligi: ${data.text.length} belgi\n`);
        
        // Extract text content
        const text = data.text;
        
        // Save full text to file for analysis
        writeFileSync('pdf-content.txt', text, 'utf-8');
        console.log('✅ PDF matn pdf-content.txt ga saqlandi\n');
        
        // Analyze content structure
        console.log('🔍 PDF tarkibini tahlil qilyapman...\n');
        
        // Look for lesson patterns
        const lines = text.split('\n').filter(line => line.trim().length > 0);
        
        // Find lessons (looking for numbered patterns or specific keywords)
        const lessonPatterns = [
            /Lesson\s+\d+/gi,
            /Dars\s+\d+/gi,
            /\d+\.\s+[A-Z]/g,
            /Unit\s+\d+/gi
        ];
        
        const foundLessons = [];
        lines.forEach((line, index) => {
            lessonPatterns.forEach(pattern => {
                if (pattern.test(line)) {
                    foundLessons.push({
                        line: index + 1,
                        content: line.trim(),
                        context: lines.slice(Math.max(0, index - 1), Math.min(lines.length, index + 3))
                    });
                }
            });
        });
        
        console.log(`📋 Topilgan dars patternlari: ${foundLessons.length}\n`);
        
        if (foundLessons.length > 0) {
            console.log('Birinchi 10 ta pattern:\n');
            foundLessons.slice(0, 10).forEach(lesson => {
                console.log(`Qator ${lesson.line}: ${lesson.content}`);
            });
        }
        
        // Look for vocabulary words (English - Uzbek pairs)
        const vocabPattern = /([A-Za-z]+)\s*[-–—]\s*([А-Яа-яЎўҚқҒғҲҳ\s]+)/g;
        const vocabularyPairs = [];
        let match;
        
        while ((match = vocabPattern.exec(text)) !== null) {
            vocabularyPairs.push({
                english: match[1].trim(),
                uzbek: match[2].trim()
            });
        }
        
        console.log(`\n📚 Topilgan lug'at juftliklari: ${vocabularyPairs.length}\n`);
        
        if (vocabularyPairs.length > 0) {
            console.log('Birinchi 20 ta so\'z:\n');
            vocabularyPairs.slice(0, 20).forEach((pair, i) => {
                console.log(`${i + 1}. ${pair.english} - ${pair.uzbek}`);
            });
        }
        
        // Now compare with database
        const client = new MongoClient(uri);
        await client.connect();
        console.log('\n✅ MongoDB ga ulandi\n');
        
        const db = client.db();
        const lessonsCollection = db.collection('lessons');
        
        const dbLessons = await lessonsCollection.find({})
            .sort({ order: 1 })
            .toArray();
        
        console.log(`📊 MongoDB da: ${dbLessons.length} ta dars\n`);
        
        // Compare
        console.log('🔄 Solishtirish:\n');
        console.log(`PDF da topilgan pattern: ${foundLessons.length}`);
        console.log(`PDF da lug'at so'zlari: ${vocabularyPairs.length}`);
        console.log(`MongoDB da darslar: ${dbLessons.length}`);
        
        // Analyze DB lessons structure
        console.log('\n📋 MongoDB darslar tuzilishi:\n');
        
        const sampleLesson = dbLessons[0];
        console.log('Namuna dars strukturasi:');
        console.log(JSON.stringify(sampleLesson, null, 2));
        
        await client.close();
        
        console.log('\n💡 Keyingi qadamlar:\n');
        console.log('1. pdf-content.txt faylini tekshiring');
        console.log('2. PDF strukturasini aniqlang');
        console.log('3. Qo\'shilmagan darslarni topamiz');
        
    } catch (error) {
        console.error('❌ Xatolik:', error);
    }
}

extractPdfContent();
