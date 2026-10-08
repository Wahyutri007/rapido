import { clsx, type ClassValue } from "clsx";
import { Href } from "expo-router";
import { twMerge } from "tailwind-merge";

export * from "./dates";
export * from "./colors";
export * from "./styles";
export * from "../haptics";

const TW_UNIT_BASE = 4;
const TW_BASE_SIZE = 16;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convert tailwind-style units to px string for React Native styles
export function tw(value: number | string): number {
  const parsedValue = typeof value === "number" ? value : parseFloat(value);
  return isNaN(parsedValue) ? 0 : parsedValue * TW_UNIT_BASE;
}

/**
 * @description Rescale units from 16px base to 14px base to match nativewind sizing with gluestack-ui
 * @deprecated App now natively uses 16px base, this function is no longer needed
 */
export function rescale(size: number) {
  return size * (16 / 16);
}

export async function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function scrollArrayIndex<T>(array: T[], index: number) {
  if (index < 0) {
    return array[0];
  } else if (index >= array.length) {
    return array[array.length - 1];
  }
  return array[index];
}

export function parseNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return isNaN(value) ? 0 : value;

  const stringVal = value.toString().trim();
  if (!stringVal) return 0;

  // Remove non-numeric characters except for negative sign
  const isNegative = stringVal.startsWith("-");
  const clean = stringVal.replace(/[^0-9]/g, "");
  if (!clean) return 0;

  const parsed = parseInt(clean, 10);
  if (isNaN(parsed)) return 0;

  return isNegative ? -parsed : parsed;
}

export function formatRp(value: number | string): string {
  const numberValue = typeof value === "number" ? (isNaN(value) ? 0 : value) : parseNumber(value);

  return numberValue.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });
}

export function parseRp(value: string | number | null | undefined, withPrefix = true): string {
  if (value === null || value === undefined || value === "") {
    return withPrefix ? "Rp 0" : "0";
  }

  const numberValue = typeof value === "number" ? value : parseNumber(value);
  const formatted = formatRp(numberValue);

  if (!withPrefix) {
    return formatted.replace(/Rp\s?/, "").trim();
  }

  return formatted;
}

export function numberToString(value: number, defaultValue: number = 0): string {
  if (isNaN(value)) {
    return defaultValue.toString();
  }

  return value.toString();
}

export function route(
  path: string | Href,
  params?: Record<string, string | number>,
): Href {
  let routePath = path.toString();

  if (params) {
    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");
    routePath += `?${queryString}`;
  }

  return routePath as Href;
}

export function toGrid(
  containerWidth: number = 0,
  columns: number = 1,
  gap: number = 0,
) {
  return (containerWidth - gap * (columns - 1)) / columns;
}
