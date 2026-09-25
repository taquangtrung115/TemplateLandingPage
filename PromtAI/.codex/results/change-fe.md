# FE core handoff

Implemented the frontend portion of the approved versioned publishing flow. Backend and public renderer/exporter changes remain owned by the other agents.

## Changed

- Added an IndexedDB draft store with per-draft IDs, guest/user scoping, migration of existing `guest_draft_*` localStorage records, revision compare-and-swap, duplicate/delete operations, and cross-tab change notifications. Generated IDs remain UUIDv4 on browsers without `crypto.randomUUID`.
- Made auth storage reads/writes resilient to blocked or unavailable localStorage, retained sessions in memory for the current tab, preserved pending auth actions with full path/query/hash, and stopped the Axios layer from clearing a session on arbitrary request failures.
- Reworked the customizer around local autosave after 500 ms, explicit server draft save, explicit immutable version creation, publication controls, private preview, continuation from a version, community sharing from a saved version, and 401/409/network conflict states. Storage failure keeps an editable in-memory draft and marks it unsaved.
- Added `/drafts` for scoped local drafts and `/products` for the existing products page. Added paged version loading to the editor and My Sites, and added private version preview/edit actions to My Sites.
- Added admin overview API usage and the ownerless site assignment page. Logout waits for the active editor draft flush before clearing the session.
- Added public customization API helpers requested by the public UI agent. Preserved that agent's separate CTA/section-heading edits in the shared sidebar file.
- Kept public version state separate from main-version state: any non-main version can become primary, and any public version can be unpublished independently. Version copy actions convert relative API URLs to absolute links.
- Fixed save-time 401 handling to persist the requested save action before login, flush before continuing from a snapshot, and normalize root-relative community thumbnail URLs for the URL input.

## Validation and lifecycle notes

- `npm run build` passes in `FE` after the follow-up fixes. Vite reports the large main bundle warning (about 1.73 MB minified); this does not fail the build.
- No browser E2E or live FE/API integration run was performed in this ownership slice. The root agent reports the backend real-API smoke passed; the formal tester should exercise both guest and authenticated flows.
- Same-origin link navigation and the toolbar Back action await the local flush. Browser Back/pagehide cannot be paused by the current `BrowserRouter` setup; those lifecycle handlers start a flush, while `beforeunload` warns when content is dirty. Verify this behavior in the formal browser run.
- If IndexedDB is unavailable, an initial template remains editable/exportable in memory and is clearly marked unsaved, but that memory cannot survive a full reload. The page warns before unload while changes remain dirty.
- If localStorage is unavailable, auth and pending-action fallbacks work for the current SPA tab; a hard reload cannot preserve those in-memory fallbacks.
