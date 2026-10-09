const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const vm = require("node:vm");
const { createRequire } = require("node:module");
const { preserveNativewindCache } = require("./preserve-nativewind-cache.cjs");

const temporaryRoot = fs.mkdtempSync(
	path.join(os.tmpdir(), "rapido-css-init-"),
);
if (
	path.dirname(temporaryRoot) !== os.tmpdir() ||
	!path.basename(temporaryRoot).startsWith("rapido-css-init-")
)
	throw Error("Unexpected temporary path");
const cacheDirectory = path.join(temporaryRoot, ".cache");
const originalWrite = fs.writeFileSync;
const checks = [];
const check = (name, actual, expected) => {
	assert.deepEqual(actual, expected, name);
	checks.push(name);
};
try {
	// Run the installed CSS Interop initializer against an isolated cache.
	const entry = require.resolve("react-native-css-interop/metro");
	const installedRequire = createRequire(entry);
	const localRequire = (name) =>
		name === "./expo"
			? { expoColorSchemeWarning() {} }
			: installedRequire(name);
	localRequire.resolve = installedRequire.resolve;
	const dependency = { exports: {} };
	vm.runInNewContext(fs.readFileSync(entry, "utf8"), {
		module: dependency,
		exports: dependency.exports,
		require: localRequire,
		__dirname: path.join(temporaryRoot, "dist", "metro"),
		process,
	});
	const initialize = () =>
		dependency.exports.withCssInterop(
			{ resolver: { sourceExts: [] }, transformer: {}, server: {} },
			{ input: "global.css", forceWriteFileSystem: true },
		);
	fs.mkdirSync(cacheDirectory, { recursive: true });
	const android = path.join(cacheDirectory, "android.js");
	const payload = '({flags:{darkMode:"class dark"},rules:[]})';
	fs.writeFileSync(android, payload);
	initialize();
	check(
		"installed initializer reproduces Android cache truncation",
		fs.readFileSync(android, "utf8"),
		"",
	);
	fs.writeFileSync(android, payload);
	const protectedConfig = preserveNativewindCache(initialize, cacheDirectory);
	check(
		"guarded installed initializer preserves Android CSS and flags",
		fs.readFileSync(android, "utf8"),
		payload,
	);
	check(
		"guard returns full Metro config",
		typeof protectedConfig.resolver.resolveRequest,
		"function",
	);
	check(
		"initializer creates missing platform files",
		fs.existsSync(path.join(cacheDirectory, "ios.js")),
		true,
	);
	check(
		"filesystem implementation restored after configuration",
		fs.writeFileSync,
		originalWrite,
	);
	const nativePlatforms = ["ios", "native", "macos", "windows"];
	for (const platform of nativePlatforms)
		fs.writeFileSync(path.join(cacheDirectory, `${platform}.js`), payload);
	preserveNativewindCache(initialize, cacheDirectory);
	check(
		"second config preserves all populated native platform caches",
		nativePlatforms.every(
			(p) =>
				fs.readFileSync(path.join(cacheDirectory, `${p}.js`), "utf8") ===
				payload,
		),
		true,
	);
	preserveNativewindCache(
		() => fs.writeFileSync(android, "updated styles"),
		cacheDirectory,
	);
	check(
		"compiler nonempty synchronous write is allowed",
		fs.readFileSync(android, "utf8"),
		"updated styles",
	);
	const unrelated = path.join(cacheDirectory, "web.css");
	fs.writeFileSync(unrelated, "web styles");
	preserveNativewindCache(
		() => fs.writeFileSync(unrelated, ""),
		cacheDirectory,
	);
	check(
		"unrelated web writes are not intercepted",
		fs.readFileSync(unrelated, "utf8"),
		"",
	);
	const expected = new Error("configuration failure");
	assert.throws(
		() =>
			preserveNativewindCache(() => {
				throw expected;
			}, cacheDirectory),
		(error) => error === expected,
	);
	check(
		"filesystem implementation restored after initializer failure",
		fs.writeFileSync,
		originalWrite,
	);
	fs.writeFileSync(android, "");
	check(
		"writes outside initialization retain original semantics",
		fs.readFileSync(android, "utf8"),
		"",
	);
	const result = {
		status: "PASS",
		count: checks.length,
		checks,
		dependencyVersion: require("react-native-css-interop/package.json").version,
	};
	if (process.argv[2])
		fs.writeFileSync(process.argv[2], `${JSON.stringify(result, null, 2)}\n`);
	console.log(JSON.stringify(result, null, 2));
} finally {
	assert.equal(fs.writeFileSync, originalWrite);
	// The directory is freshly created with mkdtemp and used only by this test.
	fs.rmSync(temporaryRoot, { recursive: true, force: true });
}
