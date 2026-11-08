from pathlib import Path
from pypdf import PdfReader
pdf=next(Path('C:/Users/trungtq/Downloads').glob('*CAV 22.10.2026.pdf'))
r=PdfReader(pdf)
out=Path('BE/assets/quoting/products');out.mkdir(parents=True,exist_ok=True)
for code,image in zip([f'CB-{i:02}' for i in range(1,7)], list(r.pages[0].images)[1:]): image.image.save(out/(code+'.png'))
for code,image in zip([f'XQ-{i:02}' for i in range(1,6)],r.pages[1].images): image.image.save(out/(code+'.png'))
print('Extracted', len(list(out.glob('*.png'))),'source product images')
