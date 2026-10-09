const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { preserveNativewindCache } = require("../../../scripts/preserve-nativewind-cache.cjs");
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "rapido-qc-cache-"));
const cache = path.join(temporary, ".cache");
fs.mkdirSync(cache);
const android = path.join(cache, "android.js");
const originalWrite = fs.writeFileSync;
const originalStat = fs.statSync;
const checks = [];
const check = (name, callback) => { callback(); checks.push(name); };
const seed = () => originalWrite(android, "native css");
const contents = () => fs.readFileSync(android, "utf8");

async function main() {
  try {
    seed();
    const value = {};
    check("initializer result retains identity", () => assert.equal(preserveNativewindCache(() => value, cache), value));
    check("only exact populated native path is protected", () => {
      const other = path.join(temporary, "android.js");
      fs.writeFileSync(other, "unrelated");
      preserveNativewindCache(() => { fs.writeFileSync(other, ""); fs.writeFileSync(android, ""); }, cache);
      assert.equal(fs.readFileSync(other, "utf8"), "");
      assert.equal(contents(), "native css");
    });
    check("normalized relative native path is protected", () => {
      preserveNativewindCache(() => fs.writeFileSync(path.relative(process.cwd(), android), ""), cache);
      assert.equal(contents(), "native css");
    });
    check("nonempty Buffer compiler output is written", () => {
      preserveNativewindCache(() => fs.writeFileSync(android, Buffer.from("compiled css")), cache);
      assert.equal(contents(), "compiled css");
    });
    check("nonempty writes preserve write options", () => {
      seed();
      preserveNativewindCache(() => fs.writeFileSync(android, " updated", { flag: "a", encoding: "utf8" }), cache);
      assert.equal(contents(), "native css updated");
    });
    check("zero byte Buffer is delegated under string-only contract", () => {
      preserveNativewindCache(() => fs.writeFileSync(android, Buffer.alloc(0)), cache);
      assert.equal(contents(), "");
    });
    check("existing empty native file remains writable", () => {
      preserveNativewindCache(() => fs.writeFileSync(android, ""), cache);
      assert.equal(contents(), "");
    });
    check("missing native file is created without swallowing ENOENT", () => {
      const missing = path.join(cache, "ios.js");
      preserveNativewindCache(() => fs.writeFileSync(missing, ""), cache);
      assert.equal(fs.statSync(missing).size, 0);
    });
    check("non-ENOENT stat errors propagate with fs restored", () => {
      seed();
      const error = Object.assign(new Error("fixture denied"), { code: "EACCES" });
      fs.statSync = function(file, ...args) {
        if (path.resolve(file) === android) throw error;
        return originalStat.call(fs, file, ...args);
      };
      try {
        assert.throws(() => preserveNativewindCache(() => fs.writeFileSync(android, ""), cache), e => e === error);
        assert.equal(fs.writeFileSync, originalWrite);
        assert.equal(contents(), "native css");
      } finally { fs.statSync = originalStat; }
    });
    check("delegated write failures propagate with fs restored", () => {
      assert.throws(() => preserveNativewindCache(() => fs.writeFileSync(path.join(temporary, "absent", "file.js"), "css"), cache), { code: "ENOENT" });
      assert.equal(fs.writeFileSync, originalWrite);
    });
    check("nested initialization restores outer guard then original fs", () => {
      seed();
      preserveNativewindCache(() => {
        const outer = fs.writeFileSync;
        preserveNativewindCache(() => fs.writeFileSync(android, ""), cache);
        assert.equal(fs.writeFileSync, outer);
        fs.writeFileSync(android, "");
      }, cache);
      assert.equal(contents(), "native css");
      assert.equal(fs.writeFileSync, originalWrite);
    });
    check("nested exception restores outer guard and propagates identity", () => {
      const error = new Error("nested fixture");
      preserveNativewindCache(() => {
        const outer = fs.writeFileSync;
        assert.throws(() => preserveNativewindCache(() => { throw error; }, cache), e => e === error);
        assert.equal(fs.writeFileSync, outer);
        fs.writeFileSync(android, "");
      }, cache);
      assert.equal(contents(), "native css");
      assert.equal(fs.writeFileSync, originalWrite);
    });
    const promise = preserveNativewindCache(() => Promise.resolve().then(() => fs.writeFileSync(android, "")), cache);
    assert.equal(fs.writeFileSync, originalWrite);
    await promise;
    check("guard ends synchronously before returned Promise work", () => assert.equal(contents(), ""));
    seed();
    await preserveNativewindCache(() => fs.promises.writeFile(android, ""), cache);
    check("async compiler writes remain unaffected", () => assert.equal(contents(), ""));
    seed();
    check("later synchronous compiler empty writes remain unaffected", () => {
      preserveNativewindCache(() => null, cache);
      fs.writeFileSync(android, "");
      assert.equal(contents(), "");
    });
    check("original filesystem functions restored after all checks", () => {
      assert.equal(fs.writeFileSync, originalWrite);
      assert.equal(fs.statSync, originalStat);
    });
    const result = { status: "PASS", count: checks.length, checks, cache: "isolated mkdtemp; active node_modules cache untouched" };
    fs.writeFileSync(path.join(__dirname, "guard-boundaries-results.json"), JSON.stringify(result, null, 2) + "\n");
    console.log(JSON.stringify(result));
  } finally {
    fs.statSync = originalStat;
    assert.equal(fs.writeFileSync, originalWrite);
    const resolved = path.resolve(temporary);
    assert.equal(path.dirname(resolved).toLowerCase(), path.resolve(os.tmpdir()).toLowerCase());
    assert.ok(path.basename(resolved).startsWith("rapido-qc-cache-"));
    fs.rmSync(resolved, { recursive: true, force: true });
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
