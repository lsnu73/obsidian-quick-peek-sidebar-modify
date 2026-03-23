import { getDefaultLanguageCode } from "../lang";
import { SettingsOptionInterface } from "./SettingsOptionInterface";

/**
 * 插件设置
 */
const DEFAULT_SETTINGS: SettingsOptionInterface = {
    /**
     * 是否显示左侧边栏
     */
    leftSidebar: true,
    /**
     * 是否显示右侧边栏
     */
    rightSidebar: true,
    /**
     * 是否同步左侧和右侧边栏
     */
    syncLeftRight: false,
    /**
     * 是否强制相同延迟
     */
    enforceSameDelay: true,
    /**
     * 侧边栏延迟时间
     */
    sidebarDelay: 150,
    /**
     * 侧边栏展开延迟时间
     */
    sidebarExpandDelay: 10,
    /**
     * 左侧边栏像素触发值
     */
    leftSideBarPixelTrigger: 20,
    /**
     * 右侧边栏像素触发值
     */
    rightSideBarPixelTrigger: 20,
    /**
     * 是否使用覆盖模式
     */
    overlayMode: false,
    /**
     * 是否双击固定
     */
    doubleClickPin: false,
    /**
     * 是否仅在聚焦时显示
     */
    onlyWhenFocused: false,
    /**
     * 展开/收起速度
     */
    expandCollapseSpeed: 370,
    /**
     * 左侧边栏最大宽度
     */
    leftSidebarMaxWidth: 325,
    /**
     * 右侧边栏最大宽度
     */
    rightSidebarMaxWidth: 325,
    /**
     * 语言 code
     */
    language: getDefaultLanguageCode(),
};

export default DEFAULT_SETTINGS;