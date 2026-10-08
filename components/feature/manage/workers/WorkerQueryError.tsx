import Card from "@/components/common/Card";
import Text from "@/components/common/Text";
import { Button, ButtonText } from "@/components/ui/button";

export default function WorkerQueryError({
	message,
	onRetry,
}: {
	message: string;
	onRetry: () => void;
}) {
	return (
		<Card className="gap-4">
			<Text size="normal" className="text-muted">
				{message}
			</Text>
			<Button variant="outline" onPress={onRetry}>
				<ButtonText>Coba lagi</ButtonText>
			</Button>
		</Card>
	);
}
