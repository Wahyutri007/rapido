<?php
// Autoload only the candidate Menu in this process. The copied 30-case suite is
// byte-identical to the QC suite; __DIR__ redirects its outputs into this folder.
require 'C:/Users/Wahyu/Downloads/rapido-backend-dev/rapido-backend-dev/vendor/autoload.php';
$candidate = __DIR__.'/Menu.candidate.txt';
$className = 'App\\Domain\\Catalog\\Models\\Menu';
if (class_exists($className, false)) throw new RuntimeException('Menu was already loaded');
spl_autoload_register(function ($class) use ($className, $candidate) {
    if ($class === $className) require $candidate;
}, true, true);
register_shutdown_function(function () use ($className, $candidate) {
    $file = __DIR__.'/stock-policy-results.json';
    if (!file_exists($file)) {fwrite(STDERR, 'Missing policy results'.PHP_EOL); return;}
    $result = json_decode(file_get_contents($file), true, 512, JSON_THROW_ON_ERROR);
    $loaded = (new ReflectionClass($className))->getFileName();
    if (realpath($loaded) !== realpath($candidate)) throw new RuntimeException('Candidate Menu was not executed');
    $result['executionMode'] = 'PROPOSAL_ONLY_NOT_APPLIED';
    $result['actuallyLoadedMenu'] = $loaded;
    $result['candidateMenuHash'] = hash_file('sha256', $candidate);
    $result['originalRunnerHash'] = hash_file('sha256', __DIR__.'/stock-policy.php');
    file_put_contents($file, json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES).PHP_EOL);
});
require __DIR__.'/stock-policy.php';
