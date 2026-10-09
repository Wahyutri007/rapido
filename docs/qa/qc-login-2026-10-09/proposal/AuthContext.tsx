import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import { createGetHook } from "@/api/factory";
import Keys from "@/constants/Keys";
import * as SecureStore from "@/lib/storage";
import type { UserData } from "@/types/api/auth";

type AuthContextType = {
	user?: UserData | null;
	signOut: () => Promise<void>;
	updateToken: (token: string | null) => Promise<void>;
	hasPermission: (permission: string) => boolean;
	hasAnyPermission: (permissions: string[]) => boolean;
	hasAllPermissions: (permissions: string[]) => boolean;
	hasRole: (roles: string[] | string) => boolean;
	isLoading: boolean;
	isLoaded: boolean;
	authenticated: boolean;
	reloadAuth: () => Promise<boolean>;
};

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const useUserQuery = createGetHook<UserData>({
	path: "/user",
	queryKey: ["user-data"],
});

export function useAuth() {
	const context = React.useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}

export default function AuthProvider(props: React.PropsWithChildren) {
	const { children } = props;

	const [token, setToken] = React.useState<string | null>(null);
	const [isLoaded, setIsLoaded] = React.useState<boolean>(false);
	const [isLoading, setIsLoading] = React.useState<boolean>(true);

	const userQuery = useUserQuery(undefined, { enabled: !!token });

	const authenticated = !!token && !!userQuery.data;

	const queryClient = useQueryClient();

	async function loadToken(): Promise<boolean> {
		setIsLoading(true);
		try {
			const storedToken = await SecureStore.getItemAsync(Keys.AUTH_TOKEN);
			if (!storedToken) {
				setToken(null);
				return false;
			}
			setToken(storedToken);
			const res = await userQuery.refetch();
			return !!res.data;
		} catch (error) {
			// console.error("Failed to load token:", error);
			return false;
		} finally {
			setIsLoading(false);
			setIsLoaded(true);
		}
	}

	async function reloadAuth(): Promise<boolean> {
		return await loadToken();
	}

	// Update token in secure store
	async function updateToken(token: string | null) {
		if (token) {
			await SecureStore.setItemAsync(Keys.AUTH_TOKEN, token);
			setToken(token);
			await userQuery.refetch({ throwOnError: true });
		} else {
			setToken(null);
			await SecureStore.deleteItemAsync(Keys.AUTH_TOKEN);

			queryClient.setQueryData(["user-data"], null);
			queryClient.removeQueries({ queryKey: ["user-data"] });
			queryClient.clear(); // Aggressive clear to ensure state reset
		}
	}

	async function signOut() {
		await updateToken(null);
	}

	const hasPermission = React.useCallback(
		(permission: string) => {
			if (!userQuery.data) return false;
			if (userQuery.data.roles.includes("owner")) return true;
			return userQuery.data.permissions.includes(permission);
		},
		[userQuery.data],
	);

	const hasRole = React.useCallback(
		(role: string | string[]) => {
			const roles = Array.isArray(role) ? role : [role];

			if (!userQuery.data) return false;
			return roles.some((r) => userQuery.data.roles.includes(r));
		},
		[userQuery.data],
	);

	const hasAnyPermission = React.useCallback(
		(permissions: string[]) => {
			if (!userQuery.data) return false;
			if (userQuery.data.roles.includes("owner")) return true;
			return permissions.some((permission) =>
				userQuery.data.permissions.includes(permission),
			);
		},
		[userQuery.data],
	);

	const hasAllPermissions = React.useCallback(
		(permissions: string[]) => {
			if (!userQuery.data) return false;
			if (userQuery.data.roles.includes("owner")) return true;
			return permissions.every((permission) =>
				userQuery.data.permissions.includes(permission),
			);
		},
		[userQuery.data],
	);

	// Load token from store
	React.useEffect(() => {
		loadToken();
	}, []);

	return (
		<AuthContext.Provider
			value={{
				user: userQuery.data,
				signOut,
				updateToken,
				hasPermission,
				hasAnyPermission,
				hasAllPermissions,
				authenticated,
				isLoading,
				isLoaded,
				hasRole,
				reloadAuth,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}
