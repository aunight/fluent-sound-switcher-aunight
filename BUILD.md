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

### Advanced device settings build

Run `npm ci --prefix work/build-tools` before building the embedded UI. Clean-CSS minifies styles and Terser compresses JavaScript, preserving top-level names to fit the fixed native asset capacity.

Add `work/FluentDeviceSettings.cs` to the helper compilation alongside all sources above. Keep the entire original `third-party/SoundVolumeView/` distribution and `THIRD_PARTY_NOTICES.md`; the installer includes them. The component is not MIT licensed. Configuration requests use a separate request/response mailbox, endpoint IDs rather than names, expiry and one-shot consumption. No audio settings are polled while the page is closed.

### ASIO detection build

Include `work/FluentAsioInfo.cs`, `work/FluentAbletonMeter.cs` and `work/FluentReleaseCheck.cs`. Detection reads registry entries, process modules and live Ableton engine logs without initializing an ASIO driver.

ASIO scanning now requires compiling the helper with `/platform:x64` so it can inspect 64-bit DAW driver modules. It filters to visible applications and known audio hosts in the current Windows session. UI Automation scanning has been removed; WPF/UIAutomation references are no longer needed. Scanning runs in an isolated worker process with an 8-second timeout and reports loaded modules, not confirmed active-driver use.

### Ableton ASIO meter

The helper now includes `work/FluentAbletonMeter.cs`. Add this source when compiling. It reads `output_meter_left/right` from the existing local Ableton Live MCP Remote Script on loopback port 8765. It only makes read-only requests while the visible mixer renews its lease. Meter data expires after one second; errors back off instead of synthesizing activity. It requires that Remote Script and currently supports a single running Live instance. This is application-master metering, not endpoint loopback metering, and it works with native ASIO. SonoBus standalone still needs its own audio-meter bridge.

ASIO meter transport now subscribes to Live meter-property notifications through the existing local bridge. A transient listener pushes peak values over a token-checked loopback UDP socket; a separate tiny `asio-level.json` avoids audio-session enumeration delays. A dedicated UI lease and an eight-second producer expiry remove listeners when monitoring stops. It changes no Live project, installed Remote Script files, audio routing or driver settings. Local source measurements: previous RPC read median 636 ms (8 calls), native push median 47 ms (172 updates in 8 seconds). These are source-data timings, not pixel-render latency.


### Release updates

Compile all helper sources with `/platform:x64` and references to System.Web.Extensions.dll, System.Drawing.dll and System.Xml.dll. The installer bundles RELEASE_NOTES.md. FluentReleaseCheck queries this edition's latest GitHub release, verifies the owned installer asset SHA-256, and installs only on user request or when automatic updates are enabled (off by default). A local build newer than the published release uses its bundled notes. Keep the Inno AppVersion, updater CurrentVersion and release tag consistent.
