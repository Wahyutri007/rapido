import { createGetHook, createMutationHook } from "../factory";
import { ExtraMenuSchema } from "@/schema/add/extra-menu";
import { ExtraMenuData } from "@/types/api/extra-menu";

export const useExtraMenusQuery = createGetHook<ExtraMenuData[]>({
  path: "/contents/extra-menus",
  queryKey: ["extra-menus"],
  name: "extra_menus",
});

export const useExtraMenuQuery = createGetHook<ExtraMenuData>({
  path: (id) => `/contents/extra-menus/${id}`,
  queryKey: (id) => ["extra-menus", id],
  name: "extra_menu",
});

export const useExtraMenuRequest = createMutationHook<
  ExtraMenuData,
  ExtraMenuSchema
>({
  path: "/contents/extra-menus",
  method: "post",
  name: "extra_menu",
  invalidateKeys: ["extra-menus"],
});

export const useExtraMenuUpdateRequest = createMutationHook<
  ExtraMenuData,
  ExtraMenuSchema
>({
  path: (id) => `/contents/extra-menus/${id}`,
  method: "put",
  name: "extra_menu",
  invalidateKeys: (data, payload, id) => [["extra-menus"], ["extra-menus", id]],
});

export const useExtraMenuDeleteRequest = createMutationHook<null, void>({
  path: (id) => `/contents/extra-menus/${id}`,
  method: "delete",
  name: "extra_menu",
  invalidateKeys: ["extra-menus"],
});
