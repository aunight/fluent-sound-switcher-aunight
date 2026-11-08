2026.11.08.12

繁體中文

1. MiniFuse ASIO 設定
在 ASIO 區塊直接調整緩衝大小與安全模式，自動讀取目前設定，套用後讀回確認。僅支援已驗證的 API 5.13 與單台 MiniFuse；其他驅動仍使用原廠控制面板。

2. 共用 ASIO 快取
輸出與輸入分頁共用 ASIO 掃描結果、驅動選擇及 MiniFuse 設定，切換頁面不再重複讀取。保留手動重新掃描功能。

3. 下拉選單位置與動畫
已選取列對齊並覆蓋原欄位，選單從該列往上下展開。修正欄位寬度不足、文字換行、底線與原文字箭頭露出的問題，並支援系統減少動態效果設定。

4. 設定頁面與圖示
拉開 ASIO 控制項及應用程式卡片間距，保留區塊標題圖示。側邊欄採用 Microsoft Fluent 彩色圖示，ASIO 應用程式名稱旁顯示程式本身圖示；附上圖示授權資訊。

English

1. MiniFuse ASIO settings
Adjust buffer size and Safe Mode directly in the ASIO section. Settings load automatically and changes are verified by reading them back. Limited to tested API 5.13 and one connected MiniFuse; other drivers continue to use their vendor control panels.

2. Shared ASIO cache
Output and input pages share scan results, driver selection and MiniFuse settings instead of rereading them on every tab switch. Manual rescanning remains available.

3. Dropdown placement and animation
The selected row aligns over the closed field, and the menu expands upward and downward from that row. Fixed narrow controls, wrapped labels, underlines and exposed original text/arrows. Respects the system reduced-motion preference.

4. Settings layout and icons
Added spacing between ASIO controls and application cards while retaining section-heading icons. Navigation uses Microsoft Fluent Color icons, and ASIO application names show their own application icons. Included icon attribution and licensing.

2026.11.06.9

繁體中文

1. ASIO 驅動控制面板
輸入／輸出設定的 ASIO 區塊新增驅動選擇與「開啟驅動控制面板」。FL Studio ASIO 使用獨立 STA 執行緒開啟面板；MiniFuse 則開啟已安裝的 MiniFuse Control Center。

2. 錯誤訊息與介面
驅動面板開啟失敗時顯示對應介面語言的提示，修正繁體中文介面冒出英文錯誤。調淡裝置設定卡片與 ASIO 區塊的邊框，減少過亮白線。

English

1. ASIO driver control panels
Added driver selection and Open driver control panel to the ASIO section of input/output settings. FL Studio ASIO opens on an isolated STA thread; MiniFuse opens the installed MiniFuse Control Center.

2. Errors and appearance
Driver-panel failures now follow the interface language, including Traditional Chinese. Reduced the contrast of device-settings cards and ASIO borders.

Previous changes / 先前修改

繁體中文

1. 裝置進階設定
輸出與輸入裝置分頁設定取樣率、位元深度、獨佔控制、優先權及驅動提供的音效增強；輸出裝置另提供 Windows Sonic。裝置選單改為緊湊單行，格式依 Windows 顯示聲道、位元與 Hz。

2. 設定介面與操作
重新分類為外觀設定、輸出裝置、輸入裝置、裝置行為、通知與指示器、快捷鍵及支援。加寬設定視窗、修正文字換行與卡片擠壓，補上按鈕圖示。輸入／輸出頁保留資料，切換頁面不再重新掃描。

3. 即時音量與 ASIO
主輸出、應用程式及麥克風顯示實際音量動態條。ASIO 應用程式使用正式圖示並置底；無法透過 Windows 調整音量時，提示改用程式、驅動或音訊介面本體。Ableton 透過既有本機 Live MCP 橋接推送真實主輸出電平，實測更新間隔約 47 毫秒。原版 SonoBus 沒有可讀的獨立電平來源時不顯示假動畫；載入的 ASIO 驅動與已確認使用的驅動會明確區分。

4. 混音器穩定性
系統音效固定在各播放裝置清單底部，修正工作階段失效時反覆出現或消失。保留自繪玻璃標題列、系統匣喚回及工作列範圍內最大化，並加強 ASIO 區塊邊框對比。

5. 更新與日誌
支援頁提供「查看更新」「更新」及自動更新選項，預設不自動安裝。新版安裝前驗證官方倉庫資產 SHA-256，保留設定並重新啟動。更新按鈕補上下載圖示；已是最新版時，日誌視窗只顯示「關閉」。本版日誌改為編號與分段排版，並隨安裝檔附帶，避免顯示舊版內容。

English

1. Advanced device settings
Separate output/input pages configure sample rate, bit depth, exclusive control, priority and driver-provided enhancements, with Windows Sonic on output devices. Compact single-line menus use Windows-style channel, bit-depth and Hz labels.

2. Settings and navigation
Reorganized Appearance, Output devices, Input devices, Device behavior, Notifications & indicators, Shortcuts and Support. Widened settings, fixed wrapping and compressed cards, and added button icons. Device pages retain their data instead of rescanning on every tab switch.

3. Live meters and ASIO
Master output, applications and microphones show real level meters. ASIO applications use their own icons and appear last; unsupported Windows volume control directs users to application, driver or audio-interface controls. Ableton sends real master-output levels through the existing local Live MCP bridge, with measured updates around 47 ms apart. Unmodified SonoBus without a readable independent meter source never shows fabricated activity. Loaded drivers and confirmed active drivers remain clearly distinguished.

4. Mixer stability
Keep System Sounds at the bottom of each output-device list and prevent flicker when its session expires. Retain the custom glass title bar, tray restoration and taskbar-aware maximization, with improved ASIO border contrast.

5. Updates and release notes
Support provides View updates, Update and optional automatic updates, off by default. Installation validates the owned GitHub asset's SHA-256, retains settings and restarts the app. Fixed the download icon; up-to-date dialogs only show Close. Release notes now use numbered, spaced sections and are bundled with the installer to avoid stale content.

安裝檔尚未簽章，Windows 仍可能顯示安全提示。
The installer is unsigned; Windows may still show a security prompt.

原始作者 / Original developer: Gabriel Leocadio (Leocadio94)
https://github.com/Leocadio94/fluent-sound-switcher
修改者 / Modified by: AuNight · MIT License
