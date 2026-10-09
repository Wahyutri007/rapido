const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "../../../../..");
const source = fs.readFileSync(path.join(root, "metro.config.js"), "utf8");
const originalWrite = fs.writeFileSync;
const checks = [];
const check = (name, callback) => { callback(); checks.push(name); };

function load(platform, stores) {
  let nativeWindOptions;
  const config = { cacheStores: stores, resolver: { assetExts: ["png"] } };
  const sandbox = {
    __dirname: root, process: { platform }, module: { exports: {} },
    require(name) {
      if (name === "expo/metro-config") return { getDefaultConfig: () => config };
      if (name === "nativewind/metro") return { withNativeWind(c, options) { nativeWindOptions = options; return c; } };
      if (name === "node:path") return path;
      if (name === "./scripts/preserve-nativewind-cache.cjs") return require("../../../../../scripts/preserve-nativewind-cache.cjs");
      throw new Error(`Unexpected dependency ${name}`);
    },
  };
  sandbox.require.resolve = require.resolve;
  vm.runInNewContext(source, sandbox, { filename: "metro.config.js" });
  return { config: sandbox.module.exports, nativeWindOptions };
}

async function main() {
  let active = 0;
  let maximum = 0;
  const starts = [];
  const receivers = [];
  const syncError = new Error("sync store failure");
  const asyncError = new Error("async store failure");
  const clearError = new Error("clear store failure");
  let failClear = false;
  let clears = 0;
  const store = {
    get(key) {
      receivers.push(this);
      starts.push(key);
      if (key === 0) throw syncError;
      active++;
      maximum = Math.max(maximum, active);
      return new Promise((resolve, reject) => setTimeout(() => {
        active--;
        if (key === 1) reject(asyncError);
        else resolve(key * 2);
      }, 1));
    },
    set(key, value) { receivers.push(this); return [key, value]; },
    clear() { receivers.push(this); if (failClear) throw clearError; return ++clears; },
  };
  const windows = load("win32", [store]);
  const cache = windows.config.cacheStores[0];
  const results = await Promise.allSettled(Array.from({ length: 257 }, (_, key) => cache.get(key)));
  await new Promise(resolve => setImmediate(resolve));
  check("production Windows config wraps store", () => assert.notEqual(cache, store));
  check("queued operations start FIFO including after failures", () => assert.deepEqual(starts, Array.from({ length: 257 }, (_, key) => key)));
  check("synchronous failure propagates identity", () => assert.equal(results[0].reason, syncError));
  check("asynchronous failure propagates identity", () => assert.equal(results[1].reason, asyncError));
  check("all later queued operations settle with correct values", () => {
    assert.equal(results.slice(2).every((result, i) => result.status === "fulfilled" && result.value === (i + 2) * 2), true);
  });
  check("Windows concurrent limit is 64 and work drains", () => { assert.ok(maximum <= 64 && maximum > 1); assert.equal(active, 0); });
  const later = await cache.get(300);
  check("completed queue accepts later operations", () => assert.equal(later, 600));
  const set = await cache.set("fixture", "value");
  check("synchronous set arguments and result survive wrapper", () => assert.deepEqual(set, ["fixture", "value"]));
  check("clear delegates return value", () => assert.equal(cache.clear(), 1));
  failClear = true;
  check("clear failure propagates identity", () => assert.throws(() => cache.clear(), e => e === clearError));
  failClear = false;
  check("all methods retain original store receiver", () => assert.equal(receivers.every(receiver => receiver === store), true));
  const linux = load("linux", [store]);
  check("non-Windows cache store identity is retained", () => assert.equal(linux.config.cacheStores[0], store));
  check("md asset type remains registered", () => assert.deepEqual(Array.from(windows.config.resolver.assetExts), ["png", "md"]));
  check("NativeWind pipeline options remain unchanged", () => assert.deepEqual(JSON.parse(JSON.stringify(windows.nativeWindOptions)), { input: "./global.css", inlineRem: 16, forceWriteFileSystem: true }));
  check("filesystem guard ends after production config initialization", () => assert.equal(fs.writeFileSync, originalWrite));
  const result = { status: "PASS", count: checks.length, checks, queuedReadOperations: 258, maximumOpenRequests: maximum, actualConfigWithExpoAndNativeWindAdapters: true, noSharedCacheWrite: true };
  fs.writeFileSync(path.join(__dirname, "queue-boundaries-results.json"), JSON.stringify(result, null, 2) + "\n");
  console.log(JSON.stringify(result));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
