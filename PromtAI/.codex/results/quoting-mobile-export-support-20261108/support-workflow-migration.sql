START TRANSACTION;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261108133804_AddQuotingSupportWorkflow') THEN
    ALTER TABLE quo."SupportRequests" ADD "ResolvedAtUtc" timestamp with time zone;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261108133804_AddQuotingSupportWorkflow') THEN
    ALTER TABLE quo."SupportRequests" ADD "ResolvedByUserId" uuid;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261108133804_AddQuotingSupportWorkflow') THEN
    ALTER TABLE quo."SupportRequests" ADD "Revision" integer NOT NULL DEFAULT 0;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261108133804_AddQuotingSupportWorkflow') THEN
    ALTER TABLE quo."SupportRequests" ADD "Status" integer NOT NULL DEFAULT 0;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261108133804_AddQuotingSupportWorkflow') THEN
    ALTER TABLE quo."SupportRequests" ADD "UpdatedAtUtc" timestamp with time zone;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261108133804_AddQuotingSupportWorkflow') THEN
    ALTER TABLE quo."SupportRequests" ADD "UpdatedByUserId" uuid;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261108133804_AddQuotingSupportWorkflow') THEN
    CREATE INDEX "IX_SupportRequests_Status_CreatedAtUtc_Id" ON quo."SupportRequests" ("Status", "CreatedAtUtc", "Id");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261108133804_AddQuotingSupportWorkflow') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20261108133804_AddQuotingSupportWorkflow', '9.0.2');
    END IF;
END $EF$;
COMMIT;

