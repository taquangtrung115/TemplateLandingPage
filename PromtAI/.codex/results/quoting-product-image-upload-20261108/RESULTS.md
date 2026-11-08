# Product image upload — 2026-11-08

## Delivered behavior

- Product drawer uses Astryx FileInput: pick JPG/PNG on desktop/mobile, preview, remove, save. No URL entry or Supabase dashboard required for business users.
- Upload occurs only on save; a failed upload retains the selected file. A failed product save retains the uploaded URL for retry without a duplicate upload. Closing the drawer releases its local preview.
- Admin-only CQRS upload endpoint; actual file decoding, 5 MB/16 MP bounds, EXIF orientation, metadata removal, max 1600px output. Opaque immutable object names protect old quotation image snapshots when the catalog image changes.
- Private Supabase image bucket created automatically. Product images are served publicly through BE; quotation files retain their authenticated download flow. No key/provider credential in FE or public URLs.
- New secret keys use apikey; legacy service_role JWTs remain supported. Bucket lookup/create handles both HTTP 404/409 and Supabase's HTTP 400 wrapper with statusCode 404/409.
- HTML embeds uploaded bytes for offline use; PDF uses the same saved image. Reads deduplicate URLs, cap concurrency at four and total source bytes at 32 MB; storage failures do not silently substitute another image.
- No database schema change. Image URL remains in the existing product/quotation snapshot fields.
- Follow-up: first visit now defaults to light regardless of OS color scheme; a valid saved light/dark preference is preserved, including blocked/corrupt-storage handling.

## Backend operator setup

User confirmed Render has no storage URL/key configured. Set only on the backend service:

```text
Quoting__Images__SupabaseUrl=https://<project-ref>.supabase.co
Quoting__Images__SecretKey=<server-only secret from Supabase Settings > API Keys>
Quoting__Images__Bucket=product-images
```

Bucket is optional (default product-images). Redeploy updated BE/FE. Legacy service_role can instead use Quoting__Images__ServiceRoleKey. No secret should be put in chat, source control or VITE variables.

These image-specific keys leave the existing quotation file-storage configuration independent. Without image storage configuration, upload returns 503, preserves the form and never claims success or stores images on an ephemeral local disk.

## Verification

- `dotnet test BE/TemplateLandingPage.sln`: **548 unit + 7 architecture + 47 PostgreSQL/API integration = 602 passed** (final log: be-final-after-review.log).
- `dotnet build BE/TemplateLandingPage.sln --no-restore -t:Rebuild`: **0 warnings, 0 errors**.
- `dotnet publish BE/src/API/TemplateLandingPage.API.csproj -c Release --no-restore`: passed. Linux x64/arm64 native SkiaSharp assets are present in publish output.
- Infrastructure NuGet vulnerability audit: no vulnerable packages from configured sources.
- Final FE component suite: **200 passed**, lines **85.09%**, branches **70.31%** (fe-coverage-verified.log). Worker limit of two avoids oversubscribing this workstation's jsdom processes.
- `npm run build`: passed; existing large bundle warning remains.
- Browser verification uses the published Release backend, real isolated PostgreSQL database and the loopback Supabase Storage protocol fixture. No application API requests are mocked.
- Full 65-case browser run: 62 passed, 2 desktop skips for the mobile-only product-card test, 1 ambiguous customer-create locator on an empty list. Corrected the locator to select the header action; all five customer CRUD cases and five new first-visit theme cases then passed (10/10). Across the final 70 distinct cases: 68 passed, 2 intentional skips.
- Upload → product save → quote creation → catalog image replacement → old-image HTML/PDF download passed on desktop light/dark and mobile 320/375/390px. Existing quotation CRUD, VAT, support Kanban, offline HTML and accessibility checks also passed.
- Final canonical-secret-key fixture override verified by rerunning all eight product-image API integration cases successfully.
- Inspected a rendered exported PDF: Vietnamese accents and the uploaded photo display correctly. Extracted photo pixels match the HTML-embedded PNG exactly (254 × 173); the PDF title is searchable Vietnamese text.
- Review also caught PDF's old code-based photo fallback after removing an image; it now respects an empty image snapshot, with regression cases for null/empty/bundled-image URLs.
- Initial browser runs exposed Vite's first-time FileInput dependency reload and stale local Debug deps.json; a clean build fixed the local artifact and Release publish was used for final browser verification.

## Practical limits

- Supabase cloud/Render integration is **not verified**, because production has not been configured. Protocol fixture and unit tests cover server credential headers, private bucket creation, legacy status wrappers, immutable object storage and reads.
- Docker/Linux execution is not verified; local publish includes the required Linux native asset. Windows runtime exercised real image decode/export.
- Old external URLs remain supported as legacy catalog data; only uploaded managed images and original bundled source images are embedded offline.
- Image objects are intentionally retained when replaced/removed from catalog entries to preserve old quotations; there is no background retention cleanup in this change.
- No deployment, production migration or production data mutation performed.
- Owned API, Vite, protocol fixture and PostgreSQL processes stopped after verification; the isolated browser test database was removed. Existing user services were left alone.

## References

- [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys)
- [Supabase Storage error handler](https://github.com/supabase/storage/blob/master/src/http/error-handler.ts)
- [Supabase Storage error definitions](https://github.com/supabase/storage/blob/master/src/internal/errors/codes.ts)
