import { SelectItemProps } from "@/components/common/Form";
import { BackupSchema } from "@/schema/manage/backup";

export type BackupItemProps = Omit<BackupSchema, "type"> & {
  id: string;
  type: SelectItemProps; // * Make into a specific type
};
