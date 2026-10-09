import BottomActionButton from "@/components/common/BottomActionButton";
import Card from "@/components/common/Card";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";

export default function JournalFormNotFound({
	entity,
	onBack,
}: {
	entity: string;
	onBack: () => void;
}) {
	return (
		<>
			<Wrapper hasActionButton contentContainerStyle={{ padding: 16, gap: 16 }}>
				<Card className="gap-4">
					<Text w="semibold">Data {entity.toLowerCase()} tidak ditemukan</Text>
					<Text size="normal" className="text-muted">
						Buka kembali jurnal dari daftar untuk melanjutkan.
					</Text>
				</Card>
			</Wrapper>
			<BottomActionButton onPress={onBack}>
				Kembali ke daftar
			</BottomActionButton>
		</>
	);
}
