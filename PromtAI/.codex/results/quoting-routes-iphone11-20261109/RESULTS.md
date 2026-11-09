# Quoting routes, authentication and iPhone 11 — 2026-11-09

## Findings

- Read-only checks of `https://quoting-beta.vercel.app` returned HTTP 200 for `/`, but HTTP 404 for `/login`, `/products` and `/quotations/create`. FE_Quoting used BrowserRouter without a Vercel SPA rewrite.
- The supplied physical iPhone screenshots show the login column collapsing and text wrapping character by character. Current WebKit did not reproduce that exact older-device collapse, but the original login used an inline-size container on the grid and placed the introduction above the form. In the iPhone 11 profile (414×715 viewport), the old submit button began at y=895, below the initial viewport.
- Visual review of populated quotations also found truncated unit/category labels, delete actions and summary product names. A page-level overflow assertion alone did not catch these.

## Changes

- Added `FE_Quoting/vercel.json` with the SPA rewrite recommended in [Vercel's Vite documentation](https://vercel.com/docs/frameworks/frontend/vite#using-vite-to-make-spas). Vercel Root Directory must be `FE_Quoting`.
- Replaced the login container-query layout with an explicitly sized CSS grid, one column at ≤640px. Form comes first; supporting content remains below it. Explicit widths/min-widths prevent a narrow intrinsic column. Mobile inputs use 16px text to avoid iOS focus zoom.
- Existing authenticated sessions opening `/login` now return to the application. Login waits for session restoration. Return locations preserve pathname/query/hash and reject external paths or login loops.
- Protected-route and backend authentication checks remain active. Anonymous and expired sessions must sign in, including when opening a deep link directly or refreshing it.
- Quotation product names, unit/group information and summary names wrap within available width. Delete actions use a complete short visible label, retain the product-specific accessible name, and get their own mobile row.
- Added iPhone 11 WebKit light/dark projects, route/authentication/mobile regression coverage and operator setup documentation.

## Verification

- Latest unit/component suite: **203 passed, 19 files** (`fe-verified.log`).
- Latest `npm run build`: **passed** (`fe-build-final.log`). Existing large-chunk warning remains. The local verification build uses `VITE_API_BASE_URL=/api/v1` and the loopback API proxy.
- Compiled production-build route matrix: **35 passed** across desktop light/dark, 320/375/390px mobile and iPhone 11 WebKit light/dark (`browser-final.log`). Covers all 10 protected routes, direct navigation, refresh, anonymous access, return after login, invalid-token 401, menu navigation, logout/back, drawers and four populated editor steps.
- After the additional editor label/wrapping corrections, focused checks at 320px and iPhone 11 passed (**2/2**, `browser-editor-final.log`).
- Latest compiled production-build regressions: **12 passed** on 320px and iPhone 11 WebKit light/dark (`browser-regression.log`): populated editor/drawers, create → customer price → edit → PDF download → approval, complete mobile product cards, and no serious/critical Axe violations on five core pages. This includes reruns of three editor cases from the 35-case matrix; counts are run totals, not 47 unique cases.
- Inspected login, populated editor and route screenshots. Final iPhone 11 login form width: **348px**; submit bounds: **y=427…463**, inside the initial 715px viewport (`login-iphone11-verified.png`).
- `git diff --check`: passed.
- Browser flows used the real API and the isolated local PostgreSQL database `quoting_routes_20261109`. No application API mocks or production database changes. The API built successfully at startup; no backend source changed.
- The first new test run exposed two test-harness issues: theme initialization also ran in the sandboxed preview iframe, and drawer bounds were measured mid-animation. Restricted initialization to the top frame and waited for settled drawer bounds; corrected runs passed.
- Owned API/Vite/preview processes were stopped, the isolated database was dropped, and the local PostgreSQL instance started for this task was stopped.

## Deployment and limits

- **Not deployed.** The live Vercel site has not received these source/configuration changes. Redeploy the frontend with Root Directory `FE_Quoting`; retain its backend `VITE_API_BASE_URL` configuration.
- WebKit with the iPhone 11 device profile is browser emulation. The exact iOS version in the user's screenshots and a physical iPhone replay after deployment remain unverified.
- No production migration, account change or data mutation was performed.

## Evidence

- `login-iphone11-verified.png`: final initial viewport, 414×715 CSS pixels.
- `final/playwright/`: the 10-route desktop/mobile screenshots and login screenshots.
- `regression/playwright/`: latest populated editor, product-card and PDF-flow artifacts.
- `production-login-webkit.png`, `before-report.json`, `before-webkit-login.png`: public/local baseline evidence (ignored artifacts).
