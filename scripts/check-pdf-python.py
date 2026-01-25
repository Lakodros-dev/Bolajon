import PyPDF2
import re
import sys

try:
    pdf_path = 'public/book/bolajon_full.pdf'
    
    print('📖 PDF ochilmoqda...\n')
    
    with open(pdf_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        num_pages = len(pdf_reader.pages)
        
        print(f'📄 Jami sahifalar: {num_pages}\n')
        
        # Extract text from all pages
        qadam_numbers = set()
        
        print('🔍 Qadamlarni qidiryapman...\n')
        
        for page_num in range(num_pages):
            if page_num % 50 == 0:
                print(f'   {page_num}/{num_pages} sahifa tekshirildi...')
            
            page = pdf_reader.pages[page_num]
            text = page.extract_text()
            
            # Find all QADAM entries
            matches = re.findall(r'(\d+)-QADAM', text, re.IGNORECASE)
            for match in matches:
                qadam_numbers.add(int(match))
        
        qadam_list = sorted(list(qadam_numbers))
        
        print(f'\n🔢 Topilgan qadamlar: {len(qadam_list)} ta')
        print(f'📊 Birinchi qadam: {qadam_list[0]}')
        print(f'📊 Oxirgi qadam: {qadam_list[-1]}\n')
        
        # Check for 61-70
        print('🔍 61-70 qadamlar:')
        for i in range(61, 71):
            if i in qadam_list:
                print(f'✅ {i}-QADAM mavjud')
            else:
                print(f'❌ {i}-QADAM yo\'q')
        
        print(f'\n📋 Barcha qadamlar ({len(qadam_list)} ta):')
        print(', '.join(map(str, qadam_list[:20])) + '...')
        
except Exception as e:
    print(f'❌ Xatolik: {e}')
    sys.exit(1)
