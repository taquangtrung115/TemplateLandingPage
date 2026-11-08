from pathlib import Path
p=Path('FE_Quoting/src/pages/quotations/CreateQuotationPage.jsx')
s=p.read_text(encoding='utf-8')
s=s.replace("import { Stepper, Step } from '@astryxdesign/core/Stepper';", "import { Button } from '@astryxdesign/core/Button';\nimport { Skeleton } from '@astryxdesign/core/Skeleton';\nimport { calculateQuotation } from '../../utils/quotationCalculation';")
a=s.index('const PDF_SAMPLE_PRODUCTS ='); b=s.index('export default function CreateQuotationPage()',a); s=s[:a]+s[b:]
s=s.replace("new Date().toISOString().split('T')[0]", "new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10)")
a=s.index('        let [cList, pList, tList]');b=s.index('      } catch (err)',a)
s=s[:a]+'''        const [customerList, productList, templateList] = await Promise.all([
          quotingCustomerApi.getCustomers(),
          quotingProductApi.getProducts(),
          quotingTemplateApi.getTemplates(),
        ]);
        if (!isMounted) return;
        setCustomers(customerList || []);
        setProducts(productList || []);
        setTemplates(templateList || []);
        setSelectedCustomerId(customerList?.[0]?.id || '');
        setSelectedTemplateId(templateList?.[0]?.id || '');
''' + s[b:]
s=s.replace('    const initData = async () => {', '    let isMounted = true;\n    const initData = async () => {')
s=s.replace('      } catch (err) {\n      } finally {\n        setLoading(false);', "      } catch (err) {\n        if (isMounted) setErrorMessage(err.message || 'Không thể tải dữ liệu lập báo giá. Vui lòng thử lại.');\n      } finally {\n        if (isMounted) setLoading(false);")
s=s.replace('    initData();\n  }, []);', '    initData();\n    return () => { isMounted = false; };\n  }, []);')
a=s.index('    let sub = 0;');b=s.index('  }, [items, discountPercent, taxPercent]);',a)
s=s[:a]+'''    return calculateQuotation(items, discountPercent, taxPercent);
''' + s[b:]
s=s.replace('    const existing = items.find((i) => i.productId === prod.id);', '    setItems((items) => {\n    const existing = items.find((i) => i.productId === prod.id);')
s=s.replace('setItems(items.map((i) => (i.productId === prod.id ? { ...i, quantity: (Number(i.quantity) || 1) + 1 } : i)));','return items.map((i) => (i.productId === prod.id ? { ...i, quantity: (Number(i.quantity) || 1) + 1 } : i));')
s=s.replace('      setItems([\n        ...items,','      return [\n        ...items,',1).replace('      ]);\n    }\n  };','      ];\n    }\n    });\n  };',1)
s=s.replace("itemGroup: prod.category || 'A/ DÒNG COMBO'", "itemGroup: prod.category || 'Chưa phân loại'")
s=s.replace("val = Math.max(1, Number(value) || 1);", "val = Math.max(0.01, Number(value) || 0.01);")
s=s.replace("    } else if (field === 'discountPercent')", "    } else if (field === 'unitPrice') {\n      val = Math.max(0, Number(value) || 0);\n    } else if (field === 'discountPercent')")
s=s.replace('  const handleSubmit = async () => {', '''  const validateStep = (targetStep) => {
    let message = null;
    let invalidStep = 0;
    if (!isGenericCustomer && !selectedCustomerId) message = 'Chọn khách hàng hoặc chọn Báo giá chung.';
    else if (!selectedTemplateId) message = 'Chưa có mẫu báo giá. Vui lòng liên hệ quản trị viên để tạo mẫu.';
    else if (!issueDate || (validUntil && validUntil < issueDate)) message = 'Hạn hiệu lực phải từ ngày lập báo giá trở đi.';
    else if (targetStep > 1 && items.length === 0) { message = 'Thêm ít nhất một sản phẩm vào báo giá.'; invalidStep = 1; }
    if (message) { setErrorMessage(message); setStep(invalidStep); return false; }
    setErrorMessage(null);
    return true;
  };

  const handleGoToStep = (nextStep) => {
    if (submitting || loading) return;
    if (nextStep > step && !validateStep(nextStep)) return;
    setStep(nextStep);
  };

  const handleSubmit = async () => {
    if (submitting || loading || !validateStep(3)) return;''')
