import { createGetHook, createMutationHook } from "../factory";
import { MenuSchema } from "@/schema/add/menu";
import { MenuData } from "@/types/api/menu";

export const useMenusQuery = createGetHook<MenuData[]>({
  path: "/contents/menus",
  queryKey: ["menus"],
  name: "menus",
});

export const useMenuQuery = createGetHook<MenuData>({
  path: (id) => `/contents/menus/${id}`,
  queryKey: (id) => ["menus", id],
  name: "menu",
});

export const useMenuRequest = createMutationHook<MenuData, MenuSchema>({
  path: "/contents/menus",
  method: "post",
  name: "menu",
  invalidateKeys: ["menus"],
});

export const useMenuUpdateRequest = createMutationHook<MenuData, MenuSchema>({
  path: (id) => `/contents/menus/${id}`,
  method: "put",
  name: "menu",
  invalidateKeys: (data, payload, id) => [["menus"], ["menus", id]],
});

export const useMenuDeleteRequest = createMutationHook<null, void>({
  path: (id) => `/contents/menus/${id}`,
  method: "delete",
  name: "menu",
  invalidateKeys: ["menus"],
});
