import {request} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
const api=await request.newContext({baseURL:'http://127.0.0.1:5184'});
const login=await (await api.post('/api/v1/auth/login',{data:{email:process.env.QUOTING_E2E_EMAIL,password:process.env.QUOTING_E2E_PASSWORD}})).json();const token=login.value.token;
const headers={Authorization:`Bearer ${token}`};
async function call(method,path,data){const r=await api.fetch(`/api/v1${path}`,{method,data,headers});if(!r.ok())throw new Error(`${path}: ${r.status()} ${await r.text()}`);return(await r.json()).value;}
const products=await call('GET','/quoting/products'); const templates=await call('GET','/quoting/templates');const source=templates.find(t=>t.isSystem);const v=source.versions.find(v=>v.version===source.currentVersion);
const seller=JSON.parse(v.sellerInfoJson);seller.phone='';
const templateId=await call('POST','/quoting/templates',{code:`PDF-REVIEW-${Date.now()}`,name:'Kiểm tra PDF theo nguồn gốc',title:'BẢNG BÁO GIÁ',sellerInfoJson:JSON.stringify(seller),salutationText:v.salutationText,columnsConfigJson:v.columnsConfigJson,paymentTermsJson:v.paymentTermsJson,signatureConfigJson:v.signatureConfigJson});
for(const [name,count,long] of [['base',11,false],['multipage',40,true]]){
 const items=Array.from({length:count},(_,i)=>{const code = !long && i >= 6 ? `XQ-0${i-5}` : `CB-0${i%6+1}`;const p=products.find(p=>p.code===code);return{productCode:p.code,productName:long?`Sản phẩm số ${i+1} – ${p.name}`:p.name,description:long&&i===0?'Tôm tươi cuộn rong biển, sản phẩm tiếng Việt. '.repeat(20):p.description,unit:p.unit,quantity:1.25,unitPrice:p.price,itemGroup:p.category,imageUrl:p.imageUrl,sortOrder:i+1};});
 const id=await call('POST','/quoting/quotations',{templateId,customerId:null,taxPercent:0,issueDate:new Date().toISOString(),items,notes:'Kiểm tra xuất PDF tiếng Việt'});const f=await call('POST',`/quoting/quotations/${id}/export`,{fileType:'pdf',taxPercent:0});const r=await api.get(`/api/v1/quoting/quotations/${id}/files/${f.id}/download`,{headers});await writeFile(`../PromtAI/.codex/results/fe-quoting-review-20261108/quotation-${name}.pdf`,await r.body());console.log(name,id);
}
await api.dispose();
