# Rapido Frontend — Copilot Instructions

Expo/React Native mobile app for Rapido (Ocean). Consumes the Laravel backend API.

## Stack
- **Expo SDK 53** with Expo Router (file-based routing)
- **React Native 0.79** + React 19
- **Styling**: NativeWind (Tailwind) + GlueStack UI
- **State**: TanStack React Query for server state, React Context for auth
- **Forms**: React Hook Form + Zod validation
- **Runtime**: Bun (preferred) or npm

## Project Structure

```
app/                    # Expo Router pages
├── (home)/             # Authenticated routes (tabs, home, add, manage)
├── (onboarding)/       # Guest flows (login, register, forgot-password)
├── (no-layout)/        # Standalone screens without nav
├── _layout.tsx         # Root layout (providers, QueryClient)
api/
├── axios.ts            # Axios instance with token interceptor
├── hooks/              # Custom hooks wrapping queries (useLoginRequest, etc.)
├── queries/            # Raw API functions (login, getUserData, etc.)
components/
├── common/             # Shared components (Text, AddToCart)
├── custom/{feature}/   # Feature-specific components
├── ui/                 # GlueStack primitives (button, input, modal)
schema/                 # Zod validation schemas per feature
constants/              # Keys, Colors, Config, static data
context/                # React contexts (AuthContext)
hooks/                  # Utility hooks (usePostRequest, useCustomRouter)
lib/                    # Utilities (api-utils, utils)
```

## Key Patterns

### API Layer
```typescript
// api/queries/auth.ts — raw API call
export async function login(data: LoginSchema): Promise<QueryResponse<LoginData>> {
  try {
    const response = await axios.post<APIResponse<LoginData>>('login', data);
    return response.data;
  } catch (error) {
    return createQueryFallback<LoginData>(error);
  }
}

// api/hooks/auth.ts — hook with form integration
export default function useLoginRequest(form: UseFormReturn<LoginSchema>) {
  const auth = useAuth();
  return usePostRequest(login, {
    onSuccess: (data) => auth.updateToken(data.token),
    onError: (error) => { /* map errors to form */ }
  });
}
```

### Validation Schemas
```typescript
// schema/onboarding/login.ts
export const loginSchema = z.object({
  email: z.string().min(1, { message: "Email tidak boleh kosong" }).email(),
  password: z.string().min(8, { message: "Password minimal 8 karakter" }),
});
export type LoginSchema = z.infer<typeof loginSchema>;
```

### Custom Text Component
Always use `components/common/Text` instead of RN's Text — supports font weights:
```tsx
<Text w="bold">Title</Text>
<Text w="medium">Subtitle</Text>
<Text>Regular body</Text>
```

### Error Handling
```typescript
import { createQueryFallback, mapFormErrors } from "@/lib/api-utils";

// In hook's onError:
if (error.status === 422) {
  mapFormErrors(form, error.errors);
}
```

## API Contract
Backend returns consistent envelope:
```typescript
{ success: boolean; status: number; message: string; data?: T; errors?: E }
```

## Environment
- **API URL**: Set in `constants/Others.ts` — update `BASE_URL` to your local IP for device testing
- **Auth token**: Stored in `expo-secure-store` under `Keys.AUTH_TOKEN`
- **Dev tools**: DevFab in root layout provides storage reset/logging actions

## Commands
| Task | Command |
|------|---------|
| Start dev | `bun dev` or `npx expo start` |
| Android | `bun android` |
| iOS | `bun ios` |
| Lint | `bun run lint` |

## Conventions
- All user-facing text is in **Indonesian**
- Route groups: `(home)` = authenticated, `(onboarding)` = guest
- Prefer `usePostRequest` for mutations, `useQuery` for fetches
- Keep API response parsing in `api/hooks/`, not in components
