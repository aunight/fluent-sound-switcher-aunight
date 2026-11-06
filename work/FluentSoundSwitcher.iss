[Setup]
AppId=FluentSoundSwitcher.Custom
AppName=Fluent Sound Switcher
AppVersion=2026.11.06.9
AppVerName=Fluent Sound Switcher 2026.11.06.9
DefaultDirName={code:ExistingInstallDir}
UsePreviousAppDir=no
DefaultGroupName=Fluent Sound Switcher
PrivilegesRequired=lowest
PrivilegesRequiredOverridesAllowed=commandline
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
MinVersion=10.0
OutputDir=..\outputs
OutputBaseFilename=FluentSoundSwitcher-2026.11.06.9-Setup-x64
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
UninstallDisplayIcon={app}\fluent-sound-switcher.exe
CloseApplications=force
CloseApplicationsFilter=fluent-sound-switcher.exe,FluentAppMeter.exe
RestartApplications=no
DisableProgramGroupPage=yes
SetupLogging=yes
#ifdef TrustedSigning
SignTool=trusted
SignedUninstaller=yes
#endif

[Languages]
Name: "chinesetraditional"; MessagesFile: "ChineseTraditional.isl"
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "autostart"; Description: "登入 Windows 時啟動"
Name: "desktopicon"; Description: "建立桌面捷徑"; Flags: unchecked

[Files]
Source: "..\RELEASE_NOTES.md"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\outputs\release-20261104\FluentSoundSwitcher.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\outputs\release-20261104\fluent-sound-switcher.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\outputs\release-20261104\FluentAppMeter.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\outputs\release-20261104\LICENSE.txt"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\third-party\SoundVolumeView\*"; DestDir: "{app}\third-party\SoundVolumeView"; Excludes: "*.cfg"; Flags: ignoreversion
Source: "..\THIRD_PARTY_NOTICES.md"; DestDir: "{app}"; Flags: ignoreversion
Source: "MicrosoftEdgeWebview2Setup.exe"; DestDir: "{tmp}"; Flags: deleteafterinstall; Check: NeedsWebView

[Icons]
Name: "{group}\Fluent Sound Switcher"; Filename: "{app}\FluentSoundSwitcher.exe"; IconFilename: "{app}\fluent-sound-switcher.exe"
Name: "{userdesktop}\Fluent Sound Switcher"; Filename: "{app}\FluentSoundSwitcher.exe"; IconFilename: "{app}\fluent-sound-switcher.exe"; Tasks: desktopicon

Name: "{userprograms}\音效裝置切換器"; Filename: "{app}\FluentSoundSwitcher.exe"; IconFilename: "{app}\fluent-sound-switcher.exe"
Name: "{userdesktop}\音效裝置切換器"; Filename: "{app}\FluentSoundSwitcher.exe"; IconFilename: "{app}\fluent-sound-switcher.exe"; Check: LegacyDesktopShortcut

