# Independent QA — SD5-014 Cash Input Kasir

Tanggal: 2026-10-09 (Asia/Jakarta)
Hasil: **PASS_SCOPED** untuk input uang, validasi nominal dan opt-in controlled Keypad.

## Integritas paket dan source

Verifier read-only Senior5 melaporkan 26 artefak frozen, 3 owned source checked, `failures: []`, dan `dependencyDrift: []`. Verifier tidak menyatakan QA/QC approval. Hashed source final:

| Source | SHA256 |
|---|---|
| `app/(no-layout)/(cashier)/cart/input-money.tsx` | `dde9381b7e6be9cc4ec0198ae8997b0f0bdb9a0a5c35db63fa9456a3e85ec492` |
| `schema/cashier/cash-input.ts` | `3b98ce420014de04c181bb4036fbd93c60ba0869e20b4ab993607d7391d3cdc0` |
| `components/common/Keypad.tsx` | `7caeae9015b269cd48ee3d9db360a4543913db7e55689d5b82433d57db0bd415` |

Three existing Keypad callers match the handoff fingerprints exactly: choose-store PIN `1f9da1aa…`, manage PIN `125f1209…`, refund PIN `393fb9e6…`. No source, dependency, caller, or developer packet was edited.

## Independent behavior replay

The new reviewer harness uses the actual input screen, React Hook Form, Zod resolver, cash schema, Keypad and monetary helper with React renderer. Native host controls, icons, expo-router navigation and focus are adapters. **24 behavioral checks passed, plus 3 caller-fingerprint integrity checks (27 checks total); 0 failed, 0 runtime errors or action rejections.** The actual default uncontrolled Keypad was rendered for one legacy sequence. Caller fingerprints only establish unchanged source bytes; they are not rendered PIN/refund flow regression tests. Behavior coverage includes:

- Prefill, backspace, digit append, C/empty and RHF value synchronization; exact amount, double submission and route parameters.
- Missing, explicit zero, negative, fractional, duplicate and unsafe totals; safe-integer maximum, unsafe received amount and the 16-digit keypad cap.
- Local relevant and irrelevant route parameter changes, global parameter isolation, stale callback rejection, blur/refocus, unmount, value cleared during async validation, and retry after navigation rejection.
- Default uncontrolled nullable Keypad behavior as one rendered check. Three unchanged PIN/refund caller hashes are integrity checks only; no full caller screen or navigation flows were tested.

Full details and captured outputs: `independent-results.json`, `independent.stdout.txt`, `adapter.cjs`, and `packet-verifier.stdout.json`. The original 144 developer checks were not rerun or added to this independent count.

## Limits and handoff

This checks frontend input and navigation into the existing confirmation route. It does not test or certify payment completion, server quote/total validation, backend/API, native keyboard/haptics, real Expo Router, HP, browser or Figma. A keyed route-param change remounts the form; keyboard/focus behavior on a device remains pending. Visual/Figma parity is not reviewed. The source preserves existing visual styles; `AGENTS_UI.md` semantic typography/color conformance remains a separate visual review.

This QA receipt is scoped behavior evidence, not QC approval or publication approval.

