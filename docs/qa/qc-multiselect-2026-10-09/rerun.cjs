const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { createRequire } = require("node:module");
const original = path.resolve("docs/qa/senior-7-2026-10-09/multi-select/lifecycle.cjs");
const suite = process.argv[2];
assert.ok(["lifecycle", "integration"].includes(suite));
const code = fs.readFileSync(original, "utf8");
const mod = { exports: {} };
const output = Object.create(console);
output.log = value => {
  const result = JSON.parse(value);
  console.log(JSON.stringify({ suite: result.suite, status: result.status, passed: result.passed, failed: result.failed }));
};
// Keep source/logic/helpers unchanged; override only the output directory at runtime.
new Function("require", "module", "__dirname", "console", code)(createRequire(original), mod, __dirname, output);
