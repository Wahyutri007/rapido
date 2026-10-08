# Rapido Mobile UI Design System & Implementation Guide (`/frontend`)

> **AUTHORITATIVE DIRECTIVE FOR AI AGENTS**:
> This document is the single source of truth for all UI implementation, layout structuring, component reuse, and styling semantics in the Rapido mobile app (`/frontend`).
> Agents **MUST STRICTLY COMPLY** with the conventions, tokens, micro-patterns, and archetypes defined herein.

---

## 1. The Core Principles: Zero Semantic Overrides

### ⛔ 1.1 Semantic Primitives Stand on Their Own
Core shared components have built-in geometry, borders, backgrounds, shadows, and paddings.
- **`<Card>` is already complete**: It renders `rounded-xl shadow-main p-4 bg-white`.
  - ❌ **NEVER**: `<Card className="rounded-2xl bg-white shadow-main p-4 border border-gray-100">`
  - ✅ **ONLY**: Use `className` for flex layout: `<Card className="gap-4">` or `<Card className="flex-row items-center justify-between">`.
- **Form Controls are already complete**: `<Input>`, `<FormInput>`, `<SingleSelect>`, `<MultiSelect>` manage their own dimensions, borders, and backgrounds based on `size` and `variant`.
  - ❌ **NEVER**: `<Input className="h-11 rounded-lg border border-gray-200 bg-white px-3">`
  - ✅ **ONLY**: `<Input size="xl" variant="outline">` or `<FormInput placeholder="..." />`.
- **`<Button>` is already complete**: Sizing and colors are governed by `size="xl" | "lg" | "md" | "sm"`, `variant="solid" | "outline" | "link"`, and `action="primary" | "secondary" | "negative"`.

---

## 2. Design System Tokens & Sizing Geometry

### 2.1 The 4-Unit Spacing Grid (Strict Multiples of 4px)
All spacing must strictly adhere to the 4-pixel grid system ($n \times 4\text{px}$). 
> ⛔ **BANNED FRACTIONAL SPACING**: Do NOT use arbitrary `.5` steps like `gap-0.5` (2px), `gap-2.5` (10px), or `py-3.5` (14px). These are Figma vector artifact misinterpretations.

| Token | Pixels | Permitted Usage |
| --- | --- | --- |
| `gap-1` / `p-1` | 4px | **Standard multi-level text stacks** (title + subtitle, label + value), badge insets, helper text. NEVER use `gap-0.5`. |
| `gap-2` / `p-2` | 8px | Form item spacing, compact badge paddings, secondary button paddings. |
| `gap-3` / `p-3` | 12px | **Dense metric cards**, icon-to-text gaps in dense cards, list item row spacing, filter chips. |
| `gap-4` / `p-4` | 16px | **Standard screen content padding**, standard card padding, form card gap. |
| `gap-6` / `p-6` | 24px | Major section separation in reports, modal container padding. |
| `h-20` | 80px | Bottom clearance spacer for tab bars (`hasBottomBar`). |
| `h-32` | 128px | Bottom clearance spacer for sticky CTA buttons (`hasActionButton`). |

---

### 2.2 Token Conversion Table (Strict "Do This, Not That")
AI agents frequently default to raw Tailwind color names or font sizes. **Always use Rapido semantic tokens:**

| ❌ Strictly Forbidden (Raw / Non-Semantic) | ✅ Rapido Authoritative Standard | Context / Explanation |
| --- | --- | --- |
| `text-amber-700`, `text-amber-600`, `text-yellow-600` | `text-warning` | Warning state text |
| `bg-amber-100`, `bg-amber-50`, `bg-yellow-50` | `bg-warning-50` or `bg-warning-bg` | Warning pill or icon box |
| `text-zinc-500`, `text-zinc-400`, `text-gray-500`, `text-gray-400` | `text-muted` | Subtitles, hints, secondary text |
| `text-zinc-800`, `text-zinc-900`, `text-gray-900`, `text-black` | `text-foreground` | Primary text (default on `<Text>`) |
| `text-red-500`, `text-red-600` | `text-destructive` (or `text-error`) | Error / destructive text |
| `bg-red-50`, `bg-red-100`, `bg-error-50` | `bg-error-bg` (or `bg-error-50`) | Error / delete pill or icon box |
| `text-green-500`, `text-green-600`, `text-emerald-600` | `text-success` | Success / active state text |
| `bg-green-50`, `bg-green-100`, `bg-success-50` | `bg-success-bg` (or `bg-success-50`) | Success pill or icon box |
| `border-gray-100`, `border-gray-200`, `border-zinc-200`, `border-outline-100` | `border-border` or `border-border-muted` | Surface borders and dividers |
| `text-xs`, `text-sm`, `text-base`, `text-lg` | `<Text size="small" \| "normal" \| "body">` | **BANNED on `<Text>`** |
| `font-normal`, `font-medium`, `font-semibold`, `font-bold` | `<Text w="regular" \| "medium" \| "semibold" \| "bold">` | **BANNED on `<Text>`** |
| `style={{ fontFamily: FONT_NAMES.* }}` | `<Text w="...">` | Weight prop auto-binds font |

