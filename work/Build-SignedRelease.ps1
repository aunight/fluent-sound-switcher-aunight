param(
 [Parameter(Mandatory=$true)][ValidatePattern('^[0-9A-Fa-f]{40}$')][string]$Thumbprint,
 [switch]$LocalMachine,
 [string]$SignTool='C:\Program Files (x86)\Windows Kits\10\bin\10.0.19041.0\x64\signtool.exe'
)
$ErrorActionPreference='Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)
$store=if($LocalMachine){'Cert:\LocalMachine\My'}else{'Cert:\CurrentUser\My'}
$certificate=Get-Item -LiteralPath (Join-Path $store $Thumbprint)
if(-not $certificate.HasPrivateKey){throw 'Certificate has no accessible private key'}
if($certificate.NotAfter -le (Get-Date) -or $certificate.NotBefore -gt (Get-Date)){throw 'Certificate is not currently valid'}
if($certificate.EnhancedKeyUsageList.ObjectId -notcontains '1.3.6.1.5.5.7.3.3'){throw 'Certificate is not for code signing'}
$chain=New-Object System.Security.Cryptography.X509Certificates.X509Chain
if(-not $chain.Build($certificate)){throw ('Certificate chain is not trusted: '+($chain.ChainStatus.Status -join ','))}
if(-not (Test-Path -LiteralPath $SignTool)){throw 'SignTool missing'}
$signArguments=@('sign','/sha1',$Thumbprint,'/s','My','/fd','SHA256','/tr','http://timestamp.digicert.com','/td','SHA256')
if($LocalMachine){$signArguments+='/sm'}
foreach($name in @('fluent-sound-switcher.exe','FluentAppMeter.exe','FluentSoundSwitcher.exe')){
 $file=Join-Path $PWD ('outputs\release-20261104\'+$name)
 & $SignTool @signArguments $file
 if($LASTEXITCODE -ne 0){throw "Signing failed: $name"}
 & $SignTool verify /pa /all /v $file
 if($LASTEXITCODE -ne 0){throw "Signature verification failed: $name"}
}
# The Inno tool signs both installer and generated uninstaller.
$command='"'+$SignTool+'" sign /sha1 '+$Thumbprint+' /s My /fd SHA256 /tr http://timestamp.digicert.com /td SHA256'
if($LocalMachine){$command+=' /sm'}
$command+=' $f'
& work/inno-compiler/ISCC.exe '/DTrustedSigning' ('/Strusted='+$command) work/FluentSoundSwitcher.iss
if($LASTEXITCODE -ne 0){throw 'Signed installer build failed'}
& $SignTool verify /pa /all /v outputs/FluentSoundSwitcher-2026.11.04-Setup-x64.exe
if($LASTEXITCODE -ne 0){throw 'Installer signature verification failed'}
Get-FileHash outputs/FluentSoundSwitcher-2026.11.04-Setup-x64.exe,outputs/release-20261104/*.exe | Select-Object Path,Hash | ConvertTo-Json | Set-Content outputs/release-sha256-20261104.json -Encoding utf8
