const fs=require('node:fs');const path=require('node:path');const {createRequire}=require('node:module');const {pathToFileURL}=require('node:url');
const root=path.resolve('FE_Quoting');const req=createRequire(path.join(root,'package.json'));const {chromium,webkit,expect:baseExpect}=req('@playwright/test');const expect=baseExpect.configure({timeout:15000});
let activeBrowser,activePage;
(async()=>{
 const f=await import(pathToFileURL(path.join(root,'test/fixtures.js')));const output=path.resolve('PromtAI/.codex/results/quoting-missing-pdf-images-20261110');const checks=[];
 const engineName=process.env.QUOTING_UI_ENGINE || 'chromium'; const browser=activeBrowser=await (engineName==='webkit'?webkit:chromium).launch();
 for(const width of (engineName==='webkit'?[375,414]:[320,375,414,768,1440])){
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});const page=activePage=await context.newPage();const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error('BROWSERERROR',e.message);});page.on('console',m=>{if(m.type()==='error')console.error('CONSOLEERROR',m.text());});
  const user={id:'00000000-0000-4000-8000-000000000001',fullName:'Quản trị viên',email:'qa@example.test',role:'Admin'};
  await page.addInitScript(({user})=>{localStorage.setItem('token','isolated-ui-test');localStorage.setItem('user',JSON.stringify(user));if(!localStorage.getItem('quoting.colorMode'))localStorage.setItem('quoting.colorMode','light');},{user});
  let releaseAuth;const authGate=new Promise(resolve=>releaseAuth=resolve);let holdAuth=true;
  await page.route('**/api/v1/**',async route=>{
   const url=new URL(route.request().url());const pathname=url.pathname;let value;
   if(pathname.endsWith('/auth/me')){if(holdAuth) await authGate;value=user;}
   else if(pathname.endsWith('/support-requests')){const status=url.searchParams.get('status');value={data:status==='Resolved'?[{id:'support1',fullName:'Nguyễn Minh',email:'qa@example.test',topic:'Báo giá & Chiết Khấu',message:'Cần hỗ trợ điều chỉnh mẫu báo giá.',priority:'normal',status:'Resolved',revision:1,createdAtUtc:'2026-11-10T07:00:00Z',resolvedAtUtc:'2026-11-10T07:10:00Z'}]:[],total:status==='Resolved'?1:0};}
   else if(pathname.endsWith('/product-groups'))value={groups:f.groups};
   else if(pathname.endsWith('/products'))value=[f.product];
   else if(pathname.endsWith('/customers'))value=[f.customer];
   else if(pathname.endsWith('/templates'))value=[f.template];
   else if(pathname.endsWith('/quotations/summary'))value=f.summary;
   else if(pathname.endsWith('/preview-draft')||pathname.endsWith('/preview'))value={htmlContent:'<html><body><h1>BẢNG BÁO GIÁ</h1></body></html>'};
   else if(pathname.endsWith('/quotations/'+f.quotationId))value=f.quotation;
   else if(pathname.endsWith('/quotations'))value={data:[f.quotation],total:1};
   else if(pathname.includes('/templates/'))value=f.template;
   else throw Error('Unexpected mocked API route '+pathname);
   await route.fulfill({json:{isSuccess:true,value}});
  });
  await page.goto('http://127.0.0.1:5185/support');await expect(page.getByRole('status')).toContainText('Đang kiểm tra phiên đăng nhập');expect(await page.locator('.app-loading-document').evaluate(el=>getComputedStyle(el).animationName)).toBe('none'); await page.emulateMedia({reducedMotion:'no-preference'});expect(await page.locator('.app-loading-document').evaluate(el=>getComputedStyle(el).animationName)).toBe('document-arrive');await page.screenshot({path:path.join(output,`${engineName}-boot-light-${width}.png`)});await page.emulateMedia({reducedMotion:'reduce'});holdAuth=false;releaseAuth();
  await expect(page.getByRole('heading',{name:'Xử lý hỗ trợ',exact:true})).toBeVisible();await page.evaluate(()=>document.fonts.ready);
  if(width<1024){await page.getByRole('radio',{name:'Đã xử lý (1)',exact:true}).click();}
  await expect(page.getByText('Nguyễn Minh',{exact:true})).toBeVisible();
  const geometry=()=>page.evaluate(()=>{const rect=el=>{const r=el.getBoundingClientRect();const s=getComputedStyle(el);return {x:Math.round(r.x),y:Math.round(r.y),width:Math.round(r.width),height:Math.round(r.height),font:s.fontFamily,size:s.fontSize};};return {heading:rect(document.querySelector('h1')),columns:[...document.querySelectorAll('.support-column')].map(rect),body:getComputedStyle(document.body).backgroundColor,columnsBackground:getComputedStyle(document.querySelector('.support-column')).backgroundColor};});
  const light=await geometry();await page.screenshot({path:path.join(output,`${engineName}-support-light-${width}.png`)});
  await page.getByRole('button',{name:'Giao diện tối',exact:true}).click();await expect(page.locator('html')).toHaveAttribute('data-theme','dark');const dark=await geometry();
  expect(dark.heading).toEqual(light.heading);expect(dark.columns).toEqual(light.columns);expect(light.body).not.toBe(light.columnsBackground);expect(dark.body).not.toBe(dark.columnsBackground);
  await page.screenshot({path:path.join(output,`${engineName}-support-dark-${width}.png`)});
  await page.goto('http://127.0.0.1:5185/products');await expect(page.getByText(f.product.name,{exact:true})).toBeVisible();
  const productRegion=width<768?page.getByLabel('Danh sách sản phẩm trên điện thoại'):page.getByRole('table');
  await expect(productRegion.getByRole('button',{name:'Sửa sản phẩm',exact:true})).toBeVisible();await expect(productRegion.getByRole('button',{name:'Xóa sản phẩm',exact:true})).toBeVisible();await expect(productRegion.getByRole('button',{name:/Thêm thao tác/})).toHaveCount(0);
  await productRegion.getByRole('button',{name:'Xóa sản phẩm',exact:true}).click();const confirm=page.getByRole('alertdialog');await expect(confirm).toBeVisible();expect(await confirm.getByRole('button').count()).toBe(2);expect(await confirm.locator('button svg').count()).toBe(2);await confirm.getByRole('button',{name:'Hủy',exact:true}).click();
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1);expect(overflow).toBe(false);if(width>=768){const pos=await productRegion.locator('tr').last().locator('td').last().evaluate(el=>getComputedStyle(el).position);expect(pos).toBe('sticky');}
  await page.screenshot({path:path.join(output,`${engineName}-products-dark-${width}.png`)});expect(errors).toEqual([]);checks.push({width,themeGeometryEqual:true,actionsVisible:2,pageOverflow:false,errors});await context.close();
 }
 await browser.close();fs.writeFileSync(path.join(output,`ui-checks-${engineName}.json`),JSON.stringify(checks,null,2));console.log(JSON.stringify(checks));
})().catch(async error=>{console.error(error);if(activePage){console.error((await activePage.locator('body').innerText()).slice(0,2000));await activePage.screenshot({path:'PromtAI/.codex/results/quoting-missing-pdf-images-20261110/ui-failure.png'});}await activeBrowser?.close();process.exitCode=1;});
