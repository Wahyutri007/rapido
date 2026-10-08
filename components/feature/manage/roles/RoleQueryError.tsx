import Card from "@/components/common/Card";
import Text from "@/components/common/Text";
import { Button, ButtonText } from "@/components/ui/button";

export default function RoleQueryError({
	message,
	onRetry,
}: {
	message: string;
	onRetry: () => void;
}) {
	return (
		<Card className="items-center gap-4">
			<Text size="normal" className="text-center text-muted">
				{message}
			</Text>
			<Button variant="outline" size="sm" onPress={onRetry}>
				<ButtonText>Coba lagi</ButtonText>
			</Button>
		</Card>
	);
}
