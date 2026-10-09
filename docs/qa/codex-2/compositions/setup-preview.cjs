const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const project = path.resolve(__dirname, "../../../..");
const root = path.join(project, "preview-inventory");
if (fs.existsSync(root))
	throw new Error(
		"preview-inventory already exists; inspect it before recreating this developer harness",
	);
const preview = path.join(root, "routes");
fs.mkdirSync(preview, { recursive: true });
fs.writeFileSync(
	path.join(root, "entry.tsx"),
	`import "@/global.css";
import "@/components/icons";
import { registerRootComponent } from "expo";
import { ExpoRoot } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
const context = require.context("./routes", true, /\\.tsx$/);
function Preview() { return <GestureHandlerRootView style={{ flex: 1 }}><ExpoRoot context={context} /></GestureHandlerRootView>; }
registerRootComponent(Preview);
`,
);
fs.writeFileSync(
	path.join(preview, "_layout.tsx"),
	`import { useFonts } from "expo-font";
import { JSStack } from "@/components/custom/JSStack";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
export default function PreviewLayout() {
const [loaded, error] = useFonts({
InterRegular: require("../../assets/fonts/Inter_24pt-Regular.ttf"),
InterMedium: require("../../assets/fonts/Inter_24pt-Medium.ttf"),
InterSemiBold: require("../../assets/fonts/Inter_24pt-SemiBold.ttf"),
InterBold: require("../../assets/fonts/Inter_24pt-Bold.ttf"),
});
if (error) throw error;
if (!loaded) return null;
return <GluestackUIProvider mode="light"><JSStack screenOptions={{ headerShown: false }} /></GluestackUIProvider>;
}
`,
);
function route(target, source) {
	const output = path.join(preview, target);
	fs.mkdirSync(path.dirname(output), { recursive: true });
	fs.writeFileSync(
		output,
		`export { default } from ${JSON.stringify(`@/${source}`)};\n`,
	);
}
route("(back-office)/_layout.tsx", "app/(back-office)/_layout");
for (const file of ["_layout", "index", "summary"])
	route(
		`(back-office)/inventory/${file}.tsx`,
		`app/(back-office)/inventory/${file}`,
	);
route("inventory/_layout.tsx", "app/(no-layout)/inventory/_layout");
for (const feature of [
	"stock-transfer",
	"stock-adjustment",
	"purchase-order",
	"suppliers",
	"materials",
	"compositions",
]) {
	for (const file of ["_layout", "index", "modify", "detail"])
		route(
			`inventory/${feature}/${file}.tsx`,
			`app/(no-layout)/inventory/${feature}/${file}`,
		);
}
for (const tab of ["home", "report", "catalog", "manage"]) {
	fs.writeFileSync(
		path.join(preview, `(back-office)/${tab}.tsx`),
		'import Text from "@/components/common/Text"; export default function Placeholder(){return <Text>Preview Inventory</Text>;}',
	);
}
const html = `<!doctype html><html><head><base href="/"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"><style>html,body,#root{width:100%;height:100%;margin:0;overflow:hidden}#root{display:flex;flex-direction:column}</style></head><body><div id="root"></div><script src="http://localhost:8081/preview-inventory/entry.bundle?platform=web&dev=true&hot=false&lazy=false"></script></body></html>`;
http
	.createServer((request, response) => {
		if (
			/^\/(assets\/|_expo\/|symbolicate|logs|.*\.(ttf|png|jpg|bundle|map))/.test(
				request.url,
			)
		) {
			const upstream = http.request(
				{
					hostname: "127.0.0.1",
					port: 8081,
					path: request.url,
					method: request.method,
					headers: request.headers,
				},
				(result) => {
					response.writeHead(result.statusCode, result.headers);
					result.pipe(response);
				},
			);
			upstream.on("error", (error) => {
				response.writeHead(502);
				response.end(error.message);
			});
			request.pipe(upstream);
			return;
		}
		response.setHeader("Content-Type", "text/html");
		response.end(html);
	})
	.listen(8091, "127.0.0.1", () =>
		process.stdout.write(
			"Composition preview ready at http://127.0.0.1:8091/inventory\n",
		),
	);
