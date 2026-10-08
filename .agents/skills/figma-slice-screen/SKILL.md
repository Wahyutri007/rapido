---
name: figma-slice-screen
description: >-
  Use when the user wants to implement or finish a Figma screen/frame in Rapido
  and shares a Figma "Copy link to selection" URL or node ID. Covers the
  inspect -> clarify -> confirm -> build -> verify loop and how to map Figma to
  Rapido's design tokens, components, icons, and typography. Do NOT write code
  before the build plan has been confirmed.
---

# Figma UI Slicing (Rapido)

Implement a Figma frame with the project's tokens and components — never paste
Figma's generated code. Hand-map everything.

## Inputs

- **Node ID(s)** + the **target screen/file**. Node IDs in the URL use hyphens
  (`1234-5678`); convert to colons (`1234:5678`) for the API. If the target file
  is not stated, search the codebase and ask if ambiguous.
- **Figma file key**: `t5TOjRmAB5Z4mmGfoAXXx2` (file "Kasikoo v.1.0_09_09"). This
  same project was previously named **Ocean** and **Rapido** — treat a mention of
  any of these as this file.

## The loop

1. **Inspect** — render the frame(s) to an image and view it; then read the node
   data/styles for exact colors, typography, spacing, radius, and effects. Verify
   details (separators, edge cases) against the node data, not just the render.
2. **Clarify** — reply with a short **build plan + open questions** before any
   code (see checklist below).
3. **Confirm** — wait for the user's answers/confirmation.
4. **Build** — implement following the project conventions below.
5. **Self-review + verify** — re-read the diff against the node data, then run
   eslint / tsc / biome on the touched files.

## Clarify checklist (ask before coding)

- **States**: filled / empty / loading / error?
- **Reuse**: extend an existing component, or build new?
- **Data**: mock/static, or wired to the app's API layer (see
  `scaffold-entity-feature` skill)?
- **Assets/icons**: exports, or converted to icon components?
- **File location**: confirm the exact screen/component file.
- **Behavior**: what do interactive elements actually do?
- **Scope**: one frame, or a multi-screen flow?

## Project conventions while building

- **Colors** — Tailwind classnames first, never raw hex. Priority:
  semantic tokens (`text-foreground`, `text-muted`, `text-subtle`,
  `text-inverse`, `text-destructive`, `bg-surface-muted`, `border-border-muted`,
  `bg-background-success`) → palette scale (`text-primary`, `bg-success-50`,
  `text-error-600`) → `Colors.ts` **last**, only where classnames can't express a
  color (standalone vector/SVG icon `color` props). Full rules in `AGENTS.md`.
- **Text** — use the `Text` component's semantic props: `size`
  (`body`/`normal`/`small`) and `w` (`regular`/`medium`/`semibold`/`bold`). Never
  set raw `text-*` size classes for content text.
- **Icons** — register once in `components/icons/` and import from there. Convert
  raw SVG with the `convert-svg-icon` skill (`createIcon`, `currentColor`). Raw
  `react-native-svg` `<Svg>` is not NativeWind-interop'd — position it with the
  `style` prop, not `className`.
- **Reuse primitives** — extend `components/common/` / `components/custom/`
  (`Wrapper`, `CardList`, `NavList`, `SearchBar`, `Text`, `Form`, ...) via
  variants/props + composition (`children`/`render` escape hatches) rather than
  forking. Keep existing consumers compatible unless explicitly told to override.
- **Data** — static/mock inline in the screen unless told to integrate with the
  backend; format currency with `formatRp` (`lib/utils`).
- **Abstract repeats** — pull shared pieces into components/hooks, e.g.
  `FilterRow` (report screens), `AnimatedWrapper` + `ScrollToTopFab` +
  `useScrollProgress`.
- **Animation** — reanimated; programmatic scroll via `useAnimatedRef` +
  `withTiming` inside `useAnimatedReaction`, eased with
  `Easing.inOut(Easing.cubic)`.
- **Gluestack files** (`components/ui/*`) — edit only when necessary or asked;
  keep default behavior unchanged (shared app-wide). State the blast radius when
  touching shared components (`components/ui/*`, `components/custom/*`,
  `components/common/*`, `global.css`).
- **Strings** — UI text is Indonesian.

## Notes

- Pixel/spacing fidelity often needs one screenshot round-trip from the user
  (there is no simulator in this environment).

## Verify

```bash
bunx eslint <files>
bunx tsc --noEmit
bunx biome check --write <files>
```
