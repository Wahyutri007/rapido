export const Permissions = {
  // * Assignable Permissions
  MANAGE_REPORTS: "manage reports",
  MANAGE_MENUS: "manage menus",

  // Catalogs
  MANAGE_UNITS: "manage units",
  MANAGE_VARIANTS: "manage variants",
  MANAGE_CATEGORIES: "manage categories",
  MANAGE_BUNDLINGS: "manage bundlings",
  MANAGE_PROMO: "manage promo",
  MANAGE_VOUCHERS: "manage vouchers",
  MANAGE_DISCOUNTS: "manage discounts",
  MANAGE_BRANDS: "manage brands",

  // Others
  MANAGE_STORE: "manage store",
  MANAGE_EMPLOYEES: "manage employees",
  MANAGE_PRINTERS: "manage printers",
  EXPORT_DATA: "export data",
  MANAGE_TAXES: "manage taxes",
  MANAGE_EXTRA_COSTS: "manage extra costs",
  MANAGE_PAYMENT_METHODS: "manage payment methods",
  MODIFY_RECEIPT: "modify receipt",
  ARTIFICIAL_INTELLIGENCE: "artificial intelligence",
  MANAGE_OPERATIONAL: "manage operational",
  MANAGE_CUSTOMERS: "manage customers",
  MANAGE_ORDER_TYPES: "manage order types",

  // Inventory
  MANAGE_SUPPLIERS: "manage suppliers",
  MANAGE_PURCHASE_ORDERS: "manage purchase orders",
  MANAGE_STOCK_ADJUSTMENTS: "manage stock adjustments",
  MANAGE_STOCK_TRANSFERS: "manage stock transfers",
} as const;

export type Permission = (typeof Permissions)[keyof typeof Permissions];
