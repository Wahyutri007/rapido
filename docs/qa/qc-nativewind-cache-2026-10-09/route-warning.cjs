const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const root = path.resolve(__dirname, "../../..");
const sorterFile = "node_modules/expo-router/build/useScreens.js";
const sorterSource = fs.readFileSync(path.join(root, sorterFile), "utf8");
const sorterAST = ts.createSourceFile(sorterFile, sorterSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
const declaration = sorterAST.statements.find(node => ts.isFunctionDeclaration(node) && node.name.text === "getSortedChildren");
assert.ok(declaration, "installed production sorter found");
const warnings = [];
const getSortedChildren = new Function("Route_1", "console", `${declaration.getText(sorterAST)}; return getSortedChildren;`)(
  require(path.join(root, "node_modules/expo-router/build/sortRoutes.js")),
  { warn: (...args) => warnings.push(args) },
);

function registrations(source) {
  const ast = ts.createSourceFile("layout.tsx", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const result = [];
  const walk = node => {
    if (ts.isJsxSelfClosingElement(node) && node.tagName.getText(ast) === "JSStack.Screen") {
      const name = node.attributes.properties.find(attribute => ts.isJsxAttribute(attribute) && attribute.name.text === "name");
      assert.ok(name && ts.isStringLiteral(name.initializer), "literal Screen name");
      result.push({ name: name.initializer.text });
    }
    ts.forEachChild(node, walk);
  };
  walk(ast);
  return result;
}

function children(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if (entry.isDirectory() && fs.existsSync(path.join(directory, entry.name, "_layout.tsx"))) return [{ route: entry.name }];
    if (entry.isFile() && entry.name.endsWith(".tsx") && entry.name !== "_layout.tsx") return [{ route: entry.name.slice(0, -4) }];
    return [];
  });
}

const parentFile = "app/(no-layout)/_layout.tsx";
const childFile = "app/(no-layout)/(cashier)/catalog/_layout.tsx";
const parent = fs.readFileSync(path.join(root, parentFile), "utf8");
const child = fs.readFileSync(path.join(root, childFile), "utf8");
const invalid = ["menu/search", "menu", "catalog/menu"];
const candidateParent = parent.replace(/      <JSStack.Screen\r?\n        name="menu\/search"\r?\n        options=\{\{ header: \(\) => <Header back title="Cari" \/> \}\}\r?\n      \/>\r?\n/, "")
  .replace(/      <JSStack.Screen name="menu" options=\{\{ headerShown: false \}\} \/>\r?\n/, "")
  .replace(/      <JSStack.Screen name="catalog\/menu" options=\{\{ headerShown: false \}\} \/>\r?\n/, "");
const insertion = '\t\t\t<JSStack.Screen\n\t\t\t\tname="search"\n\t\t\t\toptions={{ header: () => <Header back title="Cari" /> }}\n\t\t\t/>\n';
const candidateChild = child.replace("\t\t</JSStack>", insertion + "\t\t</JSStack>");
assert.notEqual(candidateParent, parent);
assert.notEqual(candidateChild, child);
const checks = [];
const check = (name, callback) => { callback(); checks.push(name); };
const directChildren = children(path.dirname(path.join(root, parentFile)));
const actual = getSortedChildren(directChildren, registrations(parent));
check("production router reproduces all three legacy root warnings", () => assert.deepEqual(warnings.map(args => /No route named "([^"]+)"/.exec(args[0])[1]), invalid));
check("current warnings do not remove valid screens", () => assert.equal(actual.length, directChildren.length));
check("catalog menu exists under child layout", () => {
  assert.ok(fs.existsSync(path.join(root, "app/(no-layout)/catalog/menu/_layout.tsx")));
  assert.ok(registrations(fs.readFileSync(path.join(root, "app/(no-layout)/catalog/_layout.tsx"), "utf8")).some(screen => screen.name === "menu"));
});
check("search screen exists under cashier catalog", () => assert.ok(fs.existsSync(path.join(root, "app/(no-layout)/(cashier)/catalog/search.tsx"))));
warnings.length = 0;
const proposed = getSortedChildren(directChildren, registrations(candidateParent));
check("suggested parent patch produces zero route warnings", () => assert.equal(warnings.length, 0));
check("suggested parent patch retains all routable children", () => assert.deepEqual(proposed.map(entry => entry.route.route).sort(), actual.map(entry => entry.route.route).sort()));
const removed = registrations(parent).filter(screen => !registrations(candidateParent).some(next => next.name === screen.name)).map(screen => screen.name);
check("suggested parent removes only three invalid declarations", () => assert.deepEqual(removed, invalid));
const actualChildNames = registrations(child).map(entry => entry.name);
const proposedChildNames = registrations(candidateChild).map(entry => entry.name);
check("suggested search header registration retains index and detail", () => assert.deepEqual(proposedChildNames, [...actualChildNames, "search"]));
getSortedChildren(children(path.dirname(path.join(root, childFile))), registrations(candidateChild));
check("suggested child patch produces zero route warnings", () => assert.equal(warnings.length, 0));
check("suggestion keeps Cari header in actual search layout", () => assert.ok(candidateChild.includes('name="search"\n\t\t\t\toptions={{ header: () => <Header back title="Cari" /> }}')));

fs.writeFileSync(path.join(__dirname, "candidate-parent.tsx.txt"), candidateParent);
fs.writeFileSync(path.join(__dirname, "candidate-child.tsx.txt"), candidateChild);
const result = { status: "PASS", count: checks.length, checks, finding: "QC-HP-WARNING-001", parentFile, childFile, warningRoutes: invalid, actualDirectChildren: directChildren.map(child => child.route), productionSorterFile: sorterFile, scope: "actual sorter + filesystem + AST; candidate only, no app source edit or native runtime rerun" };
fs.writeFileSync(path.join(__dirname, "route-warning-results.json"), JSON.stringify(result, null, 2) + "\n");
console.log(JSON.stringify(result));
