import { create } from "zustand";
import { PAYROLL_DEMO_RECORDS } from "@/constants/data/manage/payroll";
import type { PayrollRecord } from "@/types/ui/manage/payroll";

type PayrollState = {
	records: PayrollRecord[];
	replaceRecord: (record: PayrollRecord) => void;
};
export const usePayrollStore = create<PayrollState>((set) => ({
	records: PAYROLL_DEMO_RECORDS,
	replaceRecord: (record) =>
		set((state) => ({
			records: state.records.map((item) =>
				item.id === record.id ? record : item,
			),
		})),
}));
