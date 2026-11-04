# Fluent Sound Switcher — AuNight Edition

[繁體中文](README.md) · [Download](https://github.com/aunight/fluent-sound-switcher-aunight/releases)

A Windows customization of [Fluent Sound Switcher](https://github.com/Leocadio94/fluent-sound-switcher). Original developer: Gabriel Leocadio. Modifications and customization: AuNight.

## Changes

- Tray panel with enabled audio devices, master volume, app mixer, mute controls and audio-responsive meters.
- Reorder apps within an output device; pin, mute, route, ignore and restore apps from the context menu.
- Process-specific monitoring for LINE call/media helpers, hiding them after silence; fixes for missing system sounds and absent default devices.
- Live Windows light/dark mode, optional Windows 7 glass, a Mica-inspired settings panel, background blur and transitions.
- Traditional Chinese UI, startup and single-instance behavior, and an installer that upgrades registered existing installations. The support page links to this edition's GitHub Releases.

## Install and update

Download the Windows x64 installer from [Releases](https://github.com/aunight/fluent-sound-switcher-aunight/releases). It looks for registered existing installations and retains user preferences. Windows 10/11, Microsoft Edge WebView2 Runtime and .NET Framework 4 are required; process-specific LINE monitoring requires a Windows version supporting process loopback. When WebView2 is missing, the installer uses Microsoft's online bootstrapper.

This edition is unsigned; Windows may show an unknown-publisher or SmartScreen warning. Download new installers from Releases.

## Source and build limitations

`work/` contains the UI patches, C# audio helper, launcher, installer and build scripts. `upstream-reference/` is a snapshot of the original upstream source for reference; it is not the complete source of the customized main executable.

The current main program is built by patching `work/fluent-before-session-order-20261101.exe`, an already-customized binary base, at fixed offsets. That base includes earlier native modifications and cannot be fully reconstructed from the upstream source in this repository. Different base versions or offsets may fail. See [BUILD.md](BUILD.md).

## License and credits

The original project is distributed under the [MIT License](LICENSE), copyright © 2026 Gabriel Leocadio. This edition is modified by AuNight. The full original license is included.

