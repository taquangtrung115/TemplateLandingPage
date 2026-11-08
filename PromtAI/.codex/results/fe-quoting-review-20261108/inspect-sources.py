from pathlib import Path
import zipfile, xml.etree.ElementTree as ET, json
from pypdf import PdfReader
out=Path('PromtAI/.codex/results/fe-quoting-review-20261108')
downloads=Path('C:/Users/trungtq/Downloads')
pdf=next(downloads.glob('*CAV 22.10.2026.pdf'))
r=PdfReader(pdf)
(out/'source-pdf.txt').write_text('\n\n'.join(p.extract_text() or '' for p in r.pages),encoding='utf-8')
print('PDF pages:',len(r.pages))
xlsx=next(downloads.glob('BAO GIA TP COMBO*.xlsx'))
ns={'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
with zipfile.ZipFile(xlsx) as z:
 strings=[]
 if 'xl/sharedStrings.xml' in z.namelist():
  strings=[''.join(x.itertext()) for x in ET.fromstring(z.read('xl/sharedStrings.xml')).findall('s:si',ns)]
 sheets={}
 for name in z.namelist():
  if name.startswith('xl/worksheets/sheet') and name.endswith('.xml'):
   rows=[]
   for row in ET.fromstring(z.read(name)).findall('.//s:sheetData/s:row',ns):
    vals=[]
    for c in row.findall('s:c',ns):
     v=c.find('s:v',ns)
     val=v.text if v is not None else ''.join(c.find('s:is',ns).itertext()) if c.find('s:is',ns) is not None else ''
     if c.get('t')=='s' and val: val=strings[int(val)]
     if val: vals.append(c.get('r')+': '+val)
    if vals: rows.append(' | '.join(vals))
   sheets[name]=rows
 (out/'source-xlsx.json').write_text(json.dumps(sheets,ensure_ascii=False,indent=2),encoding='utf-8')
 print(json.dumps(sheets,ensure_ascii=False,indent=2)[:12000])
print((out/'source-pdf.txt').read_text(encoding='utf-8')[:16000])
