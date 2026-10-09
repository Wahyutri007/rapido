const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const ts = require("typescript");
const root = path.resolve(__dirname, "../../..");
const biome = path.join(root, "node_modules/@biomejs/biome/bin/biome");
const files = ["metro.config.js", "scripts/preserve-nativewind-cache.cjs", "scripts/verify-nativewind-cache.cjs", "scripts/verify-metro-cache.cjs"];
const execute = (command, args, input) => spawnSync(command, args, { cwd: root, encoding: "utf8", windowsHide: true, input, maxBuffer: 8 * 1024 * 1024 });
// This installed experimental reporter emits unescaped Windows paths.
// Normalize path fields only and retain the original output for review.
const parseBiome = output => JSON.parse(output.replace(/"path":"([^"]*)"/g, (_, value) => `"path":${JSON.stringify(value)}`));
const actualStyle = execute(process.execPath, [biome, "check", ...files, "--reporter=json"]);
assert.equal(actualStyle.status, 1, "existing scoped Biome check has findings");
fs.writeFileSync(path.join(__dirname, "style-findings.raw.txt"), actualStyle.stdout);
fs.writeFileSync(path.join(__dirname, "biome-check.stderr.txt"), actualStyle.stderr);
const diagnostics = parseBiome(actualStyle.stdout);
fs.writeFileSync(path.join(__dirname, "style-findings.json"), JSON.stringify(diagnostics, null, 2) + "\n");
assert.equal(diagnostics.summary.errors, 4);
const proposal = path.join(__dirname, "style-proposal");
for (const file of files) {
  const destination = path.join(proposal, file);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  let source = fs.readFileSync(path.join(root, file), "utf8");
  if (file === "scripts/verify-nativewind-cache.cjs") {
    const guard = 'if (path.dirname(temporaryRoot) !== os.tmpdir() || !path.basename(temporaryRoot).startsWith("rapido-css-init-")) throw Error("Unexpected temporary path");';
    assert.equal(source.split(guard).length, 2);
    source = source.replace(`\t${guard}\n`, "");
    const creation = 'const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "rapido-css-init-"));';
    assert.ok(source.includes(creation));
    source = source.replace(creation, `${creation}\n${guard}`);
  }
  fs.writeFileSync(destination, source);
}
const formatFiles = files.filter(file => file !== "scripts/preserve-nativewind-cache.cjs");
const formatted = execute(process.execPath, [biome, "format", "--write", ...formatFiles.map(file => path.join(proposal, file))]);
assert.equal(formatted.status, 0, formatted.stdout + formatted.stderr);
const proposedStyle = execute(process.execPath, [biome, "check", ...files.map(file => path.join(proposal, file)), "--reporter=json"]);
assert.equal(proposedStyle.status, 0, proposedStyle.stdout + proposedStyle.stderr);
fs.writeFileSync(path.join(__dirname, "style-proposal-results.json"), JSON.stringify(parseBiome(proposedStyle.stdout), null, 2) + "\n");

const canonical = node => {
  const children = [];
  ts.forEachChild(node, child => { children.push(canonical(child)); });
  return { kind: node.kind, text: ts.isIdentifier(node) || ts.isLiteralExpression(node) ? node.text : undefined, children };
};
for (const file of ["metro.config.js", "scripts/verify-metro-cache.cjs"]) {
  const read = absolute => canonical(ts.createSourceFile(file, fs.readFileSync(absolute, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.JS));
  assert.deepEqual(read(path.join(root, file)), read(path.join(proposal, file)), `format-only AST identical ${file}`);
}
assert.equal(fs.readFileSync(path.join(root, files[1]), "utf8"), fs.readFileSync(path.join(proposal, files[1]), "utf8"));

function diff(file, candidate) {
  const result = execute("git", ["diff", "--no-index", "--no-renames", "--", path.join(root, file), candidate]);
  assert.equal(result.status, 1, `expected candidate diff ${file}`);
  return result.stdout.split("\n").map(line => {
    if (line.startsWith("diff --git ")) return `diff --git a/${file} b/${file}`;
    if (line.startsWith("--- ")) return `--- a/${file}`;
    if (line.startsWith("+++ ")) return `+++ b/${file}`;
    return line;
  }).join("\n");
}
const stylePatch = path.join(__dirname, "startup-style.patch");
fs.writeFileSync(stylePatch, formatFiles.map(file => diff(file, path.join(proposal, file))).join(""));
const routeFiles = ["app/(no-layout)/_layout.tsx", "app/(no-layout)/(cashier)/catalog/_layout.tsx"];
const routeCandidates = ["candidate-parent.tsx.txt", "candidate-child.tsx.txt"];
const routePatch = path.join(__dirname, "routing-warning.patch");
fs.writeFileSync(routePatch, routeFiles.map((file, i) => diff(file, path.join(__dirname, routeCandidates[i]))).join(""));
for (const patch of [stylePatch, routePatch]) {
  const result = execute("git", ["apply", "--check", patch]);
  assert.equal(result.status, 0, result.stdout + result.stderr);
}
const candidateLint = routeFiles.map((file, i) => {
  const input = fs.readFileSync(path.join(__dirname, routeCandidates[i]), "utf8");
  const result = execute(process.execPath, [path.join(root, "node_modules/eslint/bin/eslint.js"), "--stdin", "--stdin-filename", file, "--format", "json"], input);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  return JSON.parse(result.stdout)[0];
});
fs.writeFileSync(path.join(__dirname, "route-proposal-eslint.json"), JSON.stringify(candidateLint, null, 2) + "\n");
const result = {
  status: "PASS",
  actualBiomeExitCode: actualStyle.status,
  actualErrors: diagnostics.summary.errors,
  proposedBiomeExitCode: proposedStyle.status,
  proposedErrors: parseBiome(proposedStyle.stdout).summary.errors,
  productionMetroASTUnchanged: true,
  cacheQueueHarnessASTUnchanged: true,
  productionGuardFileUnchanged: true,
  initializerHarnessChange: "cleanup target safety guard moved after mkdtemp, before try/finally; successful-path assertions unchanged",
  patchApplyChecks: 2,
  routeCandidateESLintErrors: candidateLint.reduce((total, file) => total + file.errorCount, 0),
  appliedToAppSource: false,
};
fs.writeFileSync(path.join(__dirname, "patch-results.json"), JSON.stringify(result, null, 2) + "\n");
console.log(JSON.stringify(result));
