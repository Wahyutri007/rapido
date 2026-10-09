import type { Account } from "@/types/ui/accounting/account";

export const UNKNOWN_CURRENCY = "__unknown__";
export const accountCurrency = (account: Account) =>
	account.currency.trim().toUpperCase() || UNKNOWN_CURRENCY;
export const currencyLabel = (currency: string) =>
	currency === UNKNOWN_CURRENCY ? "Tanpa mata uang" : currency;

export function balanceCurrencies(accounts: Account[]) {
	return [...new Set(accounts.map(accountCurrency))]
		.sort()
		.map((value) => ({ value, label: currencyLabel(value) }));
}
// Work in hundredths and reject unsupported precision instead of hiding differences.
export function balanceMinor(value: number): number | null {
	if (!Number.isFinite(value) || value < 0) return null;
	const scaled = value * 100;
	const rounded = Math.round(scaled);
	if (!Number.isSafeInteger(rounded) || rounded / 100 !== value) return null;
	return rounded;
}
export function trialBalance(
	accounts: Account[],
	currency: string,
	search = "",
	classification = "",
) {
	const query = search.trim().toLocaleLowerCase("id-ID");
	const rows = accounts
		.filter(
			(a) =>
				accountCurrency(a) === currency &&
				(!classification || a.classification === classification) &&
				(!query ||
					[a.code, a.name, a.classification, a.subClassification].some((text) =>
						text.toLocaleLowerCase("id-ID").includes(query),
					)),
		)
		.map((account) => ({
			account,
			debitMinor: balanceMinor(account.debit),
			creditMinor: balanceMinor(account.credit),
		}))
		.sort(
			(a, b) =>
				a.account.code.localeCompare(b.account.code, "id", { numeric: true }) ||
				a.account.id.localeCompare(b.account.id),
		);
	const invalidCount = rows.filter(
		(row) => row.debitMinor === null || row.creditMinor === null,
	).length;
	const debitMinor = rows.reduce(
		(total, row) => total + (row.debitMinor ?? 0),
		0,
	);
	const creditMinor = rows.reduce(
		(total, row) => total + (row.creditMinor ?? 0),
		0,
	);
	const overflow =
		!Number.isSafeInteger(debitMinor) || !Number.isSafeInteger(creditMinor);
	const totals =
		rows.length && !invalidCount && !overflow && currency !== UNKNOWN_CURRENCY
			? {
					debit: debitMinor / 100,
					credit: creditMinor / 100,
					difference: (debitMinor - creditMinor) / 100,
					balanced: debitMinor === creditMinor,
				}
			: null;
	return { rows, invalidCount, overflow, totals };
}
export function balanceAmount(value: number) {
	return value.toLocaleString("id-ID", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
}
