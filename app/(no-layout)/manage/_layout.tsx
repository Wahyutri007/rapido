import Header from "@/components/common/Header";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";

export default function Layout() {
	return (
		<JSStack screenOptions={{ ...ScaleBackTransition }}>
			<JSStack.Screen
				name="pin"
				options={{ header: () => <Header back title="Buat Pin" /> }}
			/>
			<JSStack.Screen name="order-type" options={{ headerShown: false }} />
			<JSStack.Screen name="payment-method" options={{ headerShown: false }} />
			<JSStack.Screen name="tax" options={{ headerShown: false }} />
			<JSStack.Screen name="extra" options={{ headerShown: false }} />
			<JSStack.Screen name="printer" options={{ headerShown: false }} />
			<JSStack.Screen name="backup" options={{ headerShown: false }} />
			<JSStack.Screen name="store" options={{ headerShown: false }} />
			<JSStack.Screen name="export" options={{ headerShown: false }} />
			<JSStack.Screen name="integrations" options={{ headerShown: false }} />
			<JSStack.Screen name="sales-target" options={{ headerShown: false }} />
			<JSStack.Screen name="expenses" options={{ headerShown: false }} />
			<JSStack.Screen name="income" options={{ headerShown: false }} />
			<JSStack.Screen name="payroll" options={{ headerShown: false }} />
			<JSStack.Screen name="absence" options={{ headerShown: false }} />
			<JSStack.Screen name="pos-settings" options={{ headerShown: false }} />
			<JSStack.Screen name="faq" options={{ headerShown: false }} />
			<JSStack.Screen name="feature-request" options={{ headerShown: false }} />
			<JSStack.Screen name="feedback" options={{ headerShown: false }} />
			<JSStack.Screen name="receipt" options={{ headerShown: false }} />
			<JSStack.Screen name="place" options={{ headerShown: false }} />
			<JSStack.Screen name="workers" options={{ headerShown: false }} />
			<JSStack.Screen name="member" options={{ headerShown: false }} />
		</JSStack>
	);
}