s=s.replace('Math.max(1, Number(it.quantity) || 1)', 'Math.max(0.01, Number(it.quantity) || 0.01)')
a=s.index('      if (res?.isSuccess && res?.value)');b=s.index('    } catch (err)',a)
s=s[:a]+'''      if (!res || typeof res !== 'string') throw new Error('Máy chủ chưa trả về mã báo giá hợp lệ.');
      toast({ body: 'Đã tạo báo giá.', type: 'info' });
      navigate(`/quotations/${res}`);
''' + s[b:]
s=s.replace("onClick={() => setStep(idx)}", "onClick={() => handleGoToStep(idx)}\n                          role=\"button\"\n                          tabIndex={submitting ? -1 : 0}\n                          aria-current={isActive ? 'step' : undefined}\n                          onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); handleGoToStep(idx); } }}")
s=s.replace('        style={{\n          display: \'flex\',\n          gap: 24,\n          alignItems: \'flex-start\',\n          flexWrap: \'nowrap\',\n          width: \'100%\',\n        }}', '        className="quotation-editor"')
a=s.index('        {/* Right Column: Sticky Summary Overview Panel */}'); b=s.index('          {summaryCard}',a)
s=s[:a]+'''        {/* Summary follows the editor on narrow screens. */}
        <div className="quotation-summary">
''' + s[b:]
s=s.replace('                              {customers.map((c) => (', '                              {customers.length === 0 && <Text>Chưa có khách hàng. Bạn có thể chọn Báo giá chung.</Text>}\n                              {customers.map((c) => (')
s=s.replace('                                  key={c.id}\n                                  onClick=', '''                                  key={c.id}
                                  role="button"
                                  tabIndex={0}
                                  aria-pressed={selectedCustomerId === c.id}
                                  onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setIsGenericCustomer(false); setSelectedCustomerId(c.id); } }}
                                  onClick=''',1)
s=s.replace('                                value={validUntil}', '                                min={issueDate || undefined}\n                                value={validUntil || null}')
s=s.replace('                                  min={1}', '                                  min={0.01}\n                                  step={0.01}')
s=s.replace('                            <HStack gap={3} vAlign="center">\n                              <VStack width={100}>','                            <HStack className="quotation-item-fields" gap={3} vAlign="center" wrap="wrap">\n                              <VStack width={100}>')
s=s.replace('                                onClick={() => handleRemoveItem(idx)}', '                                label={`Xóa ${it.productName}`}\n                                aria-label={`Xóa ${it.productName}`}\n                                onClick={() => handleRemoveItem(idx)}')
a=s.index('                  {/* Quick Pick Products'); b=s.index('              {/* STEP 2:',a)
s=s[:a]+'''                  <VStack gap={3}>
                    <Heading level={3}>Thêm sản phẩm</Heading>
                    {products.length === 0 && <Text>Chưa có sản phẩm đang bán. Vui lòng thêm sản phẩm trong danh mục.</Text>}
                    <div className="quotation-product-picker">
                      {products.map((product) => (
                        <Button key={product.id} variant="secondary"
                          label={`${product.name} · ${formatVnd(product.price)}`}
                          icon={<Icon icon={PlusIcon} size="sm" />}
                          onClick={() => handleAddItem(product)} />
                      ))}
                    </div>
                  </VStack>
                </VStack>
              )}

''' + s[b:]
a=s.index('                    onClick={() => {\n                      if (step === 0');b=s.index('\n                  />',a)
s=s[:a]+'''                    onClick={() => handleGoToStep(step + 1)}
                    disabled={loading || submitting}''' + s[b:]
s=s.replace('onClick={() => setStep(step - 1)}','onClick={() => handleGoToStep(step - 1)}\n                    disabled={submitting}')
s=s.replace('  return (\n    <VStack gap={6}>', '''  if (loading) return <VStack gap={3} aria-label="Đang tải dữ liệu lập báo giá"><Skeleton height={40} /><Skeleton height={300} /></VStack>;

  return (
    <VStack gap={6}>''')
s=s.replace('      {/* Main 2-Column', '      {!loading && products.length === 0 && !errorMessage && <Banner status="info" title="Danh mục sản phẩm đang trống" description="Thêm sản phẩm đang bán trước khi lập báo giá." />}\n\n      {/* Main 2-Column')
s=s.replace('Báo giá sẽ chính thức có hiệu lực hợp đồng với đối tác.', 'Báo giá sẽ được ghi nhận là đã phê duyệt.')
p.write_text(s,encoding='utf-8')
