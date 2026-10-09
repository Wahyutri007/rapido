# Independent QA — PM-CASHIER-PRICE-001

Date: 2026-10-09 (Asia/Jakarta)
Result: **SCOPED QA PASS**

## Scope and source identity

The three frozen owned sources were read-only throughout QA. Hashes were checked after the replay and match the developer freeze signal.

| Source | SHA256 |
|---|---|
| `lib/cashier-cart-pricing.ts` | `9fef6562bbb467b33e1a9eebab08a79001e3f48a714059a64434690112b8a585` |
| `components/feature/cart/CartItem.tsx` | `8b6339038414b7fb32f5b4cd97285ca40c2b1898682cf0250c4f518712bf6f79` |
| `app/(no-layout)/(cashier)/cart/index.tsx` | `d8b959d26ef0919e3357bdb3d99950adf58293e98d2a69fda52a4f9b79c9f0a1` |

## Independent replay

`independent-cases.cjs` transpiles the helper and the real fixture modules with installed TypeScript. It loads `CART` from `constants/data/cart.ts`, with actual `menu.ts` and `variant.ts` imports. Only `@/assets/images` is stubbed with inert objects; pricing never reads the images. The harness asserts line totals Rp43,000 and Rp100,000 and subtotal Rp143,000. This is reproducible from the harness and source hashes below.

All 16 independently authored expectation cases passed: discount price zero and snapshot precedence, base price fallback, single/multiple variants, quantity one/zero/fractional, negative/fractional prices, NaN variant, safe-integer overflow in variant/base and line total, multiple groups, empty cart, and invalid nested item. Input immutability also passed.

Fixture and helper dependency fingerprints:

| Source | SHA256 |
|---|---|
| `constants/data/cart.ts` | `2e747f3d214dcddcf13ff04d5991f6bb94d9341f22872069a062d35321fe672f` |
| `constants/data/menu.ts` | `64ada92db5299f71efa241c36007abaa867fbbc839869be61b2f3ebc6a3adf19` |
| `constants/data/variant.ts` | `d0bde49ee7db71db0361d276daa56bdc959860a6b23a6e02b72ac63e7a3a7ce1` |
| `types/api/cart.ts` | `a9429d771ef6577224d1f5624e75c52c14881204ae5d1b78e4040bbb228d8960` |
| `types/ui/add/menu.ts` | `3f01ac7b039348ad18ed2716a1480044524a5b5f81b6f9e54f394686912dade4` |
| `types/ui/add/variant.ts` | `f794efff4d0fb6097a0b2df439cd838fbc2527139363f8b288cc02678e804495` |

## Screen and contract review

The subtotal helper returns `null` for malformed or unsupported money; no `formatRp(-1)` use appears in the three owned sources. Cart screen wiring uses subtotal only in the subtotal display. Tax and “Lainnya” remain `-`; both total displays remain `-`, with copy that total payment is unavailable. Neither payment button receives subtotal: “Bayar Sekarang” is a no-op and the existing “Bayar Nanti” path is explicitly mock behavior. No checkout, payment, API, backend, native, browser, or Figma success is claimed.

The helper rejects fractional Rupiah (`Number.isSafeInteger`) because the current display rounds to whole Rupiah; the source schema does not enforce integer currency values. Tax, fees, order-level discounts, and payable total remain unavailable because no checkout contract was present. No new pricing defect was found in the scoped source. This is a scoped behavior/source review only, not QC, PM approval, Figma parity, or integration certification.
