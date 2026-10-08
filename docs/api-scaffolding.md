# API Scaffolding & Factory Documentation

This project uses a factory pattern to streamline API data fetching and mutations, reducing boilerplate.

## Overview

Instead of manually writing `axios` calls and wrapping them in `useQuery` or `useMutation`, you can use the factory functions in `api/factory.ts`.

### 1. New API Factory (`api/factory.ts`)
You can create hooks in a single line:

```typescript
// Create a GET hook
export const useUser = createGetHook<UserData>("/user", ["user-data"]);

// Create a Mutation hook (POST/PUT/DELETE)
export const useLogin = createMutationHook<LoginData, LoginSchema>("/login", "post");
```

### 2. Enhanced Base Client (`api/common.ts`)
The `api/common.ts` file includes helpers for all HTTP methods (`get`, `post`, `put`, `del`) with consistent error handling.

## Workflow: Adding a New API

To add a new feature (e.g., **Order Types**), follow this pattern:

1.  **Define Types** in `types/api/your-feature.ts`.
2.  **Create Hooks** in `api/hooks/your-feature.ts`:
    ```typescript
    import { createGetHook, createMutationHook } from "../factory";

    // GET Request
    export const useOrderTypes = createGetHook<OrderType[]>("/order-types", ["order-types"]);
    
    // POST Request
    export const useCreateOrderType = createMutationHook<OrderType, OrderTypeSchema>("/order-types", "post");
    
    // PUT Request (Dynamic path)
    export const useUpdateOrderType = createMutationHook<OrderType, OrderTypeSchema>("/order-types/${id}", "put");
    
    // DELETE Request
    export const useDeleteOrderType = createMutationHook<null, void>("/order-types/${id}", "delete");
    ```
3.  **Use in Component**:
    ```tsx
    const { data } = useOrderTypes();
    const { call: deleteOrder } = useDeleteOrderType();
    
    // Calling mutation
    deleteOrder(); 
    ```

## Customization

- **Custom Error Handling**: You can wrap the generated hook in your own custom hook if you need specific logic (like `api/hooks/auth.ts` does for login errors).
- **Dynamic Paths**: The `path` argument can be a function like `(args) => \`/users/${args.id}\`` if needed.
