import type {
	PurchaseRecord,
	StockKind,
	StockRecord,
} from "@/types/ui/inventory";
import type { InventoryMaterial } from "@/types/ui/inventory/material";

export type MovementType = "purchase" | "transfer" | "adjustment" | "recorded";
export type StockMovement = {
	id: string;
	itemId: string;
	name: string;
	sku: string;
	category: string;
	kind: StockKind;
	type: MovementType;
	label: string;
	reference: string;
	quantity: number;
	unit: string | null;
	store: string | null;
	createdAt: string | null;
	day: string | null;
	timestamp: number | null;
	closingStock: null;
	actor: string | null;
	note: string | null;
	fromStore: string | null;
	toStore: string | null;
	supplier: string | null;
	source: { operation: Exclude<MovementType, "recorded">; id: string } | null;
};

export const MOVEMENT_TYPES: { value: MovementType; label: string }[] = [
	{ value: "purchase", label: "Pembelian" },
	{ value: "transfer", label: "Transfer Stok" },
	{ value: "adjustment", label: "Penyusutan" },
	{ value: "recorded", label: "Catatan Bahan Baku" },
];

const textOrNull = (value: string | undefined) => value?.trim() || null;

function movementDate(value: string) {
	const match = /^(\d{4})-(\d{2})-(\d{2})T/.exec(value);
	const timestamp = Date.parse(value);
	if (!match || !Number.isFinite(timestamp)) return null;
	const [, year, month, day] = match;
	const calendar = new Date(`${year}-${month}-${day}T12:00:00`);
	if (
		calendar.getFullYear() !== Number(year) ||
		calendar.getMonth() + 1 !== Number(month) ||
		calendar.getDate() !== Number(day)
	)
		return null;
	return { createdAt: value, day: `${year}-${month}-${day}`, timestamp };
}

/** Read-only projection of existing session records, not a posted stock ledger.
 * Transfer legs belong to separate stores. Historical balances are unavailable.
 * Transaction item snapshots retain their original names and units.
 */
