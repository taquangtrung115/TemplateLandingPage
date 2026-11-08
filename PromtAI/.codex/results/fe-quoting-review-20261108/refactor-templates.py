from pathlib import Path
p=Path('FE_Quoting/src/pages/templates/TemplateListPage.jsx');s=p.read_text(encoding='utf-8')
s=s.replace("import { TextInput }", "import { Selector } from '@astryxdesign/core/Selector';\nimport { Skeleton } from '@astryxdesign/core/Skeleton';\nimport { TextInput }")
s=s.replace("  const [activeSection,", "  const [selectedTemplateId, setSelectedTemplateId] = useState('');\n  const [activeSection,")
for name,val in [('title','BẢNG BÁO GIÁ'),('companyName','CHUỖI ĂN VẶT'),('address','19 NGÔ VĂN NĂM PHÚ THẠNH TPHCM'),('taxCode','0319645690'),('phone','0901 234 567'),('bankAccount','68681068'),('bankName','AB BANK'),('bankHolder','CTY TNHH MARVISION')]:
 s=s.replace("useState('"+val+"')", "useState('')")
s=s.replace("  const [salutation, setSalutation] = useState(\n    'Lời nói đầu công ty chúng tôi xin cảm ơn Quý khách hàng đã quan tâm và ủng hộ sản phẩm của công ty chúng tôi. Công ty chúng tôi xin gửi bảng giá như sau:'\n  );", "  const [salutation, setSalutation] = useState('');")
s=s.replace('      setTemplates(res || []);', "      setTemplates(res || []);\n      setSelectedTemplateId((current) => res?.some((template) => template.id === current) ? current : res?.find((template) => template.isSystem && template.isActive)?.id || res?.[0]?.id || '');")
s=s.replace('    } catch (err) {\n\n      setTemplates([]);', "    } catch (err) {\n      setErrorMessage(err.message || 'Không thể tải mẫu báo giá. Vui lòng thử lại.');")
s=s.replace('  const defaultTemplate = templates[0] || null;', '''  const selectedTemplate = templates.find((template) => template.id === selectedTemplateId) || null;
  const currentTemplateVersion = selectedTemplate?.versions?.find((version) => version.version === selectedTemplate.currentVersion);
  const parseConfig = (json) => { try { return JSON.parse(json || '{}'); } catch { return {}; } };

  useEffect(() => {
    const seller = parseConfig(currentTemplateVersion?.sellerInfoJson);
    const payment = parseConfig(currentTemplateVersion?.paymentTermsJson);
    const bank = payment.bankAccounts?.[0] || {};
    setTitle(currentTemplateVersion?.title || '');
    setCompanyName(seller.companyName || '');
    setAddress(seller.address || '');
    setTaxCode(seller.taxCode || '');
    setPhone(seller.phone || '');
    setBankAccount(bank.accountNumber || seller.bankAccount || '');
    setBankName(bank.bankName || seller.bankName || '');
    setBankHolder(bank.accountHolder || seller.bankHolder || '');
    setSalutation(currentTemplateVersion?.salutationText || '');
  }, [currentTemplateVersion]);''')
s=s.replace('defaultTemplate', 'selectedTemplate')
s=s.replace('  const handlePublishVersion = async () => {', '  const handlePublishVersion = async () => {\n    if (saving || loading || !isAdmin) return;')
s=s.replace('    if (!selectedTemplate) {', '    if (!selectedTemplate || !currentTemplateVersion) {')
s=s.replace('      const sellerInfoJson = JSON.stringify({', '      if (!title.trim() || !companyName.trim()) { setErrorMessage(\'Nhập tên đơn vị bán hàng và tiêu đề báo giá.\'); return; }\n      const sellerInfoJson = JSON.stringify({\n        ...parseConfig(currentTemplateVersion.sellerInfoJson),')
a=s.index('      const paymentTermsJson =');b=s.index('      await quotingTemplateApi.createVersion',a)
s=s[:a]+'''      const currentPayment = parseConfig(currentTemplateVersion.paymentTermsJson);
      const paymentTermsJson = JSON.stringify({
        ...currentPayment,
        bankAccounts: [{ ...currentPayment.bankAccounts?.[0], accountNumber: bankAccount, bankName, accountHolder: bankHolder }, ...(currentPayment.bankAccounts?.slice(1) || [])],
      });
''' + s[b:]
s=s.replace("columnsConfigJson: JSON.stringify(['STT', 'Tên sản phẩm', 'ĐVT', 'Đơn giá', 'Hình ảnh'])", 'columnsConfigJson: currentTemplateVersion.columnsConfigJson')
s=s.replace('        signatureConfigJson,', '        signatureConfigJson: currentTemplateVersion.signatureConfigJson,\n        customCss: currentTemplateVersion.customCss,')
s=s.replace('              setActiveSection(\'versions\');\n              handlePublishVersion();', "              setSelectedTemplateId(row.id);\n              setActiveSection('seller');\n              setErrorMessage(null);\n              setSuccessMessage(null);")
s=s.replace('label="Nâng Bản (v+1)"','label="Chọn mẫu"')
s=s.replace('    [selectedTemplate]', '    [templates]')
s=s.replace('          isLoading={saving}', '          isLoading={saving}\n          isDisabled={!isAdmin || loading || !currentTemplateVersion}')
s=s.replace('      {/* Info / Status Banners */}', '''      <Selector label="Mẫu báo giá đang chỉnh sửa" value={selectedTemplateId} onChange={(id) => { setSelectedTemplateId(id); setSuccessMessage(null); setErrorMessage(null); }}
        options={templates.map((template) => ({ value: template.id, label: `${template.name} · v${template.currentVersion}` }))} />
      {!isAdmin && <Banner status="info" title="Chế độ xem" description="Chỉ quản trị viên được thay đổi mẫu báo giá." />}
      {loading && <Skeleton height={80} />}
      {!loading && templates.length === 0 && <Banner status="info" title="Chưa có mẫu báo giá" description="Liên hệ quản trị viên để thêm mẫu trước khi lập báo giá." />}
      {/* Info / Status Banners */}''')
s=s.replace('      <Layout\n        height="fill"', '      <Layout\n        className="quotation-settings"\n        height="auto"')
s=s.replace('<TextInput\n', '<TextInput\n                      isDisabled={!isAdmin || loading || saving}\n').replace('<TextArea\n','<TextArea\n                    isDisabled={!isAdmin || loading || saving}\n')
p.write_text(s,encoding='utf-8')
