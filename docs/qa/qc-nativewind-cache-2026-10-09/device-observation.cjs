const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const root = path.resolve(__dirname, "../../..");
const adb = path.join(process.env.LOCALAPPDATA, "RapidoAndroidTools/platform-tools/adb.exe");
const args = ["-s", "35b9a8aa"];
const dir = path.join(root, ".expo/qc-phone-warning-2026-10-09");
fs.mkdirSync(dir, { recursive: true });
const run = (...command) => execFileSync(adb, [...args, ...command], { timeout: 20000, maxBuffer: 12 * 1024 * 1024, windowsHide: true });
const screenshot = path.join(dir, "current-device.png");
fs.writeFileSync(screenshot, run("exec-out", "screencap", "-p"));
const result = {
  observedAt: new Date().toISOString(),
  serial: "35b9a8aa",
  expoPid: run("shell", "pidof", "host.exp.exponent").toString("utf8").trim(),
  screenshot: path.relative(root, screenshot).replaceAll("\\", "/"),
  screenshotPublished: false,
  operations: ["screencap exec-out", "pidof host.exp.exponent"],
  noRestartReloadNavigationOrDataClear: true,
};
fs.writeFileSync(path.join(__dirname, "device-observation.json"), JSON.stringify(result, null, 2) + "\n");
console.log(JSON.stringify(result));
