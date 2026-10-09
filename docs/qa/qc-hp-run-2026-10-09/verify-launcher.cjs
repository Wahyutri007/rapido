const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const { EventEmitter } = require('node:events');
const file = path.resolve('scripts/start-hp.cjs');
const code = fs.readFileSync(file, 'utf8');
const checks = [];
const check = (name, actual, expected) => checks.push({ name, actual, expected, passed: JSON.stringify(actual) === JSON.stringify(expected) });
function fixture(options = {}) {
  const adbCalls = [], spawned = [], killed = [], messages = [], methods = [];
  let opened = 0, childStarted = false, child;
  const fakeProcess = Object.assign(new EventEmitter(), {
    platform: 'win32', execPath: process.execPath, versions: { node: options.oldNode ? '20.10.0' : '22.13.1' },
    env: { RAPIDO_ADB_PATH: 'QC-ADB.exe', EXPO_PUBLIC_BASE_URL: 'http://127.0.0.1:8001', EXPO_PUBLIC_API_URL: 'http://127.0.0.1:8001/api' },
    argv: ['node', file], exitCode: undefined,
  });
  if (options.nonlocalBackend) fakeProcess.env.EXPO_PUBLIC_API_URL = 'http://192.168.1.8:8001/api';
  const fakeFs = Object.assign({}, fs, { existsSync: (name) => {
    if (String(name).endsWith('QC-ADB.exe')) return !options.noAdb;
    if (options.noDependencies && String(name).replaceAll('\\', '/').endsWith('/node_modules/expo/bin/cli')) return false;
    return fs.existsSync(name);
  } });
  const fakeChildProcess = {
    spawnSync: (executable, args) => {
      if (executable === 'where.exe') return { status: 1, stdout: '', stderr: '' };
      adbCalls.push(args);
      if (args[0] === 'devices') return { status: 0, stdout: `List of devices attached\n${options.devices ?? 'QC-PHONE device product:fixture'}\n`, stderr: '' };
      if (args.includes('dumpsys')) return { status: 0, stdout: `versionName=${options.expoVersion ?? '57.0.9'}`, stderr: '' };
      if (args.includes('reverse')) return options.reverseFailure ? { status: 1, stdout: '', stderr: 'Fixture USB reverse failure' } : { status: 0, stdout: '', stderr: '' };
      if (args.includes('am')) {
        opened++;
        if (child) queueMicrotask(() => child.emit('exit', 0));
        return { status: 0, stdout: 'Status: ok', stderr: '' };
      }
      throw new Error(`Uncovered ADB command: ${args.join(' ')}`);
    },
    spawn: (executable, args, config) => {
      spawned.push({ executable, args, config }); childStarted = true;
      child = new EventEmitter(); child.pid = 99999;
      child.kill = (signal) => { killed.push({ pid: child.pid, signal }); queueMicrotask(() => child.emit('exit', 1)); return true; };
      if (options.spawnError) queueMicrotask(() => child.emit('error', new Error('Fixture spawn error')));
      return child;
    },
  };
  const fetch = async (url, config) => {
    methods.push(config?.method ?? 'GET');
    if (url.endsWith('/api/health')) return { ok: !options.backendFailure, status: options.backendFailure ? 503 : 200, json: async () => ({ data: { status: options.maintenance ? 'maintenance' : 'online' } }) };
    if (options.metroMissing && !childStarted || options.spawnError && childStarted) {
      const error = new Error('Connection refused'); error.cause = { code: 'ECONNREFUSED' }; throw error;
    }
    if (url.endsWith('/status')) return { ok: !options.nonMetro, status: options.nonMetro ? 404 : 200, text: async () => options.nonMetro ? 'Other service' : 'packager-status:running' };
    return { ok: true, status: 200, json: async () => ({ extra: { expoClient: { sdkVersion: options.badMetroSdk ? '56.0.0' : '57.0.0', _internal: { projectRoot: options.foreignProject ? path.resolve('../other-project') : process.cwd() } } } }) };
  };
  const module = { exports: {} };
  const requireFixture = (name) => name === 'node:fs' ? fakeFs : name === 'node:child_process' ? fakeChildProcess : require(name);
  vm.runInNewContext(code, { module, exports: module.exports, require: requireFixture, __dirname: path.dirname(file), process: fakeProcess, console: { log: (...args) => messages.push(args.join(' ')), error: (...args) => messages.push(args.join(' ')) }, fetch, AbortSignal, URL, Date, setTimeout: (callback) => { queueMicrotask(callback); return 1; } }, { filename: file });
  return { launcher: module.exports, adbCalls, spawned, killed, messages, methods, process: fakeProcess, opened: () => opened };
}
(async () => {
  let f = fixture(); await f.launcher.main([]);
  check('warm server: opens expected Expo Go URI once', f.adbCalls.filter((args) => args.includes('am')).map((args) => args.slice(0)), [['-s', 'QC-PHONE', 'shell', 'am', 'start', '-W', '-a', 'android.intent.action.VIEW', '-d', 'exp://127.0.0.1:8088', '-p', 'host.exp.exponent']]);
  check('warm server: reverses Metro and backend for selected phone', f.adbCalls.filter((args) => args.includes('reverse')), [['-s', 'QC-PHONE', 'reverse', 'tcp:8088', 'tcp:8088'], ['-s', 'QC-PHONE', 'reverse', 'tcp:8001', 'tcp:8001']]);
  check('warm server: never starts or kills existing process', [f.spawned.length, f.killed.length], [0, 0]);
  check('warm server: HTTP probes are read only', [...new Set(f.methods)], ['GET']);
  f = fixture(); await f.launcher.main(['--check']);
  check('check flag: no launch, reverse, spawn or kill', [f.opened(), f.adbCalls.filter((args) => args.includes('reverse')).length, f.spawned.length, f.killed.length], [0, 0, 0, 0]);
  f = fixture({ devices: 'QC-A device\nQC-B device' }); await f.launcher.main(['--device', 'QC-B']);
  check('multiple devices: explicit serial scopes all mutation commands', f.adbCalls.filter((args) => args.includes('reverse') || args.includes('am')).every((args) => args[0] === '-s' && args[1] === 'QC-B'), true);
  for (const [name, options, args, pattern] of [
    ['no phone', { devices: '' }, [], /HP belum siap/],
    ['unauthorized', { devices: 'QC-PHONE unauthorized' }, [], /Izinkan USB debugging/],
    ['offline selected', { devices: 'QC-PHONE offline' }, ['--device', 'QC-PHONE'], /offline/],
    ['multiple unspecified', { devices: 'QC-A device\nQC-B device' }, [], /Lebih dari satu/],
    ['missing selected', {}, ['--device', 'QC-MISSING'], /tidak terdeteksi/],
    ['missing serial argument', {}, ['--device'], /Isi serial/],
    ['unknown flag', {}, ['--unexpected'], /Opsi tidak dikenal/],
    ['old Node', { oldNode: true }, [], /Node.js 22.13/],
    ['dependency missing', { noDependencies: true }, [], /npm ci/],
    ['ADB missing', { noAdb: true }, [], /ADB belum ditemukan/],
    ['SDK mismatch', { expoVersion: '56.0.1' }, [], /SDK 57/],
    ['backend unavailable', { backendFailure: true }, [], /Backend belum siap/],
    ['backend maintenance', { maintenance: true }, [], /status backend bukan online/],
    ['nonlocal backend', { nonlocalBackend: true }, [], /backend HTTP localhost/],
    ['occupied non-Metro port', { nonMetro: true }, [], /layanan lain/],
    ['foreign Metro project', { foreignProject: true }, [], /bukan proyek Rapido/],
    ['Metro SDK mismatch', { badMetroSdk: true }, [], /SDK server Metro berbeda/],
  ]) {
    f = fixture(options); let message = '';
    try { await f.launcher.main(args); } catch (error) { message = error.message; }
    check(`${name}: actionable error before launch`, pattern.test(message), true);
    check(`${name}: leaves app/ports/processes untouched`, [f.opened(), f.adbCalls.filter((args) => args.includes('reverse')).length, f.spawned.length, f.killed.length], [0, 0, 0, 0]);
  }
  f = fixture({ reverseFailure: true }); let reverseError = '';
  try { await f.launcher.main([]); } catch (error) { reverseError = error.message; }
  check('USB reverse error: reports failure and cannot launch', [reverseError.includes('USB reverse failure'), f.opened(), f.spawned.length], [true, 0, 0]);
  f = fixture({ metroMissing: true }); await f.launcher.main([]);
  check('cold server: starts one Metro and opens phone', [f.spawned.length, f.opened()], [1, 1]);
  check('cold server: Expo Go/local IPv4/8088/one worker/offline flags', f.spawned[0].args.slice(2), ['start', '--go', '--localhost', '--port', '8088', '--max-workers', '1', '--offline']);
  check('cold server: child uses application directory and hidden window', [f.spawned[0].config.cwd, f.spawned[0].config.windowsHide], [process.cwd(), true]);
  check('cold server: backend env applies to owned child, parent unchanged', [f.spawned[0].config.env.EXPO_PUBLIC_API_URL, f.process.env.EXPO_PUBLIC_API_URL, f.killed.length], ['http://127.0.0.1:8001/api', 'http://127.0.0.1:8001/api', 0]);
  check('cold server: SIGINT listener removed after own child exits', f.process.listenerCount('SIGINT'), 0);
  f = fixture({ metroMissing: true, spawnError: true }); let spawnError = '';
  try { await f.launcher.main([]); } catch (error) { spawnError = error.message; }
  check('spawn error: reports error and cannot open HP', [spawnError.includes('Fixture spawn error'), f.opened()], [true, 0]);
  check('spawn error: no foreign process is killed', f.killed, []);
  f = fixture(); await f.launcher.main(['--help']);
  check('help: no device/HTTP/process operations', [f.adbCalls.length, f.methods.length, f.spawned.length], [0, 0, 0]);
  const output = { owner: 'QC', createdAt: new Date().toISOString(), scope: 'Production HP launcher in VM, actual filesystem/project version, controlled device/HTTP/process adapters; no real process kill/phone operations in this suite', sourceHashes: { 'scripts/start-hp.cjs': crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex') }, passed: checks.filter((item) => item.passed).length, failed: checks.filter((item) => !item.passed).length, checks };
  fs.writeFileSync(path.join(__dirname, 'launcher-results.json'), JSON.stringify(output, null, 2) + '\n');
  console.log(JSON.stringify({ passed: output.passed, failed: output.failed, failures: checks.filter((item) => !item.passed).map((item) => item.name) }));
  process.exitCode = output.failed ? 1 : 0;
})().catch((error) => { console.error(error); process.exitCode = 1; });
