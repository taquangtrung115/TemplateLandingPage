from pathlib import Path
from pypdf import PdfReader
import pdfplumber
root=Path('PromtAI/.codex/results/fe-quoting-review-20261108')
pdf=next(Path('C:/Users/trungtq/Downloads').glob('*CAV 22.10.2026.pdf'))
r=PdfReader(pdf)
with pdfplumber.open(pdf) as doc:
 for i,p in enumerate(r.pages):
  print('PAGE',i+1)
  print([(x.name,x.image.size) for x in p.images])
  print([(x['name'],round(x['top'],1),round(x['width'],1),round(x['height'],1)) for x in doc.pages[i].images])
