interface LanguageTranslationInterface {
    /**
     * 切换左侧边栏显示/隐藏的命令名称
     */
    toggleLeftSidebar: string;

    /**
     * 切换右侧边栏显示/隐藏的命令名称
     */
    toggleRightSidebar: string;

    /**
     * 同时切换左右侧边栏显示/隐藏的命令名称
     */
    toggleBothSidebars: string;

    /**
     * 左侧边栏悬停触发选项的标签文本
     */
    leftSidebarHover: string;

    /**
     * 左侧边栏悬停触发选项的描述文本
     */
    leftSidebarHoverDesc: string;

    /**
     * 右侧边栏悬停触发选项的标签文本
     */
    rightSidebarHover: string;

    /**
     * 右侧边栏悬停触发选项的描述文本
     */
    rightSidebarHoverDesc: string;

    /**
     * 同步左右侧边栏状态选项的标签文本
     */
    syncLeftRightSidebar: string;

    /**
     * 同步左右侧边栏状态选项的描述文本
     */
    syncLeftRightSidebarDesc: string;

    /**
     * 覆盖模式选项的标签文本
     */
    overlayMode: string;

    /**
     * 覆盖模式选项的描述文本
     */
    overlayModeDesc: string;

    /**
     * 双击固定选项的标签文本
     */
    doubleClickPin: string;

    /**
     * 双击固定选项的描述文本
     */
    doubleClickPinDesc: string;

    /**
     * 仅当聚焦时选项的标签文本
     */
    onlyWhenFocused: string;

    /**
     * 仅当聚焦时选项的描述文本
     */
    onlyWhenFocusedDesc: string;

    /**
     * 行为设置部分的标题文本
     */
    behavior: string;

    /**
     * 定时设置部分的标题文本
     */
    timing: string;

    /**
     * 外观设置部分的标题文本
     */
    appearance: string;

    /**
     * 左侧边栏像素触发阈值选项的标签文本
     */
    leftSidebarPixelTrigger: string;

    /**
     * 左侧边栏像素触发阈值选项的描述文本
     */
    leftSidebarPixelTriggerDesc: string;

    /**
     * 右侧边栏像素触发阈值选项的标签文本
     */
    rightSidebarPixelTrigger: string;

    /**
     * 右侧边栏像素触发阈值选项的描述文本
     */
    rightSidebarPixelTriggerDesc: string;

    /**
     * 边栏延迟选项的标签文本
     */
    sidebarDelay: string;

    /**
     * 边栏延迟选项的描述文本
     */
    sidebarDelayDesc: string;

    /**
     * 边栏展开延迟选项的标签文本
     */
    sidebarExpandDelay: string;

    /**
     * 边栏展开延迟选项的描述文本
     */
    sidebarExpandDelayDesc: string;

    /**
     * 展开/折叠速度选项的标签文本
     */
    expandCollapseSpeed: string;

    /**
     * 展开/折叠速度选项的描述文本
     */
    expandCollapseSpeedDesc: string;

    /**
     * 左侧边栏最大宽度选项的标签文本
     */
    leftSidebarMaxWidth: string;

    /**
     * 左侧边栏最大宽度选项的描述文本
     */
    leftSidebarMaxWidthDesc: string;

    /**
     * 右侧边栏最大宽度选项的标签文本
     */
    rightSidebarMaxWidth: string;

    /**
     * 右侧边栏最大宽度选项的描述文本
     */
    rightSidebarMaxWidthDesc: string;
    /**
     * 语言
     */
    language: string;
    /**
     * 工作区变化自动折叠左右面板
     */
    collapseOnWorkspaceChange: string;
    /**
     *  工作区变化自动折叠左右面板选项的描述
     */
    collapseOnWorkspaceChangeDesc: string;
}

export default LanguageTranslationInterface