$ErrorActionPreference='Stop'
$repository='aunight/fluent-sound-switcher-aunight'
$tag='v2026.11.08.12'
$asset=Join-Path $PSScriptRoot '..\outputs\FluentSoundSwitcher-2026.11.08.12-Setup-x64.exe'
$asset=(Resolve-Path -LiteralPath $asset).Path
$localHash=(Get-FileHash -LiteralPath $asset -Algorithm SHA256).Hash.ToLowerInvariant()
$lines=@("protocol=https","host=github.com","username=aunight",'') | git credential fill 2>$null
if($LASTEXITCODE -ne 0){throw 'Git credential manager could not provide an authenticated session'}
$tokenLine=$lines | Where-Object { $_ -like 'password=*' } | Select-Object -First 1
if(-not $tokenLine){throw 'No GitHub credential was available'}
$apiToken=$tokenLine.Substring(9)
$headers=@{Authorization="Bearer $apiToken";Accept='application/vnd.github+json';'X-GitHub-Api-Version'='2022-11-28';'User-Agent'='Fluent-Sound-Switcher-Release'}
$account=Invoke-RestMethod -Uri 'https://api.github.com/user' -Headers $headers
if($account.login -ine 'aunight'){throw 'Stored GitHub credential belongs to a different account'}
$existing=$null
try{$existing=Invoke-RestMethod -Uri "https://api.github.com/repos/$repository/releases/tags/$tag" -Headers $headers}catch{if($_.Exception.Response.StatusCode.value__ -ne 404){throw}}
if($existing){throw 'A release with this tag already exists; refusing to overwrite it'}
$notes=[IO.File]::ReadAllText((Join-Path $PSScriptRoot '..\RELEASE_NOTES.md'),[Text.Encoding]::UTF8)
$entries=[regex]::Matches($notes,'(?m)^20\d{2}\.\d{2}\.\d{2}(?:\.\d+)?\r?$')
if($entries.Count -gt 1){$notes=$notes.Substring(0,$entries[1].Index).TrimEnd()}
$body=@{tag_name=$tag;target_commitish=(git rev-parse HEAD);name='AuNight Edition 2026.11.08.12';body=$notes;draft=$true;prerelease=$false;make_latest='true'} | ConvertTo-Json -Depth 5
$release=Invoke-RestMethod -Uri "https://api.github.com/repos/$repository/releases" -Method Post -Headers $headers -ContentType 'application/json; charset=utf-8' -Body ([System.Text.Encoding]::UTF8.GetBytes($body))
$name=[uri]::EscapeDataString([IO.Path]::GetFileName($asset))
$uploaded=Invoke-RestMethod -Uri "https://uploads.github.com/repos/$repository/releases/$($release.id)/assets?name=$name" -Method Post -Headers $headers -ContentType 'application/octet-stream' -InFile $asset
if($uploaded.size -ne (Get-Item -LiteralPath $asset).Length){throw 'Uploaded asset size mismatch; draft retained'}
if($uploaded.digest -ne "sha256:$localHash"){throw 'Uploaded asset SHA256 mismatch; draft retained'}
$result=Invoke-RestMethod -Uri "https://api.github.com/repos/$repository/releases/$($release.id)" -Method Patch -Headers $headers -ContentType 'application/json' -Body '{"draft":false,"make_latest":"true"}'
if($result.draft){throw 'Release is still a draft'}
[pscustomobject]@{Release=$result.html_url;Asset=$uploaded.browser_download_url;Sha256=$localHash;ServerDigest=$uploaded.digest} | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $PSScriptRoot '..\outputs\github-release-result-20261108-12.json') -Encoding UTF8
[pscustomobject]@{Release=$result.html_url;Asset=$uploaded.name;Sha256=$localHash;ServerDigest=$uploaded.digest} | Format-List
