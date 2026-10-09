import type { DigitalOrderChannelValues } from "@/schema/manage/digital-order-channel";

export type DigitalOrderChannel = DigitalOrderChannelValues & {
	id: string;
	revision: number;
	status: "draft";
};
