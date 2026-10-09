<?php
$root = 'C:/Users/Wahyu/Downloads/rapido-backend-dev/rapido-backend-dev';
require $root.'/vendor/autoload.php';
$app = require $root.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
config(['database.connections.qc_stock_identity' => ['driver' => 'sqlite', 'database' => ':memory:', 'prefix' => '', 'foreign_key_constraints' => true], 'database.default' => 'qc_stock_identity']);
$db = Illuminate\Support\Facades\DB::connection('qc_stock_identity');
if ($db->getDatabaseName() !== ':memory:') throw new RuntimeException('Expected memory database');
foreach (['menus', 'categories'] as $name) $db->getSchemaBuilder()->create($name, function ($t) {$t->string('id')->primary(); $t->string('user_id');});
$db->table('menus')->insert([['id' => 'shared-a', 'user_id' => 'owner-1'], ['id' => 'shared-b', 'user_id' => 'owner-2'], ['id' => 'shared-own', 'user_id' => 'owner-1']]);
$db->table('categories')->insert([['id' => 'shared-a', 'user_id' => 'owner-2'], ['id' => 'shared-b', 'user_id' => 'owner-1'], ['id' => 'shared-own', 'user_id' => 'owner-1']]);
$owner = (new App\Domain\User\Models\User())->forceFill(['id' => 'owner-1']);
$checks = [];
foreach ([['item', 'shared-a', true], ['category', 'shared-a', false], ['item', 'shared-b', false], ['category', 'shared-b', true], ['item', 'shared-own', true], ['category', 'shared-own', true]] as [$kind, $id, $shouldPass]) {
    $payload = ['enabled' => true, 'type' => 'hybrid', 'content_type' => $kind, 'stockable_ids' => [$id]];
    $request = App\Domain\User\Requests\StockSettingRequest::create('/settings/stock-settings', 'POST', $payload);
    $request->setContainer($app); $request->attributes->set('owner', $owner); $app->instance('request', $request);
    $validator = Illuminate\Support\Facades\Validator::make($request->all(), $request->rules()); $request->setValidator($validator);
    $valid = $validator->passes(); $data = $valid ? $request->validated() : null;
    $expected = [['stockable_id' => $id, 'stockable_type' => $kind === 'category' ? 'category' : 'menu']];
    $checks[] = ['name' => 'shared namespace '.$kind.' '.$id, 'passed' => $valid === $shouldPass && (!$valid || $data['stockables'] === $expected), 'payload' => $payload, 'expectedValid' => $shouldPass, 'actualValid' => $valid, 'validated' => $data, 'errors' => $validator->errors()->toArray()];
}
$passed = count(array_filter($checks, fn($check) => $check['passed']));
file_put_contents(__DIR__.'/domain-identity-results.json', json_encode(['database' => ':memory:', 'connection' => 'qc_stock_identity', 'passed' => $passed, 'failed' => count($checks)-$passed, 'checks' => $checks, 'limitations' => 'Actual Request/ValidUserContent/ownership SQL, minimal memory tables; no HTTP/auth middleware/live DB/controller checkout.'], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES).PHP_EOL);
echo $passed.'/'.count($checks).' shared namespace checks passed'.PHP_EOL;
exit($passed === count($checks) ? 0 : 1);
