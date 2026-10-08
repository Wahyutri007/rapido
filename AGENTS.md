# Rapido Mobile App (`/frontend`)

React Native (Expo) mobile app for Rapido. Uses expo-router for file-based routing.

## Context for Future Sessions

Read [`docs/PROJECT_CONTEXT.md`](docs/PROJECT_CONTEXT.md) when starting or resuming Rapido work. It records the architecture, reference files, documentation discrepancies, and Figma connection verified in this workspace. Treat it as an orientation snapshot; recheck the relevant source files and follow the user's current request and the authoritative guides below.

## Tech Stack & Commands

- Expo SDK 53 + React Native 0.79 + React 19 (React Compiler enabled)
- **expo-router v5** — file-based routing under `app/`
- **TypeScript** (strict) with `@/*` root alias
- **NativeWind v4 (TailwindCSS)** + **gluestack-ui** (`components/ui/`)
- **react-hook-form + zod** for forms (schemas in `schema/`)
- **zustand** (persisted via `expo-secure-store`) for client state
- **@tanstack/react-query v5** + **axios** (factory in `api/factory.ts`)
- **Biome** formatting & linting (tabs, double quotes — `bun lint`)

```bash
bun install && bun start
bun lint
```

## Routing & Layouts

- **App Flow & Navigation Map**: Consult [`docs/README.md`](docs/README.md) for the complete navigation tree, route directory, mode transitions, and auth lifecycle.
- **Documentation Synchronization (Mandatory)**: Whenever adding, moving, or removing routes, screens, or layouts, agents MUST keep [`docs/README.md`](docs/README.md) updated.
- **4 Modes**: Back Office (`app/(back-office)/`), Cashier (`app/(cashier)/`), Operator (`app/(operator)/`), Absence (`app/(absence)/`).
- **Modal / Non-tabbed flows**: `app/(no-layout)/`.
- **Headers belong at the layout level**: Configure headers in `_layout.tsx` using `JSStack.Screen` options (`header: () => <Header title="..." back />`). Never render `<Header>` inside screen views.
- **Nested layouts**: Parent `_layout.tsx` must register child feature folders with `options={{ headerShown: false }}` so the parent stack does not intercept or duplicate headers.

## UI Design System & Component Guidelines (Mandatory)

> ⚠️ **CRITICAL DIRECTIVE FOR AGENTS**:
> All detailed UI implementation standards, 4-unit spacing tokens, corner radii matrices, one-liner micro-patterns, anti-patterns, and complete copy-pasteable production boilerplates are codified in [`AGENTS_UI.md`](AGENTS_UI.md).
> **Agents MUST consult and strictly adhere to [`AGENTS_UI.md`](AGENTS_UI.md) before implementing or editing any screens or components.**

### Non-Negotiable Core UI Rules
1. **Semantic Primitives Stand on Their Own**: Core components (`<Card>`, `<Input>`, `<SingleSelect>`, `<Button>`, `<BottomActionButton>`) have built-in styling. Do NOT override them with redundant utility classes (`rounded-2xl`, `bg-white`, `p-4`, `shadow-main`, `border border-gray-100`, `h-11`). Only use `className` for flex layout (e.g. `className="gap-4"`).
2. **Strict Semantic Colors & Typography**: Use `text-foreground`, `text-muted`, `text-warning`, `text-destructive`, `text-success`, `border-border`, `bg-background`. NEVER use raw non-semantic Tailwind colors like `text-amber-700`, `bg-amber-100`, `text-zinc-500`, `border-gray-200`. For typography, ALWAYS import `<Text>` from `@/components/common/Text` with semantic props (`size="small" | "normal" | "body"`, `w="regular" | "medium" | "semibold" | "bold"`). **BANNED**: `text-xs`, `text-sm`, `text-base`, `font-*`, and `style={{ fontFamily }}`.
3. **Container Constraints (Never Style `Wrapper` Directly)**: NEVER style `<Wrapper>` or `<AnimatedWrapper>` directly with arbitrary classes (e.g. `className="p-4 bg-gray-50"`). Configure padding and gap via `contentContainerStyle={{ padding: 16, gap: 16 }}` or `py={tw(4)}`. For screens with sticky CTAs, pass `hasActionButton`. For `<FlatList>` screens, pass `isNotScrollable`.
4. **Forms & Inputs**: ALWAYS use react-hook-form + zod schemas with Gluestack controls (`<Form>`, `<FormField>`, `<FormItem>`, `<FormLabel>`, `<FormControl>`, `<FormInput>`, `<FormSelect>`). NEVER hand-roll raw `<TextInput>` inside custom bordered views.

