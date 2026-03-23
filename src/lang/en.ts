import LanguageTranslationInterface from "../types/LanguageTranslationInterface";

const en: LanguageTranslationInterface = {
    // 命令名称
    toggleLeftSidebar: "Toggle Left Sidebar",
    toggleRightSidebar: "Toggle Right Sidebar",
    toggleBothSidebars: "Toggle Both Sidebars",

    // 设置选项
    leftSidebarHover: "Left Sidebar Hover",
    leftSidebarHoverDesc: "Enable hover to expand and collapse the left sidebar.",
    rightSidebarHover: "Right Sidebar Hover",
    rightSidebarHoverDesc: "Enable hover to expand and collapse the right sidebar. Only collapses the right panel unless you have a right ribbon.",
    syncLeftRightSidebar: "Sync Left and Right Sidebars",
    syncLeftRightSidebarDesc: "If enabled, hovering over the right sidebar will also expand the left sidebar and vice versa. (Both left and right sidebars must be enabled above)",
    overlayMode: "Overlay Mode",
    overlayModeDesc: "When enabled, sidebars will slide over the main content without affecting the layout. When disabled, sidebars will expand by pushing content.",
    doubleClickPin: "Double Click to Pin Sidebar",
    doubleClickPinDesc: "When enabled, double-click to keep the sidebar open. Double-click again to unpin.",
    onlyWhenFocused: "Only When Focused",
    onlyWhenFocusedDesc: "When enabled, sidebar hover will only trigger when Obsidian is the focused application. Useful when splitting the screen with other applications.",

    // 设置部分标题
    behavior: "Behavior",
    timing: "Timing",
    appearance: "Appearance",

    // 行为设置
    leftSidebarPixelTrigger: "Left Sidebar Pixel Trigger",
    leftSidebarPixelTriggerDesc: "Specify the number of pixels from the left edge of the editor to trigger left sidebar hover open (must be greater than 0)",
    rightSidebarPixelTrigger: "Right Sidebar Pixel Trigger",
    rightSidebarPixelTriggerDesc: "Specify the number of pixels from the right edge of the editor to trigger right sidebar hover open (must be greater than 0)",

    // 定时设置
    sidebarDelay: "Sidebar Collapse Delay",
    sidebarDelayDesc: "Delay before sidebar collapses after mouse leaves (milliseconds). Enter '0' to disable delay.",
    sidebarExpandDelay: "Sidebar Expand Delay",
    sidebarExpandDelayDesc: "Delay before sidebar expands after hover (milliseconds). Default is 200ms.",
    expandCollapseSpeed: "Expand/Collapse Animation Speed",
    expandCollapseSpeedDesc: "Speed of sidebar expand/collapse animation (milliseconds).",

    // 外观设置
    leftSidebarMaxWidth: "Left Sidebar Max Width",
    leftSidebarMaxWidthDesc: "Specify the maximum width of the left sidebar when expanded (pixels)",
    rightSidebarMaxWidth: "Right Sidebar Max Width",
    rightSidebarMaxWidthDesc: "Specify the maximum width of the right sidebar when expanded (pixels)",
    language: "Choose Language",
};
export default en;