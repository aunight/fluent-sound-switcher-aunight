$dir=Join-Path $env:APPDATA 'com.fluentsoundswitcher.app'
function Invoke-DeviceRead($command,$device=''){
 $token=[guid]::NewGuid().ToString()
 @{requestId=$token;timestamp=[DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds();command=$command;deviceId=$device;value=''} | ConvertTo-Json -Compress | Set-Content (Join-Path $dir 'device-settings-request.json') -Encoding utf8
 $watch=[Diagnostics.Stopwatch]::StartNew()
 do {Start-Sleep -Milliseconds 100;try{$reply=Get-Content (Join-Path $dir 'device-settings-response.json') -Raw | ConvertFrom-Json;if($reply.requestId -eq $token){if(!$reply.ok){throw $reply.error};Write-Host "$command completed in $($watch.ElapsedMilliseconds) ms";return $reply.data}}catch{if($reply.requestId -eq $token){throw}}}while($watch.ElapsedMilliseconds -lt 15000)
 throw "$command timed out"
}
$devices=Invoke-DeviceRead 'list'
$asio=Invoke-DeviceRead 'asio'
$output=$devices | Where-Object { $_.active -and !$_.input } | Select-Object -First 1
$input=$devices | Where-Object { $_.active -and $_.input } | Select-Object -First 1
$outState=Invoke-DeviceRead 'read' $output.id
$inState=Invoke-DeviceRead 'read' $input.id
[pscustomobject]@{devices=$devices.Count;output=$outState.name;input=$inState.name;asioApps=$asio.apps.Count} | ConvertTo-Json -Compress
