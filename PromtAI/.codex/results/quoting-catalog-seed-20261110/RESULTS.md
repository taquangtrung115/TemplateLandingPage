# Quoting catalog seed through EF migration — 2026-11-10

## Change

Added data migration `20261110102142_SeedQuotingProductCatalog`, after `20261110092605_AddQuotingProductGroupsAndDisplayOptions`. A single `dotnet ef database update` applies all pending schema/data migrations, including two standard product groups and eleven catalog products (six Combo, five Xiên que). No separate runtime-seeder call or SeedData opt-in is required for these catalogs.

The data migration adds missing rows and associations, compares both product code and normalized Unicode/whitespace/case-insensitive names, and does not replace prices, units, descriptions, uploaded images, inactive/deleted states or customized group metadata. Known legacy products with missing category/group are assigned to their standard group; custom groups and quotation snapshots remain intact. Seed rows are retained when rolling back the data-only migration to preserve references and user edits.

Runtime QuotingSeeder remains consistent, including reuse of a customized default group's identity/name/order/state, and adds no duplicates after the migration.

## Run once

From `C:/Source/TemplateLandingPage`, with the existing design-time migration connection configuration (or TEMPLATE_MIGRATION_CONNECTION_STRING):

```powershell
dotnet ef database update --project BE/src/Persistence --startup-project BE/src/API
```

An operator who already applied the group schema needs the same command; only unapplied migrations execute. Existing edited products and deliberately deleted rows are preserved, so the active list can contain fewer than eleven default rows in a customized database.

## Verification

- Actual CLI database update on a new, isolated PostgreSQL database, without runtime seed: COMBO sort 1 → six products; XIEN-QUE sort 2 → five products (`one-command-migration.log`, `one-command-verified.log`).
- Four migration integration scenarios passed: empty database; upgrade from pre-group schema with user edits, inactive/deleted products, NFD/whitespace/case-variant names and custom category; existing customized groups; rollback/reapply without duplicate or reset (`migration-tests.log`).
- Complete BE suite passed: 561 unit + 7 architecture + 59 integration = 627 tests (`backend-tests.log`). Five seeder tests, including the additional customized-default-group scenario, passed separately after the final runtime seed adjustment (`seeder-tests.log`).
- Backend solution build: zero warnings, zero errors (`backend-build.log`). git diff --check passed.
- EF-generated idempotent SQL for existing databases from the pre-group migration is available as `apply-catalog-and-groups.sql`; new databases should use the EF command above to apply the entire migration history.
- Only isolated local QA databases were migrated. No production deployment or user-database mutation. Owned test PostgreSQL service is stopped after verification.
