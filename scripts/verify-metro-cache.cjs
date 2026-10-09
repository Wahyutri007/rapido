const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

async function main() {
	let active = 0;
	let maximum = 0;
	let writes = 0;
	let cleared = false;
	const store = {
		async get(key) {
			active += 1;
			maximum = Math.max(maximum, active);
			await new Promise((resolve) => setTimeout(resolve, 1));
			active -= 1;
			if (key === -1) throw new Error("cache read failure");
			return key;
		},
		async set() {
			active += 1;
			maximum = Math.max(maximum, active);
			await new Promise((resolve) => setTimeout(resolve, 1));
			active -= 1;
			writes += 1;
		},
		clear() {
			cleared = true;
		},
	};
	const root = path.dirname(require.resolve("../metro.config.js"));
	const sandbox = {
		module: { exports: {} },
		__dirname: root,
		process: { platform: "win32" },
		require(name) {
			if (name === "expo/metro-config") {
				return {
					getDefaultConfig: () => ({
						cacheStores: [store],
						resolver: { assetExts: [] },
					}),
				};
			}
			if (name === "nativewind/metro") {
				return { withNativeWind: (config) => config };
			}
			if (name === "node:path") return path;
			if (name === "./scripts/preserve-nativewind-cache.cjs") {
				return require("./preserve-nativewind-cache.cjs");
			}
			throw new Error(`Unexpected Metro dependency: ${name}`);
		},
	};
	sandbox.require.resolve = require.resolve;
	vm.runInNewContext(
		fs.readFileSync(path.join(root, "metro.config.js"), "utf8"),
		sandbox,
	);
	const cache = sandbox.module.exports.cacheStores[0];
	const reads = await Promise.all(
		Array.from({ length: 3000 }, (_, key) => cache.get(key)),
	);
	assert.equal(reads.length, 3000);
	assert.equal(reads[2999], 2999);
	assert.ok(maximum <= 64);
	assert.ok(maximum > 1);
	const results = await Promise.allSettled([
		cache.get(-1),
		...Array.from({ length: 200 }, (_, key) => cache.set(key, key)),
	]);
	assert.equal(results[0].status, "rejected");
	assert.equal(writes, 200);
	assert.ok(maximum <= 64);
	await cache.clear();
	assert.equal(cleared, true);
	console.log(
		JSON.stringify({
			reads: reads.length,
			writes,
			maximumOpenRequests: maximum,
			errorQueueRecovered: true,
			clearDelegated: cleared,
		}),
	);
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
