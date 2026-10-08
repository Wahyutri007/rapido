import { BackupItemProps } from "@/types/ui/manage/backup";
import { BACKUP_OPTIONS } from "./backup-type";

export const BACKUP_ITEMS: BackupItemProps[] = [
  {
    id: "1",
    type: BACKUP_OPTIONS[0],
    dateRange: {
      start: new Date("2023-01-01"),
      end: new Date("2023-12-31"),
    },
    location: "local",
  },
];
