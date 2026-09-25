# Handoff: backend security, interactions, catalog projections, and admin overview

## Implemented

- JWT signing secrets are required from configuration and must be at least 32 bytes. Every authenticated request rechecks that the account is active and not deleted, then replaces any token role with the current database role. Registered the `Admin` authorization policy and applied it to user management and master-data writes. Demo seed now runs only in Development when `SeedData:Enabled` is explicitly true. Removed the source-level JWT fallback and secret placeholder from appsettings.
- Exception middleware returns generic 409 for write conflicts, generic 400 for malformed HTTP/JSON requests, and generic 500 for unexpected failures. Server logs contain an operation ID and exception type, not exception details.
- Public template/category/menu/product reads filter inactive records. Catalog and category reads use no-tracking summary projections; template summaries omit `DefaultConfigJson`, and category template counts are queried in projection. Added a no-tracking template-name projection for customization detail queries.
- Community template sharing requires authentication and a source customization/version/category. The handler verifies ownership or Admin access, loads the selected immutable version snapshot, resolves the category and author from the database, and creates the community template from that snapshot.
- RSVP and guestbook writes require an explicit public version and enabled feature. Entries now store nullable version IDs for legacy compatibility; reads are paginated and version-scoped. RSVP contact data is owner/Admin-only; public guestbook responses expose only display fields. Admin overview reports database counts using aggregate queries.
- Admin template editing fetches the full template detail by ID before opening the JSON editor; catalog rows no longer need to contain configuration JSON.

## Main files

- API/auth/config: `BE/src/API/Program.cs`, `BE/src/API/Middlewares/ExceptionHandlingMiddleware.cs`, `BE/src/API/appsettings.json`, `BE/src/API/appsettings.example.json`, `BE/src/Infrastructure/Authentication/JwtSettings.cs`, `BE/src/Presentation/Authorization/AuthorizationPolicies.cs`.
- HTTP surfaces: `BE/src/Presentation/APIs/{Users,Templates,Categories,NavigationMenus,Products,Interactions}/...Api.cs` and `BE/src/Presentation/APIs/Admin/AdminOverviewApi.cs`.
- Interaction persistence and handlers: `BE/src/Domain/Entities/{RsvpEntry,GuestbookEntry}.cs`, `BE/src/Domain/Repositories/{IRsvpRepository,IGuestbookRepository}.cs`, `BE/src/Persistence/Configurations/{RsvpEntryConfiguration,GuestbookEntryConfiguration}.cs`, matching repository implementations, and `BE/src/Application/UseCases/V1/Interactions/`.
- Public catalog projection: `BE/src/Domain/ReadModels/{TemplateSummary,CategorySummary}.cs`, `BE/src/Contract/Services/V1/Templates/TemplateSummaryResponse.cs`, category/template contracts, repository interfaces/implementations, and query handlers.
- Admin overview: `BE/src/Domain/ReadModels/AdminOverviewCounts.cs`, `BE/src/Domain/Repositories/IAdminOverviewRepository.cs`, `BE/src/Persistence/Repositories/AdminOverviewRepository.cs`, `BE/src/Contract/Services/V1/Admin/`, and `BE/src/Application/UseCases/V1/Admin/Queries/GetAdminOverviewQueryHandler.cs`.
- Shared persistence registration: `BE/src/Persistence/DependencyInjection/Extensions/ServiceCollectionExtensions.cs`.
- Template edit detail load: `FE/src/pages/admin/AdminTemplatesPage.jsx`.

## Verification and review focus

- `dotnet build BE/src/API/TemplateLandingPage.API.csproj --no-restore` succeeded with 0 warnings and 0 errors. This compiles all runtime BE projects.
- `dotnet build BE/TemplateLandingPage.sln --no-restore` currently fails while compiling the existing UnitTests project (37 errors) because tests still use old interaction command/handler constructors, category/template repository methods, and template list return types. Runtime projects compile. These tests were left for the formal Tester pass rather than changing assertions to preserve old behavior.
- `git diff --check` reported no whitespace errors. No local API or real database was run.
- Tester should exercise dynamic role revocation/account deactivation; anonymous and non-admin master-data writes; active-only public reads; community sharing with owner/Admin and selected version; missing/private/feature-disabled interaction versions; per-version response isolation and RSVP PII access; malformed JSON 400 and conflict 409; and the Admin template edit detail request.
- The migration adding nullable interaction-version foreign keys/indexes is root-owned and should be checked together with the full PostgreSQL migration tests.
