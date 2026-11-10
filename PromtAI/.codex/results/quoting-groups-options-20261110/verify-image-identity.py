import os, json, urllib.request, base64, hashlib
from pathlib import Path
import pymupdf

base='http://127.0.0.1:54611/api/v1'
token=None
def call(method, path, data=None):
    headers={'Content-Type':'application/json'}
    if token:headers['Authorization']='Bearer '+token
    request=urllib.request.Request(base+path, data=None if data is None else json.dumps(data).encode(), headers=headers, method=method)
    with urllib.request.urlopen(request) as response:return response.read()
def value(raw):
    data=json.loads(raw); return data.get('value',data)
session=value(call('POST','/auth/login',{'email':os.environ['QUOTING_E2E_EMAIL'],'password':os.environ['QUOTING_E2E_PASSWORD']}))
token=session['token']
products=[p for p in value(call('GET','/quoting/products')) if p['code'] in [f'CB-{i:02}' for i in range(1,7)]+[f'XQ-{i:02}' for i in range(1,6)]]
items=[{'productId':p['id'],'productCode':products[(i+1)%len(products)]['code'],'productName':'QA ảnh '+p['code'],
    'unit':p['unit'],'imageUrl':p['imageUrl'],'quantity':1,'unitPrice':p['price'],'sortOrder':i+1} for i,p in enumerate(products)]
quote=value(call('POST','/quoting/quotations',{'items':items,'showDiscount':False,'showQuantity':False,'showSubTotal':False,'showGrandTotal':False}))
preview=value(call('GET',f'/quoting/quotations/{quote}/preview'))['htmlContent']
export=value(call('POST',f'/quoting/quotations/{quote}/export',{'fileType':'pdf'}))
pdf=call('GET',f'/quoting/quotations/{quote}/files/{export["id"]}/download')
out=Path(__file__).parent
(out/'image-identity-qa.pdf').write_bytes(pdf)
doc=pymupdf.open(stream=pdf,filetype='pdf')
def pixels(pix):
    if pix.colorspace.n!=3:pix=pymupdf.Pixmap(pymupdf.csRGB,pix)
    if pix.alpha:pix=pymupdf.Pixmap(pix,0)
    return (pix.width,pix.height,hashlib.sha256(pix.samples).hexdigest())
embedded={pixels(pymupdf.Pixmap(doc,image[0])) for page in doc for image in page.get_images(full=True)}
verified=[]
for product in products:
    with urllib.request.urlopen('http://127.0.0.1:54611'+product['imageUrl']) as response: source=response.read()
    assert base64.b64encode(source).decode() in preview,product['code']+' HTML image differs from web'
    assert pixels(pymupdf.Pixmap(source)) in embedded,product['code']+' PDF pixels differ from web'
    verified.append(product['code'])
(out/'image-identity-verified.json').write_text(json.dumps({'verifiedProducts':verified,'count':len(verified),'pdfPages':len(doc),'comparison':'Web HTTP bytes equal HTML bytes; decoded PDF image pixels equal web pixels, with deliberately different product codes.'},ensure_ascii=False,indent=2),encoding='utf-8')
print('Verified web → HTML → PDF for all',len(verified),'product photos, with deliberately mismatched product codes.')