export function buildStockMovements({
	stockRecords,
	purchases,
	materials,
}: {
	stockRecords: readonly StockRecord[];
	purchases: readonly PurchaseRecord[];
	materials: readonly InventoryMaterial[];
}): StockMovement[] {
	const movements: StockMovement[] = [];
	for (const record of stockRecords) {
		const occurrences = new Map<string, number>();
		for (const line of record.lines) {
			const occurrence = occurrences.get(line.item.id) ?? 0;
			occurrences.set(line.item.id, occurrence + 1);
			if (!Number.isFinite(line.quantity) || line.quantity <= 0) continue;
			const date = movementDate(record.createdAt);
			const base = {
				itemId: line.item.id,
				name: line.item.name,
				sku: line.item.sku,
				category: line.item.category,
				kind: line.item.kind,
				type: record.operation,
				reference: record.reference,
				unit: textOrNull(line.item.unit),
				createdAt: date?.createdAt ?? null,
				day: date?.day ?? null,
				timestamp: date?.timestamp ?? null,
				closingStock: null,
				actor: textOrNull(record.createdBy),
				note: textOrNull(record.note),
				fromStore: textOrNull(record.fromStore),
				toStore: textOrNull(record.toStore),
				supplier: null,
				source: { operation: record.operation, id: record.id },
			};
			movements.push({
				...base,
				id: JSON.stringify([
					"stock",
					record.operation,
					record.id,
					line.item.id,
					occurrence,
					"out",
				]),
				label:
					record.operation === "transfer" ? "Transfer Keluar" : "Penyusutan",
				quantity: -line.quantity,
				store: base.fromStore,
			});
			if (record.operation === "transfer" && base.toStore) {
				movements.push({
					...base,
					id: JSON.stringify([
						"stock",
						record.operation,
						record.id,
						line.item.id,
						occurrence,
						"in",
					]),
					label: "Transfer Masuk",
					quantity: line.quantity,
					store: base.toStore,
				});
			}
		}
	}
	for (const record of purchases) {
		if (record.status !== "completed") continue;
		const occurrences = new Map<string, number>();
		for (const line of record.lines) {
			const occurrence = occurrences.get(line.item.id) ?? 0;
			occurrences.set(line.item.id, occurrence + 1);
			if (!Number.isFinite(line.quantity) || line.quantity <= 0) continue;
			const date = movementDate(record.createdAt);
			movements.push({
				id: JSON.stringify(["purchase", record.id, line.item.id, occurrence]),
				itemId: line.item.id,
				name: line.item.name,
				sku: line.item.sku,
				category: line.item.category,
				kind: line.item.kind,
				type: "purchase",
				label: "Pembelian",
				reference: record.reference,
				quantity: line.quantity,
				unit: textOrNull(line.item.unit),
				store: textOrNull(record.store),
				createdAt: date?.createdAt ?? null,
				day: date?.day ?? null,
				timestamp: date?.timestamp ?? null,
				closingStock: null,
				actor: textOrNull(record.receivedBy),
				note: textOrNull(record.note),
				fromStore: null,
				toStore: null,
				supplier: textOrNull(record.supplier),
				source: { operation: "purchase", id: record.id },
			});
		}
	}
	for (const material of materials) {
		const occurrences = new Map<string, number>();
		for (const movement of material.movements) {
			const occurrence = occurrences.get(movement.id) ?? 0;
			occurrences.set(movement.id, occurrence + 1);
			if (!Number.isFinite(movement.quantity) || movement.quantity === 0)
				continue;
			movements.push({
				id: JSON.stringify(["material", material.id, movement.id, occurrence]),
				itemId: material.id,
				name: material.name,
				sku: material.sku,
				category: material.category,
				kind: "material",
				type: "recorded",
				label: movement.label,
				reference: movement.reference,
				quantity: movement.quantity,
				// Captured movements have no date/store. Current catalog units are
				// not evidence of historical units after a catalog edit.
				unit: textOrNull(movement.unit),
				store: null,
				createdAt: null,
				day: null,
				timestamp: null,
				closingStock: null,
				actor: null,
				note: null,
				fromStore: null,
				toStore: null,
				supplier: null,
				source: null,
			});
		}
	}
	return movements.sort(
		(a, b) =>
			(b.timestamp ?? Number.NEGATIVE_INFINITY) -
				(a.timestamp ?? Number.NEGATIVE_INFINITY) || a.id.localeCompare(b.id),
	);
}

export type MovementFilters = {
	kind: StockKind;
	search: string;
	store: string;
	type: string;
	day: string;
};

export function filterStockMovements(
	movements: readonly StockMovement[],
	filters: MovementFilters,
) {
	const search = filters.search.trim().toLocaleLowerCase("id-ID");
	return movements.filter(
		(movement) =>
			movement.kind === filters.kind &&
			(!filters.store || movement.store === filters.store) &&
			(!filters.type || movement.type === filters.type) &&
			(!filters.day || movement.day === filters.day) &&
			(!search ||
				[
					movement.name,
					movement.sku,
					movement.reference,
					movement.store,
					movement.label,
				].some((value) => value?.toLocaleLowerCase("id-ID").includes(search))),
	);
}

export function formatMovementDay(day: string | null) {
	return day
		? new Date(`${day}T12:00:00`).toLocaleDateString("id-ID", {
				day: "numeric",
				month: "long",
				year: "numeric",
			})
		: "Tanggal belum tersedia";
}

export function formatMovementQuantity(movement: StockMovement) {
	return `${movement.quantity > 0 ? "+" : ""}${movement.quantity.toLocaleString("id-ID", { maximumSignificantDigits: 21 })} ${movement.unit ?? "(satuan belum tersedia)"}`;
}
