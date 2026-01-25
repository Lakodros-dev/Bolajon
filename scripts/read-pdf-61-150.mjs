import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function readPDF61_150() {
    try {
        const pdfPath = path.join(__dirname, '..', 'public', 'book', 'bolajon61-150.pdf');
        
        console.log('📖 bolajon61-150.pdf o\'qilmoqda...\n');
        
        const dataBuffer = fs.readFileSync(pdfPath);
        
        console.log(`📦 Fayl hajmi: ${(dataBuffer.length / 1024 / 1024).toFixed(2)} MB\n`);
        
        const data = await pdfParse(dataBuffer);
        
        console.log(`📄 Jami sahifalar: ${data.numpages}`);
        console.log(`📝 Matn uzunligi: ${data.text.length} belgi\n`);
        
        // Save full text
        const textPath = path.join(__dirname, '..', 'bolajon-61-150-full.txt');
        fs.writeFileSync(textPath, data.text, 'utf-8');
        console.log(`💾 To'liq matn saqlandi: ${textPath}\n`);
        
        // Find all QADAM entries
        const lines = data.text.split('\n');
        const qadamDetails = [];
        
        console.log('🔍 Qadamlarni qidiryapman...\n');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            const match = line.match(/^(\d+)-QADAM/i);
            
            if (match) {
                const num = parseInt(match[1]);
                
                // Get title (next non-empty line)
                let title = '';
                for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
                    const nextLine = lines[j].trim();
                    if (nextLine && !nextLine.match(/^\d+$/) && nextLine.length > 2) {
                        title = nextLine;
                        break;
                    }
                }
                
                qadamDetails.push({ order: num, title, lineIndex: i });
                
                if (num >= 61 && num <= 70) {
                    console.log(`✅ ${num}-QADAM: ${title}`);
                }
            }
        }
        
        const sortedQadams = qadamDetails.sort((a, b) => a.order - b.order);
        
        console.log(`\n🔢 Topilgan qadamlar: ${sortedQadams.length} ta`);
        if (sortedQadams.length > 0) {
            console.log(`📊 Birinchi qadam: ${sortedQadams[0].order}`);
            console.log(`📊 Oxirgi qadam: ${sortedQadams[sortedQadams.length - 1].order}\n`);
        }
        
        // Save qadam list
        const qadamListPath = path.join(__dirname, '..', 'qadam-61-150-list.json');
        fs.writeFileSync(qadamListPath, JSON.stringify(sortedQadams, null, 2), 'utf-8');
        console.log(`💾 Qadamlar ro'yxati saqlandi: ${qadamListPath}\n`);
        
        // Show 61-70 details
        console.log('📋 61-70 qadamlar tafsiloti:\n');
        const lessons61_70 = sortedQadams.filter(q => q.order >= 61 && q.order <= 70);
        lessons61_70.forEach(lesson => {
            console.log(`${lesson.order}. ${lesson.title}`);
        });
        
        if (lessons61_70.length === 0) {
            console.log('❌ 61-70 qadamlar topilmadi');
        }
        
    } catch (error) {
        console.error('❌ Xatolik:', error);
        console.error(error.stack);
    }
}

readPDF61_150();
