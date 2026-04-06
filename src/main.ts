import { Plugin, WorkspaceRibbon, WorkspaceSplit } from "obsidian";
import { SettingsOptionInterface } from "./types/SettingsOptionInterface";
import { SidebarHoverSettingsTab } from "./setting/sidebarHoverSettingsTab";
import DEFAULT_SETTINGS from "./setting/DEFAULT_SETTINGS";

// 扩展接口以访问内部属性
interface ExtendedWorkspaceSplit extends WorkspaceSplit {
    containerEl: HTMLElement;
    collapsed: boolean;
    expand: () => void;
    collapse: () => void;
}

interface ExtendedWorkspaceRibbon extends WorkspaceRibbon {
    containerEl: HTMLElement;
}


/**
 * 侧边栏悬停展开插件
 * 允许通过鼠标悬停在屏幕边缘来展开和折叠侧边栏
 */
export default class OpenSidebarHover extends Plugin {
    settings: SettingsOptionInterface;
    isHoveringLeft = false;
    isHoveringRight = false;
    isPinnedLeft = false;
    isPinnedRight = false;
    leftSplit: ExtendedWorkspaceSplit;
    rightSplit: ExtendedWorkspaceSplit;
    leftRibbon: ExtendedWorkspaceRibbon;
    leftSplitMouseEnterHandler: () => void;
    rightSplitMouseEnterHandler: () => void;
    leftSplitMouseMoveHandler: () => void;
    rightSplitMouseMoveHandler: () => void;
    workspaceChangeTimeout: NodeJS.Timeout | null = null;

    // 双击跟踪变量
    private lastClickTime = 0;
    private lastClickTarget: HTMLElement | null = null;
    private doubleClickThreshold = 300;

    // 手动添加的事件进行清理跟踪
    private manualEvents: Array<{
        element: HTMLElement;
        type: string;
        handler: EventListener;
    }> = [];


    /**
     * 检查用户是否正在编辑（重命名输入、上下文菜单打开等）
     * @returns 是否正在编辑
     */
    isActivelyEditing(): boolean {
        // 检查是否有打开菜单（.menu）、设置菜单（.mod-settings）、侧边栏菜单（.sidebar-menu）
        const hasOpenMenu = document.querySelector('.sidebar-menu') !== null || document.querySelector('.menu') !== null || document.querySelector('.mod-settings') !== null;
        if (hasOpenMenu) return true;

        // 检查文件浏览器中是否有项目正在重命名
        const hasRenameInput = document.querySelector('.is-being-renamed') !== null;
        if (hasRenameInput) return true;

        // 检查侧边栏中是否有输入或可编辑元素被聚焦
        const activeEl = document.activeElement as HTMLElement;
        if (activeEl) {
            const isInput = activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA';
            const isEditable = activeEl.isContentEditable;

            if (isInput || isEditable) {
                // 检查聚焦的元素是否在任一侧边栏内
                const inLeftSidebar = this.leftSplit?.containerEl?.contains(activeEl);
                const inRightSidebar = this.rightSplit?.containerEl?.contains(activeEl);
                if (inLeftSidebar || inRightSidebar) return true;
            }
        }

        return false;
    }

    /**
     * 处理工作区变化
     */
    handleWorkspaceChange() {
        // 等待以确保DOM已就绪
        if (this.workspaceChangeTimeout) clearTimeout(this.workspaceChangeTimeout);

        this.workspaceChangeTimeout = setTimeout(() => {
            this.forceReinitialize();
        }, 100);
    }

    /**
     * 强制重新初始化插件状态
     */
    forceReinitialize() {
        // 重置所有状态并获取新的引用
        this.leftSplit = this.app.workspace.leftSplit as unknown as ExtendedWorkspaceSplit;
        this.rightSplit = this.app.workspace.rightSplit as unknown as ExtendedWorkspaceSplit;
        this.isHoveringLeft = false;
        this.isHoveringRight = false;

        // 清理并重新附加事件
        this.detachManualEvents();
        this.attachManualEvents();
        if (this.settings.collapseOnWorkspaceChange) {
            this.collapseBoth();
        }
    }

    /**
     * 文档点击事件处理程序（同时处理单击和双击）
     * @param e 鼠标事件
     */
    documentClickHandler = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const now = Date.now();

