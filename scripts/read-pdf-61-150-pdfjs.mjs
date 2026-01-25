import { readFileSync, writeFileSync } from 'fs';

async function readPdf61_150() {
    try {
        console.log('📖 bolajon61-150.pdf ni o\'qiyapman...\n');
        
        // Use pdfjs-dist
        const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
        
        const data = new Uint8Array(readFileSync('public/book/bolajon61-150.pdf'));
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
        writeFileSync('pdf-61-150-content.txt', fullText, 'utf-8');
        console.log('✅ PDF matn pdf-61-150-content.txt ga saqlandi\n');
        
        // Find QADAM entries
        console.log('🔍 Qadamlarni qidiryapman...\n');
        
        const lines = fullText.split('\n');
        const qadamDetails = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            const match = line.match(/(\d+)-QADAM/i);
            
            if (match) {
                const num = parseInt(match[1]);
                
                // Get title from surrounding lines
                let title = '';
                for (let j = i - 2; j <= i + 5; j++) {
                    if (j >= 0 && j < lines.length) {
                        const nearLine = lines[j].trim();
                        if (nearLine && !nearLine.match(/^\d+$/) && !nearLine.match(/QADAM/) && nearLine.length > 3 && nearLine.length < 100) {
                            title = nearLine;
                            break;
                        }
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
        writeFileSync('qadam-61-150-list.json', JSON.stringify(sortedQadams, null, 2), 'utf-8');
        console.log(`💾 Qadamlar ro'yxati saqlandi: qadam-61-150-list.json\n`);
        
        // Show 61-70 details
        console.log('📋 61-70 qadamlar:\n');
        const lessons61_70 = sortedQadams.filter(q => q.order >= 61 && q.order <= 70);
        
        if (lessons61_70.length > 0) {
            lessons61_70.forEach(lesson => {
                console.log(`${lesson.order}. ${lesson.title}`);
            });
        } else {
            console.log('❌ 61-70 qadamlar topilmadi');
        }
        
        console.log(`\n📋 Barcha qadamlar (${sortedQadams.length} ta):`);
        sortedQadams.forEach(q => {
            console.log(`${q.order}. ${q.title}`);
        });
        
    } catch (error) {
        console.error('❌ Xatolik:', error);
        console.error(error.stack);
    }
}

readPdf61_150();
