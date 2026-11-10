# FE_Quoting — groups, price-list options, responsive editor and export images

Date: 2026-11-10. Workspace: C:/Source/TemplateLandingPage.
Branch: feature/rsvp-management-and-customizer-enhancements. Local implementation only.

## Delivered

- Product-group catalog at `/product-groups`: code, name, description, sort order, active state; authenticated reads and Admin-only writes. Defaults: A/ DÒNG COMBO, B/ DÒNG SẢN PHẨM XIÊN QUE. Soft deletion is blocked while a nondeleted product references the group.
- Product editor selects groupId from the catalog. Group name and order are returned with products. Inactive groups are excluded from new selection; existing assignments can be maintained. Older product updates that omit a group retain their current group.
- Quotation editor searches customers/templates/products in pickers; adding a group includes all its active products without duplicate rows or incrementing quantities. Catalog price and editable quotation price remain separate. Group name/order are snapshotted on quotation lines.
- New quotations default showDiscount, showQuantity, showSubTotal and showGrandTotal to false, as confirmed by the user. Each flag can be enabled independently. Hidden quantity uses 1 and hidden discount is omitted from the submitted pricing. The grand-total switch also controls the line-total column.
- Saved quotation details, draft preview, HTML and PDF honor the flags. Existing quotation flags remain true after migration. An older draft-edit request that omits the flags preserves the saved choices.
- Confirmation-step preview uses the actual backend export renderer without inserting a quotation, writing history or reserving a quotation number. Pinned template versions survive draft editing.
- Wizard progress stays below the app header, navigation actions stay at the viewport bottom. Mobile uses card records and compact bottom-sheet pickers/actions; desktop uses tables with right-pinned action menus. Desktop actions use Astryx DropdownMenuItem. Mobile list metrics use a compact two-column arrangement.
- Date, sales-department title and signing note sit at the lower right of the final PDF page. The default six-Combo price list fits on one A4 page, including signature; the 11-product example occupies two pages.
- Fixed the additional image mismatch reported by the user: PDF formerly inferred a bundled photo from ProductCode, even when the quotation line referenced a different ImageUrl. HTML/PDF now share URL-based bundled-image resolution and retain uploaded-image snapshot behavior. Unsupported/removed images never silently become another product's bundled photo.

## Verification

- Final backend suite: 561 unit + 7 architecture + 55 PostgreSQL/API integration = **623 passed** (`test-be-image-final.log`). Final backend build: **0 warnings, 0 errors** (`build-be-final.log`). Release publish passed (`publish-final.log`).
- Final frontend suite: **207 passed / 19 files** (`test-fe-final-verified.log`). Final Vite build passed (`build-fe-final.log`); the existing >500 kB bundle warning remains. This app is JavaScript and has no tsc script.
- Image regression suite: **25 passed**, including all 11 catalog photos with deliberately mismatched product codes and a custom SKU (`test-image-source.log`).
- Real API/web/PDF comparison: fetched every bundled photo through the running HTTP backend; all 11 HTTP image byte strings appeared unchanged in HTML, and decoded PDF image pixels matched their corresponding HTTP image pixels. The test intentionally assigned different product codes (`verify-image-identity.py`, `image-identity-verified.json`).
- Browser matrix: light/dark at 320, 375, 414, 768 and 1440px plus group/product CRUD. Ten cases passed in the matrix run; the two desktop cases passed after correcting sidebar-vs-footer selectors and removing a hardcoded seed-count assumption (`browser-groups-final.log`, `browser-desktop-final.log`).
- Existing browser regressions: 14 passed, one intentional desktop skip for the mobile-only test. The mobile customer action case passed after switching compact actions to a bottom sheet (`browser-regression.log`, `browser-mobile-menu-final.log`). Full quotation custom-price/edit/PDF/approval, generic quotation, VAT exports, list screens and accessibility checks passed on desktop/mobile.
- Safari iPhone: group selection/preview/create passed against the production build; group/product creation also passed (`browser-webkit-final.log`, earlier `browser-webkit.log`). A first development-server cold load exceeded the test's short heading wait; the production-build replay passed.
- Migration verified on a separate PostgreSQL database containing old-schema rows. Combo, custom free-text and missing categories became proper group references. Existing prices and inactive state stayed intact; the old quotation kept all four display flags true (`migration-verified.log`).
- Visually inspected rendered PDF pages, Vietnamese text, images, conditional columns and signature placement. Representative exports: `quotation-default.pdf` and `quotation-all-options.pdf`. Diagnostic image-identity PDF is QA data, not a customer quotation.
- `git diff --check` passed. No secrets added to frontend/source. No production deployment or production database write.

## Deployment

Apply `20261110092605_AddQuotingProductGroupsAndDisplayOptions` through the normal backend migration process before deploying the updated backend and frontend together. The new FE requires product-group and draft-preview endpoints. Existing published services were not changed by this task. Old exported files remain historical bytes; export a new file after deploying the renderer fix to obtain corrected image selection.

Owned browser-test servers and the isolated PostgreSQL service are stopped after verification. QA databases are separate from user/production databases.
