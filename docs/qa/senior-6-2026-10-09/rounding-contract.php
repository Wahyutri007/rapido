<?php
// Read-only production Laravel Request validation. No API/DB mutations.
$root = 'C:/Users/Wahyu/Downloads/rapido-backend-dev/rapido-backend-dev';
require $root.'/vendor/autoload.php';
$app = require $root.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$request = new App\Domain\User\Requests\RoundingSettingRequest();
$rules = $request->rules();
$cases = json_decode(file_get_contents(__DIR__.'/rounding-contract-payloads.json'), true, 512, JSON_THROW_ON_ERROR);
$results = [];
$valid = true;
foreach ($cases as $case) {
    $payload = $case['payload'];
    $validator = Illuminate\Support\Facades\Validator::make($payload, $rules);
    $passed = $validator->passes();
    $factor = pow(10, $payload['decimal_places']);
    $total = 15001;
    // Same arithmetic as CartPricingService, not a full cart/service execution.
    $rounded = !$payload['enabled'] ? $total : match ($payload['method']) {
        'up' => ceil($total / $factor) * $factor,
        'down' => floor($total / $factor) * $factor,
        'nearest' => round($total / $factor) * $factor,
    };
    $expected = match ($case['scenario']) {
        'selected UI Puluhan (Rp10)' => 15010,
        'selected UI Ratusan (Rp100)' => 15100,
        'selected UI Ribuan (Rp1.000)' => 16000,
        default => null,
    };
    $matches = $expected === null || $rounded == $expected;
    $valid = $valid && $passed && $matches;
    $results[] = ['scenario' => $case['scenario'], 'payload' => $payload,
        'valid' => $passed, 'errors' => $validator->errors()->toArray(),
        'factor' => $factor, 'roundedTotal' => $rounded, 'expected' => $expected,
        'expectedMatches' => $matches];
}
$sources = [];
foreach (['app/Domain/User/Requests/RoundingSettingRequest.php', 'app/Domain/Order/Services/CartPricingService.php'] as $file) {
    $sources[$file] = hash_file('sha256', $root.'/'.$file);
}
file_put_contents(__DIR__.'/rounding-contract-results.json', json_encode([
    'backendSourceSha256' => $sources, 'payloadSha256' => hash_file('sha256', __DIR__.'/rounding-contract-payloads.json'),
    'cases' => $results, 'passed' => $valid,
    'limitations' => 'Actual Request validator, same arithmetic as CartPricingService; full cart/service and real API not executed. No database mutation.',
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES).PHP_EOL);
echo count($results).' production Request cases: '.($valid ? 'PASS' : 'FAIL').PHP_EOL;
exit($valid ? 0 : 1);
