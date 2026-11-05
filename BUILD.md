# Build notes / 建置說明

The shipped main EXE uses an already-customized binary base. `upstream-reference/` is a separate upstream snapshot and cannot reproduce that binary by itself. Preserve the exact supplied base; the patch script checks fixed asset offsets and Brotli round-tripping.

Requirements: Windows x64, Node.js with Brotli, .NET Framework 4 C# compiler, Inno Setup 6, and Microsoft's WebView2 Evergreen bootstrapper. Install Inno Setup separately and place the official `MicrosoftEdgeWebview2Setup.exe` in `work/` before packaging. The official Inno Setup Traditional Chinese translation is included.

From the repository root in PowerShell:

```powershell
$env:FSS_RELEASE_URL='https://github.com/aunight/fluent-sound-switcher-aunight/releases'
New-Item outputs/release-20261104 -ItemType Directory -Force | Out-Null
node work/update-current-ui.cjs work/fluent-before-session-order-20261101.exe outputs/release-20261104/fluent-sound-switcher.exe
node work/patch-update-endpoint.cjs outputs/release-20261104/fluent-sound-switcher.exe
& 'C:/Windows/Microsoft.NET/Framework64/v4.0.30319/csc.exe' /nologo /target:winexe /platform:x64 /main:FluentAppMeter /reference:System.Web.Extensions.dll /reference:System.Drawing.dll "/out:$PWD\outputs\release-20261104\FluentAppMeter.exe" "$PWD\work\FluentAppMeter.cs" "$PWD\work\FluentGlass.cs" "$PWD\work\FluentProcessPeak.cs"
& 'C:/Windows/Microsoft.NET/Framework64/v4.0.30319/csc.exe' /nologo /target:winexe /platform:x64 /reference:System.Windows.Forms.dll "/out:$PWD\outputs\release-20261104\FluentSoundSwitcher.exe" "$PWD\work\FluentLauncher.cs"
Copy-Item LICENSE outputs/release-20261104/LICENSE.txt
& 'C:/Program Files (x86)/Inno Setup 6/ISCC.exe' work/FluentSoundSwitcher.iss
```

The endpoint patch switches the inherited updater manifest URL to this repository. This edition does not provide upstream-signed automatic updates; Releases offers manual installers. A publicly trusted code-signing certificate is required for the optional signed build; no signing keys are included.


Upstream reference snapshot commit: 5452754a680d30548b5c5cf4df3acc169e466fe3. The legacy embedded native updater still performs its startup check; its fixed-length endpoint is redirected to this edition's Releases page, which does not serve a signed updater manifest. It does not install updates automatically.


### Microphone input meter

The audio helper includes `work/FluentInputPeak.cs` alongside `FluentAppMeter.cs`, `FluentProcessPeak.cs` and `FluentGlass.cs`. Compile with the .NET Framework C# compiler using `/main:FluentAppMeter`, `/target:winexe`, and references to `System.Web.Extensions.dll` and `System.Drawing.dll`. It opens shared-mode capture streams only while the visible UI renews the meter lease; samples are used locally for peak levels and are not recorded or uploaded. Run `node work/test-input-meter.cjs` for device isolation and lifecycle checks.


### Packaged app icons

Include `work/FluentAppIcons.cs` when compiling the audio helper, with a reference to `System.Xml.dll`. It resolves the executable entry in AppxManifest.xml and prefers the corresponding unplated PNG asset, then falls back to the EXE icon for unpackaged apps. `node work/test-app-icons.cjs` verifies that fresh, device-specific icon data reaches the mixer. `work/test-app-icons-native.cs` can verify the selected PNG against an installed package asset.
