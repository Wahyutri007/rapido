import ItemActionSheet from "@/components/custom/ItemActionSheet";
import type { GeneralJournal } from "@/types/ui/accounting/journal";

type JournalActionSheetProps = {
	journal: GeneralJournal | null;
	isOpen: boolean;
	onClose: () => void;
	onViewDetail?: (journal: GeneralJournal) => void;
	onEditJournal?: (journal: GeneralJournal) => void;
	onDeleteJournal?: (journal: GeneralJournal) => void;
};

export default function JournalActionSheet({
	journal,
	isOpen,
	onClose,
	onViewDetail,
	onEditJournal,
	onDeleteJournal,
}: JournalActionSheetProps) {
	if (!journal) return null;

	return (
		<ItemActionSheet
			isOpen={isOpen}
			onClose={onClose}
			title={journal.referenceNumber}
			detailTitle="Detail Jurnal"
			detailSubtitle="Info lebih lanjut tentang Jurnal"
			onViewDetail={onViewDetail ? () => onViewDetail(journal) : undefined}
			editTitle="Edit Jurnal"
			editSubtitle="Ubah nama, urutan, atau pengaturan lainnya"
			onEdit={onEditJournal ? () => onEditJournal(journal) : undefined}
			deleteTitle="Hapus Jurnal"
			deleteSubtitle="Jurnal akan dihapus permanen"
			onDelete={onDeleteJournal ? () => onDeleteJournal(journal) : undefined}
		/>
	);
}
