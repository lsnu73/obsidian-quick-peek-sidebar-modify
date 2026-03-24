import LanguageTranslationInterface from "../types/LanguageTranslationInterface";

const en: LanguageTranslationInterface = {
    // 命令名称
    toggleLeftSidebar: "Toggle left sidebar",
    toggleRightSidebar: "Toggle right sidebar",
    toggleBothSidebars: "Toggle both sidebars",

    // 设置选项
    leftSidebarHover: "Left sidebar hover",
    leftSidebarHoverDesc: "Enable hover to expand and collapse the left sidebar.",
    rightSidebarHover: "Right sidebar hover",
    rightSidebarHoverDesc: "Enable hover to expand and collapse the right sidebar. Only collapses the right panel unless you have a right ribbon.",
    syncLeftRightSidebar: "Sync left and right sidebars",
    syncLeftRightSidebarDesc: "If enabled, hovering over the right sidebar will also expand the left sidebar and vice versa. (Both left and right sidebars must be enabled above)",
    overlayMode: "Overlay mode",
    overlayModeDesc: "When enabled, sidebars will slide over the main content without affecting the layout. When disabled, sidebars will expand by pushing content.",
    doubleClickPin: "Double click to pin sidebar",
    doubleClickPinDesc: "When enabled, double-click to keep the sidebar open. Double-click again to unpin.",
    onlyWhenFocused: "Only when focused",
    onlyWhenFocusedDesc: "When enabled, sidebar hover will only trigger when Obsidian is the focused application. Useful when splitting the screen with other applications.",

    // 设置部分标题
    behavior: "Behavior",
    timing: "Timing",
    appearance: "Appearance",

    // 行为设置
    leftSidebarPixelTrigger: "Left sidebar pixel trigger",
    leftSidebarPixelTriggerDesc: "Specify the number of pixels from the left edge of the editor to trigger left sidebar hover open (must be greater than 0)",
    rightSidebarPixelTrigger: "Right sidebar pixel trigger",
    rightSidebarPixelTriggerDesc: "Specify the number of pixels from the right edge of the editor to trigger right sidebar hover open (must be greater than 0)",
    collapseOnWorkspaceChange: "When the workspace changes, should the left and right panels be collapsed",
    collapseOnWorkspaceChangeDesc: "If enabled, the left and right panels will automatically fold when switching notes.",

    // 定时设置
    sidebarDelay: "Sidebar collapse delay",
    sidebarDelayDesc: "Delay before sidebar collapses after mouse leaves (milliseconds). Enter '0' to disable delay.",
    sidebarExpandDelay: "Sidebar expand delay",
    sidebarExpandDelayDesc: "Delay before sidebar expands after hover (milliseconds). Default is 200ms.",
    expandCollapseSpeed: "Expand/collapse animation speed",
    expandCollapseSpeedDesc: "Speed of sidebar expand/collapse animation (milliseconds).",

    // 外观设置
    leftSidebarMaxWidth: "Left sidebar max width",
    leftSidebarMaxWidthDesc: "Specify the maximum width of the left sidebar when expanded (pixels)",
    rightSidebarMaxWidth: "Right sidebar max width",
    rightSidebarMaxWidthDesc: "Specify the maximum width of the right sidebar when expanded (pixels)",
    language: "Choose language"
};
export default en;