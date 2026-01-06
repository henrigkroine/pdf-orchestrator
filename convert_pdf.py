
from pdf2image import convert_from_path
pages = convert_from_path('exports/TEEI-AWS-Partnership-TFU-V2-DIGITAL.pdf', dpi=150, first_page=1, last_page=4)
for i, page in enumerate(pages):
    page.save(f'exports/page-{i+1}-analysis.png', 'PNG')
print('✅ Converted 4 pages to PNG')
