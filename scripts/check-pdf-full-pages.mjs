import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function checkPDF() {
    try {
        const pdfPath = path.join(__dirname, '..', 'public', 'book', 'bolajon_full.pdf');
        
        console.log('📖 PDF tekshirilmoqda...\n');
        
        const dataBuffer = fs.readFileSync(pdfPath);
        const data = await pdfParse(dataBuffer);
        
        console.log(`📄 Jami sahifalar: ${data.numpages}`);
        console.log(`📝 Matn uzunligi: ${data.text.length} belgi\n`);
        
        // Find all QADAM entries
        const text = data.text;
        const lines = text.split('\n');
        
        const qadamNumbers = [];
        
        for (const line of lines) {
            const match = line.match(/(\d+)-QADAM/i);
            if (match) {
                const num = parseInt(match[1]);
                if (!qadamNumbers.includes(num)) {
                    qadamNumbers.push(num);
                }
            }
        }
        
        qadamNumbers.sort((a, b) => a - b);
        
        console.log(`🔢 Topilgan qadamlar: ${qadamNumbers.length} ta\n`);
        console.log(`📊 Birinchi qadam: ${qadamNumbers[0]}`);
        console.log(`📊 Oxirgi qadam: ${qadamNumbers[qadamNumbers.length - 1]}\n`);
        
        console.log('📋 Barcha qadamlar:');
        console.log(qadamNumbers.join(', '));
        
        // Check for 61-70
        console.log('\n\n🔍 61-70 qadamlar:');
        for (let i = 61; i <= 70; i++) {
            if (qadamNumbers.includes(i)) {
                console.log(`✅ ${i}-QADAM mavjud`);
            } else {
                console.log(`❌ ${i}-QADAM yo'q`);
            }
        }
        
        // Save full text
        const outputPath = path.join(__dirname, '..', 'bolajon-full-complete.txt');
        fs.writeFileSync(outputPath, data.text, 'utf-8');
        console.log(`\n💾 To'liq matn saqlandi: ${outputPath}`);
        
    } catch (error) {
        console.error('❌ Xatolik:', error);
    }
}

checkPDF();
