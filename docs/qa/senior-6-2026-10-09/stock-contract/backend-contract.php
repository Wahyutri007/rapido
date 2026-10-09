<?php
// Production Request + ValidUserContent, on an isolated SQLite :memory: connection.
// No HTTP requests or changes to the application's configured database.
$root = 'C:/Users/Wahyu/Downloads/rapido-backend-dev/rapido-backend-dev';
require $root.'/vendor/autoload.php';
$app = require $root.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
config(['database.connections.sd6_contract' => [
    'driver' => 'sqlite', 'database' => ':memory:', 'prefix' => '', 'foreign_key_constraints' => true,
], 'database.default' => 'sd6_contract']);
$connection = Illuminate\Support\Facades\DB::connection('sd6_contract');
if ($connection->getDatabaseName() !== ':memory:') throw new RuntimeException('Expected isolated memory database');
$schema = $connection->getSchemaBuilder();
foreach (['menus', 'categories', 'stock_settings'] as $table) {
    $schema->create($table, function (Illuminate\Database\Schema\Blueprint $table) {
        $table->string('id')->primary(); $table->string('user_id');
    });
}
$connection->table('menus')->insert([
    ['id' => 'menu-1', 'user_id' => 'owner-1'], ['id' => 'menu-2', 'user_id' => 'owner-1'],
    ['id' => 'foreign-menu', 'user_id' => 'owner-2'],
    ['id' => 'shared-id', 'user_id' => 'owner-1'],
]);
$connection->table('categories')->insert([
    ['id' => 'category-1', 'user_id' => 'owner-1'], ['id' => 'category-2', 'user_id' => 'owner-1'],
    ['id' => 'category-3', 'user_id' => 'owner-1'], ['id' => 'foreign-category', 'user_id' => 'owner-2'],
    ['id' => 'shared-id', 'user_id' => 'owner-1'],
]);
$connection->enableQueryLog(); $connection->flushQueryLog();
$owner = (new App\Domain\User\Models\User())->forceFill(['id' => 'owner-1']);
$emptyRequest = Illuminate\Http\Request::create('/settings/stock-settings', 'GET');
$emptyRequest->attributes->set('owner', $owner);
$emptyResponse = (new App\Domain\User\Controllers\Settings\StockSettingController())->index($emptyRequest)->getData(true);
$emptyResponsePassed = $emptyResponse['success'] === true && array_key_exists('data', $emptyResponse) && $emptyResponse['data'] === null;
$positive = json_decode(file_get_contents(__DIR__.'/payloads.json'), true, 512, JSON_THROW_ON_ERROR);
$cases = array_map(fn ($case) => [...$case, 'shouldPass' => true], $positive);
foreach ([
    ['item', ['category-1']], ['category', ['menu-1']],
    ['item', ['foreign-menu']], ['category', ['foreign-category']],
    ['item', ['prod-1']], ['category', ['missing-category']],
] as [$contentType, $ids]) {
    $cases[] = ['scenario' => 'reject '.$contentType.' '.implode(',', $ids), 'payload' => [
        'enabled' => true, 'type' => 'hybrid', 'content_type' => $contentType, 'stockable_ids' => $ids,
    ], 'shouldPass' => false];
}
$results = []; $allPassed = $emptyResponsePassed;
foreach ($cases as $case) {
    $request = App\Domain\User\Requests\StockSettingRequest::create('/settings/stock-settings', 'POST', $case['payload']);
    $request->attributes->set('owner', $owner);
    $request->setContainer($app); $app->instance('request', $request);
    $validator = Illuminate\Support\Facades\Validator::make($request->all(), $request->rules());
    $request->setValidator($validator);
    $valid = $validator->passes(); $matches = $valid === $case['shouldPass'];
    $validated = $valid ? $request->validated() : null;
    if ($valid && $case['payload']['type'] === 'hybrid') {
        $morphType = $case['payload']['content_type'] === 'category' ? 'category' : 'menu';
        $expected = array_map(fn ($id) => ['stockable_id' => $id, 'stockable_type' => $morphType], $case['payload']['stockable_ids']);
        $matches = $matches && $validated['stockables'] === $expected && !isset($validated['stockable_ids']);
    }
    if ($valid && $case['payload']['type'] === 'all') $matches = $matches && !isset($validated['stockables']);
    $allPassed = $allPassed && $matches;
    $results[] = [...$case, 'valid' => $valid, 'passed' => $matches, 'validated' => $validated, 'errors' => $validator->errors()->toArray()];
}
$hashes = [];
foreach ([
    'app/Domain/User/Requests/StockSettingRequest.php', 'app/Rules/ValidUserContent.php',
    'app/Domain/User/Enums/StockSettingContentEnum.php', 'app/Domain/User/Enums/StockSettingTypeEnum.php',
    'app/Domain/Catalog/Models/Menu.php', 'app/Domain/Catalog/Models/Category.php',
    'app/Domain/User/Controllers/Settings/StockSettingController.php', 'app/Domain/User/Models/StockSettings/StockSetting.php',
    'app/Traits/HasResponseBuilder.php',
] as $file) $hashes[$file] = hash_file('sha256', $root.'/'.$file);
file_put_contents(__DIR__.'/backend-results.json', json_encode([
    'connection' => 'sd6_contract', 'database' => ':memory:', 'backendSourceHashes' => $hashes,
    'payloadHash' => hash_file('sha256', __DIR__.'/payloads.json'), 'cases' => $results, 'passed' => $allPassed,
    'emptySettingControllerResponse' => ['passed' => $emptyResponsePassed, 'response' => $emptyResponse],
    'validationQueriesInMemory' => count($connection->getQueryLog()),
    'limitations' => 'Production Request/ownership and controller GET without settings on isolated fixture tables; no HTTP, live database, controller store/persistence or transaction checkout.',
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES).PHP_EOL);
echo count($results).' backend contract cases: '.($allPassed ? 'PASS' : 'FAIL').PHP_EOL;
exit($allPassed ? 0 : 1);
