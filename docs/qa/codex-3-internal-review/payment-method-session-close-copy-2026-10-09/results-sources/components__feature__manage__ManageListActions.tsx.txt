import { type ReactNode, useLayoutEffect, useRef, useState } from "react";
import ItemActionSheet from "@/components/custom/ItemActionSheet";
import type { State } from "@/types";

type ListActionsProps = {
	title: string;
	entityName: string;
	available: boolean;
	onViewDetail: () => void;
	onEdit: () => void;
	renderDelete: (openState: State<boolean>) => ReactNode;
};

export default function ManageListActions({
	title,
	entityName,
	available,
	onViewDetail,
	onEdit,
	renderDelete,
}: ListActionsProps) {
	const [state, setState] = useState({
		actionsOpen: true,
		deleteOpen: false,
		retired: false,
	});
	if (!available && !state.retired) {
		setState({ actionsOpen: false, deleteOpen: false, retired: true });
	}
	return (
		<>
			{available && !state.retired && state.actionsOpen && (
				<ActionSession
					title={title}
					entityName={entityName}
					onClose={() =>
						setState((current) => ({ ...current, actionsOpen: false }))
					}
					onViewDetail={onViewDetail}
					onEdit={onEdit}
					onDelete={() =>
						setState((current) => ({ ...current, deleteOpen: true }))
					}
				/>
			)}
			{/* Keep request/success feedback mounted after its record leaves the list. */}
			{renderDelete([
				available && !state.retired && state.deleteOpen,
				(next) =>
					setState((current) => ({
						...current,
						deleteOpen: current.retired
							? false
							: typeof next === "function"
								? next(current.deleteOpen)
								: next,
					})),
			])}
		</>
	);
}

function ActionSession({
	onClose,
	onViewDetail,
	onEdit,
	onDelete,
	...props
}: Pick<
	ListActionsProps,
	"title" | "entityName" | "onViewDetail" | "onEdit"
> & {
	onClose: () => void;
	onDelete: () => void;
}) {
	const mounted = useRef(false);
	const claimed = useRef(false);
	useLayoutEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);
	function act(callback: () => void) {
		if (!mounted.current || claimed.current) return;
		claimed.current = true;
		callback();
	}
	return (
		<ItemActionSheet
			{...props}
			isOpen
			onClose={() => {
				// The shared sheet closes before invoking its action in the same event.
				if (mounted.current && !claimed.current) onClose();
			}}
			onViewDetail={() => act(onViewDetail)}
			onEdit={() => act(onEdit)}
			onDelete={() => act(onDelete)}
		/>
	);
}
