import { createGetHook, createMutationHook } from "../factory";
import { UnitSchema } from "@/schema/add/unit";
import { UnitData } from "@/types/api/unit";

export const useUnitsQuery = createGetHook<UnitData[]>({
  path: "/contents/units",
  queryKey: ["units"],
  name: "units",
});

export const useUnitQuery = createGetHook<UnitData>({
  path: (id) => `/contents/units/${id}`,
  queryKey: (id) => ["units", id],
  name: "unit",
});

export const useUnitRequest = createMutationHook<UnitData, UnitSchema>({
  path: "/contents/units",
  method: "post",
  name: "unit",
  invalidateKeys: ["units"],
});

export const useUnitUpdateRequest = createMutationHook<UnitData, UnitSchema>({
  path: (id) => `/contents/units/${id}`,
  method: "put",
  name: "unit",
  invalidateKeys: (data, payload, id) => [["units"], ["units", id]],
});

export const useUnitDeleteRequest = createMutationHook<null, void>({
  path: (id) => `/contents/units/${id}`,
  method: "delete",
  name: "unit",
  invalidateKeys: ["units"],
});