[Registry]
Root: HKCU; Subkey: "Software\Microsoft\Windows\CurrentVersion\Run"; ValueName: "Fluent Sound Switcher"; Flags: deletevalue
Root: HKCU; Subkey: "Software\Microsoft\Windows\CurrentVersion\Run"; ValueType: string; ValueName: "Fluent Sound Switcher App Meter"; ValueData: """{app}\FluentAppMeter.exe"""; Tasks: autostart; Flags: uninsdeletevalue
Root: HKCU; Subkey: "Software\Microsoft\Windows\CurrentVersion\Run"; ValueType: string; ValueName: "音效裝置切換器"; ValueData: """{app}\fluent-sound-switcher.exe"" --autostart"; Tasks: autostart; Flags: uninsdeletevalue

[Run]
Filename: "{tmp}\MicrosoftEdgeWebview2Setup.exe"; Parameters: "/silent /install"; StatusMsg: "正在安裝 Microsoft Edge WebView2…"; Flags: waituntilterminated; Check: NeedsWebView
Filename: "{app}\FluentSoundSwitcher.exe"; Description: "啟動 Fluent Sound Switcher"; Flags: nowait postinstall skipifsilent
Filename: "{app}\FluentSoundSwitcher.exe"; Flags: nowait; Check: IsAutoUpdate

[Code]
function IsAutoUpdate: Boolean;
begin
 Result := ExpandConstant('{param:FSSAUTOUPDATE|0}') = '1';
end;

function LegacyDesktopShortcut: Boolean;
begin
 Result := FileExists(ExpandConstant('{userdesktop}\音效裝置切換器.lnk'));
end;

var
 UpgradeDir: String;
 LegacyKeys: TStringList;
 LegacyRoots: TStringList;

function IsFluentDirectory(Dir: String): Boolean;
begin
 Result := (Dir <> '') and FileExists(AddBackslash(Dir) + 'fluent-sound-switcher.exe');
end;

function IconDirectory(Value: String): String;
var P: Integer;
begin
 Value := Trim(Value);
 if (Length(Value) > 0) and (Value[1] = '"') then begin
  Delete(Value, 1, 1);
  P := Pos('"', Value);
  if P > 0 then Value := Copy(Value, 1, P - 1);
 end else begin
  P := Pos('.exe', Lowercase(Value));
  if P > 0 then Value := Copy(Value, 1, P + 3);
 end;
 Result := ExtractFileDir(Value);
end;

procedure DiscoverInstallations(Root: Integer);
var Names: TArrayOfString; I: Integer; Key, Name, Dir, Value: String;
begin
 if not RegGetSubkeyNames(Root, 'Software\Microsoft\Windows\CurrentVersion\Uninstall', Names) then Exit;
 for I := 0 to GetArrayLength(Names) - 1 do begin
  Key := 'Software\Microsoft\Windows\CurrentVersion\Uninstall\' + Names[I];
  if RegQueryStringValue(Root, Key, 'DisplayName', Name) then
   if (Pos('fluent sound switcher', Lowercase(Name)) = 1) or (Name = '音效裝置切換器') then begin
    Dir := '';
    RegQueryStringValue(Root, Key, 'InstallLocation', Dir);
    if not IsFluentDirectory(Dir) then
     if RegQueryStringValue(Root, Key, 'DisplayIcon', Value) then Dir := IconDirectory(Value);
    if not IsFluentDirectory(Dir) then
     if RegQueryStringValue(Root, Key, 'UninstallString', Value) then Dir := IconDirectory(Value);
    if IsFluentDirectory(Dir) then begin
     Log('Detected existing Fluent installation: ' + Name + ' at ' + Dir);
     if UpgradeDir = '' then UpgradeDir := RemoveBackslashUnlessRoot(Dir);
     if Names[I] <> 'FluentSoundSwitcher.Custom_is1' then begin
      LegacyKeys.Add(Key); LegacyRoots.Add(IntToStr(Root));
     end;
    end;
   end;
 end;
end;

function InitializeSetup: Boolean;
var Dir: String;
begin
 LegacyKeys := TStringList.Create; LegacyRoots := TStringList.Create;
 {Prefer the current registered custom edition, then any registered branch.}
 if RegQueryStringValue(HKCU, 'Software\Microsoft\Windows\CurrentVersion\Uninstall\FluentSoundSwitcher.Custom_is1', 'InstallLocation', Dir) then
  if IsFluentDirectory(Dir) then UpgradeDir := RemoveBackslashUnlessRoot(Dir);
 DiscoverInstallations(HKCU);
 DiscoverInstallations(HKLM64);
 DiscoverInstallations(HKLM32);
 Dir := ExpandConstant('{localappdata}\音效裝置切換器');
 if (UpgradeDir = '') and IsFluentDirectory(Dir) then UpgradeDir := Dir;
 Result := True;
end;

function ExistingInstallDir(Param: String): String;
begin
 if UpgradeDir <> '' then Result := UpgradeDir
 else Result := ExpandConstant('{localappdata}\音效裝置切換器');
end;

procedure RegisterExtraCloseApplicationsResources;
begin
 if UpgradeDir <> '' then begin
  RegisterExtraCloseApplicationsResource(False, AddBackslash(UpgradeDir) + 'fluent-sound-switcher.exe');
  RegisterExtraCloseApplicationsResource(False, AddBackslash(UpgradeDir) + 'FluentAppMeter.exe');
 end;
end;

procedure CurStepChanged(CurStep: TSetupStep);
var I, Root: Integer; Dir, Value: String;
begin
 if CurStep = ssPostInstall then
  for I := 0 to LegacyKeys.Count - 1 do begin
   Root := StrToInt(LegacyRoots[I]); Dir := '';
   RegQueryStringValue(Root, LegacyKeys[I], 'InstallLocation', Dir);
   if not IsFluentDirectory(Dir) then
    if RegQueryStringValue(Root, LegacyKeys[I], 'DisplayIcon', Value) then Dir := IconDirectory(Value);
   if not IsFluentDirectory(Dir) then
    if RegQueryStringValue(Root, LegacyKeys[I], 'UninstallString', Value) then Dir := IconDirectory(Value);
   {Only remove an obsolete listing for the directory actually upgraded.}
   if CompareText(RemoveBackslashUnlessRoot(Dir), RemoveBackslashUnlessRoot(ExpandConstant('{app}'))) = 0 then
    if not RegDeleteKeyIncludingSubkeys(Root, LegacyKeys[I]) then Log('Could not remove legacy listing: ' + LegacyKeys[I]);
  end;
end;

function NeedsWebView: Boolean;
var Version: String;
begin
 Result := not (RegQueryStringValue(HKLM32, 'Software\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}', 'pv', Version) and (Version <> '') and (Version <> '0.0.0.0'));
 if Result then
  Result := not (RegQueryStringValue(HKCU, 'Software\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}', 'pv', Version) and (Version <> '') and (Version <> '0.0.0.0'));
end;


