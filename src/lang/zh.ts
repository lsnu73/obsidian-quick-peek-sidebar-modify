import LanguageTranslationInterface from "../types/LanguageTranslationInterface";

const zh: LanguageTranslationInterface = {
    // 命令名称
    toggleLeftSidebar: "切换左侧边栏",
    toggleRightSidebar: "切换右侧边栏",
    toggleBothSidebars: "切换两侧边栏",

    // 设置选项
    leftSidebarHover: "左侧边栏悬停",
    leftSidebarHoverDesc: "启用左侧边栏的悬停展开和折叠功能。",
    rightSidebarHover: "右侧边栏悬停",
    rightSidebarHoverDesc: "启用右侧边栏的悬停展开和折叠功能。仅折叠右侧面板，除非您有右侧功能区。",
    syncLeftRightSidebar: "同步左右侧边栏",
    syncLeftRightSidebarDesc: "如果启用，悬停在右侧边栏时也会同时展开左侧边栏，反之亦然。（左侧和右侧边栏必须都在上方启用）",
    overlayMode: "覆盖模式",
    overlayModeDesc: "启用时，侧边栏会滑过主内容而不影响布局。禁用时，侧边栏会通过推挤内容来展开。",
    doubleClickPin: "双击固定侧边栏",
    doubleClickPinDesc: "启用时，双击可保持侧边栏打开。再次双击可取消固定。",
    onlyWhenFocused: "仅在聚焦时",
    onlyWhenFocusedDesc: "启用时，仅当Obsidian是聚焦的应用程序时才会触发侧边栏悬停。在与其他应用程序分屏时很有用。",

    // 设置部分标题
    behavior: "行为",
    timing: "定时",
    appearance: "外观",

    // 行为设置
    leftSidebarPixelTrigger: "左侧边栏像素触发器",
    leftSidebarPixelTriggerDesc: "指定从编辑器左边缘开始触发左侧边栏悬停打开的像素数（必须大于0）",
    rightSidebarPixelTrigger: "右侧边栏像素触发器",
    rightSidebarPixelTriggerDesc: "指定从编辑器右边缘开始触发右侧边栏悬停打开的像素数（必须大于0）",

    // 定时设置
    sidebarDelay: "侧边栏折叠延迟",
    sidebarDelayDesc: "鼠标离开后侧边栏折叠前的延迟（毫秒）。输入'0'可禁用延迟。",
    sidebarExpandDelay: "侧边栏展开延迟",
    sidebarExpandDelayDesc: "悬停后侧边栏展开前的延迟（毫秒）。默认为200ms。",
    expandCollapseSpeed: "展开/折叠动画速度",
    expandCollapseSpeedDesc: "侧边栏展开/折叠动画的速度（毫秒）。",

    // 外观设置
    leftSidebarMaxWidth: "左侧边栏最大宽度",
    leftSidebarMaxWidthDesc: "指定左侧边栏展开时的最大宽度（像素）",
    rightSidebarMaxWidth: "右侧边栏最大宽度",
    rightSidebarMaxWidthDesc: "指定右侧边栏展开时的最大宽度（像素）",
    language: "选择语言"

};
export default zh;