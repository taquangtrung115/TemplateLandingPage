const fs = require('node:fs');
const path = require('node:path');
const {createRequire} = require('node:module');
const root = path.resolve('FE_Quoting');
const requireFE = createRequire(path.join(root,'package.json'));
const {parse} = requireFE('@babel/parser');
function walk(node, visit) { if (!node || typeof node !== 'object') return; if(node.type) visit(node); for(const [key,value] of Object.entries(node)) { if(key === 'loc') continue; if(Array.isArray(value)) value.forEach(x=>walk(x,visit)); else if(value && typeof value === 'object') walk(value,visit); } }
const icons = {'Thử lại':'ArrowPathIcon','Thử lại bản xem trước':'ArrowPathIcon','Hủy':'XMarkIcon','Xóa ảnh':'TrashIcon','Xóa bộ lọc':'FunnelIcon','Thêm nhóm':'PlusIcon','Lưu nhóm':'CheckIcon','Thêm cả nhóm':'SquaresPlusIcon','Về danh sách báo giá':'ArrowLeftIcon','Sửa báo giá':'PencilSquareIcon','Xóa báo giá':'TrashIcon','Tải lại':'ArrowPathIcon','Xem chi tiết':'EyeIcon','Xem tất cả':'ArrowRightIcon','Đánh dấu đã xử lý':'CheckCircleIcon','Tạo mẫu':'DocumentPlusIcon','Thêm mẫu':'PlusIcon','Tạo yêu cầu khác':'PlusIcon'};
function files(dir) { return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]); }
let changed=0;
for(const file of files(path.join(root,'src')).filter(f=>f.endsWith('.jsx'))) {
 let source=fs.readFileSync(file,'utf8'); const tree=parse(source,{sourceType:'module',plugins:['jsx']}); const edits=[];const needed=new Set();
 walk(tree,node=>{
  if(node.type!=='JSXOpeningElement' || node.name.name!=='Button' || node.attributes.some(a=>a.name?.name==='icon') || node.attributes.some(a=>a.type==='JSXSpreadAttribute')) return;
  const label=node.attributes.find(a=>a.name?.name==='label'); if(!label) throw Error(file+':missing label');
  let icon=label.value?.type==='StringLiteral'?icons[label.value.value]:null;
  let expr;
  if(!icon){ const text=source.slice(label.start,label.end); if(text.includes('Đang đăng nhập')) icon='ArrowRightOnRectangleIcon'; else if(text.includes('Đang gửi')) icon='PaperAirplaneIcon'; else if(text.includes('step > 0')) {expr="step > 0 ? ArrowLeftIcon : XMarkIcon";needed.add('ArrowLeftIcon');needed.add('XMarkIcon');} else if(text.includes('column.action')) expr='column.icon'; else throw Error(file+':'+text); }
  if(icon) needed.add(icon);
  edits.push({start:node.name.end,end:node.name.end,text:` icon={<Icon icon={${expr||icon}} size="sm" />}`});
 });
 if(!edits.length) continue;
 for(const edit of edits.sort((a,b)=>b.start-a.start)) source=source.slice(0,edit.start)+edit.text+source.slice(edit.end);
 const iconImport=tree.program.body.find(n=>n.type==='ImportDeclaration' && n.source.value==='@heroicons/react/24/outline');
 const current=new Set(iconImport?.specifiers.map(s=>s.local.name)||[]); const extra=[...needed].filter(n=>!current.has(n));
 if(extra.length) { if(iconImport) source=source.replace(/(import\s*\{)([^}]*)(\}\s*from\s*['"]@heroicons\/react\/24\/outline['"])/,(_,a,b,c)=>a+b.trimEnd().replace(/,?$/ ,',')+' '+extra.join(', ')+',\n'+c); else source=`import { ${extra.join(', ')} } from '@heroicons/react/24/outline';\n`+source; }
 if(!tree.program.body.some(n=>n.type==='ImportDeclaration' && n.source.value==='@astryxdesign/core/Icon')) source="import { Icon } from '@astryxdesign/core/Icon';\n"+source;
 fs.writeFileSync(file,source); changed++;
}
for(const name of ['products/ProductCatalogPage','products/ProductGroupPage','customers/CustomerListPage','quotations/QuotationDetailPage']) {const file=path.join(root,'src/pages',name+'.jsx'); let s=fs.readFileSync(file,'utf8');s=s.replace("import { AlertDialog } from '@astryxdesign/core/AlertDialog';", "import { ConfirmationDialog as AlertDialog } from '../../components/common/ConfirmationDialog';");fs.writeFileSync(file,s);}
console.log({changed});
