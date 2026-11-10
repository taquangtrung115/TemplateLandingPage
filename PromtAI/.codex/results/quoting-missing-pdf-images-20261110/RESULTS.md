# Quoting — PDF images, shared actions, loading and theme parity

Date: 2026-11-10
Workspace: C:\Source\TemplateLandingPage
Branch: feature/rsvp-management-and-customizer-enhancements
Baseline HEAD: b7c1315

## Delivered behavior

- Light and dark now inherit the same Gothic typography, dimensions and component rules. Light mode uses Neutral color tokens, with distinct column and skeleton surfaces. Font, heading bounds and support-column bounds are identical when toggling modes.
- RowActions shows the first two permitted actions directly. Only subsequent actions appear in the third overflow control, using Astryx DropdownMenuItem on desktop and the native menu bottom sheet on mobile. Disabled/conditional actions remain supported. Desktop action columns stay sticky; mobile record actions follow the record fields.
- Explicit Heroicons were added to all application Button call sites that lacked an icon, including confirmation actions. Native Astryx controls retain their own internal icons.
- Enum/status values use Astryx Badge, including the mobile product group/unit, support status and priority, quotation statuses and versions. Dashboard uses the shared quotation-status mapping, so rejected/cancelled records are no longer labeled as drafts.
- App startup uses a formal branded quotation-document animation. Route/content loading uses Skeleton. A shared Button adapter renders a skeleton in the icon slot while busy and prevents repeated submissions. Upload and preview loading also use skeletons. No Spinner imports or spin keyframes remain in application source. Reduced motion produces a static document; initialization does not wait for the animation.
- Remote image snapshots now load into the same byte dictionary used by HTML and PDF. HTML is self-contained; PDF contains image objects for external legacy photos as well as uploaded/bundled images. Product codes and current catalog images do not substitute for the quote's saved ImageUrl.
- Remote loading accepts approved HTTPS hosts on port 443 only, disables redirects, sends no storage credentials, bounds body size/pixels/output dimensions, deduplicates URLs and limits concurrency/document time and memory. Default external host: images.unsplash.com; a configured Supabase origin is also allowed. Additional trusted hosts use Quoting:Images:AllowedRemoteHosts. See FE_Quoting/README.md.
- Failed saved images return Quotation.ImageUnavailable for draft preview, saved preview and export. Export failure does not save/upload an incomplete quotation file.

## PDF evidence

The provided BG-202611-0009 PDF had two pages and zero embedded image objects. A parameterized database lookup ran inside an explicit READ ONLY transaction and was rolled back. All six saved photo URLs were external Unsplash URLs. No database writes or cloud uploads were performed during this diagnosis.

The actual saved quote and template were reconstructed in memory and exported locally using the updated service. All six remote URLs loaded successfully. The corrected PDF remains two pages and contains six image objects on page 1. Both rendered pages were visually inspected; the signature stays at the lower right on the final page. The existing old export is unchanged; after deploying the backend, create a fresh export to get the fix.

Local artifacts (ignored by git):
- BG-202611-0009-corrected.pdf
- BG-202611-0009-corrected.html
- provided-page-1.png / provided-page-2.png
- corrected-page-1.png / corrected-page-2.png
- corrected-inspection.json

## Verification

- dotnet build BE/TemplateLandingPage.sln --no-restore: success, zero warnings/errors.
- Backend unit suite: 586 passed; architecture suite: 7 passed.
- Integration suite: 61 distinct tests passed across the complete suite and the final affected-suite rerun. The full-flow fixture previously used a fictitious CDN photo; it now uses an existing bundled asset. The final image/full-flow run passed all 11 cases, including two new error/no-export cases. All other 50 integration cases passed unchanged in the complete run. All database tests used an isolated local PostgreSQL service and disposable databases, not the configured application database.
- Remote-image regression suite after strengthening the PDF image-dimension assertion: 23 passed.
- FE complete suite: 215 passed in 20 files. Final theme/actions rerun after the skeleton-token adjustment: 13 passed.
- FE production build: success. Existing bundle-size advisory remains (largest main chunk about 1.04 MB uncompressed); no build errors.
- Chromium: 320, 375, 414, 768 and 1440 px. WebKit: 375 and 414 px. Checked light/dark geometry parity, distinct support surfaces, no page overflow, two visible actions, no overflow for two actions, sticky desktop action cells, confirmation buttons with icons, and reduced/normal-motion startup behavior. Browser checks used isolated mocked API responses; they do not establish production deployment state. No browser runtime errors.
- RowActions unit tests cover desktop/mobile overflow from the third action, filtering hidden actions, callbacks and disabled/busy behavior.
- git diff --check: clean.

## Design record

Component scope; existing Astryx colors/fonts/spacing retained. Audience: sales staff; use: opening the quoting workspace; user-selected tone: formal. No page macrostructure, navigation or footer redesign. The new noninteractive loading component has light/dark and normal/reduced-motion variants; its applicable states were exercised in the browser. Hallmark critique: Philosophy 5, Hierarchy 4, Execution 4, Specificity 4, Restraint 5, Variety 4. No new image/GIF dependency, fake chrome, fabricated metrics, animated layout or font family was introduced. Source: AppLoading.jsx / AppLoading.css; rendering evidence is saved with chromium-/webkit- prefixes.

## Delivery state

Source changes are local and uncommitted. No deployment and no production migrations/data edits. This follow-up adds no new database migration. Existing group/catalog seed migrations remain unchanged. Temporary development, preview and local PostgreSQL services were stopped after verification; disposable test databases were removed by the fixtures.