        // 检查是否为双击（在阈值内点击同一目标）
        const isDoubleClick = this.lastClickTarget === target &&
            (now - this.lastClickTime) < this.doubleClickThreshold;

        // 更新跟踪变量
        this.lastClickTime = now;
        this.lastClickTarget = target;

        // 如果启用了双击固定，则处理双击
        if (isDoubleClick && this.settings.doubleClickPin) {
            this.handleSidebarDoubleClick(target);
            return; // 跳过双击的单击逻辑
        }

        // 如果用户正在编辑（重命名、菜单打开等），则不折叠
        if (this.isActivelyEditing()) return;

        // 如果窗口未聚焦且启用了该设置，则不折叠
        if (this.settings.onlyWhenFocused && !document.hasFocus()) return;

        // 原始单击逻辑
        // 确保leftSplit和rightSplit已初始化
        if (!this.leftSplit || !this.rightSplit) return;

        const leftSplitEl = this.leftSplit.containerEl;
        const rightSplitEl = this.rightSplit.containerEl;

        // 如果点击侧边栏区域外且侧边栏已展开，则折叠它们
        if (!leftSplitEl.contains(target) && !rightSplitEl.contains(target)) {
            if (!this.leftSplit.collapsed && this.settings.leftSidebar && !this.isPinnedLeft) {
                this.collapseLeft();
            }
            if (!this.rightSplit.collapsed && this.settings.rightSidebar && !this.isPinnedRight) {
                this.collapseRight();
            }
        }
    };

    /**
     * 处理侧边栏双击以固定/取消固定
     * @param target 双击目标元素
     */
    handleSidebarDoubleClick(target: HTMLElement) {
        if (!this.leftSplit || !this.rightSplit) return;

        const leftSplitEl = this.leftSplit.containerEl;
        const rightSplitEl = this.rightSplit.containerEl;

        // 确定哪个侧边栏被双击
        if (leftSplitEl.contains(target)) {
            this.isPinnedLeft = !this.isPinnedLeft;
        }

        if (rightSplitEl.contains(target)) {
            this.isPinnedRight = !this.isPinnedRight;
        }
    }

    /**
     * 附加手动管理的事件监听器
     */
    attachManualEvents() {
        // 辅助函数，用于跟踪事件以便清理
        const attach = (element: HTMLElement, type: string, handler: EventListener) => {
            element.addEventListener(type, handler);
            this.manualEvents.push({ element, type, handler });
        };

        // 为右侧分割区域添加悬停类的实现
        if (this.rightSplit?.containerEl) {
            this.rightSplitMouseEnterHandler = () => {
                this.isHoveringRight = true;
                this.rightSplit.containerEl.addClass('hovered');
            };
            attach(this.rightSplit.containerEl, "mouseenter", this.rightSplitMouseEnterHandler);

            attach(this.rightSplit.containerEl, "mouseleave", this.rightSplitMouseLeaveHandler);

            this.rightSplitMouseMoveHandler = () => this.rightSplit.containerEl.addClass('hovered');
            attach(this.rightSplit.containerEl, "mousemove", this.rightSplitMouseMoveHandler);
        }

        // 为左侧分割区域添加悬停类的实现
        if (this.leftRibbon && this.leftRibbon.containerEl) {
            attach(this.leftRibbon.containerEl, "mouseenter", this.leftRibbonMouseEnterHandler);
        }

        if (this.leftSplit?.containerEl) {
            this.leftSplitMouseEnterHandler = () => {
                this.isHoveringLeft = true;
                this.leftSplit.containerEl.addClass('hovered');
            };
            attach(this.leftSplit.containerEl, "mouseenter", this.leftSplitMouseEnterHandler);

            attach(this.leftSplit.containerEl, "mouseleave", this.leftSplitMouseLeaveHandler);

            this.leftSplitMouseMoveHandler = () => this.leftSplit.containerEl.addClass('hovered');
            attach(this.leftSplit.containerEl, "mousemove", this.leftSplitMouseMoveHandler);
        }
    }

    /**
     * 分离手动管理的事件监听器
     */
    detachManualEvents() {
        // 移除所有跟踪的事件监听器
        this.manualEvents.forEach(({ element, type, handler }) => {
            element.removeEventListener(type, handler);
        });
        this.manualEvents = [];

        // 清理悬停类
        if (this.rightSplit?.containerEl) {
            this.rightSplit.containerEl.removeClass('hovered');
        }
        if (this.leftSplit?.containerEl) {
            this.leftSplit.containerEl.removeClass('hovered');
        }
    }

    /**
     * 插件加载时执行
     */
    async onload() {
        await this.loadSettings();


        // 如果设置中启用了覆盖模式，则应用覆盖模式类
        if (this.settings.overlayMode) {
            document.body.classList.add("sidebar-overlay-mode");
        }

        // 添加全局CSS类以实现建议的JS-CSS方法
        document.body.classList.add("open-sidebar-hover-plugin");

        // 根据设置更新CSS变量
        this.updateCSSVariables();

        // 注册热键命令以切换侧边栏
        this.addCommand({
            id: 'toggle-left-sidebar',
            name: "切换左侧侧边栏",
            callback: () => {
                this.toggleLeftSidebar();
            }
        });

        this.addCommand({
            id: 'toggle-right-sidebar',
            name: "切换右侧侧边栏",
            callback: () => {
                this.toggleRightSidebar();
            }
        });

        this.addCommand({
            id: 'toggle-both-sidebars',
            name: "切换两侧边栏",
            callback: () => {
                this.toggleBothSidebars();
            }
            // hotkeys: [{modifiers: [], key: 'Escape'}]
        });

        this.app.workspace.onLayoutReady(() => {
            // 转换为扩展接口以访问内部属性
            this.leftSplit = this.app.workspace.leftSplit as unknown as ExtendedWorkspaceSplit;
            this.rightSplit = this.app.workspace.rightSplit as unknown as ExtendedWorkspaceSplit;
            this.leftRibbon = this.app.workspace.leftRibbon as unknown as ExtendedWorkspaceRibbon;

            // 使用Obsidian的API注册自动清理的事件
            this.registerDomEvent(document, "mousemove", this.mouseMoveHandler);
            this.registerDomEvent(document, "click", this.documentClickHandler);

            // 防止工作区更改后插件损坏
            this.registerEvent(
                this.app.workspace.on('layout-change', () => {
                    this.handleWorkspaceChange();
                })
            );

            // 手动添加事件监听器
            this.attachManualEvents();
        });

        this.addSettingTab(new SidebarHoverSettingsTab(this.app, this));
    }

    /**
     * 插件卸载时执行
     */
    onunload() {
        void this.saveSettings();

        // 如果添加了覆盖模式类，则移除
        document.body.classList.remove("sidebar-overlay-mode");

        // 移除全局CSS类
        document.body.classList.remove("open-sidebar-hover-plugin");

        // 清理所有手动添加的事件监听器
        this.detachManualEvents();
    }

    /**
     * 加载设置
     */
    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    /**
     * 保存设置
     */
    async saveSettings() {
        await this.saveData(this.settings);
    }

    /**
     * 更新CSS变量的辅助方法
     */
    updateCSSVariables() {
        // 直接设置 :root 下的 CSS 变量
        document.documentElement.style.setProperty('--sidebar-expand-collapse-speed', `${this.settings.expandCollapseSpeed}ms`);
        document.documentElement.style.setProperty('--sidebar-expand-delay', `${this.settings.sidebarExpandDelay}ms`);
        document.documentElement.style.setProperty('--left-sidebar-max-width', `${this.settings.leftSidebarMaxWidth}px`);
        document.documentElement.style.setProperty('--right-sidebar-max-width', `${this.settings.rightSidebarMaxWidth}px`);

        // 直接设置 body 下的 CSS 变量
        document.body.style.setProperty('--sidebar-width', `${this.settings.leftSidebarMaxWidth}px`);
        document.body.style.setProperty('--right-sidebar-width', `${this.settings.rightSidebarMaxWidth}px`);
    }

    // 辅助方法
    /**
     * 获取编辑器宽度
     * @returns 编辑器宽度
     */
    getEditorWidth = () => this.app.workspace.containerEl.clientWidth;

    /**
     * 展开右侧边栏
     */
    expandRight() {
        // 通过展开开始动画
        this.rightSplit.expand();
        this.isHoveringRight = true;
    }

    /**
     * 展开左侧边栏
     */
    expandLeft() {
        // 通过展开开始动画
        this.leftSplit.expand();
        this.isHoveringLeft = true;
    }

    /**
     * 展开两侧边栏
     */
    expandBoth() {
        this.expandRight();
        this.expandLeft();
    }

    /**
     * 折叠右侧边栏
     */
    collapseRight() {
        // 仅在未固定时折叠
        if (!this.isPinnedRight) {
            this.rightSplit.collapse();
            this.isHoveringRight = false;
        }
    }

    /**
     * 折叠左侧边栏
     */
    collapseLeft() {
        // 仅在未固定时折叠
        if (!this.isPinnedLeft) {
            this.leftSplit.collapse();
            this.isHoveringLeft = false;
        }
    }

    /**
     * 折叠两侧边栏
     */
    collapseBoth() {
        this.collapseRight();
        this.collapseLeft();
    }

    /**
     * 仅切换左侧边栏 - 用于热键命令
     * 通过热键显示时，侧边栏会被固定，直到再次按下热键才会自动隐藏
     */
    toggleLeftSidebar() {
        if (!this.leftSplit) return;

        const leftExpanded = !this.leftSplit.collapsed;

        if (leftExpanded) {
            this.isPinnedLeft = false;
            this.leftSplit.collapse();
            this.isHoveringLeft = false;
        } else {
            this.expandLeft();
            this.isPinnedLeft = true;
        }
    }

    /**
     * 仅切换右侧边栏 - 用于热键命令
     */
    toggleRightSidebar() {
        if (!this.rightSplit) return;

        const rightExpanded = !this.rightSplit.collapsed;

        if (rightExpanded) {
            this.isPinnedRight = false;
            this.rightSplit.collapse();
            this.isHoveringRight = false;
        } else {
            this.expandRight();
            this.isPinnedRight = true;
        }
    }

    /**
     * 切换两侧边栏 - 用于热键命令
     */
    toggleBothSidebars() {
        const leftExpanded = this.leftSplit && !this.leftSplit.collapsed;
        const rightExpanded = this.rightSplit && !this.rightSplit.collapsed;

        if (leftExpanded || rightExpanded) {
            // 至少有一个侧边栏已展开 - 折叠两者并取消固定
            this.isPinnedLeft = false;
            this.isPinnedRight = false;
            if (this.leftSplit) {
                this.leftSplit.collapse();
                this.isHoveringLeft = false;
            }
            if (this.rightSplit) {
                this.rightSplit.collapse();
                this.isHoveringRight = false;
            }
        } else {
            // 两侧边栏都已折叠 - 展开并固定两者
            if (this.leftSplit) {
                this.expandLeft();
                this.isPinnedLeft = true;
            }
            if (this.rightSplit) {
                this.expandRight();
                this.isPinnedRight = true;
            }
        }
    }

    /**
     * 鼠标移动事件处理程序
     * @param event 鼠标事件
     */
    mouseMoveHandler = (event: MouseEvent) => {
        // 如果启用了该设置且窗口未聚焦，则跳过悬停检测
        if (this.settings.onlyWhenFocused && !document.hasFocus()) {
            return;
        }

        // 如果用户正在编辑（重命名、菜单打开、设置页面等），则跳过悬停检测
        if (this.isActivelyEditing()) {
            return;
        }

        const mouseX = event.clientX;

        // 处理右侧边栏悬停
        if (this.settings.rightSidebar) {
            if (!this.isHoveringRight && this.rightSplit.collapsed && !this.isPinnedRight) {
                const editorWidth = this.getEditorWidth();

                this.isHoveringRight =
                    mouseX >= editorWidth - this.settings.rightSideBarPixelTrigger;

                if (this.isHoveringRight && this.rightSplit.collapsed) {
                    setTimeout(() => {
                        if (this.isHoveringRight && !this.isActivelyEditing()) {
                            if (this.settings.syncLeftRight) {
                                this.expandBoth();
                            } else {
                                this.expandRight();
                            }
                        }
                    }, this.settings.sidebarExpandDelay);
                }

                setTimeout(() => {
                    if (!this.isHoveringRight && !this.isActivelyEditing()) {
                        this.collapseRight();
                    }
                }, this.settings.sidebarDelay);
            }
        }

        // 处理左侧边栏悬停
        if (this.settings.leftSidebar) {
            if (!this.isHoveringLeft && this.leftSplit.collapsed && !this.isPinnedLeft) {
                // 检查鼠标是否在左侧触发区域
                this.isHoveringLeft = mouseX <= this.settings.leftSideBarPixelTrigger;

                if (this.isHoveringLeft && this.leftSplit.collapsed) {
                    setTimeout(() => {
                        if (this.isHoveringLeft && !this.isActivelyEditing()) {
                            if (this.settings.syncLeftRight) {
                                this.expandBoth();
                            } else {
                                this.expandLeft();
                            }
                        }
                    }, this.settings.sidebarExpandDelay);
                }

                setTimeout(() => {
                    if (!this.isHoveringLeft && !this.isActivelyEditing()) {
                        this.collapseLeft();
                    }
                }, this.settings.sidebarDelay);
            }
        }
    };

    /**
     * 右侧分割区域鼠标离开事件处理程序
     * @param event 鼠标事件
     */
    rightSplitMouseLeaveHandler = (event: MouseEvent) => {
        // 如果离开到标签头容器或菜单，则不处理
        const target = event.relatedTarget as HTMLElement;
        if (target && (target.closest('.workspace-tab-header-container-inner') ||
            (target.hasClass && (target.hasClass('menu') || target.hasClass('sidebar-menu'))) ||
            target?.classList?.contains('menu') ||
            target?.classList?.contains('sidebar-menu') ||
            target?.closest('.menu') ||
            target?.closest('.sidebar-menu'))) {
            return;
        }

        // 如果窗口未聚焦且启用了该设置，则不折叠
        if (this.settings.onlyWhenFocused && !document.hasFocus()) return;

        // 如果用户正在编辑（重命名、菜单打开等），则不折叠
        if (this.isActivelyEditing()) return;

        if (this.settings.rightSidebar && !this.isPinnedRight) {
            this.isHoveringRight = false;
            // 移除悬停类
            this.rightSplit.containerEl.removeClass('hovered');

            setTimeout(() => {
                // 折叠前重新检查编辑状态和菜单状态
                if (!this.isHoveringRight && !this.isActivelyEditing() && !document.querySelector('.menu') && !document.querySelector('.sidebar-menu')) {
                    if (this.settings.syncLeftRight && this.settings.leftSidebar) {
                        this.collapseBoth();
                    } else {
                        this.collapseRight();
                    }
                }
            }, this.settings.sidebarDelay);
        }
    };

    /**
     * 左侧分割区域鼠标离开事件处理程序
     * @param event 鼠标事件
     */
    leftSplitMouseLeaveHandler = (event: MouseEvent) => {
        // 如果离开到标签头容器或菜单，则不处理
        const target = event.relatedTarget as HTMLElement;
        if (target && (target.closest('.workspace-tab-header-container-inner') ||
            (target.hasClass && (target.hasClass('menu') || target.hasClass('sidebar-menu'))) ||
            target?.classList?.contains('menu') ||
            target?.classList?.contains('sidebar-menu') ||
            target?.closest('.menu') ||
            target?.closest('.sidebar-menu'))) {
            return;
        }

        // 如果窗口未聚焦且启用了该设置，则不折叠
        if (this.settings.onlyWhenFocused && !document.hasFocus()) return;

        // 如果用户正在编辑（重命名、菜单打开等），则不折叠
        if (this.isActivelyEditing()) return;

        if (this.settings.leftSidebar && !this.isPinnedLeft) {
            this.isHoveringLeft = false;
            // 移除悬停类
            this.leftSplit.containerEl.removeClass('hovered');

            setTimeout(() => {
                // 折叠前重新检查编辑状态和菜单状态
                if (!this.isHoveringLeft && !this.isActivelyEditing() && !document.querySelector('.menu') && !document.querySelector('.sidebar-menu')) {
                    if (this.settings.syncLeftRight && this.settings.rightSidebar) {
                        this.collapseBoth();
                    } else {
                        this.collapseLeft();
                    }
                }
            }, this.settings.sidebarDelay);
        }
    };

    /**
     * 左侧功能区鼠标进入事件处理程序
     */
    leftRibbonMouseEnterHandler = () => {
        if (this.settings.leftSidebar) {
            this.isHoveringLeft = true;
            setTimeout(() => {
                // 检查是否仍在悬停
                if (this.isHoveringLeft) {
                    if (this.settings.syncLeftRight && this.settings.rightSidebar) {
                        this.expandBoth();
                    } else {
                        this.expandLeft();
                    }
                }
            }, this.settings.sidebarExpandDelay);
        }
    };
}

