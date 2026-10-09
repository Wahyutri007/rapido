/* global __dirname */
const fs = require("node:fs");
const path = require("node:path");
const { spawn, spawnSync } = require("node:child_process");

const projectRoot = path.resolve(__dirname, "..");
const metroPort = 8088;
const expoPackage = "host.exp.exponent";
const sleep = (milliseconds) =>
	new Promise((resolve) => setTimeout(resolve, milliseconds));

function adbPath() {
	const local = process.env.LOCALAPPDATA;
	const candidates = [
		process.env.RAPIDO_ADB_PATH,
		process.env.ANDROID_HOME &&
			path.join(process.env.ANDROID_HOME, "platform-tools", "adb.exe"),
		process.env.ANDROID_SDK_ROOT &&
			path.join(process.env.ANDROID_SDK_ROOT, "platform-tools", "adb.exe"),
		local && path.join(local, "Android", "Sdk", "platform-tools", "adb.exe"),
		local &&
			path.join(local, "RapidoAndroidTools", "platform-tools", "adb.exe"),
	];
	const found = candidates.find((file) => file && fs.existsSync(file));
	if (found) return found;
	const lookup = spawnSync(
		process.platform === "win32" ? "where.exe" : "which",
		["adb"],
		{
			encoding: "utf8",
			windowsHide: true,
		},
	);
	const onPath = lookup.stdout
		?.trim()
		.split(/\r?\n/)
		.find((file) => fs.existsSync(file));
	if (onPath) return onPath;
	throw new Error(
		"ADB belum ditemukan. Pasang Android Platform Tools, atau isi RAPIDO_ADB_PATH dengan lokasi adb.exe. Lihat docs/RUN_DI_HP.md.",
	);
}

function adb(executable, args) {
	const result = spawnSync(executable, args, {
		encoding: "utf8",
		windowsHide: true,
		timeout: 15000,
	});
	if (
		result.error ||
		result.status !== 0 ||
		/^Error:/m.test(result.stdout || "")
	) {
		throw new Error(
			`ADB gagal (${args[0]}): ${result.error?.message || result.stderr?.trim() || result.stdout?.trim()}`,
		);
	}
	return result.stdout.trim();
}

function selectDevice(text, requested) {
	const devices = text
		.split(/\r?\n/)
		.map((line) => line.trim().split(/\s+/))
		.filter(
			([serial, state]) =>
				serial && ["device", "unauthorized", "offline"].includes(state),
		);
	if (requested) {
		const device = devices.find(([serial]) => serial === requested);
		if (!device)
			throw new Error(
				"HP pilihan tidak terdeteksi. Periksa kabel USB dan USB debugging.",
			);
		if (device[1] !== "device")
			throw new Error(
				`HP ${requested} ${device[1]}. Buka kunci HP dan pilih Izinkan USB debugging; jika offline, sambungkan ulang kabel.`,
			);
		return requested;
	}
	const ready = devices.filter(([, state]) => state === "device");
	if (ready.length > 1)
		throw new Error(
			"Lebih dari satu perangkat tersambung. Gunakan npm run start:hp -- --device SERIAL_HP.",
		);
	if (ready.length === 1) return ready[0][0];
	if (devices.some(([, state]) => state === "unauthorized"))
		throw new Error(
			"Buka kunci HP lalu pilih Izinkan USB debugging pada dialog di HP.",
		);
	throw new Error(
		"HP belum siap. Sambungkan kabel data USB, aktifkan USB debugging, dan izinkan komputer di HP.",
	);
}

