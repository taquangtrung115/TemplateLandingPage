START TRANSACTION;
DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM pg_namespace WHERE nspname = 'quo') THEN
        CREATE SCHEMA quo;
    END IF;
END $EF$;

CREATE TABLE quo."Customers" (
    "Id" uuid NOT NULL,
    "Name" character varying(250) NOT NULL,
    "ContactPerson" character varying(150),
    "Phone" character varying(50) NOT NULL,
    "Email" character varying(150),
    "Address" character varying(500),
    "TaxCode" character varying(50),
    "Notes" character varying(1000),
    "IsActive" boolean NOT NULL,
    "IsDeleted" boolean NOT NULL,
    "DeletedAtUtc" timestamp with time zone,
    "CreatedAtUtc" timestamp with time zone NOT NULL,
    "ModifiedAtUtc" timestamp with time zone,
    CONSTRAINT "PK_Customers" PRIMARY KEY ("Id")
);

CREATE TABLE quo."Products" (
    "Id" uuid NOT NULL,
    "Code" character varying(50) NOT NULL,
    "Name" character varying(250) NOT NULL,
    "Description" character varying(1000),
    "Unit" character varying(50) NOT NULL,
    "Price" numeric(18,2) NOT NULL,
    "ImageUrl" character varying(1000),
    "Category" character varying(100),
    "IsActive" boolean NOT NULL,
    "IsDeleted" boolean NOT NULL,
    "DeletedAtUtc" timestamp with time zone,
    "CreatedAtUtc" timestamp with time zone NOT NULL,
    "ModifiedAtUtc" timestamp with time zone,
    CONSTRAINT "PK_Products" PRIMARY KEY ("Id")
);

CREATE TABLE quo."Quotations" (
    "Id" uuid NOT NULL,
    "QuotationNumber" character varying(50) NOT NULL,
    "CustomerId" uuid NOT NULL,
    "CustomerName" character varying(250) NOT NULL,
    "CustomerContactPerson" character varying(150),
    "CustomerPhone" character varying(50),
    "CustomerEmail" character varying(150),
    "CustomerAddress" character varying(500),
    "CustomerTaxCode" character varying(50),
    "TemplateId" uuid NOT NULL,
    "TemplateVersion" integer NOT NULL,
    "Status" character varying(50) NOT NULL,
    "IssueDate" timestamp with time zone NOT NULL,
    "ValidUntil" timestamp with time zone,
    "SubTotal" numeric(18,2) NOT NULL,
    "DiscountPercent" numeric(5,2) NOT NULL,
    "DiscountAmount" numeric(18,2) NOT NULL,
    "TaxPercent" numeric(5,2) NOT NULL,
    "TaxAmount" numeric(18,2) NOT NULL,
    "TotalAmount" numeric(18,2) NOT NULL,
    "Notes" character varying(2000),
    "CreatedByUserId" uuid NOT NULL,
    "IsDeleted" boolean NOT NULL,
    "DeletedAtUtc" timestamp with time zone,
    "CreatedAtUtc" timestamp with time zone NOT NULL,
    "ModifiedAtUtc" timestamp with time zone,
    CONSTRAINT "PK_Quotations" PRIMARY KEY ("Id")
);

CREATE TABLE quo."QuotationTemplates" (
    "Id" uuid NOT NULL,
    "Code" character varying(50) NOT NULL,
    "Name" character varying(250) NOT NULL,
    "Description" character varying(1000),
    "CurrentVersion" integer NOT NULL,
    "IsSystem" boolean NOT NULL,
    "IsActive" boolean NOT NULL,
    "IsDeleted" boolean NOT NULL,
    "DeletedAtUtc" timestamp with time zone,
    "CreatedAtUtc" timestamp with time zone NOT NULL,
    "ModifiedAtUtc" timestamp with time zone,
    CONSTRAINT "PK_QuotationTemplates" PRIMARY KEY ("Id")
);