---

### 2.3 Corner Radii Hierarchy: Outer vs. Inner Elements
Avoid over-rounding inner elements. Follow this structural hierarchy:
- `rounded-xl` (12px): **Outer Screen-Level Surfaces** — `<Card>`, `<SearchBar>`, `<Input>`, `<SingleSelect>`, `<MultiSelect>`, `<CatalogItemCard>`, and actionsheet containers.
- `rounded-lg` (8px): **Inner Nested Elements** — Icon boxes (`size-10`, `size-9`), segmented tab containers and active tab pills, badges, secondary button chips, and nested surface caps (e.g. `rounded-t-lg`).
- `rounded-2xl` (16px): Strictly reserved for Actionsheet root drawers, large hero banners, or nested picker cards.
- `rounded-full` (9999px): Sticky CTA buttons (`BottomActionButton`), floating action buttons, pill tags, check indicator circles, user avatars.

---

### 2.4 Card Density, Compound Containers & Multi-Tier Patterns
- **Standard Card**: Always default to `<Card className="gap-4">` (inherits default `p-4`, `rounded-xl`, `bg-white`).
- **Dense List Container Card**: When housing a vertical list of rows with dividers, use `<Card className="py-1">` so child rows with `py-3` don't create double vertical padding at the edges.
- **Compound Container Card (Preserving Figma Hierarchy)**:
  - When the design groups multiple related blocks under a single section header (e.g. *Ringkasan Arus Kas* hosting both a list of activity rows and a 2-tier subcard), **do NOT split them into separate floating cards**.
  - Keep them grouped in a single `<Card className="gap-3.5">`.
  - Nested sub-surfaces should use standard semantic inner containers:
    ```tsx
    {/* Inner list box with border */}
    <View className="overflow-hidden rounded-xl border border-border-muted bg-white px-3.5 py-1">
      {/* List items with py-2.5 or py-3 and dividers */}
    </View>
    ```
- **Multi-Tier / Metric Summary Card**: When a card has distinct colored sections (e.g. blue header tier + white bottom tier), use `<View className="overflow-hidden rounded-xl border border-primary-200/50 bg-primary-100">`:
  - Header tier: `<View className="flex-row items-center gap-3 px-3.5 py-3">`
  - Bottom tier / columns: `<View className="flex-row items-center rounded-t-lg bg-white p-3">` (using `p-3` for dense horizontal balance).

---

### 2.5 Standard Full-Flush Segmented Tabs
For segmented toggle bars (such as in *Buku Besar* and *Arus Kas*), do NOT use capsule pill styling (`p-1`). Use the standardized full-flush container:
```tsx
<View className="flex-row items-center overflow-hidden rounded-xl border border-border-muted bg-white shadow-main">
  {TABS.map((tab, index) => {
    const isActive = activeTab === tab.key;
    const isNextActive = index + 1 < TABS.length && TABS[index + 1].key === activeTab;
    return (
      <React.Fragment key={tab.key}>
        <Pressable
          onPress={() => setActiveTab(tab.key)}
          className={cn(
            "flex-1 items-center justify-center py-3 transition-all active:opacity-75",
            isActive ? "rounded-lg bg-primary" : "bg-transparent",
          )}
        >
          <Text
            size="normal"
            w={isActive ? "bold" : "medium"}
            className={isActive ? "text-white" : "text-muted"}
          >
            {tab.label}
          </Text>
        </Pressable>
        {!isActive && !isNextActive && index < TABS.length - 1 && (
          <View className="h-5 w-px self-center bg-border-muted" />
        )}
      </React.Fragment>
    );
  })}
</View>
```

---

### 2.6 Golden Rule: Token Strictness vs. Layout Dogmatism
- **Tokens are Strict & Non-Negotiable**: Never use raw colors (`text-red-500`, `text-zinc-600`), never use forbidden arbitrary fractions (`gap-0.5`, `py-3.5`), and never override base primitives with redundant classes (`<Card className="rounded-2xl p-4 bg-white">`).
- **Layout Architecture Must Respect the Designer's Visual Intent**: Do NOT alter the visual hierarchy or decompose compound cards just because an inner box exists. If Figma groups elements inside one container card, preserve that container hierarchy faithfully using clean semantic `<View>` boundaries.