### Component Reuse Directory (Mandatory Pre-Check)

**RULE: Before implementing ANY UI block, check existing shared components first. Never rebuild what already exists.**

| Need | Shared Component | Path |
| --- | --- | --- |
| **Search Input** | `<SearchBar>` | `@/components/common/SearchBar` |
| **Single-Selection / Picker** | `<SingleSelect>` | `@/components/common/SingleSelect` |
| **Multi-Selection / Picker** | `<MultiSelect>` | `@/components/common/MultiSelect` |
| **Screen Container** | `<AnimatedWrapper>` / `<Wrapper>` | `@/components/common/Wrapper` |
| **Content Card** | `<Card>` | `@/components/common/Card` |
| **Bottom Submit / Action Button** | `<BottomActionButton>` | `@/components/common/BottomActionButton` |
| **Detail Screen Actions (Edit/Delete)** | `<DetailBottomActions>` | `@/components/custom/DetailBottomActions` |
| **Standard Inline Button** | `<Button>` / `<ButtonText>` | `@/components/ui/button` |
| **Typography / Text** | `<Text>` | `@/components/common/Text` |
| **Detail Key-Value Row** | `<DetailRow>` | `@/components/custom/DetailRow` |
| **3-Action Sheet (Detail/Edit/Delete)** | `<ItemActionSheet>` | `@/components/custom/ItemActionSheet` |
| **Alert / Error Dialog** | `<AlertModal>` | `@/components/common/AlertModal` |
| **Success Dialog** | `<SuccessModal>` | `@/components/common/SuccessModal` |
| **Delete Confirmation Dialog** | `<DeleteConfirmModal>` | `@/components/common/DeleteConfirmModal` |
| **Image Uploader** | `<ImageUploader>` | `@/components/common/ImageUploader` |
| **Catalog Row Card** | `<CatalogItemCard>` | `@/components/custom/CatalogItemCard` |
| **Report CardList Suite** | `<CardListSections>`, `<CardListItem>` | `@/components/custom/CardList` |

- Generic reusable &rarr; `components/common/`
- Cross-feature / semi-specific &rarr; `components/custom/`
- Feature-only &rarr; `components/feature/<feature>/`
- Complete production templates for Catalog Lists, Forms, Details, and Reports &rarr; see [`AGENTS_UI.md`](AGENTS_UI.md).

## API & Data Layer

- Use factories in `api/factory.ts` (`createGetHook` / `createMutationHook`).
- Map 422 errors via `handleFormError` (`api/common.ts`).
- New backend entity / CRUD feature? Load the `scaffold-entity-feature` skill.
- Figma frame implementation? Load the `figma-slice-screen` skill.

## Workflow, Efficiency & Planning Output

### Planning Output Convention (Execution Profile)
Whenever formulating an implementation plan, ALWAYS conclude with an **Execution Profile & Operator Tips** section:
- **Recommended Effort Level**: `Low` | `Medium` | `High` with a 1-sentence rationale (e.g., *Low* for declarative UI and known schemas; *Medium* for tricky Zustand/React Query synchronization, financial calculations, or cross-field validation).
- **Suggested Batching / Chunking**: Recommend how the user should split implementation prompts to prevent rate limits and context bloat (e.g., Step 1: Schema & API hooks, Step 2: Screen UI & layouts).
- **Operator Tips & Watchouts**: 1–2 actionable reminders (e.g. layout registration options, specific shared components from the reuse table).

