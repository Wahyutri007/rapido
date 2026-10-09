const fs = require("node:fs");
const path = require("node:path");

// CSS Interop 0.2.x initializes every native platform file with an empty write.
// Another Metro config load must not erase styles used by a running server.
// Limit this compatibility guard to synchronous NativeWind configuration only;
// the compiler's subsequent non-empty/async writes continue normally.
function preserveNativewindCache(initialize, cacheDirectory) {
	const nativeFiles = new Set(
		["android", "ios", "native", "macos", "windows"].map((platform) =>
			path.resolve(cacheDirectory, `${platform}.js`),
		),
	);
	const writeFileSync = fs.writeFileSync;
	try {
		fs.writeFileSync = function (file, data, ...options) {
			if (
				data === "" &&
				typeof file === "string" &&
				nativeFiles.has(path.resolve(file))
			) {
				try {
					if (fs.statSync(file).size > 0) return;
				} catch (error) {
					if (error.code !== "ENOENT") throw error;
				}
			}
			return writeFileSync.call(fs, file, data, ...options);
		};
		return initialize();
	} finally {
		fs.writeFileSync = writeFileSync;
	}
}

module.exports = { preserveNativewindCache };