---

## 3. Screen Containers: `<Wrapper>` & `<AnimatedWrapper>`

### ⛔ Never Style `Wrapper` Directly with Arbitrary Classes
`Wrapper` is a composite component hosting a `KeyboardAvoidingView`, a safe-area aware scroll container, and built-in background (`bg-background`).
- ❌ **NEVER DO THIS**: `<Wrapper className="p-4 bg-gray-50 flex-col">`
  - In React Native, padding on `ScrollView` directly clips scrollbars, causes keyboard-offset jumping, and creates layout bugs.
- ✅ **DO THIS**: Use `contentContainerStyle` for padding and `gap`, and use `Wrapper`'s dedicated props.

### The 3 Standard Screen Container Patterns

#### Pattern A: Scrollable Form / Detail / Settings Screen
Use `<Wrapper>` with `hasActionButton` and `contentContainerStyle`:
```tsx
<Wrapper
  hasActionButton
  contentContainerStyle={{ padding: 16, gap: 16 }}
>
  <Card className="gap-4">
    {/* Form or Detail Content */}
  </Card>
</Wrapper>
```

#### Pattern B: List Screen with `<FlatList>`
Use `<Wrapper isNotScrollable>` so `<FlatList>` handles the scroll gestures cleanly:
```tsx
<Wrapper py={tw(4)} isNotScrollable>
  <View className="relative flex-1 px-4">
    <SearchBar ... />
    <FlatList
      className="mt-4 flex-1"
      contentContainerStyle={{ paddingBottom: 100, gap: 12 }}
      data={items}
      renderItem={({ item }) => <CatalogItemCard ... />}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={() => <SearchNotFound />}
    />
  </View>
</Wrapper>
```

#### Pattern C: Report / Feed Screen (with Scroll-to-Top FAB)
Use `<AnimatedWrapper>` with `contentContainerStyle`:
```tsx
<View className="flex-1">
  <AnimatedWrapper
    showScrollToTopFab
    hasBottomBar // or hasActionButton if screen has a bottom CTA
    fabBottomOffset={tw(24)}
    contentContainerStyle={{ padding: 16, gap: 16 }}
  >
    <FilterRow ... />
    <CardListSections sections={sections} />
  </AnimatedWrapper>
  <ReportActionButton ... />
</View>
```

---

## 4. Typography Standard (`<Text>` Component)

Always import `<Text>` from `@/components/common/Text`:
```tsx
import Text from "@/components/common/Text";
```

### Semantic Scale:
- `size="small"` (12px): Subtitles, badges, helper text, pill counts, timestamps.
- `size="normal"` (14px): Body copy, form labels, list item titles, dropdown trigger text.
- `size="body"` (16px, **default**): Card titles, modal headers, primary button labels.
- `w`: `"regular"` (default) | `"medium"` | `"semibold"` | `"bold"`.

```tsx
// ✅ Correct Usage
<Text size="normal" w="medium">Nama Kategori</Text>
<Text size="small" className="text-muted">Sub judul atau penjelasan</Text>
<Text size="body" w="bold">Judul Halaman</Text>

// ❌ FORBIDDEN: NativeWind class font-size / font-weight overrides
<Text className="text-sm font-semibold text-zinc-500">Wrong</Text>
```

---

## 5. One-Liner Micro-Patterns (Quick Reference)

