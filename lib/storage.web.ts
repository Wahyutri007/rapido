// Browser persistence; this is not the encrypted native SecureStore implementation.
export function getItem(key: string): string | null {
	return typeof window === "undefined"
		? null
		: window.localStorage.getItem(key);
}

export function setItem(key: string, value: string): void {
	if (typeof window !== "undefined") window.localStorage.setItem(key, value);
}

export async function getItemAsync(key: string): Promise<string | null> {
	return getItem(key);
}

export async function setItemAsync(key: string, value: string): Promise<void> {
	setItem(key, value);
}

export async function deleteItemAsync(key: string): Promise<void> {
	if (typeof window !== "undefined") window.localStorage.removeItem(key);
}
