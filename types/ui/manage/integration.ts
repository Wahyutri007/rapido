import type { IntegrationValues } from "@/schema/manage/integration";

export type IntegrationDraft = IntegrationValues & {
	id: string;
	status: "draft";
};
