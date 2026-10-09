// Small CDP runner using Node 22 WebSocket and the locally installed Edge.
// Creates its own temporary browser profile; no app/server/dependency changes.
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { setTimeout: delay } = require("node:timers/promises");
async function launch() {
	const profile = fs.mkdtempSync(
		path.join(os.tmpdir(), "rapido-senior8-browser-"),
	);
	const child = spawn(
		"C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
		[
			"--headless=new",
			"--disable-gpu",
			"--no-first-run",
			"--no-default-browser-check",
			"--remote-debugging-port=0",
			`--user-data-dir=${profile}`,
			"about:blank",
		],
		{ windowsHide: true, stdio: "ignore" },
	);
	child.unref();
	let launchError;
	child.on("error", (error) => {
		launchError = error;
	});
	let ws;
	try {
		const portFile = path.join(profile, "DevToolsActivePort");
		for (let i = 0; !fs.existsSync(portFile); i++) {
			if (launchError) throw launchError;
			if (i >= 240) throw Error("Edge CDP launch timed out");
			await delay(250);
		}
		const port = fs.readFileSync(portFile, "utf8").split("\n")[0];
		const targets = await (
			await fetch(`http://127.0.0.1:${port}/json/list`)
		).json();
		ws = new WebSocket(
			targets.find((item) => item.type === "page").webSocketDebuggerUrl,
		);
		await new Promise((resolve, reject) => {
			ws.addEventListener("open", resolve, { once: true });
			ws.addEventListener("error", reject, { once: true });
		});
		let nextId = 0;
		const pending = new Map(),
			handlers = {};
		ws.addEventListener("message", ({ data }) => {
			const message = JSON.parse(data);
			if (message.id) {
				const callback = pending.get(message.id);
				if (callback) {
					pending.delete(message.id);
					clearTimeout(callback.timer);
					message.error
						? callback.reject(Error(JSON.stringify(message.error)))
						: callback.resolve(message.result);
				}
			} else if (message.method === "Runtime.exceptionThrown") {
				handlers.pageerror?.(
					Error(
						message.params.exceptionDetails.exception?.description ||
							message.params.exceptionDetails.text,
					),
				);
			}
		});
		function send(method, params = {}) {
			return new Promise((resolve, reject) => {
				const id = ++nextId;
				const timer = setTimeout(() => {
					pending.delete(id);
					reject(Error(`${method} timed out`));
				}, 30000);
				pending.set(id, { resolve, reject, timer });
				ws.send(JSON.stringify({ id, method, params }));
			});
		}
		await send("Runtime.enable");
		async function evaluate(expression) {
			const result = await send("Runtime.evaluate", {
				expression,
				awaitPromise: true,
				returnByValue: true,
			});
			if (result.exceptionDetails)
				throw Error(
					result.exceptionDetails.exception?.description ||
						result.exceptionDetails.text,
				);
			return result.result.value;
		}
		const page = {
			on: (event, callback) => {
				handlers[event] = callback;
			},
			setContent: (html) =>
				evaluate(`document.body.innerHTML=${JSON.stringify(html)}`),
			addScriptTag: ({ content }) => evaluate(content),
			evaluate: (fn, arg) =>
				evaluate(`(${fn.toString()})(${JSON.stringify(arg) ?? "undefined"})`),
		};
		return {
			newPage: async () => page,
			close: async () => {
				await send("Browser.close").catch(() => {});
				ws.close();
				// Profile is retained in TEMP as a diagnostic; no recursive cleanup of shared paths.
			},
		};
	} catch (error) {
		ws?.close();
		child.kill();
		throw error;
	}
}
module.exports = { launch };
