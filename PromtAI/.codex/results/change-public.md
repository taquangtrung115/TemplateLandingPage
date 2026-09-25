# Public UI / render / export handoff

## Delivered

- Public pages load only the requested published customization/version, pass its root and version IDs into the renderer, and show a generic unavailable page on API/config errors. Share, copy, and QR links use the current slug and preserve an explicitly requested version number. Template previews load template detail and do not silently substitute a category template.
- Renderer now honors the optional `sectionOrder` allowlist while appending omitted supported sections, supports `center`/`left`/`split`/`editorial` hero layouts, and propagates optional section headings including service process headings. The custom extra section emits a validated `id`, enabling safe anchor CTAs such as `#catalog-details`.
- RSVP and guestbook forms submit the selected `customizationVersionId`, suppress preview writes, prevent repeat submission, preserve entered content on errors, and show success only after API success. Guestbook reads use version + page parameters and no longer seed sample entries.
- Added safe link/resource/style helpers and applied them to section CTAs, maps, images, audio, and theme values. Service/package/hero/booking CTAs render only for valid destinations; booking is a link and does not collect/contact-submit data.
- HTML export renders the shared page renderer with sanitized config, escapes title/content, absolutizes same-origin relative media, keeps response links limited to same-origin version URLs, and clearly states the network dependencies for media/fonts/Tailwind. Static Q&A answers remain visible and inert export-only controls are hidden.
- Catalog failures are displayed distinctly from empty search results. Quick preview fetches template detail by ID (catalog list projections omit `defaultConfigJson`) and reports missing/error config rather than rendering a category fallback. Sidebar format detection supports both `format` and `templateFormat`.

## Verification

- `npm run build` passed (Vite 6.4.3; 1,735 modules). Vite reports the main JS chunk is about 1.72 MB and over its 500 KB advisory threshold.
- `npm test`: 129 passed, 18 failed across 14 test files. Failures: `apiUnwrap` 1, `authContext` 4, `customizerDynamic` 1 (legacy exporter assertions for keyframes, `initScrollReveal`, and serialized `CONFIG`), `customizerDeferredHighlight` 3, `customizerGuestFlow` 9. The guest flow suite asserts old guest server writes and category fallback behaviors that this plan intentionally removes. Auth/storage and other failures still need the main tester to triage.
- `git diff --check` found no whitespace errors; Git emitted only existing LF-to-CRLF notices.
- No browser E2E, live API/auth, real PostgreSQL, or downloaded-file visual verification was performed in this subtask.

## Remaining checks

- Update the exporter test to assert static rendered content, escaping/safe URLs, no false response success, and external-network notice instead of the legacy embedded config/script contract.
- Run FE/API/browser integration checks against the versioned public endpoints and verify mobile rendering/exported files. Main branch still needs to resolve the 18 FE test failures before claiming the full plan acceptance criteria.

## Follow-up before formal test handoff

- Fixed the global mobile navigation overflow: the closed translated drawer is now clipped by a viewport-sized wrapper outside the blurred sticky header, preserving the open/close transition and full-height drawer. At a 390 px viewport, Playwright verified `documentElement.scrollWidth === 390` on `/templates` and `/drafts`, both with the menu closed and open; the open drawer filled the 844 px viewport height.
- Public RSVP and wishes are rendered and enabled only when the corresponding feature has `enabled === true`, matching backend interaction validation. Editor/template previews retain their preview-only explanatory state and do not write responses.
- Removed HomePage's hard-coded fallback templates and fake IDs. API failure now shows a retry state; a successful empty response shows an honest empty state. Real templates without a thumbnail use a neutral placeholder. The three-step copy now describes local draft, sign-in/server save, explicit version creation/publication, and HTML export with network-dependent media/fonts; corrected the fallback navigation targets for pricing and guide.
- Re-ran `npm run build` after these follow-up edits: passed (Vite 6.4.3, 1,741 modules). The existing large-chunk advisory remains. The previous full FE test failures listed above were not re-run in this final follow-up and remain for formal tester triage.
