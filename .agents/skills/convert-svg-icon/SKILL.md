---
name: convert-svg-icon
description: >-
  Use this skill when converting raw SVG code, SVGR output, or regular React Native SVG components
  into standardized Rapido custom icons using the createIcon scaffold.
---

# Convert SVG Icon to Standardized Rapido Icon

Use this workflow to transform raw SVG strings, Figma exports, or standard React Native SVG components into Rapido's standardized icon implementation.

## Conversion Rules

When converting an icon:
1. **Extract `viewBox`**: Read from the `<svg>` or `<Svg>` element (default to `"0 0 24 24"` if missing).
2. **Replace Static Colors with `currentColor`**:
   - Change hardcoded strokes (`stroke="#31BC4C"`, `stroke="#000"`, etc.) to `stroke="currentColor"`.
   - Change hardcoded fills (`fill="#2C2C2C"`, `fill="black"`, etc.) to `fill="currentColor"`.
   - *Exception*: Only preserve hardcoded hex colors if the icon is intentionally multi-colored with fixed brand colors.
3. **Strip Unnecessary Attributes & Containers**:
   - Remove `width`, `height`, `xmlns`, `xmlSpace` from the root `<Svg>`.
   - Remove redundant Figma bounding-box clip paths (e.g. `<ClipPath id="..."><Path d="M0 0H...V...H0z" /></ClipPath>`).
4. **Wrap with `createIcon`**:
   - Single path: pass `<Path ... />` directly to `path`.
   - Multiple paths / shapes: wrap in `<>...</>`.
   - Ensure imports: `import { Path } from "react-native-svg";` and `import { createIcon } from "./createIcon";`.
   - Export named icon and default export:
     ```tsx
     export const [Name]Icon = createIcon({ ... });
     export default [Name]Icon;
     ```
5. **Register in `components/icons/index.ts`**:
   Add the export:
   ```ts
   export { default as [Name]Icon } from "./[file-name]";
   ```
6. **Format with Biome**:
   Run `bunx biome check --write components/icons/[file-name].tsx components/icons/index.ts`.

---

## Examples

### Input Type A: SVGR Component (e.g. `wallet.tsx`)

#### Before:
```tsx
import * as React from "react"
import Svg, { Path } from "react-native-svg"

function SvgComponent(props) {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <Path
        d="M12.667 4.667v-2A.667.667 0 0012 2H3.333a1.333 1.333 0 000 2.667h10a.667.667 0 01.667.666V8m0 0h-2a1.333 1.333 0 100 2.667h2a.667.667 0 00.667-.667V8.667A.667.667 0 0014 8z"
        stroke="#31BC4C"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M2 3.332v9.333A1.333 1.333 0 003.333 14h10a.666.666 0 00.667-.667v-2.667"
        stroke="#31BC4C"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default SvgComponent
```

#### After:
```tsx
import { Path } from "react-native-svg";
import { createIcon } from "./createIcon";

export const WalletIcon = createIcon({
	name: "WalletIcon",
	viewBox: "0 0 16 16",
	path: (
		<>
			<Path
				d="M12.667 4.667v-2A.667.667 0 0012 2H3.333a1.333 1.333 0 000 2.667h10a.667.667 0 01.667.666V8m0 0h-2a1.333 1.333 0 100 2.667h2a.667.667 0 00.667-.667V8.667A.667.667 0 0014 8z"
				stroke="currentColor"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<Path
				d="M2 3.332v9.333A1.333 1.333 0 003.333 14h10a.666.666 0 00.667-.667v-2.667"
				stroke="currentColor"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</>
	),
});

export default WalletIcon;
```

---

### Input Type B: Raw SVG String (Figma "Copy as SVG")

#### Raw SVG:
```xml
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 4v16m8-8H4" stroke="#111827" stroke-width="2" stroke-linecap="round"/>
</svg>
```

#### Standardized Icon:
```tsx
import { Path } from "react-native-svg";
import { createIcon } from "./createIcon";

export const PlusIcon = createIcon({
	name: "PlusIcon",
	viewBox: "0 0 24 24",
	path: (
		<Path
			d="M12 4v16m8-8H4"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
		/>
	),
});

export default PlusIcon;
```

---

## Verification
1. Run `bunx biome check --write components/icons/[file-name].tsx components/icons/index.ts`
2. Run `bunx tsc --noEmit` to verify type integrity.
