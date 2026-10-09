<?php
// QC: real controller/request/resources/models/stock service/transaction after-rule.
// All database operations use newly created fixture tables in SQLite :memory:.
// Only cart retrieval and Cart::load are adapted to a preloaded in-memory graph.
$root = 'C:/Users/Wahyu/Downloads/rapido-backend-dev/rapido-backend-dev';
require $root.'/vendor/autoload.php';
$app = require $root.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
config(['database.connections.qc_stock_policy' => [
    'driver' => 'sqlite', 'database' => ':memory:', 'prefix' => '', 'foreign_key_constraints' => true,
], 'database.default' => 'qc_stock_policy']);
$db = Illuminate\Support\Facades\DB::connection('qc_stock_policy');
if ($db->getDatabaseName() !== ':memory:') throw new RuntimeException('Memory isolation required');
$inputs = [
    'app/Domain/User/Controllers/Settings/StockSettingController.php',
    'app/Domain/User/Requests/StockSettingRequest.php', 'app/Rules/ValidUserContent.php',
    'app/Domain/User/Resources/StockSettings/StockSettingResource.php',
    'app/Domain/User/Resources/StockSettings/StockSettingDetailResource.php',
    'app/Domain/User/Models/StockSettings/StockSetting.php',
    'app/Domain/User/Models/StockSettings/StockSettingDetail.php',
    'app/Domain/User/Models/User.php', 'app/Traits/IsUserContent.php',
    'app/Domain/Catalog/Models/Menu.php', 'app/Domain/Catalog/Models/Category.php',
    'app/Domain/Catalog/Models/MenuEntry.php', 'app/Domain/Store/Models/Store.php',
    'app/Domain/Store/Models/StoreShift.php', 'app/Domain/Order/Models/Cart.php',
    'app/Domain/Order/Models/CartGroup.php', 'app/Domain/Order/Models/CartDetail.php',
    'app/Domain/Order/Requests/TransactionRequest.php', 'app/Domain/Order/Services/CartService.php',
    'app/Domain/Inventory/Services/StockService.php',
    'app/Domain/Inventory/Models/StockEntry.php', 'app/Domain/Inventory/Models/StockEntryDetail.php',
    'app/Traits/HasResponseBuilder.php', 'app/Providers/ModelServiceProvider.php',
];
$hashes = array_combine($inputs, array_map(fn($file) => hash_file('sha256', $root.'/'.$file), $inputs));
if ($hashes['app/Domain/Catalog/Models/Menu.php'] !== '7a57438ef6e1fcd419aea1ba192f2a6046fb42fa2a8d1e41b11de40a5624552e') throw new RuntimeException('Menu hash differs from review');
$schema = $db->getSchemaBuilder();
$schema->create('users', function ($t) { $t->string('id')->primary(); $t->string('name'); });
$schema->create('categories', function ($t) { $t->string('id')->primary(); $t->string('user_id'); $t->string('name'); });
$schema->create('menus', function ($t) { $t->string('id')->primary(); $t->string('user_id'); $t->string('name'); $t->string('category_id')->nullable(); });
$schema->create('menu_entries', function ($t) { $t->string('id')->primary(); $t->string('menu_id'); $t->string('variant_name')->nullable(); });
$schema->create('stock_settings', function ($t) { $t->string('id')->primary(); $t->string('user_id'); $t->string('type'); $t->string('content_type')->nullable(); $t->boolean('enabled'); $t->timestamps(); });
$schema->create('stock_setting_details', function ($t) { $t->string('id')->primary(); $t->string('stock_setting_id'); $t->string('stockable_id'); $t->string('stockable_type'); $t->timestamps(); });
$schema->create('stock_entries', function ($t) { $t->string('id')->primary(); $t->string('store_id'); });
$schema->create('stock_entry_details', function ($t) { $t->string('id')->primary(); $t->string('stock_entry_id'); $t->string('menu_id'); $t->integer('good_quantity'); });
$schema->create('store_shifts', function ($t) { $t->string('id')->primary(); $t->string('store_id'); $t->string('status'); $t->timestamps(); });
$db->table('store_shifts')->insert(['id' => 'qc-shift', 'store_id' => 'qc-store', 'status' => 'open', 'created_at' => '2026-10-09 00:00:00']);
$db->table('users')->insert(['id' => 'owner-1', 'name' => 'QC Fixture Owner']);
$db->table('categories')->insert([
    ['id' => 'category-1', 'user_id' => 'owner-1', 'name' => 'Makanan'],
    ['id' => 'category-2', 'user_id' => 'owner-1', 'name' => 'Minuman'],
]);
$db->table('menus')->insert([
    ['id' => 'menu-1', 'user_id' => 'owner-1', 'name' => 'Produk Satu', 'category_id' => 'category-1'],
    ['id' => 'menu-2', 'user_id' => 'owner-1', 'name' => 'Produk Dua', 'category_id' => 'category-2'],
    ['id' => 'menu-no-category', 'user_id' => 'owner-1', 'name' => 'Tanpa Kategori', 'category_id' => null],
]);
$db->enableQueryLog(); $db->flushQueryLog();

