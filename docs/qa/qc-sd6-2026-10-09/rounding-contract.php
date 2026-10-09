<?php
// Read-only Laravel validation; no auth/token/fixture/DB mutation.
$root='C:/Users/Wahyu/Downloads/rapido-backend-dev/rapido-backend-dev';
require $root.'/vendor/autoload.php';
$app=require $root.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$request=new App\Domain\User\Requests\RoundingSettingRequest();
$rules=$request->rules();
$observed=json_decode(file_get_contents(__DIR__.'/contract-payloads.json'),true);
$results=[];
foreach($observed as $case){
 $payload=$case['payload'];
 $validator=Illuminate\Support\Facades\Validator::make($payload,$rules);
 $factor=pow(10,$payload['decimal_places']);
 $total=15001;
 $results[]=['scenario'=>$case['scenario'],'payload'=>$payload,'valid'=>$validator->passes(),
  'errors'=>$validator->errors()->toArray(),'backendFactor'=>is_finite($factor)?$factor:'overflow',
  'upRoundedTotal'=>is_finite($factor)?ceil($total/$factor)*$factor:null];
}
file_put_contents(__DIR__.'/contract-validation.json',json_encode(['rules'=>$rules['decimal_places'],'cases'=>$results,'scope'=>'Laravel production Request validation, arithmetic matching CartPricingService; no API/database mutation.'],JSON_PRETTY_PRINT));
echo json_encode($results),PHP_EOL;
