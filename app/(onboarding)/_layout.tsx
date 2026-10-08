import { router } from "expo-router";
import React from "react";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";
import Header from "@/components/feature/onboarding/Header";

export default function OnboardingLayout() {
	return (
		<JSStack screenOptions={{ ...ScaleBackTransition }}>
			<JSStack.Screen
				name="onboarding"
				options={{ header: () => <Header /> }}
			/>
			<JSStack.Screen name="start" options={{ headerShown: false }} />
			<JSStack.Screen name="login" options={{ headerShown: false }} />
			<JSStack.Screen name="otp" options={{ header: () => <Header /> }} />
			<JSStack.Screen name="register" options={{ headerShown: false }} />
			<JSStack.Screen name="choose-store" options={{ headerShown: false }} />
			<JSStack.Screen
				name="forgot-password"
				options={{
					header: () => <Header back />,
				}}
			/>
			<JSStack.Screen
				name="reset-password"
				options={{
					header: () => (
						<Header back={() => router.replace("/(onboarding)/login")} />
					),
				}}
			/>
		</JSStack>
	);
}
