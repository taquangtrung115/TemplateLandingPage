# iOS 17 follow-up — 2026-11-09

- The user initially reported the old login UI/404 on the same iPhone in both standalone Safari and Facebook's embedded browser. The user subsequently confirmed that the fresh login URL displays the form normally on that affected phone.
- Previous testing changed the User-Agent on current WebKit, which was insufficient to establish iOS 17 compatibility. Installed an isolated Playwright 1.44.1/WebKit 17.4 test runtime under the ignored `runtime/` folder; the application's dependencies were not changed.
- Current production HTML loads `/assets/index-Ck0ddBbi.js`, `/assets/index-nspg1nS7.css` and `LoginPage-D4GjR6wb.js`. The login chunk has the new explicit layout and no old inline-size container rule. Response headers currently include `public, max-age=0, must-revalidate`.
- On WebKit 17.4, the production login renders without runtime errors at 414px and 375px. Form widths are 348px and 309px, respectively (`safari17-report.json`). This is closer engine coverage, not a physical iOS 17.7 test.
- Reintroducing the original `container-type: inline-size` and `repeat(auto-fit, minmax(260px, 1fr))` on the login grid in the same engine reproduces the collapse: form width changes from **348px to 0px**, and the form moves to y=6330 (`old-css-reproduction.json`, `reproduced-old-css-safari17.png`). This agrees with [WebKit issue 267525](https://bugs.webkit.org/show_bug.cgi?id=267525). The original browser-engine bug is reproduced; the subsequent fresh-URL confirmation below verifies the corrected form on the affected phone.
- The user opened `/login?verify=0715d09-ios17` on the affected phone and answered **“Form đã hiển thị bình thường”**. This confirms the corrected form on that device and supports the diagnosis that the previously opened URL retained an older document/resource set. The exact retention mechanism (HTTP cache, back/forward state or embedded-browser retention) was not directly inspected.
- Rechecked `/login` and the fresh URL after that confirmation: both return HTTP 200, the same ETag and `/assets/index-Ck0ddBbi.js`. The live header is still `public, max-age=0, must-revalidate`, so the additional local `no-store` configuration is not deployed yet.

## Additional source changes

- `FE_Quoting/vercel.json` now sets `Cache-Control: no-store, max-age=0` for SPA page responses. This prevents storing newly received app HTML; it cannot retroactively erase an already retained page.
- Excluded `/assets/` and `/api/` from both the header and the SPA fallback. An unavailable old JS asset previously returned HTTP 200 with `index.html`; asset failures will now retain real HTTP failure responses. Hashed asset caching is unaffected.
- Session storage/localStorage, JWT, cookies and login guards are unchanged. No automatic logout, user-data deletion or production deployment.
- Validated the config using Vercel's official `@vercel/routing-utils`: **14 path checks passed**, compiled routes have no errors (`vercel-route-validation.json`). All app routes map to `index.html` and receive the header; assets/API do neither. `git diff --check` passed.
- No application JS/CSS changed in this follow-up. The existing app unit suite was not repeated for this hosting-only configuration change.

## Outstanding

- Deploy the updated Vercel configuration before expecting the new response header or asset behavior on the live site.
- The corrected login form now has user-confirmed physical-device verification through the fresh URL. A production login submission and the old URL after the additional cache-policy deployment have not been verified on that phone.
