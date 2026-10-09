import { create } from "zustand";
import { DEFAULT_ACCOUNTS } from "@/constants/data/accounting/accounts";
import { DEFAULT_ADJUSTING_JOURNALS } from "@/constants/data/accounting/adjusting-journal";
import { DEFAULT_CLOSING_JOURNALS } from "@/constants/data/accounting/closing-journal";
import { DEFAULT_EXPENSES } from "@/constants/data/accounting/expenses";
import { DEFAULT_JOURNALS } from "@/constants/data/accounting/general-journal";
import {
	DEFAULT_LEDGER_ACCOUNTS,
	DEFAULT_LEDGER_ENTRIES,
	DEFAULT_LEDGER_SUMMARY,
} from "@/constants/data/accounting/general-ledger";
import { DEFAULT_INCOMES } from "@/constants/data/accounting/incomes";
import type { Account } from "@/types/ui/accounting/account";
import type { Expense } from "@/types/ui/accounting/expense";
import type { Income } from "@/types/ui/accounting/income";
import type {
	AdjustingJournal,
	ClosingJournal,
	GeneralJournal,
} from "@/types/ui/accounting/journal";
import type {
	LedgerAccount,
	LedgerEntry,
	LedgerSummary,
} from "@/types/ui/accounting/ledger";

type AccountingState = {
	accounts: Account[];
	updateBalance: (id: string, debit: number, credit: number) => void;
	resetBalance: (id: string) => void;
	addAccount: (account: Omit<Account, "id">) => string;
	updateAccount: (id: string, data: Partial<Account>) => void;
	deleteAccount: (id: string) => void;
	getTotals: () => {
		totalDebit: number;
		totalCredit: number;
		difference: number;
	};

	// Expenses
	expenses: Expense[];
	addExpense: (expense: Omit<Expense, "id">) => string;
	updateExpense: (id: string, data: Partial<Expense>) => void;
	deleteExpense: (id: string) => void;

	// Incomes
	incomes: Income[];
	addIncome: (income: Omit<Income, "id">) => string;
	updateIncome: (id: string, data: Partial<Income>) => void;
	deleteIncome: (id: string) => void;

	// General Journals
	journals: GeneralJournal[];
	addJournal: (journal: Omit<GeneralJournal, "id">) => string;
	updateJournal: (id: string, data: Partial<GeneralJournal>) => void;
	deleteJournal: (id: string) => void;

	// Adjusting Journals
	adjustingJournals: AdjustingJournal[];
	addAdjustingJournal: (journal: Omit<AdjustingJournal, "id">) => string;
	updateAdjustingJournal: (id: string, data: Partial<AdjustingJournal>) => void;
	deleteAdjustingJournal: (id: string) => void;

	// Closing Journals
	closingJournals: ClosingJournal[];
	addClosingJournal: (journal: Omit<ClosingJournal, "id">) => string;
	updateClosingJournal: (id: string, data: Partial<ClosingJournal>) => void;
	deleteClosingJournal: (id: string) => void;

	// General Ledger
	ledgerAccounts: LedgerAccount[];
	ledgerEntries: Record<string, LedgerEntry[]>;
	ledgerSummary: LedgerSummary;
	getAccountLedgerEntries: (accountId: string) => LedgerEntry[];
	addLedgerEntry: (entry: Omit<LedgerEntry, "id">) => string;
};

