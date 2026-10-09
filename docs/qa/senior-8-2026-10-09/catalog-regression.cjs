// Run from the app root: node docs/qa/senior-8-2026-10-09/catalog-regression.cjs
// Executes production memo declarations with real React hooks in headless Edge.
// Fixtures replace API results; this does not render the full native screens.
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const assert = require("node:assert/strict");
const { launch } = require("./browser.cjs");
const out = __dirname;
const files = {
	bundling: "app/(no-layout)/catalog/bundling/detail.tsx",
	extra: "app/(no-layout)/catalog/extra-menu/detail.tsx",
	menu: "app/(no-layout)/catalog/menu/detail.tsx",
};
function hookComponent(file, bindings) {
	const source = fs.readFileSync(file, "utf8");
	const ast = ts.createSourceFile(
		file,
		source,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TSX,
	);
	const declarations = [];
	function visit(node) {
		if (
			ts.isVariableDeclaration(node) &&
			node.initializer &&
			ts.isCallExpression(node.initializer) &&
			node.initializer.expression.getText(ast) === "React.useMemo"
		)
			declarations.push(node);
		ts.forEachChild(node, visit);
	}
	visit(ast);
	const body = declarations
		.map((node) => `const ${node.getText(ast)};`)
		.join("\n");
	const names = declarations.map((node) => node.name.getText(ast));
	return ts.transpileModule(
		`function Screen({env}) {
    const {${bindings.join(",")}} = env;
    ${body}
    globalThis.snapshot = {${names.join(",")}};
    return React.createElement("pre", null, JSON.stringify(globalThis.snapshot));
  }`,
		{ compilerOptions: { target: ts.ScriptTarget.ES2022 } },
	).outputText;
}
const bindings = {
	bundling: [
		"bundlingQuery",
		"bundlingId",
		"MOCK_BUNDLING_DATA",
		"storesQuery",
		"menusQuery",
	],
	extra: [
		"extraMenuQuery",
		"extraMenuId",
		"MOCK_EXTRA_MENU_DATA",
		"menusQuery",
	],
	menu: [
		"menuQuery",
		"menuId",
		"MOCK_MENU_DATA",
		"categoriesQuery",
		"brandsQuery",
		"unitsQuery",
		"orderTypesQuery",
		"extraMenusQuery",
	],
};
function reactRuntime() {
	const modules = {
		react: "react/cjs/react.production.js",
		"react-dom": "react-dom/cjs/react-dom.production.js",
		"react-dom/client": "react-dom/cjs/react-dom-client.production.js",
		scheduler: "scheduler/cjs/scheduler.production.js",
	};
	return `const factories = {${Object.entries(modules)
		.map(
			([id, file]) =>
				`${JSON.stringify(id)}: function(module,exports,require){${fs.readFileSync(path.join("node_modules", file), "utf8")}\n}`,
		)
		.join(",")}}; const cache = {};
  function require(id) { if(!cache[id]) { const module = {exports:{}}; cache[id]=module;
    factories[id](module,module.exports,require); } return cache[id].exports; }
  const React = require("react"); const {useMemo,useState,useSyncExternalStore}=React;
  const {flushSync} = require("react-dom");
  const root = require("react-dom/client").createRoot(document.getElementById("root"));
  const formatRp = value => "Rp " + value.toLocaleString("id-ID");`;
}
async function main() {
	const browser = await launch();
	const checks = [],
		errors = [];
	try {
		const page = await browser.newPage();
		page.on("pageerror", (error) => errors.push(error.message));
		await page.setContent('<div id="root"></div>');
		const components = Object.entries(files)
			.map(
				([key, file]) =>
					`${key}: (()=>{${hookComponent(file, bindings[key])};return Screen;})()`,
			)
			.join(",");
		await page.addScriptTag({
			content: `${reactRuntime()}
      const screens = {${components}};
      let previousEnv;
      function share(previous,next) {
        if(JSON.stringify(previous)===JSON.stringify(next)) return previous;
        if(next && typeof next==="object") return Object.fromEntries(Object.entries(next).map(([key,value])=>[key,Array.isArray(value) ? (JSON.stringify(previous?.[key])===JSON.stringify(value) ? previous[key] : value) : share(previous?.[key],value)]));
        return next;
      }
      globalThis.renderFixture=(name,env)=>{env=share(previousEnv,env);previousEnv=env;flushSync(()=>root.render(React.createElement(screens[name],{env})));return snapshot;};`,
		});
		const check = async (name, screen, env, verify) => {
			const result = await page.evaluate(
				({ screen, env }) => renderFixture(screen, env),
				{ screen, env },
			);
			verify(result);
			checks.push(name);
		};
		const menu = {
			id: "m1",
			category_id: "c1",
			brand_id: "b1",
			unit_id: "u1",
			order_type_ids: ["o1"],
			extra_menu_ids: ["e1"],
			entries: [{ sell_price: 12000, cost_price: 8000 }],
		};
		const menuEnv = {
			menuId: "m1",
			menuQuery: { data: menu },
			MOCK_MENU_DATA: [menu],
			categoriesQuery: { data: [{ id: "c1", name: "Food" }] },
			brandsQuery: { data: [{ id: "b1", name: "Brand" }] },
			unitsQuery: { data: [{ id: "u1", name: "Box" }] },
			orderTypesQuery: { data: [{ id: "o1", name: "Delivery" }] },
			extraMenusQuery: { data: [{ id: "e1", name: "Cheese" }] },
		};
		await check("menu resolves relations and prices", "menu", menuEnv, (r) => {
			assert.equal(r.categoryName, "Food");
			assert.equal(r.brandName, "Brand");
			assert.equal(r.unitName, "Box");
			assert.deepEqual(r.selectedOrderTypes, ["Delivery"]);
			assert.deepEqual(r.selectedExtras, ["Cheese"]);
			assert.equal(r.priceDisplay, "Rp 12.000");
			assert.equal(r.costPriceDisplay, "Rp 8.000");
		});
		menuEnv.categoriesQuery.data[0].name = "Refetched category";
		menuEnv.brandsQuery.data[0].name = "Refetched brand";
		menuEnv.unitsQuery.data[0].name = "Refetched unit";
		menuEnv.orderTypesQuery.data[0].name = "Refetched order";
		menuEnv.extraMenusQuery.data[0].name = "Refetched extra";
		await check(
			"reference query refetch updates every relation",
			"menu",
			menuEnv,
			(r) => {
				assert.equal(r.categoryName, "Refetched category");
				assert.equal(r.brandName, "Refetched brand");
				assert.equal(r.unitName, "Refetched unit");
				assert.deepEqual(r.selectedOrderTypes, ["Refetched order"]);
				assert.deepEqual(r.selectedExtras, ["Refetched extra"]);
			},
		);
		menuEnv.menuId = "m2";
		menuEnv.menuQuery.data = {
			id: "m2",
			entries: [{ sell_price: 24000, cost_price: 10000 }],
		};
		await check(
			"switch menu ID updates prices and missing relations",
			"menu",
			menuEnv,
			(r) => {
				assert.equal(r.data.id, "m2");
				assert.equal(r.categoryName, "-");
				assert.equal(r.brandName, "-");
				assert.equal(r.unitName, "-");
				assert.equal(r.priceDisplay, "Rp 24.000");
				assert.equal(r.costPriceDisplay, "Rp 10.000");
			},
		);
		menuEnv.menuQuery = {};
		menuEnv.menuId = "m1";
		await check(
			"missing backend preserves existing fixture fallback",
			"menu",
			menuEnv,
			(r) => assert.equal(r.data.id, "m1"),
		);
		menuEnv.menuQuery = {
			data: {
				...menu,
				category_id: "unknown",
				brand_id: "unknown",
				unit_id: "unknown",
				order_type_ids: ["unknown"],
				extra_menu_ids: ["unknown"],
			},
		};
		await check(
			"unresolved relation fallbacks unchanged",
			"menu",
			menuEnv,
			(r) => {
				assert.equal(r.categoryName, "Makanan");
				assert.equal(r.brandName, "Pizza Hut");
				assert.equal(r.unitName, "pcs");
				assert.deepEqual(r.selectedOrderTypes, ["Dine In", "Take Away"]);
				assert.deepEqual(r.selectedExtras, ["Topping"]);
			},
		);
		const extraEnv = {
			extraMenuId: "e1",
			extraMenuQuery: {
				data: { id: "e1", menus: [{ id: "direct", name: "Direct" }] },
			},
			MOCK_EXTRA_MENU_DATA: [{ id: "fallback" }],
			menusQuery: {
				data: [
					{ id: "m1", extra_menu_ids: ["e1"] },
					{ id: "m2", extra_menu_ids: ["e2"] },
				],
			},
		};
		await check(
			"embedded extra relations have priority",
			"extra",
			extraEnv,
			(r) => assert.equal(r.linkedMenus[0].id, "direct"),
		);
		extraEnv.extraMenuQuery.data = { id: "e1", menu_ids: ["m2"] };
		await check(
			"extra query refetch resolves both relation directions",
			"extra",
			extraEnv,
			(r) =>
				assert.deepEqual(
					r.linkedMenus.map((m) => m.id),
					["m1", "m2"],
				),
		);
		extraEnv.extraMenuId = "e2";
		extraEnv.extraMenuQuery.data = { id: "e2" };
		await check("switch extra ID excludes old links", "extra", extraEnv, (r) =>
			assert.deepEqual(
				r.linkedMenus.map((m) => m.id),
				["m2"],
			),
		);
		extraEnv.menusQuery = {};
		await check(
			"missing menu query yields empty linked list",
			"extra",
			extraEnv,
			(r) => assert.deepEqual(r.linkedMenus, []),
		);
		const bundle = {
			id: "b1",
			stores: [{ id: "s1", name: "Outlet" }],
			prices: [
				{ order_type_id: "o1", order_type_name: "Dine In", sell_price: 22000 },
			],
			details: [{ id: "d1", menu_id: "m1", quantity: 2 }],
		};
		const bundleEnv = {
			bundlingId: "b1",
			bundlingQuery: { data: bundle },
			MOCK_BUNDLING_DATA: [bundle],
			storesQuery: { data: [] },
			menusQuery: { data: [{ id: "m1", name: "Rice" }] },
		};
		await check(
			"bundling resolves outlet prices and item names",
			"bundling",
			bundleEnv,
			(r) => {
				assert.equal(r.storeList[0].name, "Outlet");
				assert.equal(r.priceList[0].sell_price, 22000);
				assert.equal(r.priceList[0].icon, "coffee");
				assert.equal(r.resolvedItems[0].name, "Rice");
			},
		);
		bundleEnv.bundlingQuery.data = {
			...bundle,
			stores: [{ id: "s2", name: "New outlet" }],
			prices: [
				{
					order_type_id: "o2",
					order_type_name: "Online Food",
					sell_price: 35000,
				},
			],
		};
		bundleEnv.menusQuery.data[0].name = "Refetched rice";
		await check(
			"bundling refetch updates outlet price icon and item",
			"bundling",
			bundleEnv,
			(r) => {
				assert.equal(r.storeList[0].id, "s2");
				assert.equal(r.priceList[0].sell_price, 35000);
				assert.equal(r.priceList[0].icon, "truck");
				assert.equal(r.resolvedItems[0].name, "Refetched rice");
			},
		);
		bundleEnv.bundlingId = "b2";
		bundleEnv.bundlingQuery.data = { id: "b2", sell_price: 18000, details: [] };
		bundleEnv.storesQuery.data = [
			{ id: "s3", name: "Query outlet", address: "Bandung" },
		];
		await check(
			"switch bundle ID preserves query store and price fallbacks",
			"bundling",
			bundleEnv,
			(r) => {
				assert.equal(r.data.id, "b2");
				assert.equal(r.storeList[0].id, "s3");
				assert.equal(r.priceList[0].sell_price, 18000);
				assert.deepEqual(r.resolvedItems, []);
			},
		);
		bundleEnv.bundlingQuery = {};
		bundleEnv.storesQuery = {};
		await check(
			"missing bundle preserves existing first-fixture fallback",
			"bundling",
			bundleEnv,
			(r) => assert.equal(r.data.id, "b1"),
		);
		assert.deepEqual(errors, []);
		fs.writeFileSync(
			path.join(out, "catalog-results.json"),
			JSON.stringify(
				{
					kind: "production memo hooks in React DOM with API fixtures",
					checks,
					runtimeErrors: errors,
					files,
				},
				null,
				2,
			) + "\n",
		);
		console.log(
			`${checks.length} catalog regression scenarios passed; runtime errors: ${errors.length}`,
		);
	} finally {
		await browser.close();
	}
}
module.exports = { reactRuntime, hookComponent };
if (require.main === module)
	main().catch((error) => {
		console.error(error);
		process.exitCode = 1;
	});