### 5.1 Form Text / Number Field
```tsx
<FormField
  control={form.control}
  name="name"
  render={() => (
    <FormItem>
      <FormLabel required>Nama Produk</FormLabel>
      <FormControl>
        <FormInput placeholder="Contoh: Kopi Tubruk" />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### 5.2 Form Dropdown (SingleSelect)
```tsx
<FormField
  control={form.control}
  name="category_id"
  render={() => (
    <FormItem>
      <FormLabel required>Kategori</FormLabel>
      <FormControl>
        <FormSelect data={categoryOptions} placeholder="Pilih Kategori" />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### 5.3 Icon Container Box
```tsx
<View className="size-10 items-center justify-center rounded-xl bg-primary-50">
  <Feather name="tag" size={18} color={Colors.primary} />
</View>
```

### 5.4 Semantic Status Pills
```tsx
// Success
<View className="rounded-full bg-success-50 px-2.5 py-0.5">
  <Text size="small" w="medium" className="text-success">Aktif</Text>
</View>

// Warning
<View className="rounded-full bg-warning-50 px-2.5 py-0.5">
  <Text size="small" w="medium" className="text-warning">Menunggu</Text>
</View>

// Destructive
<View className="rounded-full bg-error-50 px-2.5 py-0.5">
  <Text size="small" w="medium" className="text-destructive">Dibatalkan</Text>
</View>
```

### 5.5 Section Header Inside Card
```tsx
<View className="flex-row items-center gap-3">
  <View className="size-9 items-center justify-center rounded-xl bg-primary-50">
    <Feather name="info" size={18} color={Colors.primary} />
  </View>
  <View className="gap-0.5">
    <Text size="normal" w="semibold">Informasi Dasar</Text>
    <Text size="small" className="text-muted">Lengkapi data berikut</Text>
  </View>
</View>
```

### 5.6 Key-Value Detail Row
```tsx
<DetailRow label="Nama Toko" value="Cabang Pusat" icon="store" />
<DetailRow label="Status" icon="check-circle" isLast>
  <View className="rounded-full bg-success-50 px-2.5 py-0.5">
    <Text size="small" w="medium" className="text-success">Aktif</Text>
  </View>
</DetailRow>
```

---

## 6. Generalized Screen Skeletons (High-Density Archetypes)

Use these clean, generalized skeletons when building any screen in Rapido.

### Skeleton 1: Form / Create / Edit Screen (`modify.tsx`)
```tsx
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import BottomActionButton from "@/components/common/BottomActionButton";
import Card from "@/components/common/Card";
import {
  Form,
  FormControl,
  FormField,
  FormInput,
  FormItem,
  FormLabel,
  FormMessage,
  FormSelect,
} from "@/components/common/Form";
import Wrapper from "@/components/common/Wrapper";
import type { EntitySchema } from "@/schema/add/entity";
import { entitySchema } from "@/schema/add/entity";

export default function EntityFormScreen() {
  const form = useForm<EntitySchema>({
    resolver: zodResolver(entitySchema),
    defaultValues: { name: "", category_id: "" },
  });

  const onSubmit = async (data: EntitySchema) => {
    // API mutation call here
  };

  return (
    <>
      <Wrapper hasActionButton contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Card className="gap-4">
          <Form {...form}>
            <FormField
              control={form.control}
              name="name"
              render={() => (
                <FormItem>
                  <FormLabel required>Nama</FormLabel>
                  <FormControl>
                    <FormInput placeholder="Masukkan nama..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category_id"
              render={() => (
                <FormItem>
                  <FormLabel required>Kategori</FormLabel>
                  <FormControl>
                    <FormSelect data={categoryOptions} placeholder="Pilih kategori" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Form>
        </Card>
      </Wrapper>

      <BottomActionButton onPress={form.handleSubmit(onSubmit)}>
        Simpan
      </BottomActionButton>
    </>
  );
}
```

---

### Skeleton 2: Catalog List Screen (`index.tsx`)
```tsx
import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import React from "react";
import { FlatList, View } from "react-native";
import BottomActionButton from "@/components/common/BottomActionButton";
import { SearchNotFound } from "@/components/common/DataPlaceholder";
import SearchBar from "@/components/common/SearchBar";
import Wrapper from "@/components/common/Wrapper";
import CatalogItemCard from "@/components/custom/CatalogItemCard";
import ItemActionSheet from "@/components/custom/ItemActionSheet";
import { Colors } from "@/constants/Colors";
import { route, tw } from "@/lib/utils";

export default function EntityListScreen() {
  const [search, setSearch] = React.useState("");
  const [selectedItem, setSelectedItem] = React.useState<any>(null);
  const [sheetOpen, setSheetOpen] = React.useState(false);

  return (
    <>
      <Wrapper py={tw(4)} isNotScrollable>
        <View className="relative flex-1 px-4">
          <SearchBar
            search={search}
            setSearch={setSearch}
            placeholder="Cari data..."
            withSort
            variant="light"
          />

          <FlatList
            className="mt-4 flex-1"
            contentContainerStyle={{ paddingBottom: 100, gap: 12 }}
            data={filteredItems}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <CatalogItemCard
                title={item.name}
                icon={<Feather name="tag" size={19} color={Colors.primary} />}
                onPress={() => router.push(route("/catalog/entity/detail", { id: item.id }))}
                onActionPress={() => {
                  setSelectedItem(item);
                  setSheetOpen(true);
                }}
              />
            )}
            ListEmptyComponent={() => <SearchNotFound />}
          />
        </View>
      </Wrapper>

      <BottomActionButton onPress={() => router.push(route("/catalog/entity/modify"))}>
        Tambah Data
      </BottomActionButton>

      <ItemActionSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={selectedItem?.name}
        entityName="Item"
        onViewDetail={() => router.push(route("/catalog/entity/detail", { id: selectedItem?.id }))}
        onEdit={() => router.push(route("/catalog/entity/modify", { id: selectedItem?.id }))}
        onDelete={() => { /* trigger delete modal */ }}
      />
    </>
  );
}
```

---

### Skeleton 3: Detail Screen (`detail.tsx`)
```tsx
import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import React from "react";
import Wrapper from "@/components/common/Wrapper";
import DetailBottomActions from "@/components/custom/DetailBottomActions";
import DetailRow from "@/components/custom/DetailRow";
import {
  CatalogDetailHeroCard,
  CatalogDetailSection,
} from "@/components/feature/catalog";
import { Colors } from "@/constants/Colors";
import { route } from "@/lib/utils";

export default function EntityDetailScreen() {
  return (
    <>
      <Wrapper hasActionButton contentContainerStyle={{ padding: 16, gap: 16 }}>
        <CatalogDetailHeroCard
          icon={<Feather name="tag" size={26} color={Colors.primary} />}
          title={data?.name ?? "-"}
          description="Deskripsi ringkas entitas"
        />

        <CatalogDetailSection title="Informasi Entitas">
          <DetailRow label="Nama" value={data?.name} icon="file-text" />
          <DetailRow label="Tipe" value={data?.type} icon="layers" isLast />
        </CatalogDetailSection>
      </Wrapper>

      <DetailBottomActions
        onEdit={() => router.push(route("/catalog/entity/modify", { id: data?.id }))}
        onDelete={() => { /* open delete modal */ }}
      />
    </>
  );
}
```

---

### Skeleton 4: Report / Analytics CardList Screen (`report/<feature>.tsx`)
```tsx
import React from "react";
import { View } from "react-native";
import AnimatedWrapper from "@/components/common/AnimatedWrapper";
import {
  CardListFilterSheet,
  CardListSections,
  useCardListFilter,
  type CardListSection,
} from "@/components/custom/CardList";
import { FilterRow, ReportActionButton } from "@/components/feature/reports";
import { tw } from "@/lib/utils";

export default function ReportScreen() {
  const [showActions, setShowActions] = React.useState(false);
  const sections: CardListSection[] = [
    {
      id: "sec-1",
      title: "Ringkasan",
      rows: [
        { label: "Pemasukan", value: "Rp 10.000.000", variant: "positive" },
        { label: "Pengeluaran", value: "Rp 2.000.000", variant: "negative" },
        { label: "Total Bersih", value: "Rp 8.000.000", important: true },
      ],
    },
  ];

  const { open, filterSections, filterSheetProps } = useCardListFilter(sections);

  return (
    <View className="flex-1">
      <AnimatedWrapper
        showScrollToTopFab
        hasBottomBar
        fabBottomOffset={tw(24)}
        contentContainerStyle={{ padding: 16, gap: 16 }}
      >
        <FilterRow onFilterPress={open} />
        <CardListSections sections={filterSections(sections)} />
      </AnimatedWrapper>

      <ReportActionButton isOpen={showActions} onOpenChange={setShowActions} />
      <CardListFilterSheet {...filterSheetProps} />
    </View>
  );
}
```

---

## 7. Pre-Flight UI Checklist

Before delivering any UI task, verify:
- [ ] **No redundant styles**: `<Card>`, `<Input>`, `<Button>`, and `<BottomActionButton>` have zero redundant utility classes.
- [ ] **Container constraint**: `<Wrapper>` / `<AnimatedWrapper>` is NEVER styled directly with `className="p-4 bg-gray-50"`. Padding is strictly configured via `contentContainerStyle={{ padding: 16, gap: 16 }}` or `py={tw(4)}`.
- [ ] **Sticky button spacer**: Container specifies `hasActionButton` if screen has `<BottomActionButton>` or `<DetailBottomActions>`.
- [ ] **FlatList constraint**: Container specifies `isNotScrollable` and FlatList uses `contentContainerStyle={{ paddingBottom: 100, gap: 12 }}`.
- [ ] **Typography**: All text uses `<Text>` from `@/components/common/Text` with semantic `size` and `w`. Zero instances of `text-xs`, `text-sm`, `text-base`, `font-*`, or `style={{ fontFamily }}`.
- [ ] **Semantic colors**: All warning colors use `text-warning` / `bg-warning-50` (never `amber-*`). All hints use `text-muted` (never `zinc-400`/`500`). All errors use `text-destructive` (never `red-*`).
- [ ] **Headers**: Handled at layout level (`_layout.tsx`), never inside screen files.
