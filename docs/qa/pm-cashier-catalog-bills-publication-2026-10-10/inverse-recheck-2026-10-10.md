# Catalog Bills inverse recheck — 2026-10-10

Read-only candidate verification; scripts and this receipt are stored on D:. No source, Git, shared repo, build, browser, or package changes by this recheck.

## Bound candidate inputs

- `components/feature/cashier/bills/CatalogBillsScreen.tsx`: `90b10b1989ba8f4e1f20f22fe7962e0a2d1a79c1a4069ee64380abba3981c63a`
- `app/(no-layout)/(cashier)/catalog/index.tsx`: `d3805e893db070a0a2f5a7d4a46dde89eceeee568c3289ea51695c4c04668c8d`
- `app/(no-layout)/(cashier)/catalog/_layout.tsx`: `ee1599485248ed6378eae553b4f2f08e91039b89ab4b47678d7cf260191185c3`
- `components/common/SingleSelect.tsx`: `748acdfc32e58032ee0505afa0acaefb7fb6f808dc53eaf0b73e6d147ac79731`

## Results

- `compact-footer-inverse.cjs`: PASS, zero TSX parse diagnostics. Parsed AST of current screen equals the exact Before snapshot `before/compact-footer/CatalogBillsScreen.tsx` (`738c6a1a84a9fab0c36f805bff9d69b134daa1c7e5a1c6359f453276b9492665`) after removing only the added `footerPadding` declaration and the two `BottomActionBar` padding props, then restoring literal `32` in footer-height accounting. Normalized counts: one declaration, two props, one expression.
- `integration-inverse-corrected.cjs`: PASS. Existing catalog index and layout normalize to their exact Before snapshots (`e8b0ca2b884c6283379d3f6fbd86ce6970a23ba4d836bf662ce2c127db5ce544` and `2a7268551f11a43c069945501c35a1a82eeeb2f6c0832866cea3b557d3e14c07`); released `CatalogBillsHeader` body and entry label/route checks pass.
- `single-select-inverse.cjs`: PASS; current `SingleSelect` inverse matches published Before snapshot `ab53b5359a4637e3a276e402478c06c4713ffa6687719c49130629f63a13194b` after normalizing the default-false viewportSafe additions.

## Superseded attempts and limits

The unformatted intermediate screen hash `115cf316b7a2cbe4aefb9902d5ddb58263c5c15f263177565545512dfbefbb39` was superseded by the root-scoped formatter; final input is `90b10b…`. The initial compact proof draft had a RegExp helper error; the first formatted AST comparison also needed to represent the restored numeric literal as a TypeScript AST leaf. The final proof passed after those evidence-script corrections. These attempts did not alter source.

This receipt is source-level inverse evidence only. It does not claim physical browser QA, build/type QA, publication, or overall acceptance; root is running the fresh final candidate quality/build and browser checks.