function backendConfig() {
	const values = {};
	for (const name of [".env", ".env.local"]) {
		const file = path.join(projectRoot, name);
		if (!fs.existsSync(file)) continue;
		for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
			const match = line.match(
				/^\s*(EXPO_PUBLIC_(?:BASE|API)_URL)\s*=\s*(.*?)\s*$/,
			);
			if (match) values[match[1]] = match[2].replace(/^(["'])(.*)\1$/, "$2");
		}
	}
	const base =
		process.env.EXPO_PUBLIC_BASE_URL ||
		values.EXPO_PUBLIC_BASE_URL ||
		"http://127.0.0.1:8001";
	const apiUrl =
		process.env.EXPO_PUBLIC_API_URL ||
		values.EXPO_PUBLIC_API_URL ||
		`${base.replace(/\/$/, "")}/api`;
	const urls = [new URL(base), new URL(apiUrl)];
	if (
		urls.some(
			(url) =>
				!["127.0.0.1", "localhost"].includes(url.hostname) ||
				url.protocol !== "http:",
		)
	) {
		throw new Error(
			"Launcher USB memakai backend HTTP localhost. Isi EXPO_PUBLIC_BASE_URL/EXPO_PUBLIC_API_URL sesuai docs/RUN_DI_HP.md; konfigurasi LAN memakai langkah manual.",
		);
	}
	return {
		base,
		apiUrl,
		ports: [...new Set(urls.map((url) => url.port || "80"))],
	};
}

async function probeMetro() {
	let response;
	try {
		response = await fetch(`http://127.0.0.1:${metroPort}/status`, {
			signal: AbortSignal.timeout(5000),
		});
	} catch (error) {
		if (error.cause?.code === "ECONNREFUSED") return null;
		throw new Error(
			`Metro port ${metroPort} tidak merespons: ${error.message}`,
		);
	}
	if (
		!response.ok ||
		(await response.text()).trim() !== "packager-status:running"
	) {
		throw new Error(
			`Port ${metroPort} dipakai layanan lain. Launcher tidak menghentikan layanan tersebut.`,
		);
	}
	const manifestResponse = await fetch(`http://127.0.0.1:${metroPort}/`, {
		headers: { "expo-platform": "android", accept: "application/expo+json" },
		signal: AbortSignal.timeout(15000),
	});
	if (!manifestResponse.ok)
		throw new Error(`Manifest Expo gagal: HTTP ${manifestResponse.status}.`);
	const manifest = await manifestResponse.json();
	const client = manifest.extra?.expoClient;
	const root = client?._internal?.projectRoot;
	const normalize = (value) => {
		const resolved = path.resolve(value);
		return process.platform === "win32" ? resolved.toLowerCase() : resolved;
	};
	if (!root || normalize(root) !== normalize(projectRoot)) {
		throw new Error(
			`Metro port ${metroPort} bukan proyek Rapido ini. Jangan tutup server sesi lain; gunakan server Rapido yang benar.`,
		);
	}
	return { sdk: Number.parseInt(client.sdkVersion, 10) };
}

async function main(args = process.argv.slice(2)) {
	if (args.includes("--help")) {
		console.log(
			"npm run start:hp [-- --device SERIAL_HP] [-- --check]\n--check memeriksa kesiapan tanpa membuka HP atau mengubah reverse USB.\nPanduan: docs/RUN_DI_HP.md",
		);
		return;
	}
	const deviceIndex = args.indexOf("--device");
	const deviceId =
		deviceIndex < 0 ? process.env.RAPIDO_DEVICE_ID : args[deviceIndex + 1];
	if (deviceIndex >= 0 && (!deviceId || deviceId.startsWith("--")))
		throw new Error("Isi serial setelah --device.");
	const knownArgs = args.filter(
		(_, index) =>
			index !== deviceIndex &&
			index !== (deviceIndex < 0 ? -1 : deviceIndex + 1),
	);
	if (knownArgs.some((arg) => arg !== "--check"))
		throw new Error("Opsi tidak dikenal. Gunakan npm run start:hp -- --help.");
	const [major, minor] = process.versions.node.split(".").map(Number);
	if (major < 22 || (major === 22 && minor < 13))
		throw new Error("Gunakan Node.js 22.13 atau lebih baru untuk proyek ini.");
	if (
		!fs.existsSync(path.join(projectRoot, "node_modules", "expo", "bin", "cli"))
	)
		throw new Error(
			"Dependency belum terpasang. Jalankan npm ci dari folder aplikasi terlebih dahulu.",
		);
	const executable = adbPath();
	const device = selectDevice(adb(executable, ["devices", "-l"]), deviceId);
	const deviceArgs = ["-s", device];
	const installedExpo = adb(executable, [
		...deviceArgs,
		"shell",
		"dumpsys",
		"package",
		expoPackage,
	]).match(/versionName=([^\s]+)/)?.[1];
	const sdk = Number.parseInt(
		require(path.join(projectRoot, "node_modules", "expo", "package.json"))
			.version,
		10,
	);
	if (!installedExpo || Number.parseInt(installedExpo, 10) !== sdk)
		throw new Error(
			`Pasang Expo Go yang cocok dengan SDK ${sdk} di HP. Kunjungi https://expo.dev/go dan pilih versi SDK proyek.`,
		);
	const backend = backendConfig();
	let health;
	try {
		const response = await fetch(
			`${backend.apiUrl.replace(/\/$/, "")}/health`,
			{ signal: AbortSignal.timeout(5000) },
		);
		if (!response.ok) throw new Error(`HTTP ${response.status}`);
		health = await response.json();
		if ((health.data?.status ?? health.status) !== "online")
			throw new Error("status backend bukan online");
	} catch (error) {
		throw new Error(
			`Backend belum siap (${error.message}). Jalankan backend pada port ${backend.ports.join("/")} sesuai docs/RUN_DI_HP.md, lalu ulangi perintah ini.`,
		);
	}
	let metro = await probeMetro();
	if (metro && metro.sdk !== sdk)
		throw new Error(
			"SDK server Metro berbeda dari dependency proyek. Gunakan server Rapido yang sesuai.",
		);
	console.log(`HP ${device} siap; Expo Go ${installedExpo}; backend online.`);
	if (args.includes("--check")) {
		console.log(
			metro
				? "Metro Rapido siap pada port 8088. Pemeriksaan selesai; HP belum dibuka."
				: "Metro belum berjalan; start:hp akan memulainya. Pemeriksaan selesai; HP belum dibuka.",
		);
		return;
	}
	for (const port of [...new Set([String(metroPort), ...backend.ports])]) {
		adb(executable, [...deviceArgs, "reverse", `tcp:${port}`, `tcp:${port}`]);
	}
	let child;
	let childExit = null;
	if (!metro) {
		console.log("Memulai Metro Rapido (8088, satu worker, USB/offline)...");
		child = spawn(
			process.execPath,
			[
				"--dns-result-order=ipv4first",
				path.join(projectRoot, "node_modules", "expo", "bin", "cli"),
				"start",
				"--go",
				"--localhost",
				"--port",
				String(metroPort),
				"--max-workers",
				"1",
				"--offline",
			],
			{
				cwd: projectRoot,
				stdio: "inherit",
				windowsHide: true,
				env: {
					...process.env,
					EXPO_PUBLIC_BASE_URL: backend.base,
					EXPO_PUBLIC_API_URL: backend.apiUrl,
				},
			},
		);
		const exited = new Promise((resolve) => {
			child.once("exit", (code) => {
				childExit = { code };
				resolve(code);
			});
			child.once("error", (error) => {
				childExit = { code: 1, error };
				resolve(1);
			});
		});
		const onInterrupt = () => child.kill("SIGINT");
		process.once("SIGINT", onInterrupt);
		try {
			const deadline = Date.now() + 120000;
			while (!metro && Date.now() < deadline) {
				if (childExit)
					throw (
						childExit.error ||
						new Error("Metro berhenti sebelum siap. Periksa error di terminal.")
					);
				await sleep(500);
				metro = await probeMetro();
			}
			if (!metro)
				throw new Error(
					"Metro belum siap dalam 120 detik. Periksa terminal lalu ulangi.",
				);
			if (metro.sdk !== sdk)
				throw new Error("SDK server Metro tidak sesuai proyek.");
			openPhone(executable, deviceArgs);
			console.log(
				"Rapido dibuka di HP. Biarkan terminal dan kabel USB tetap tersambung; Ctrl+C menghentikan Metro yang dimulai di sini.",
			);
			process.exitCode = (await exited) ?? 0;
		} catch (error) {
			if (!childExit) child.kill();
			throw error;
		} finally {
			process.removeListener("SIGINT", onInterrupt);
		}
		return;
	}
	console.log("Memakai Metro Rapido yang sudah aktif pada port 8088.");
	openPhone(executable, deviceArgs);
	console.log(
		"Rapido dibuka di HP. Biarkan Metro/backend dan kabel USB tetap tersambung. Ulangi start:hp setelah kabel disambung ulang.",
	);
}

function openPhone(executable, deviceArgs) {
	adb(executable, [
		...deviceArgs,
		"shell",
		"am",
		"start",
		"-W",
		"-a",
		"android.intent.action.VIEW",
		"-d",
		`exp://127.0.0.1:${metroPort}`,
		"-p",
		expoPackage,
	]);
}

module.exports = { main, selectDevice, backendConfig, probeMetro };
if (require.main === module) {
	main().catch((error) => {
		console.error(`\nRapido belum dapat dibuka: ${error.message}`);
		process.exitCode = 1;
	});
}
