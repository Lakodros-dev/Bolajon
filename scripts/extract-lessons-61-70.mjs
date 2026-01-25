import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pdf-parse';
const pdfParse = pkg.default || pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function extractLessons61_70() {
    try {
        const pdfPath = path.join(__dirname, '..', 'public', 'book', 'bolajon_full.pdf');
        
        if (!fs.existsSync(pdfPath)) {
            console.log('❌ PDF fayl topilmadi:', pdfPath);
            return;
        }

        console.log('📖 PDF o\'qilmoqda...\n');
        
        const dataBuffer = fs.readFileSync(pdfPath);
        const data = await pdfParse(dataBuffer);
        
        console.log(`📄 Sahifalar: ${data.numpages}`);
        console.log(`📝 Matn uzunligi: ${data.text.length} belgi\n`);
        
        // Extract lessons 61-70
        const text = data.text;
        const lines = text.split('\n');
        
        console.log('🔍 61-70 qadamlarni qidiryapman...\n');
        
        let currentLesson = null;
        let lessonContent = [];
        const lessons = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Check for lesson number (61-QADAM, 62-QADAM, etc.)
            const lessonMatch = line.match(/^(\d+)-QADAM/i);
            
            if (lessonMatch) {
                const lessonNum = parseInt(lessonMatch[1]);
                
                // Save previous lesson
                if (currentLesson && currentLesson.order >= 61 && currentLesson.order <= 70) {
                    lessons.push({
                        order: currentLesson.order,
                        title: currentLesson.title,
                        content: lessonContent.join('\n')
                    });
                }
                
                // Start new lesson
                if (lessonNum >= 61 && lessonNum <= 70) {
                    currentLesson = {
                        order: lessonNum,
                        title: lines[i + 1]?.trim() || 'Unknown'
                    };
                    lessonContent = [];
                    console.log(`✅ Topildi: ${lessonNum}-QADAM - ${currentLesson.title}`);
                } else if (lessonNum > 70) {
                    break; // Stop after lesson 70
                } else {
                    currentLesson = null;
                }
            } else if (currentLesson) {
                lessonContent.push(line);
            }
        }
        
        // Save last lesson
        if (currentLesson && currentLesson.order >= 61 && currentLesson.order <= 70) {
            lessons.push({
                order: currentLesson.order,
                title: currentLesson.title,
                content: lessonContent.join('\n')
            });
        }
        
        console.log(`\n📊 Jami topildi: ${lessons.length} ta dars\n`);
        
        // Save to file
        const outputPath = path.join(__dirname, '..', 'lessons-61-70-extracted.json');
        fs.writeFileSync(outputPath, JSON.stringify(lessons, null, 2), 'utf-8');
        
        console.log(`💾 Saqlandi: ${outputPath}\n`);
        
        // Display summary
        lessons.forEach(lesson => {
            console.log(`\n${lesson.order}. ${lesson.title}`);
            console.log(`   Matn: ${lesson.content.substring(0, 200)}...`);
        });
        
    } catch (error) {
        console.error('❌ Xatolik:', error);
    }
}

extractLessons61_70();
