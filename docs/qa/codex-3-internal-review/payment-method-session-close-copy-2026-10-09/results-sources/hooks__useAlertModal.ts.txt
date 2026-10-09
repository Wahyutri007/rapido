import React from "react";

export function useAlertModal(initial = false) {
	const openState = React.useState<boolean>(initial);
	const [isOpen, setIsOpen] = openState;

	const open = React.useCallback(() => {
		setIsOpen(true);
	}, []);

	const close = React.useCallback(() => {
		setIsOpen(false);
	}, []);

	return { openState, open, close, isOpen };
}

export default useAlertModal;
