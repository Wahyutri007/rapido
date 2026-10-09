const fs = require("node:fs");
const path = require("node:path");
const target = path.join(__dirname, "check.cjs");
if (fs.existsSync(target)) throw new Error("Check already built; no overwrite");
const prefix = fs.readFileSync(path.join(__dirname, "adapters.cjs.txt"), "utf8");
const cases = fs.readFileSync(path.join(__dirname, "cases.cjs.txt"), "utf8");
fs.writeFileSync(target, `${prefix}\n${cases}`);
console.log("Built new Integration cases using copied presentation adapters only");
