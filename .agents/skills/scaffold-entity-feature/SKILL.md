---
name: scaffold-entity-feature
description: >-
  Use when adding a new backend-backed catalog entity / CRUD feature to Rapido
  (e.g. "add a new tax/unit/brand/<entity>", "add an endpoint for X", "scaffold
  CRUD for X"). Generates the full slice: types/api, api/hooks via the factory,
  zod schema, expo-router screens under app/(no-layout)/catalog/<entity>/ (list +
  create/edit form), plus the catalog entry-point and permission wiring. Not for
  changing one existing entity or data-only edits.
---

# Scaffold a Catalog Entity Feature

Rapido repeats the same 5-layer slice for every backend catalog entity (brands,
categories, units, taxes, order-types, payment-methods, discounts, promos,
vouchers, ...). **Use the existing entity `tax` (and `brand`) as the canonical
reference** — read those files before writing anything:
`types/api/tax.ts`, `api/hooks/taxes.ts`, `schema/add/tax.ts`,
`app/(no-layout)/catalog/tax/{_layout,index,modify}.tsx`.

Before building, confirm with the user: the entity name, its fields + validation,
the API path, the list-row display, the permission name, and whether it needs a
catalog tile (vs. an existing entry point). Then build layers **bottom-up**.

## Naming convention (follow exactly)

| Thing | Convention | Example (`tax`) |
| --- | --- | --- |
| Type file | `types/api/<singular>.ts`, type `<Pascal>Data` | `types/api/tax.ts` → `TaxData` |
| Schema | `schema/add/<singular>.ts`, `<x>Schema` + `<Pascal>Schema` | `schema/add/tax.ts` |
| Hooks file | `api/hooks/<plural>.ts` | `api/hooks/taxes.ts` |
| Route folder | `app/(no-layout)/catalog/<singular>/` | `app/(no-layout)/catalog/tax/` |
| API path | `/contents/<plural>` | `/contents/taxes` |
| Query key | `["<plural>"]` and `["<plural>", id]` | `["taxes"]` |

## 1. Types — `types/api/<singular>.ts`

Mirror the backend response shape. Include `id`, `created_at`, `updated_at` for
any backend entity. Keep a `...Payload` type only when the create/edit payload
differs from the full data.

```ts
export type TaxData = {
  id: string;
  name: string;
  rate: number;
  created_at: string;
  updated_at: string;
};
```

## 2. API hooks — `api/hooks/<plural>.ts`

**Never hand-write `useQuery`/`useMutation`.** Use `createGetHook` /
`createMutationHook` from `../factory`. Note the factory takes a **single options
object** (the examples in `docs/api-scaffolding.md` are stale — ignore them).

```ts
import type { TaxSchema } from "@/schema/add/tax";
import type { TaxData } from "@/types/api/tax";
import { createGetHook, createMutationHook } from "../factory";

export const useTaxesQuery = createGetHook<TaxData[]>({
  path: "/contents/taxes",
  queryKey: ["taxes"],
  name: "taxes",
});

export const useTaxQuery = createGetHook<TaxData>({
  path: (id) => `/contents/taxes/${id}`,
  queryKey: (id) => ["taxes", id],
  name: "tax",
});

export const useTaxRequest = createMutationHook<TaxData, TaxSchema>({
  path: "/contents/taxes",
  method: "post",
  name: "tax",
  invalidateKeys: ["taxes"],
});

export const useTaxUpdateRequest = createMutationHook<TaxData, TaxSchema>({
  path: (id) => `/contents/taxes/${id}`,
  method: "put",
  name: "tax",
  invalidateKeys: (_data, _payload, id) => [["taxes"], ["taxes", id]],
});

export const useTaxDeleteRequest = createMutationHook<null, void>({
  path: (id) => `/contents/taxes/${id}`,
  method: "delete",
  name: "tax",
  invalidateKeys: ["taxes"],
});
```

Key facts:

- **Dynamic GET** auto-disables until its arg is truthy.
- Every mutation returns `{ call, isLoading }`; `call()` resolves to
  `[data, error]` (never throws). Dynamic id is passed as the **second** hook arg
  (`useTaxUpdateRequest(undefined, params?.id)`) or as the second `call()` arg.
- `invalidateKeys` receives `(data, payload, args)` where `args` is the id — use
  the function form when you need to invalidate `["<plural>", id]` too.

## 3. Schema — `schema/add/<singular>.ts`

Zod schema with **Indonesian** error messages; export the inferred type.

```ts
import { z } from "zod";

export const taxSchema = z.object({
  name: z
    .string({ required_error: "Nama pajak tidak boleh kosong" })
    .min(1, "Nama pajak tidak boleh kosong"),
  rate: z.number({ required_error: "Persentase pajak tidak boleh kosong" }),
});

export type TaxSchema = z.infer<typeof taxSchema>;
```

## 4. Screens — `app/(no-layout)/catalog/<singular>/`

### `_layout.tsx`
`JSStack` with `ScaleBackTransition`, a `Header back` per screen, and a title that
switches between "Tambah"/"Edit" from the `id` param.

### `index.tsx` — list + delete
Reuse the common pieces instead of rebuilding them: `Wrapper` (`isNotScrollable`,
`py={tw(4)}`), `SearchBar` + `useSearch`, `FlatList` rows, `EditableActions`
(`@/components/feature/add/ActionButtons`), `LoadingPlaceholder` /
`SearchNotFound`, `useRefreshControl`, and `BottomActionButton` ("Tambah <X>").
Delete flow uses `DeleteConfirmModal` (confirm prompt), `SuccessModal` (success feedback),
and `AlertModal` (error/conflict dialogs), and calls `useXDeleteRequest(undefined, selected.id).call()`,
then invalidates `["<plural>"]`.

### `modify.tsx` — create/edit form
- `useForm<XSchema>({ resolver: zodResolver(xSchema) })`.
- Branch create vs. edit on `params?.id` (`useLocalSearchParams`).
- Prefill with `useXQuery(params?.id)` inside a `useEffect` when editing; show
  `LoadingPlaceholder` while `query.isEnabled && query.isLoading`.
- `Form`/`FormField`/`FormItem`/`FormLabel`/`FormControl`/`FormInput`/
  `FormMessage` from `@/components/common/Form` + gluestack `Button`.
- On submit: `handleFormError(error, form)` maps 422 field errors; otherwise show
  the generic error modal. Success opens the finish modal; on close invalidate
  `["<plural>"]` and `["<plural>", id]`, then `delayedBack()`.
- `ButtonGroup` pinned at `absolute bottom-8`, disabled while either request is
  `isLoading`.

## 5. Wiring

1. Register the route folder in `app/(no-layout)/catalog/_layout.tsx`:
   `<JSStack.Screen name="<singular>" options={{ headerShown: false }} />`.
2. Add a tile to the right group in `app/(back-office)/catalog/index.tsx`
   (`TRANSACTION_ITEMS` / `PRODUCT_ITEMS` / `OFFER_ITEMS`) with `id`, Indonesian
   `title`, `href: route("/catalog/<singular>")`, `image: ICONS.<x>`, and
   `permission`.
3. Add the permission string to `constants/Permissions.ts` (e.g.
   `MANAGE_<PLURAL>: "manage <plural>"`).
4. Add/find an icon in `assets/images/icons/` (tile artwork, `.jpg/.png`) and the
   `ICONS` map. For a vector icon use the `convert-svg-icon` skill instead.
5. Update `docs/README.md` to include the new catalog entity route in the navigation tree.

## Manage-settings variant (mock/static)

Older settings screens live in `app/(no-layout)/manage/<x>/` and read from
`constants/data/manage/<x>.ts` with `types/ui/manage/<x>.ts` — no API layer. Use
this shape only when the user asks for a static settings screen; otherwise prefer
the catalog + factory pattern above.

## Conventions checklist

- All user-facing strings in **Indonesian**.
- Navigate with `route()` from `@/lib/utils` (params → query string); use
  `router.push` / `delayedBack` from `@/components/custom/JSStack`.
- `Text` uses semantic `size` (`body`/`normal`/`small`) + `w`
  (`regular`/`medium`/`semibold`/`bold`), not raw `text-*` size classes.
- Colors via classnames (semantic tokens first) — never raw hex. See project
  `AGENTS.md`.
- Keep screens thin; extract reusable blocks into `components/feature/`.

## Verify

```bash
bunx eslint <files>
bunx tsc --noEmit
bunx biome check --write <files>
```
