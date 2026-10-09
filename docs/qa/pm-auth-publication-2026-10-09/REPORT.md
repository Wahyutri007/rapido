# PM publication review: auth bootstrap lifecycle

9 October 2026. Approved for module-branch publication only: fix/auth-bootstrap-lifecycle, based on integration/expo-sdk57 fa860c91a7f230e18f1eb03fd321c5d434814cba. No merge to main.

Four production files are published together: api/hooks/auth.ts, context/AuthContext.tsx, app/index.tsx and hooks/useProtectedRoute.ts. Login blocks same-event duplicate submission and carries provider validation failures to the form. Provider bootstrap ignores inactive storage reads. Boot uses the current destination and a single valid splash completion. Guard cleanup invalidates pending redirects.

QC-AUTH-20261009-PASS-RECHECK closes QC-LOGIN-001/002 for this provider and the unchanged reviewed login hook. QC-BOOT and QC-GUARD approve the exact boot/guard hashes. The auth recheck supplements those decisions using the current combination; its reported389 checks include overlapping coverage and are not a project-completion metric. The historical Login CHANGES_REQUESTED decision is included without alteration, alongside its explicit closure.

PM verification: all36 auth QC artifact hashes match the manifest; approved/exercised source hashes match. Replay48 login/provider +41 boot +46 guard =135 passed, zero failures or unexpected runtime errors. Scoped ESLint of the four production files passed without warnings. All34 loaded-source comparisons from these replays match the isolated branch after CRLF/LF normalization. Exact production source hashes are preserved in Git. No package/dependency/lockfile changes.

The initial copied boot runner retained a fixed historical output directory. Its write reproduced identical historical bytes, verified against all36 manifest entries. The copy was corrected to use its own directory and41 checks were rerun there. Historical artifacts remain byte-identical; results are counted once. PM replay runners/results and branch-contracts.json are included here.

Replays use production modules with controlled memory HTTP/storage, native/router/RAF and presentation adapters; existing test dependencies were reused. They ran in the development workspace, followed by matching the loaded source bytes against the isolated branch. This is not an end-to-end run of the isolated checkout. Query retry/timing differs from the root configuration, and failures can retain stored tokens under the existing contract. Atomic cross-instance auth, actual backend, SecureStore persistence, full root navigation, Android/iOS and browser behavior remain integration gates.

The launcher/theme branch, unapproved cache changes, onboarding/transition changes, registration/OTP work and shared modal corrections are excluded. Production main, the active workspace index and running servers are preserved. No publication claim extends to unrelated findings or features.

Whitespace gate: production and PM files pass. The frozen QC boot-integration/check.cjs has one pre-existing whitespace-only line (65); it is retained to preserve its manifest hash. The copied PM runner has that whitespace removed. No production lint rule is suppressed.
