from pathlib import Path
p=Path('BE/src/Persistence/Migrations/20261110092605_AddQuotingProductGroupsAndDisplayOptions.cs');s=p.read_text();marker='            migrationBuilder.AddForeignKey(';pos=s.index(marker);s=s[:pos]+'''            // Existing quotations retain their prior visible columns; new requests default to a price list.
            migrationBuilder.Sql("""
                UPDATE quo."Quotations" SET "ShowDiscount" = TRUE, "ShowQuantity" = TRUE, "ShowSubTotal" = TRUE, "ShowGrandTotal" = TRUE;
                INSERT INTO quo."ProductGroups" ("Id", "Code", "Name", "SortOrder", "IsActive", "IsDeleted", "CreatedAtUtc") VALUES
                  ('a0000000-0000-4000-8000-000000000001', 'COMBO', 'A/ DÒNG COMBO', 1, TRUE, FALSE, CURRENT_TIMESTAMP),
                  ('b0000000-0000-4000-8000-000000000002', 'XIEN-QUE', 'B/ DÒNG SẢN PHẨM XIÊN QUE', 2, TRUE, FALSE, CURRENT_TIMESTAMP);
                INSERT INTO quo."ProductGroups" ("Id", "Code", "Name", "SortOrder", "IsActive", "IsDeleted", "CreatedAtUtc")
                SELECT md5('quoting-product-group:' || name)::uuid, 'LEGACY-' || md5(name), name,
                    2 + row_number() OVER (ORDER BY name)::integer, TRUE, FALSE, CURRENT_TIMESTAMP
                FROM (SELECT DISTINCT COALESCE(NULLIF(btrim("Category"), ''), 'Chưa phân loại') AS name FROM quo."Products") AS legacy
                WHERE NOT EXISTS (SELECT 1 FROM quo."ProductGroups" AS g WHERE g."Name" = legacy.name);
                UPDATE quo."Products" AS p SET "GroupId" = g."Id"
                FROM quo."ProductGroups" AS g WHERE g."Name" = COALESCE(NULLIF(btrim(p."Category"), ''), 'Chưa phân loại');
                """);

'''+s[pos:];p.write_text(s)
# Shared row menus for all table-driven pages.
for file,actions in [
('FE_Quoting/src/pages/customers/CustomerListPage.jsx',"{ label: 'Sửa khách hàng', icon: PencilSquareIcon, onClick: () => handleOpenEdit(row) }, { label: 'Xóa khách hàng', icon: TrashIcon, destructive: true, onClick: () => handleConfirmDelete(row.id) }"),
('FE_Quoting/src/pages/templates/TemplateListPage.jsx',"{ label: 'Chọn mẫu', icon: DocumentDuplicateIcon, onClick: () => { setSelectedTemplateId(row.id); setActiveSection('seller'); setErrorMessage(null); } }"),
('FE_Quoting/src/pages/quotations/QuotationDetailPage.jsx',"{ label: 'Tải tệp', icon: ArrowDownTrayIcon, onClick: () => handleDownloadFile(row), isDisabled: exporting || previewing || Boolean(previewError) }")]:
 p=Path(file);s=p.read_text();s="import RowActions from '../../components/common/RowActions';\n"+s;start=s.index('      renderCell: (row) => (',s.index("key: 'actions'")) if 'QuotationDetail' in file else s.index('        renderCell: (row) => (',s.index("key: 'actions'"));end=s.index('\n    },' if 'QuotationDetail' in file else '\n      },',start);s=s[:start]+f"      renderCell: (row) => <RowActions label={{row.name || row.fileName}} actions={{[{actions}]}} />,"+s[end:];p.write_text(s)
# Respect the persisted switches on the detail view too.
p=Path('FE_Quoting/src/pages/quotations/QuotationDetailPage.jsx');s=p.read_text();start=s.index('  const itemColumns =');end=s.index('  const historyColumns',start);part=s[start:end].replace('  ], []);', '''  ].filter((column) => !(column.key === 'quantity' && quotation?.showQuantity === false)
    && !(column.key === 'discountPercent' && quotation?.showDiscount === false)
    && !(column.key === 'totalAmount' && quotation?.showGrandTotal === false)), [quotation?.showQuantity, quotation?.showDiscount, quotation?.showGrandTotal]);''');s=s[:start]+part+s[end:];s=s.replace('<VStack gap={1} style={{ flex: \'1 1 220px\', textAlign: \'right\' }}>','{quotation.showGrandTotal !== false && <VStack gap={1} style={{ flex: \'1 1 220px\', textAlign: \'right\' }}>');s=s.replace("            {quotation.discountPercent > 0 && (","            {quotation.showDiscount !== false && quotation.discountPercent > 0 && (");s=s.replace('''          </VStack>
        </HStack>
      </Card>

      <Card padding={4}>''','''          </VStack>}
        </HStack>
      </Card>

      <Card padding={4}>''');s=s.replace('          <Text type="body" weight="semibold">Tổng tiền trên tệp:', '          {quotation.showGrandTotal !== false && <Text type="body" weight="semibold">Tổng tiền trên tệp:').replace('.totalAmount)}</Text>','.totalAmount)}</Text>}');p.write_text(s)
print('Responsive layouts, fixed wizard navigation, table menus, migration backfill updated')
