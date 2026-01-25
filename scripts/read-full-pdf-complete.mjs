import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function readFullPDF() {
    try {
        const pdfPath = path.join(__dirname, '..', 'public', 'book', 'bolajon_full.pdf');
        
        console.log('📖 PDF o\'qilmoqda (bu biroz vaqt olishi mumkin)...\n');
        
        const dataBuffer = fs.readFileSync(pdfPath);
        
        console.log(`📦 Fayl hajmi: ${(dataBuffer.length / 1024 / 1024).toFixed(2)} MB\n`);
        
        const data = await pdfParse(dataBuffer);
        
        console.log(`📄 Jami sahifalar: ${data.numpages}`);
        console.log(`📝 Matn uzunligi: ${data.text.length} belgi\n`);
        
        // Save full text
        const textPath = path.join(__dirname, '..', 'bolajon-full-complete.txt');
        fs.writeFileSync(textPath, data.text, 'utf-8');
        console.log(`💾 To'liq matn saqlandi: ${textPath}\n`);
        
        // Find all QADAM entries
        const lines = data.text.split('\n');
        const qadamNumbers = new Set();
        const qadamDetails = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            const match = line.match(/^(\d+)-QADAM/i);
            
            if (match) {
                const num = parseInt(match[1]);
                qadamNumbers.add(num);
                
                // Get title (next line)
                const title = lines[i + 1]?.trim() || '';
                qadamDetails.push({ order: num, title, line: i });
            }
        }
        
        const sortedQadams = Array.from(qadamNumbers).sort((a, b) => a - b);
        
        console.log(`🔢 Topilgan qadamlar: ${sortedQadams.length} ta`);
        console.log(`📊 Birinchi qadam: ${sortedQadams[0]}`);
        console.log(`📊 Oxirgi qadam: ${sortedQadams[sortedQadams.length - 1]}\n`);
        
        // Check for 61-70
        console.log('🔍 61-70 qadamlar:');
        for (let i = 61; i <= 70; i++) {
            const found = qadamDetails.find(q => q.order === i);
            if (found) {
                console.log(`✅ ${i}-QADAM: ${found.title}`);
            } else {
                console.log(`❌ ${i}-QADAM yo'q`);
            }
        }
        
        // Save qadam list
        const qadamListPath = path.join(__dirname, '..', 'qadam-list.json');
        fs.writeFileSync(qadamListPath, JSON.stringify(qadamDetails, null, 2), 'utf-8');
        console.log(`\n💾 Qadamlar ro'yxati saqlandi: ${qadamListPath}`);
        
        console.log(`\n📋 Barcha qadamlar (${sortedQadams.length} ta):`);
        console.log(sortedQadams.join(', '));
        
    } catch (error) {
        console.error('❌ Xatolik:', error);
        console.error(error.stack);
    }
}

readFullPDF();
