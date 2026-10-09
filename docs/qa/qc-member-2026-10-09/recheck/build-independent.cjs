// Reuse the original QC production-module loader, with controllable HTTP stubs.
// Writes only this QC packet; application source and historical results stay intact.
const fs = require("node:fs");
const path = require("node:path");
const original = fs.readFileSync(path.join(__dirname, "check-original.cjs"), "utf8");
let loader = original.slice(0, original.indexOf("(async () => {\n  for (const [name, patch, expected]"));
if (!loader.includes("const save =")) throw Error("Original QC loader boundary missing");
loader = loader
	.replace("responseError = null, allowed", "responseError = null, pendingResponse = null, allowed")
	.replaceAll("return [null, responseError];", "return pendingResponse ? await pendingResponse : [null, responseError];")
	.replace("requests = []; responseError = null;};", "requests = []; responseError = null; pendingResponse = null;};");
const scenarios = String.raw`
(async () => {
  for (const [kind, problem] of [
    ['success', null],
    ['validation error', {status: 422, errors: {phone: ['Old A error']}}],
    ['server error', {status: 500, message: 'Old A server error'}],
  ]) {
    await reset();
    await render('a', member('a', 'Member A'));
    await act(async () => form().setValue('name', 'First A draft'));
    let finish, submission;
    pendingResponse = new Promise(resolve => { finish = resolve; });
    await act(async () => {
      submission = save().onPress();
      await Promise.resolve();
      await Promise.resolve();
    });
    check(kind + ' pending request retains original ID/payload', requests.map(r => [r.method, r.id, r.payload.name]), [['PUT', 'a', 'First A draft']]);
    await render('b', member('b', 'Member B'));
    await render('a', member('a', 'Member A reopened'));
    await act(async () => form().setValue('name', 'Reopened A draft'));
    await act(async () => { finish([null, problem]); await submission; });
    check(kind + ' old A cannot replace reopened A draft', form().getValues('name'), 'Reopened A draft');
    check(kind + ' old A cannot lock reopened A save', save().isDisabled, false);
    check(kind + ' old A cannot open reopened A success', renderer.root.findByType('SuccessModal').props.openState[0], false);
    check(kind + ' old A cannot open reopened A error', renderer.root.findByType('AlertModal').props.openState[0], false);
    check(kind + ' old A cannot attach reopened A field error', Boolean(form().getFieldState('phone').error), false);
  }

  await reset();
  currentId = 'strict';
  Object.assign(query, {data: member('strict', 'Strict Member'), isLoading: false, isError: false});
  await act(async () => { renderer = create(React.createElement(React.StrictMode, null, React.createElement(Route))); });
  check('StrictMode setup/cleanup replay hydrates editor', form().getValues('name'), 'Strict Member');
  await act(async () => save().onPress());
  check('StrictMode submit reaches original ID once', requests.map(r => [r.method, r.id]), [['PUT', 'strict']]);
  check('StrictMode replay keeps mounted guard active for success', renderer.root.findByType('SuccessModal').props.openState[0], true);
  check('StrictMode successful editor locks repeated save', save().isDisabled, true);
  await reset();
  check('no unexpected React errors', errors, []);

  const files = ['components/feature/manage/member/MemberModifyScreen.tsx', 'app/(no-layout)/manage/member/modify.tsx', 'schema/add/customer.ts', 'lib/manage/members.ts'];
  const result = {date: '2026-10-09', scope: 'Independent QC additional request-lifetime cases: A -> B -> reopened A and StrictMode. Production route/editor/RHF/Zod; API/query/modal/native primitives adapted. Not browser/native/backend.', passed: checks.filter(c => c.passed).length, failed: checks.filter(c => !c.passed).length, checks, errors, hashes: Object.fromEntries(files.map(f => [f, crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')]))};
  fs.writeFileSync(path.join(__dirname, 'independent-results.json'), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({passed: result.passed, failed: result.failed, failures: checks.filter(c => !c.passed)}));
  process.exitCode = result.failed ? 1 : 0;
})().catch(error => { console.error(error); process.exitCode = 2; });
`;
fs.writeFileSync(path.join(__dirname, "independent.cjs"), loader + scenarios);
