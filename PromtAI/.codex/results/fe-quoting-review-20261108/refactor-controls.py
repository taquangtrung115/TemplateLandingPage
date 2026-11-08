from pathlib import Path
p=Path('FE_Quoting/src/pages/quotations/CreateQuotationPage.jsx');s=p.read_text(encoding='utf-8')
s=s.replace("import { Card }", "import { Stepper, Step } from '@astryxdesign/core/Stepper';\nimport { Card }")
a=s.index('              {/* Stepper Header');b=s.index('              <div\n                ref={wizardContainerRef}',a)
s=s[:a]+'''              <Stepper label="Các bước tạo báo giá" activeStep={step} onStepClick={handleGoToStep}>
                {STEPS.map((item, index) => <Step key={item.label} step={index} label={item.label} />)}
              </Stepper>

''' +s[b:]
a=s.index('                            <HStack gap={3} wrap="wrap">\n                              {customers.length');b=s.index('                            </HStack>',a)+len('                            </HStack>')
# Find the outer end after the map, since customer cards contain nested stacks.
b=s.index('                            </HStack>\n                          </VStack>',a)+len('                            </HStack>')
s=s[:a]+'''                            {customers.length === 0 && <Text>Chưa có khách hàng. Bạn có thể chọn Báo giá chung.</Text>}
                            <RadioList label="Khách hàng nhận báo giá" value={selectedCustomerId} onChange={setSelectedCustomerId}>
                              {customers.map((customer) => <RadioListItem key={customer.id} value={customer.id} label={customer.name} description={[customer.phone, customer.address].filter(Boolean).join(' · ')} />)}
                            </RadioList>''' +s[b:]
s=s.replace("itemGroup: prod.category || 'Chưa phân loại',", "itemGroup: prod.category || 'Chưa phân loại',\n          catalogPrice: prod.price,")
s=s.replace('Giá danh mục: {formatVnd(it.unitPrice)}','Giá danh mục: {formatVnd(it.catalogPrice)}')
a=s.index('  const selectedTemplate = useMemo');b=s.index('  // Financial calculations',a)
s=s[:b]+'''  const templateVersion = selectedTemplate?.versions?.find((version) => version.version === selectedTemplate.currentVersion);
  const parseConfig = (json) => { try { return JSON.parse(json || '{}'); } catch { return {}; } };
  const seller = parseConfig(templateVersion?.sellerInfoJson);
  const payment = parseConfig(templateVersion?.paymentTermsJson);
  const bank = payment.bankAccounts?.[0] || {};

''' +s[b:]
s=s.replace('Bước 3: Chiết Khấu, Thuế VAT & Điều Khoản','Bước 3: Chiết khấu, thuế và điều khoản').replace('Bước 4: Xác Nhận & Xuất Báo giá','Bước 4: Kiểm tra báo giá')
s=s.replace('<strong>CTY TNHH MARVISION</strong>', "<strong>{bank.accountHolder || seller.bankHolder || '—'}</strong>").replace('<strong>68681068</strong>', "<strong>{bank.accountNumber || seller.bankAccount || '—'}</strong>").replace('<strong>AB BANK</strong>', "<strong>{bank.bankName || seller.bankName || '—'}</strong>")
s=s.replace('CHUỖI ĂN VẶT - 19 Ngô Văn Năm, TPHCM', "{[seller.companyName, seller.address].filter(Boolean).join(' · ') || selectedTemplate?.name || '—'}")
s=s.replace('Mẫu template áp dụng:', 'Mẫu báo giá:').replace('Mẫu Template Báo giá','Mẫu báo giá').replace('Thời gian hiệu lực bảng báo giá','Thời hạn báo giá')
# Remove duplicate validation covered by the step guard.
a=s.index('    if (!isGenericCustomer && !selectedCustomerId) {',s.index('  const handleSubmit'))
b=s.index('    try {',a);s=s[:a]+s[b:]
# This static business claim was not derived from the selected template.
a=s.index('        {/* Cam kết chuẩn mẫu PDF');b=s.index('      </VStack>',a)
# Nested stack: find its containing div followed by the root stack.
b=s.index('        </div>',a)+len('        </div>');s=s[:a]+'''        <Text type="supporting" color="secondary">Mẫu áp dụng: {selectedTemplate?.name || 'Chưa chọn mẫu'} (v{selectedTemplate?.currentVersion || '—'})</Text>''' +s[b:]
p.write_text(s,encoding='utf-8')
p=Path('FE_Quoting/src/pages/products/ProductCatalogPage.jsx');s=p.read_text(encoding='utf-8').replace('filteredProducts','visibleProducts');p.write_text(s,encoding='utf-8')
for p in Path('FE_Quoting/src/pages').rglob('*.jsx'):
 s=p.read_text(encoding='utf-8').replace("currency: 'VND'", "currency: 'VND', minimumFractionDigits: 0, maximumFractionDigits: 2")
 # Apply a common responsive layout class without replacing Astryx controls.
 s=s.replace('<Grid\n', '<Grid className="quoting-grid"\n') if p.name!='LoginPage.jsx' else s
 s=s.replace('<Grid columns=', '<Grid className="quoting-grid" columns=')
 p.write_text(s,encoding='utf-8')
p=Path('FE_Quoting/src/index.css');s=p.read_text(encoding='utf-8').replace('.astryx-grid {','.quoting-grid {');p.write_text(s,encoding='utf-8')