export const useAccountingStore = create<AccountingState>((set, get) => ({
	accounts: DEFAULT_ACCOUNTS,
	expenses: DEFAULT_EXPENSES,
	incomes: DEFAULT_INCOMES,
	journals: DEFAULT_JOURNALS,
	adjustingJournals: DEFAULT_ADJUSTING_JOURNALS,
	closingJournals: DEFAULT_CLOSING_JOURNALS,
	ledgerAccounts: DEFAULT_LEDGER_ACCOUNTS,
	ledgerEntries: DEFAULT_LEDGER_ENTRIES,
	ledgerSummary: DEFAULT_LEDGER_SUMMARY,

	updateBalance: (id: string, debit: number, credit: number) => {
		set((state) => ({
			accounts: state.accounts.map((acc) =>
				acc.id === id ? { ...acc, debit, credit } : acc,
			),
		}));
	},

	resetBalance: (id: string) => {
		set((state) => ({
			accounts: state.accounts.map((acc) =>
				acc.id === id ? { ...acc, debit: 0, credit: 0 } : acc,
			),
		}));
	},

	addAccount: (accountData) => {
		const newId = Date.now().toString();
		const newAccount: Account = {
			...accountData,
			id: newId,
		};
		set((state) => ({
			accounts: [...state.accounts, newAccount],
		}));
		return newId;
	},

	updateAccount: (id: string, data: Partial<Account>) => {
		set((state) => ({
			accounts: state.accounts.map((acc) =>
				acc.id === id ? { ...acc, ...data } : acc,
			),
		}));
	},

	deleteAccount: (id: string) => {
		set((state) => ({
			accounts: state.accounts.filter((acc) => acc.id !== id),
		}));
	},

	getTotals: () => {
		const accounts = get().accounts;
		const totalDebit = accounts.reduce(
			(acc, curr) => acc + (curr.debit || 0),
			0,
		);
		const totalCredit = accounts.reduce(
			(acc, curr) => acc + (curr.credit || 0),
			0,
		);
		const difference = Math.abs(totalDebit - totalCredit);
		return { totalDebit, totalCredit, difference };
	},

	addExpense: (expenseData) => {
		const baseId = `exp-${Date.now()}`;
		let newId = baseId;
		let suffix = 1;
		while (get().expenses.some((expense) => expense.id === newId)) {
			newId = `${baseId}-${suffix++}`;
		}
		const newExpense: Expense = {
			...expenseData,
			id: newId,
		};
		set((state) => ({
			expenses: [newExpense, ...state.expenses],
		}));
		return newId;
	},

	updateExpense: (id: string, data: Partial<Expense>) => {
		set((state) => ({
			expenses: state.expenses.map((exp) =>
				exp.id === id ? { ...exp, ...data } : exp,
			),
		}));
	},

	deleteExpense: (id: string) => {
		set((state) => ({
			expenses: state.expenses.filter((exp) => exp.id !== id),
		}));
	},

	addIncome: (incomeData) => {
		const baseId = `inc-${Date.now()}`;
		let newId = baseId;
		let suffix = 1;
		while (get().incomes.some((income) => income.id === newId)) {
			newId = `${baseId}-${suffix++}`;
		}
		const newIncome: Income = {
			...incomeData,
			id: newId,
		};
		set((state) => ({
			incomes: [newIncome, ...state.incomes],
		}));
		return newId;
	},

	updateIncome: (id: string, data: Partial<Income>) => {
		set((state) => ({
			incomes: state.incomes.map((inc) =>
				inc.id === id ? { ...inc, ...data } : inc,
			),
		}));
	},

	deleteIncome: (id: string) => {
		set((state) => ({
			incomes: state.incomes.filter((inc) => inc.id !== id),
		}));
	},

	addJournal: (journalData) => {
		const newId = `ju-${Date.now()}`;
		const newJournal: GeneralJournal = {
			...journalData,
			id: newId,
		};
		set((state) => ({
			journals: [newJournal, ...state.journals],
		}));
		return newId;
	},

	updateJournal: (id: string, data: Partial<GeneralJournal>) => {
		set((state) => ({
			journals: state.journals.map((journal) =>
				journal.id === id ? { ...journal, ...data } : journal,
			),
		}));
	},

	deleteJournal: (id: string) => {
		set((state) => ({
			journals: state.journals.filter((journal) => journal.id !== id),
		}));
	},

	addAdjustingJournal: (journalData) => {
		const newId = `ajp-${Date.now()}`;
		const newJournal: AdjustingJournal = {
			...journalData,
			id: newId,
		};
		set((state) => ({
			adjustingJournals: [newJournal, ...state.adjustingJournals],
		}));
		return newId;
	},

	updateAdjustingJournal: (id: string, data: Partial<AdjustingJournal>) => {
		set((state) => ({
			adjustingJournals: state.adjustingJournals.map((journal) =>
				journal.id === id ? { ...journal, ...data } : journal,
			),
		}));
	},

	deleteAdjustingJournal: (id: string) => {
		set((state) => ({
			adjustingJournals: state.adjustingJournals.filter(
				(journal) => journal.id !== id,
			),
		}));
	},

	addClosingJournal: (journalData) => {
		const newId = `jp-${Date.now()}`;
		const newJournal: ClosingJournal = {
			...journalData,
			id: newId,
		};
		set((state) => ({
			closingJournals: [newJournal, ...state.closingJournals],
		}));
		return newId;
	},

	updateClosingJournal: (id: string, data: Partial<ClosingJournal>) => {
		set((state) => ({
			closingJournals: state.closingJournals.map((journal) =>
				journal.id === id ? { ...journal, ...data } : journal,
			),
		}));
	},

	deleteClosingJournal: (id: string) => {
		set((state) => ({
			closingJournals: state.closingJournals.filter(
				(journal) => journal.id !== id,
			),
		}));
	},

	getAccountLedgerEntries: (accountId: string) => {
		const state = get();
		return state.ledgerEntries[accountId] || [];
	},

	addLedgerEntry: (entryData) => {
		const newId = `le-${Date.now()}`;
		const newEntry: LedgerEntry = {
			...entryData,
			id: newId,
		};
		set((state) => {
			const existingEntries = state.ledgerEntries[entryData.accountId] || [];
			return {
				ledgerEntries: {
					...state.ledgerEntries,
					[entryData.accountId]: [newEntry, ...existingEntries],
				},
			};
		});
		return newId;
	},
}));