class QcPreloadedCart extends App\Domain\Order\Models\Cart {
    public array $requestedRelations = [];
    public function load($relations) {
        $this->requestedRelations = $relations;
        return $this;
    }
}
class QcCartProvider extends App\Domain\Order\Services\CartService {
    public QcPreloadedCart $fixture;
    public function getUserCart(App\Domain\Store\Models\Store $store, bool $withRelations = true): App\Domain\Order\Models\Cart {
        return $this->fixture;
    }
}
$provider = new QcCartProvider(); $app->instance(App\Domain\Order\Services\CartService::class, $provider);
$store = (new App\Domain\Store\Models\Store())->forceFill(['id' => 'qc-store']);
$owner = App\Domain\User\Models\User::findOrFail('owner-1');
$controller = new App\Domain\User\Controllers\Settings\StockSettingController();
$payloads = json_decode(file_get_contents(__DIR__.'/payloads.json'), true, 512, JSON_THROW_ON_ERROR);
$fromScreen = array_column($payloads, 'payload', 'scenario');
$checks = []; $observations = []; $roundtrips = [];
function qcCheck(string $name, $actual, $expected): void {
    global $checks;
    $checks[] = ['name' => $name, 'passed' => $actual === $expected, 'actual' => $actual, 'expected' => $expected];
}
function evaluateMenu(string $label, string $id, ?bool $expectedManaged): void {
    global $checks, $observations, $app, $store, $provider;
    $menu = App\Domain\Catalog\Models\Menu::findOrFail($id);
    $actual = $menu->is_stock_managed;
    qcCheck($label.' / accessor '.$id, $actual, $expectedManaged);
    $stock = app(App\Domain\Inventory\Services\StockService::class)->getStockInStore($store, $menu);
    if ($stock !== 0) throw new RuntimeException('Expected zero-stock fixture');
    $entry = (new App\Domain\Catalog\Models\MenuEntry())->forceFill(['id' => 'qc-entry', 'menu_id' => $id]);
    $entry->setRelation('menu', $menu);
    $detail = (new App\Domain\Order\Models\CartDetail())->forceFill(['id' => 'qc-detail', 'orderable_type' => 'menu_entry', 'orderable_id' => 'qc-entry', 'quantity' => 1]);
    $detail->setRelation('orderable', $entry);
    $group = (new App\Domain\Order\Models\CartGroup())->forceFill(['id' => 'qc-group']);
    $group->setRelation('details', new Illuminate\Database\Eloquent\Collection([$detail]));
    $provider->fixture = (new QcPreloadedCart())->forceFill(['id' => 'qc-cart']);
    $provider->fixture->setRelation('groups', new Illuminate\Database\Eloquent\Collection([$group]));
    $request = App\Domain\Order\Requests\TransactionRequest::create('/qc-fixture/transaction', 'POST');
    $request->setContainer($app); $request->attributes->set('store', $store); $app->instance('request', $request);
    $validator = Illuminate\Support\Facades\Validator::make([], $request->rules());
    foreach ($request->after() as $after) $validator->after($after);
    $validator->passes();
    if ($provider->fixture->requestedRelations !== App\Domain\Order\Models\Cart::$allRelations) throw new RuntimeException('Production after-rule did not load expected graph');
    $blocked = $validator->errors()->has('cart');
    qcCheck($label.' / zero-stock validation '.$id, $blocked, (bool)$expectedManaged);
    $observations[] = ['scenario' => $label, 'menu' => $id, 'category' => $menu->category_id, 'expectedManagedFromExclusionCopy' => $expectedManaged, 'actualManaged' => $actual, 'stock' => $stock, 'requiredQuantity' => 1, 'cartError' => $validator->errors()->toArray()];
}
// Absence of any configuration is recorded as a legacy control; no default policy asserted.
evaluateMenu('no configuration control', 'menu-1', null);
foreach ([
    ['all mode', 'no existing setting', [true, true, true]],
    ['disabled category', 'category disabled', [false, false, false]],
    ['item exclusion', 'item unchanged', [false, true, true]],
    ['category exclusion', 'category unchanged', [false, true, true]],
] as [$label, $scenario, $expected]) {
    $payload = $fromScreen[$scenario] ?? throw new RuntimeException('Missing production-screen payload '.$scenario);
    $request = App\Domain\User\Requests\StockSettingRequest::create('/settings/stock-settings', 'POST', $payload);
    $request->setContainer($app); $request->attributes->set('owner', $owner); $app->instance('request', $request);
    $validator = Illuminate\Support\Facades\Validator::make($request->all(), $request->rules());
    $request->setValidator($validator);
    if (!$validator->passes()) throw new RuntimeException('Controller payload failed validation: '.json_encode($validator->errors()));
    $response = $controller->store($request);
    $saved = json_decode($response->getContent(), true, 512, JSON_THROW_ON_ERROR);
    $get = Illuminate\Http\Request::create('/settings/stock-settings', 'GET');
    $get->attributes->set('owner', $owner); $app->instance('request', $get);
    $read = json_decode($controller->index($get)->getContent(), true, 512, JSON_THROW_ON_ERROR);
    $expectedIds = $payload['type'] === 'hybrid' ? $payload['stockable_ids'] : [];
    $expectedMorph = $payload['content_type'] === 'category' ? 'category' : 'menu';
    $actualIds = array_column($read['data']['details'], 'stockable_id');
    $morphs = array_column($read['data']['details'], 'stockable_type');
    // Compare fields consumed by this screen. Nullable/default attributes and
    // relation serialization can differ between an updated model and a fresh GET.
    $contract = fn($data) => [
        'id' => $data['id'], 'type' => $data['type'], 'enabled' => $data['enabled'],
        'content_type' => $data['content_type'] ?? null,
        'details' => array_map(fn($detail) => [$detail['stockable_type'], $detail['stockable_id']], $data['details']),
    ];
    $roundtripOk = $response->getStatusCode() === 200 && $saved['success'] === true && $read['success'] === true
        && $contract($saved['data']) === $contract($read['data']) && $actualIds === $expectedIds
        && $read['data']['enabled'] === $payload['enabled'] && $read['data']['type'] === $payload['type']
        && ($payload['type'] === 'all' || ($read['data']['content_type'] === $payload['content_type'] && $morphs === array_fill(0, count($expectedIds), $expectedMorph)));
    qcCheck($label.' / controller store and GET roundtrip', $roundtripOk, true);
    $roundtrips[] = ['scenario' => $scenario, 'payload' => $payload, 'storeResponse' => $saved, 'getResponse' => $read];
    foreach (['menu-1', 'menu-2', 'menu-no-category'] as $index => $id) evaluateMenu($label, $id, $expected[$index]);
}
$afterHashes = array_combine($inputs, array_map(fn($file) => hash_file('sha256', $root.'/'.$file), $inputs));
if ($hashes !== $afterHashes) throw new RuntimeException('Backend source changed during policy verification');
$passed = count(array_filter($checks, fn($check) => $check['passed']));
$queries = $db->getQueryLog();
if (Illuminate\Support\Facades\DB::getDefaultConnection() !== 'qc_stock_policy' || $db->getDatabaseName() !== ':memory:' || $db->transactionLevel() !== 0) throw new RuntimeException('Isolation/transaction check failed');
$result = [
    'connection' => 'qc_stock_policy', 'database' => ':memory:', 'sourceHashes' => $hashes, 'hashesStable' => true,
    'payloadHash' => hash_file('sha256', __DIR__.'/payloads.json'), 'passed' => $passed, 'failed' => count($checks) - $passed,
    'checks' => $checks, 'observations' => $observations, 'controllerRoundtrips' => $roundtrips,
    'queryCount' => count($queries), 'queries' => $queries, 'transactionLevel' => $db->transactionLevel(),
    'expectation' => 'UI production copy: all products are stock-limited except selected product/category IDs; enabled=false disables stock limiting.',
    'limitations' => 'Production controller/request/resource persistence only in ephemeral memory fixture; real Menu accessor, StockService zero inventory query and TransactionRequest::after. CartService and Cart::load adapt an already-loaded model graph. No HTTP middleware/auth, bundle flow, transaction creation, real store or application database write.',
];
file_put_contents(__DIR__.'/stock-policy-results.json', json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES).PHP_EOL);
echo $passed.'/'.count($checks).' QC stock policy checks passed; '.(count($checks) - $passed).' failed'.PHP_EOL;
foreach ($checks as $check) if (!$check['passed']) echo 'FAIL '.$check['name'].' expected='.json_encode($check['expected']).' actual='.json_encode($check['actual']).PHP_EOL;
exit($passed === count($checks) ? 0 : 1);
