# Fluent Sound Switcher — AuNight Edition

<p align="center"><a href="README.md">繁體中文</a> · <strong>English</strong> · <a href="https://github.com/aunight/fluent-sound-switcher-aunight/releases">Download</a></p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-3ca63c?style=flat-square" alt="License: MIT"></a>
  <img src="https://img.shields.io/badge/Windows-10%20%7C%2011-0078d4?style=flat-square" alt="Windows 10 and 11">
  <img src="https://img.shields.io/badge/runtime-WebView2-0078d4?style=flat-square" alt="Microsoft Edge WebView2 Runtime required">
  <img src="https://img.shields.io/badge/.NET%20Framework-4-512bd4?style=flat-square" alt=".NET Framework 4 required">
</p>

A Windows customization of [Fluent Sound Switcher](https://github.com/Leocadio94/fluent-sound-switcher). Original developer: Gabriel Leocadio. Modifications and customization: AuNight.

## Screenshots

| Device controls | Settings |
| --- | --- |
| ![Input and output device volume controls](docs/screenshots/devices.png) | ![Settings with Windows theme and Windows 7 glass options](docs/screenshots/settings.png) |

| Quick volume panel | Quick settings |
| --- | --- |
| ![Quick volume panel and app mixer](docs/screenshots/volume-mixer.png) | ![System tray quick settings menu](docs/screenshots/quick-settings.png) |

## Changes

- Tray panel with enabled audio devices, master volume, app mixer, mute controls and audio-responsive meters.
- Quick playback-device switching: change the default output, or route an app by dragging it to another output device or selecting an output in its context menu. Drag to reorder apps within the same device.
- Rename devices: customize the display names of input and output devices inside the app to identify speakers, headphones, microphones and virtual audio devices.
- Tray app context menu: pin/unpin, mute/unmute, switch output device, ignore apps, restore ignored apps and refresh.
- Dynamic volume meters: show each app’s actual audio level inside its volume slider, with a numeric volume value on the right and speaker icons reflecting volume and mute state.
- Microphone controls and live input meters: adjust input volume, toggle mute and view each input device’s live level inside its slider in the main window and tray panel. Meters reset on mute or stale data; a mute-status indicator is also available.
- Process-specific monitoring for LINE call/media helpers, hiding them after silence; fixes for missing system sounds and absent default devices.
- Live Windows light/dark mode, optional Windows 7 glass, a Mica-inspired settings panel, background blur and transitions.
- Traditional Chinese UI, startup and single-instance behavior, and an installer that upgrades registered existing installations. The support page links to this edition's GitHub Releases.

### Quick playback-device switching

Select an output device in the main window or tray volume panel to change the Windows default playback device, making it easy to switch between headphones, speakers and virtual audio devices. Mark frequently used devices as favorites in the main window for quick access, or configure a hotkey to cycle through them.

To send only one app to another device, drag it to the target output in the mixer, or right-click it and choose a destination under **Switch output device**. For example, play music through speakers while keeping calls on headphones. Apps can also be reordered by dragging within the same device.

### Custom device names

Right-click an input or output device in the main window and choose Rename to replace a technical hardware name with a useful label such as “Desk speakers” or “Call headset.” These are display aliases inside this app, helping identify devices in both the device list and quick panel.

### Common app controls

Right-click an app in the tray mixer to open the menu below. Actions apply to the selected app. Ignoring an app hides it from the mixer, and it can be restored from the same menu.

<img src="docs/screenshots/app-context-menu.png" alt="App controls context menu (Traditional Chinese UI)" width="440">

| Action | What it does |
| --- | --- |
| Pin / Unpin | Place a frequently used app at the front of its playback-device list, or return it to normal ordering. |
| Mute / Unmute | Toggle the selected app’s mute state to silence or restore its audio. |
| Switch output device | Expand the available playback devices and route the selected app’s audio to a destination. |
| Ignore this app | Hide an app that does not need mixer controls. This does not close or mute it. |
| Ignored apps | List hidden apps; choose Restore to show one again. |
| Refresh | Read the current audio sessions again and update the mixer list. |

### Dynamic volume meters and microphone input

The bright meter inside each app’s volume slider follows its actual playback level. The number on the right shows its configured volume, distinguishing volume settings from current audio activity. Speaker icons also reflect volume and mute state.

Microphone sliders in the main window and tray panel show live input levels too: speak into the microphone to check for a signal. Each meter reads its own input device and resets on mute or stale data. Closing the panel releases capture after the monitoring lease expires; audio is not recorded or uploaded.

<img src="docs/screenshots/microphone-meter.png" alt="Live microphone input meter (Traditional Chinese UI)" width="618">

## Install and update

Download the Windows x64 installer from [Releases](https://github.com/aunight/fluent-sound-switcher-aunight/releases). It looks for registered existing installations and retains user preferences. Windows 10/11, Microsoft Edge WebView2 Runtime and .NET Framework 4 are required; process-specific LINE monitoring requires a Windows version supporting process loopback. When WebView2 is missing, the installer uses Microsoft's online bootstrapper.

This edition is unsigned; Windows may show an unknown-publisher or SmartScreen warning. Download new installers from Releases.

## Source and build limitations

`work/` contains the UI patches, C# audio helper, launcher, installer and build scripts. `upstream-reference/` is a snapshot of the original upstream source for reference; it is not the complete source of the customized main executable.

The current main program is built by patching `work/fluent-before-session-order-20261101.exe`, an already-customized binary base, at fixed offsets. That base includes earlier native modifications and cannot be fully reconstructed from the upstream source in this repository. Different base versions or offsets may fail. See [BUILD.md](BUILD.md).

## License and credits

The original project is distributed under the [MIT License](LICENSE), copyright © 2026 Gabriel Leocadio. The full original license is included.

- Original developer: [Gabriel Leocadio (Leocadio94)](https://github.com/Leocadio94)
- Original project: [Leocadio94/fluent-sound-switcher](https://github.com/Leocadio94/fluent-sound-switcher)
- Modified edition: [AuNight](https://github.com/aunight)

