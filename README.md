# 音效裝置切換器 — AuNight 修改版

[English](README.en.md) · [下載安裝檔](https://github.com/aunight/fluent-sound-switcher-aunight/releases)

音效裝置切換器是 [Fluent Sound Switcher](https://github.com/Leocadio94/fluent-sound-switcher) 的 Windows 修改版。原始開發者：Gabriel Leocadio；修改與客製化：AuNight。

## 修改範圍

- 右下角音量面板：顯示啟用的音訊裝置、主音量與應用程式混音器；可以靜音、調音量，並以實際聲音強度顯示音量動畫。
- 同一輸出裝置內可拖曳程式排序；右鍵可置頂、靜音、切換輸出、忽略及還原應用程式。
- LINE 通話及媒體輔助程序使用程序專屬聲音監測，停止出聲後隱藏；修正系統音效遺失與裝置空值造成的錯誤。
- Windows 明暗主題即時同步；提供 Win7 玻璃質感開關、Mica 風格設定面板、背景模糊與動畫。
- 提供繁體中文介面、開機啟動、單一執行個體及覆蓋既有版本的安裝流程。支援頁提供本修改版 Releases 連結。

## 安裝與更新

從 [Releases](https://github.com/aunight/fluent-sound-switcher-aunight/releases) 下載 Windows x64 安裝檔。安裝程式會優先偵測已登錄的既有版本並沿用位置，保留使用者設定。需 Windows 10／11、Microsoft Edge WebView2 Runtime 和 .NET Framework 4；LINE 程序專屬監測需要支援 process loopback 的 Windows 版本。若缺少 WebView2，安裝程式會使用 Microsoft 的線上安裝程式。

此修改版目前沒有程式碼簽章，Windows 可能顯示未知發行者或 SmartScreen 提示。更新請至 Releases 下載新版安裝檔。

## 原始碼與建置限制

`work/` 包含本修改版的 UI patch、音訊輔助程式 C# 原始碼、啟動器、安裝腳本及建置腳本。`upstream-reference/` 是原專案來源快照，供參考；它不是本修改版已編譯主程式的完整原始碼。

目前的主程式是由 `work/fluent-before-session-order-20261101.exe` 這個已客製化的基底套用固定位置的 UI 修改而成。此二進位基底含較早的原生修改；倉庫不宣稱能從上游原始碼完整重建該基底。修改 offsets 或使用其他版本的基底可能導致建置失敗。請參考 [BUILD.md](BUILD.md)。

## 授權與署名

原始專案依 [MIT License](LICENSE) 授權，原始著作權 © 2026 Gabriel Leocadio。隨附完整原始授權文字。

- 原始開發者：[Gabriel Leocadio（Leocadio94）](https://github.com/Leocadio94)
- 原始專案：[Leocadio94/fluent-sound-switcher](https://github.com/Leocadio94/fluent-sound-switcher)
- 本修改版：[AuNight](https://github.com/aunight)

