INSERT INTO quo."Products" ("Id","Code","Name","Unit","Price","Category","IsActive","IsDeleted","CreatedAtUtc") VALUES
('c0000000-0000-4000-8000-000000000001','LEGACY-COMBO','Combo cũ','GÓI',18000,'A/ DÒNG COMBO',TRUE,FALSE,NOW()),
('c0000000-0000-4000-8000-000000000002','LEGACY-CUSTOM','Sản phẩm nhóm cũ','GÓI',12000,'Nhóm riêng cũ',FALSE,FALSE,NOW()),
('c0000000-0000-4000-8000-000000000003','LEGACY-EMPTY','Chưa có nhóm','GÓI',12000,NULL,TRUE,FALSE,NOW());
INSERT INTO quo."Quotations" ("Id","QuotationNumber","CustomerName","TemplateId","TemplateVersion","Status","IssueDate","SubTotal","DiscountPercent","DiscountAmount","TaxPercent","TaxAmount","TotalAmount","CreatedByUserId","IsDeleted","CreatedAtUtc") VALUES
('d0000000-0000-4000-8000-000000000001','LEGACY-QA','QUÝ KHÁCH HÀNG',gen_random_uuid(),1,'Draft',NOW(),100,0,0,0,0,100,gen_random_uuid(),FALSE,NOW());
