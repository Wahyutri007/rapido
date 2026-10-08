import { create } from "zustand";
import {
	INITIAL_NOTIFICATION_SCHEDULES,
	type NotificationSchedule,
} from "@/constants/data/manage/notification-schedules";

type NotificationScheduleState = {
	schedules: NotificationSchedule[];
	addSchedule: (
		schedule: Omit<NotificationSchedule, "id" | "createdAt" | "createdBy">,
	) => string;
	updateSchedule: (
		id: string,
		schedule: Partial<NotificationSchedule>,
	) => void;
	deleteSchedule: (id: string) => void;
	getSchedule: (id: string) => NotificationSchedule | undefined;
};

export const useNotificationScheduleStore = create<NotificationScheduleState>(
	(set, get) => ({
		schedules: INITIAL_NOTIFICATION_SCHEDULES,
		addSchedule: (newScheduleData) => {
			const newId = `sched-${Date.now()}`;
			const newSchedule: NotificationSchedule = {
				...newScheduleData,
				id: newId,
				createdAt: "Hari ini",
				createdBy: "Admin",
			};
			set((state) => ({
				schedules: [newSchedule, ...state.schedules],
			}));
			return newId;
		},
		updateSchedule: (id, updatedData) => {
			set((state) => ({
				schedules: state.schedules.map((item) =>
					item.id === id ? { ...item, ...updatedData } : item,
				),
			}));
		},
		deleteSchedule: (id) => {
			set((state) => ({
				schedules: state.schedules.filter((item) => item.id !== id),
			}));
		},
		getSchedule: (id) => {
			return get().schedules.find((item) => item.id === id);
		},
	}),
);