CREATE TABLE quo."QuotationFiles" (
    "Id" uuid NOT NULL,
    "QuotationId" uuid NOT NULL,
    "FileName" character varying(250) NOT NULL,
    "FileType" character varying(50) NOT NULL,
    "FileUrl" character varying(1000) NOT NULL,
    "FileSize" bigint NOT NULL,
    "StorageProvider" character varying(50) NOT NULL,
    "CreatedAtUtc" timestamp with time zone NOT NULL,
    "CreatedByUserId" uuid NOT NULL,
    CONSTRAINT "PK_QuotationFiles" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_QuotationFiles_Quotations_QuotationId" FOREIGN KEY ("QuotationId") REFERENCES quo."Quotations" ("Id") ON DELETE CASCADE
);

CREATE TABLE quo."QuotationHistories" (
    "Id" uuid NOT NULL,
    "QuotationId" uuid NOT NULL,
    "Action" character varying(100) NOT NULL,
    "Description" character varying(1000) NOT NULL,
    "SnapshotData" text,
    "CreatedByUserId" uuid NOT NULL,
    "CreatedAtUtc" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_QuotationHistories" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_QuotationHistories_Quotations_QuotationId" FOREIGN KEY ("QuotationId") REFERENCES quo."Quotations" ("Id") ON DELETE CASCADE
);

CREATE TABLE quo."QuotationItems" (
    "Id" uuid NOT NULL,
    "QuotationId" uuid NOT NULL,
    "ProductId" uuid,
    "ProductCode" character varying(50),
    "ProductName" character varying(250) NOT NULL,
    "Description" character varying(1000),
    "Unit" character varying(50) NOT NULL,
    "ImageUrl" character varying(1000),
    "ItemGroup" character varying(150),
    "Quantity" numeric(18,4) NOT NULL,
    "UnitPrice" numeric(18,2) NOT NULL,
    "DiscountPercent" numeric(5,2) NOT NULL,
    "DiscountAmount" numeric(18,2) NOT NULL,
    "TotalAmount" numeric(18,2) NOT NULL,
    "Notes" character varying(500),
    "SortOrder" integer NOT NULL,
    CONSTRAINT "PK_QuotationItems" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_QuotationItems_Quotations_QuotationId" FOREIGN KEY ("QuotationId") REFERENCES quo."Quotations" ("Id") ON DELETE CASCADE
);

CREATE TABLE quo."QuotationTemplateVersions" (
    "Id" uuid NOT NULL,
    "TemplateId" uuid NOT NULL,
    "Version" integer NOT NULL,
    "Title" character varying(250) NOT NULL,
    "SellerInfoJson" text NOT NULL,
    "SalutationText" text NOT NULL,
    "ColumnsConfigJson" text NOT NULL,
    "PaymentTermsJson" text NOT NULL,
    "SignatureConfigJson" text NOT NULL,
    "CustomCss" text,
    "IsPublished" boolean NOT NULL,
    "CreatedAtUtc" timestamp with time zone NOT NULL,
    "CreatedByUserId" uuid,
    CONSTRAINT "PK_QuotationTemplateVersions" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_QuotationTemplateVersions_QuotationTemplates_TemplateId" FOREIGN KEY ("TemplateId") REFERENCES quo."QuotationTemplates" ("Id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "IX_Products_Code" ON quo."Products" ("Code");

CREATE INDEX "IX_QuotationFiles_QuotationId" ON quo."QuotationFiles" ("QuotationId");

CREATE INDEX "IX_QuotationHistories_QuotationId" ON quo."QuotationHistories" ("QuotationId");

CREATE INDEX "IX_QuotationItems_QuotationId" ON quo."QuotationItems" ("QuotationId");

CREATE UNIQUE INDEX "IX_Quotations_QuotationNumber" ON quo."Quotations" ("QuotationNumber");

CREATE UNIQUE INDEX "IX_QuotationTemplates_Code" ON quo."QuotationTemplates" ("Code");

CREATE UNIQUE INDEX "IX_QuotationTemplateVersions_TemplateId_Version" ON quo."QuotationTemplateVersions" ("TemplateId", "Version");

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20261108030358_AddQuotingModuleSchema', '9.0.2');

COMMIT;

