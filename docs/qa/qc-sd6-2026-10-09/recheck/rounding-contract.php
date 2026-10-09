<?php
// Production Request and pricing service; in-memory related fixtures, no HTTP or DB mutation.
$root = 'C:/Users/Wahyu/Downloads/rapido-backend-dev/rapido-backend-dev';
require $root.'/vendor/autoload.php';
$app = require $root.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$request = new App\Domain\User\Requests\RoundingSettingRequest();
$rules = $request->rules();
$sources = ['app/Domain/User/Requests/RoundingSettingRequest.php', 'app/Domain/Order/Services/CartPricingService.php', 'app/Domain/Order/Models/Cart.php'];
$hashes = function () use ($root, $sources) {
    $result = [];
    foreach ($sources as $file) $result[$file] = hash_file('sha256', $root.'/'.$file);
    return $result;
};
$before = $hashes();
$payloadFile = __DIR__.'/rounding-contract-payloads.json';
$cases = json_decode(file_get_contents($payloadFile), true, 512, JSON_THROW_ON_ERROR);
$results = [];
$passed = true;
$queries = [];
Illuminate\Support\Facades\DB::listen(function ($query) use (&$queries) { $queries[] = $query->sql; });
$pricing = new App\Domain\Order\Services\CartPricingService();
foreach ($cases as $case) {
    $payload = $case['payload'];
    $validator = Illuminate\Support\Facades\Validator::make($payload, $rules);
    $valid = $validator->passes();
    $factor = pow(10, $payload['decimal_places']);
    $total = $case['total'] ?? 15001;
    $rounded = !$payload['enabled'] ? $total : match ($payload['method']) {
        'up' => ceil($total / $factor) * $factor,
        'down' => floor($total / $factor) * $factor,
        'nearest' => round($total / $factor) * $factor,
    };
    $expected = $case['expectedRounded'] ?? match ($case['scenario']) {
        'selected UI Puluhan (Rp10)' => 15010,
        'selected UI Ratusan (Rp100)' => 15100,
        'selected UI Ribuan (Rp1.000)' => 16000,
        default => null,
    };
    // All pricing relations are preloaded; no lazy load or persistence is needed.
    $detail = (object)['total_price'=>$total, 'custom_discount_amount'=>0, 'discount'=>null];
    $group = (object)['details'=>collect([$detail]), 'orderType'=>null];
    $cart = new App\Domain\Order\Models\Cart();
    $cart->custom_discount_amount = 0;
    $cart->setRelations([
        'groups'=>collect([$group]), 'extraCost'=>null, 'promo'=>null, 'discount'=>null, 'voucher'=>null,
        'store'=>(object)['owner'=>(object)['roundingSetting'=>(object)$payload]],
    ]);
    $actual = $pricing->calculate($cart);
    $matches = ($expected === null || $actual['rounded_total'] == $expected)
        && $actual['total'] == $total && $actual['rounded_total'] == $rounded;
    $passed = $passed && $valid && $matches;
    $results[] = ['scenario'=>$case['scenario'], 'payload'=>$payload, 'valid'=>$valid,
        'errors'=>$validator->errors()->toArray(), 'total'=>$total, 'factor'=>$factor,
        'roundedTotal'=>$rounded, 'serviceResult'=>$actual, 'expected'=>$expected, 'expectedMatches'=>$matches];
}
$after = $hashes();
$passed = $passed && $before === $after && count($queries) === 0;
file_put_contents(__DIR__.'/contract-validation.json', json_encode([
    'backendBefore'=>$before, 'backendAfter'=>$after, 'stable'=>$before === $after,
    'payloadSha256'=>hash_file('sha256', $payloadFile), 'cases'=>$results, 'passed'=>$passed, 'databaseQueryCount'=>count($queries),
    'scope'=>'Actual Laravel Request validator and CartPricingService::calculate with production Cart and preloaded in-memory related fixtures. Discounts/taxes/promos/vouchers absent. No HTTP/database mutation or full checkout certification.',
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES).PHP_EOL);
echo count($results).' production Request payloads: '.($passed ? 'PASS' : 'FAIL').PHP_EOL;
exit($passed ? 0 : 1);
