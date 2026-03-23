import { App, Plugin, PluginSettingTab, Setting, WorkspaceRibbon, WorkspaceSplit } from "obsidian";

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

interface OpenSidebarHoverSettings {
  leftSidebar: boolean;
  rightSidebar: boolean;
  syncLeftRight: boolean;
  enforceSameDelay: boolean;
  sidebarDelay: number;
  sidebarExpandDelay: number;
  leftSideBarPixelTrigger: number;
  rightSideBarPixelTrigger: number;
  overlayMode: boolean;
  doubleClickPin: boolean;
  onlyWhenFocused: boolean;
  expandCollapseSpeed: number;
  leftSidebarMaxWidth: number;
  rightSidebarMaxWidth: number;
}

const DEFAULT_SETTINGS: OpenSidebarHoverSettings = {
  leftSidebar: true,
  rightSidebar: true,
  syncLeftRight: false,
  enforceSameDelay: true,
  sidebarDelay: 150,
  sidebarExpandDelay: 10,
  leftSideBarPixelTrigger: 20,
  rightSideBarPixelTrigger: 20,
  overlayMode: false,
  doubleClickPin: false,
  onlyWhenFocused: false,
  expandCollapseSpeed: 370,
  leftSidebarMaxWidth: 325,
  rightSidebarMaxWidth: 325,
};

/**
 * 侧边栏悬停展开插件
 * 允许通过鼠标悬停在屏幕边缘来展开和折叠侧边栏
 */
export default class OpenSidebarHover extends Plugin {
  settings: OpenSidebarHoverSettings;
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
    // 检查是否有打开的上下文菜单
    const hasOpenMenu = document.querySelector('.menu') !== null;
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
    this.leftSplit = this.app.workspace.leftSplit as any;
    this.rightSplit = this.app.workspace.rightSplit as any;
    this.isHoveringLeft = false;
    this.isHoveringRight = false;

    // 清理并重新附加事件
    this.detachManualEvents();
    this.attachManualEvents();
    this.collapseBoth();
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
      name: '切换左侧边栏',
      callback: () => {
        this.toggleLeftSidebar();
      }
    });

    this.addCommand({
      id: 'toggle-right-sidebar',
      name: '切换右侧边栏',
      callback: () => {
        this.toggleRightSidebar();
      }
    });

    this.addCommand({
      id: 'toggle-both-sidebars',
      name: '切换两侧边栏',
      callback: () => {
        this.toggleBothSidebars();
      },
      hotkeys: [{ modifiers: [], key: 'Escape' }]
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
    this.saveSettings();

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
    // 创建一个样式元素来保存自定义CSS变量
    const styleEl = document.createElement('style');
    styleEl.id = 'obsidian-quick-peek-sidebar-variables';

    // 移除任何现有的具有此ID的样式元素
    const existingStyle = document.getElementById(styleEl.id);
    if (existingStyle) {
      existingStyle.remove();
    }

    // 向样式元素添加CSS变量
    styleEl.textContent = `
      :root {
        --sidebar-expand-collapse-speed: ${this.settings.expandCollapseSpeed}ms;
        --sidebar-expand-delay: ${this.settings.sidebarExpandDelay}ms;
        --left-sidebar-max-width: ${this.settings.leftSidebarMaxWidth}px;
        --right-sidebar-max-width: ${this.settings.rightSidebarMaxWidth}px;
      }
      
      body {
        --sidebar-width: ${this.settings.leftSidebarMaxWidth}px !important;
        --right-sidebar-width: ${this.settings.rightSidebarMaxWidth}px !important;
      }
    `;

    // 将样式元素添加到文档头部
    document.head.appendChild(styleEl);
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

  // 事件处理程序
  /**
   * 鼠标移动事件处理程序
   * @param event 鼠标事件
   */
  mouseMoveHandler = (event: MouseEvent) => {
    // 如果启用了该设置且窗口未聚焦，则跳过悬停检测
    if (this.settings.onlyWhenFocused && !document.hasFocus()) {
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
            if (this.isHoveringRight) {
              if (this.settings.syncLeftRight) {
                this.expandBoth();
              } else {
                this.expandRight();
              }
            }
          }, this.settings.sidebarExpandDelay);
        }

        setTimeout(() => {
          if (!this.isHoveringRight) {
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
            if (this.isHoveringLeft) {
              if (this.settings.syncLeftRight) {
                this.expandBoth();
              } else {
                this.expandLeft();
              }
            }
          }, this.settings.sidebarExpandDelay);
        }

        setTimeout(() => {
          if (!this.isHoveringLeft) {
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
      (target.hasClass && target.hasClass('menu')) ||
      target?.classList?.contains('menu') ||
      target?.closest('.menu'))) {
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
        // 折叠前重新检查编辑状态
        if (!this.isHoveringRight && !this.isActivelyEditing()) {
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
      (target.hasClass && target.hasClass('menu')) ||
      target?.classList?.contains('menu') ||
      target?.closest('.menu'))) {
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
        // 折叠前重新检查编辑状态
        if (!this.isHoveringLeft && !this.isActivelyEditing()) {
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

/**
 * 侧边栏悬停设置选项卡
 */
class SidebarHoverSettingsTab extends PluginSettingTab {
  plugin: OpenSidebarHover;

  /**
   * 构造函数
   * @param app Obsidian应用实例
   * @param plugin 插件实例
   */
  constructor(app: App, plugin: OpenSidebarHover) {
    super(app, plugin);
    this.plugin = plugin;
  }

  /**
   * 显示设置选项卡
   */
  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    // 基本设置（无标题）
    new Setting(containerEl)
      .setName("左侧边栏悬停")
      .setDesc(
        "启用左侧边栏的悬停展开和折叠功能。"
      )
      .addToggle((t) =>
        t.setValue(this.plugin.settings.leftSidebar).onChange(async (value) => {
          this.plugin.settings.leftSidebar = value;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName("右侧边栏悬停")
      .setDesc(
        "启用右侧边栏的悬停展开和折叠功能。仅折叠右侧面板，除非您有右侧功能区。"
      )
      .addToggle((t) =>
        t
          .setValue(this.plugin.settings.rightSidebar)
          .onChange(async (value) => {
            this.plugin.settings.rightSidebar = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("同步左右侧边栏")
      .setDesc(
        "如果启用，悬停在右侧边栏时也会同时展开左侧边栏，反之亦然。（左侧和右侧边栏必须都在上方启用）"
      )
      .addToggle((t) =>
        t
          .setValue(this.plugin.settings.syncLeftRight)
          .onChange(async (value) => {
            this.plugin.settings.syncLeftRight = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("覆盖模式")
      .setDesc(
        "启用时，侧边栏会滑过主内容而不影响布局。禁用时，侧边栏会通过推挤内容来展开。"
      )
      .addToggle((t) =>
        t
          .setValue(this.plugin.settings.overlayMode)
          .onChange(async (value) => {
            this.plugin.settings.overlayMode = value;

            // 更新body上的CSS类以切换覆盖模式
            if (value) {
              document.body.classList.add("sidebar-overlay-mode");
            } else {
              document.body.classList.remove("sidebar-overlay-mode");
            }

            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("双击固定侧边栏")
      .setDesc(
        "启用时，双击可保持侧边栏打开。再次双击可取消固定。"
      )
      .addToggle((t) =>
        t
          .setValue(this.plugin.settings.doubleClickPin)
          .onChange(async (value) => {
            this.plugin.settings.doubleClickPin = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("仅在聚焦时")
      .setDesc(
        "启用时，仅当Obsidian是聚焦的应用程序时才会触发侧边栏悬停。在与其他应用程序分屏时很有用。"
      )
      .addToggle((t) =>
        t
          .setValue(this.plugin.settings.onlyWhenFocused)
          .onChange(async (value) => {
            this.plugin.settings.onlyWhenFocused = value;
            await this.plugin.saveSettings();
          })
      );

    // 行为部分
    new Setting(containerEl).setName("行为").setHeading();

    new Setting(containerEl)
      .setName("左侧边栏像素触发器")
      .setDesc(
        "指定从编辑器左边缘开始触发左侧边栏悬停打开的像素数（必须大于0）"
      )
      .addText((text) => {
        text
          .setPlaceholder("30")
          .setValue(this.plugin.settings.leftSideBarPixelTrigger.toString())
          .onChange(async (value) => {
            const v = Number(value);
            if (!value || isNaN(v) || v < 1) {
              this.plugin.settings.leftSideBarPixelTrigger =
                DEFAULT_SETTINGS.leftSideBarPixelTrigger;
            } else {
              this.plugin.settings.leftSideBarPixelTrigger = v;
            }
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("右侧边栏像素触发器")
      .setDesc(
        "指定从编辑器右边缘开始触发右侧边栏悬停打开的像素数（必须大于0）"
      )
      .addText((text) => {
        text
          .setPlaceholder("30")
          .setValue(this.plugin.settings.rightSideBarPixelTrigger.toString())
          .onChange(async (value) => {
            const v = Number(value);
            if (!value || isNaN(v) || v < 1) {
              this.plugin.settings.rightSideBarPixelTrigger =
                DEFAULT_SETTINGS.rightSideBarPixelTrigger;
            } else {
              this.plugin.settings.rightSideBarPixelTrigger = v;
            }
            await this.plugin.saveSettings();
          });
      });

    // 定时部分
    new Setting(containerEl).setName("定时").setHeading();

    new Setting(containerEl)
      .setName("侧边栏折叠延迟")
      .setDesc(
        "鼠标离开后侧边栏折叠前的延迟（毫秒）。输入'0'可禁用延迟。"
      )
      .addText((text) => {
        text
          .setPlaceholder("300")
          .setValue(this.plugin.settings.sidebarDelay.toString())
          .onChange(async (value) => {
            const v = Number(value);
            if (!v || isNaN(v) || v < 0) {
              this.plugin.settings.sidebarDelay = DEFAULT_SETTINGS.sidebarDelay;
            } else {
              this.plugin.settings.sidebarDelay = v;
            }
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("侧边栏展开延迟")
      .setDesc(
        "悬停后侧边栏展开前的延迟（毫秒）。默认为200ms。"
      )
      .addText((text) => {
        text
          .setPlaceholder("200")
          .setValue(this.plugin.settings.sidebarExpandDelay.toString())
          .onChange(async (value) => {
            const v = Number(value);
            if (!v || isNaN(v) || v < 0) {
              this.plugin.settings.sidebarExpandDelay = DEFAULT_SETTINGS.sidebarExpandDelay;
            } else {
              this.plugin.settings.sidebarExpandDelay = v;
            }
            // 立即应用CSS变量
            this.plugin.updateCSSVariables();
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("展开/折叠动画速度")
      .setDesc(
        "侧边栏展开/折叠动画的速度（毫秒）。"
      )
      .addText((text) => {
        text
          .setPlaceholder("300")
          .setValue(this.plugin.settings.expandCollapseSpeed?.toString() || "300")
          .onChange(async (value) => {
            const v = Number(value);
            if (!value || isNaN(v) || v < 0) {
              this.plugin.settings.expandCollapseSpeed = DEFAULT_SETTINGS.expandCollapseSpeed;
            } else {
              this.plugin.settings.expandCollapseSpeed = v;
            }
            // 立即应用CSS变量
            this.plugin.updateCSSVariables();
            await this.plugin.saveSettings();
          });
      });

    // 外观部分
    new Setting(containerEl).setName("外观").setHeading();

    new Setting(containerEl)
      .setName("左侧边栏最大宽度")
      .setDesc(
        "指定左侧边栏展开时的最大宽度（像素）"
      )
      .addText((text) => {
        text
          .setPlaceholder("300")
          .setValue(this.plugin.settings.leftSidebarMaxWidth.toString())
          .onChange(async (value) => {
            const v = Number(value);
            if (!value || isNaN(v) || v < 100) {
              this.plugin.settings.leftSidebarMaxWidth = DEFAULT_SETTINGS.leftSidebarMaxWidth;
            } else {
              this.plugin.settings.leftSidebarMaxWidth = v;
            }
            // 立即应用CSS变量
            this.plugin.updateCSSVariables();
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("右侧边栏最大宽度")
      .setDesc(
        "指定右侧边栏展开时的最大宽度（像素）"
      )
      .addText((text) => {
        text
          .setPlaceholder("300")
          .setValue(this.plugin.settings.rightSidebarMaxWidth.toString())
          .onChange(async (value) => {
            const v = Number(value);
            if (!value || isNaN(v) || v < 100) {
              this.plugin.settings.rightSidebarMaxWidth = DEFAULT_SETTINGS.rightSidebarMaxWidth;
            } else {
              this.plugin.settings.rightSidebarMaxWidth = v;
            }
            // 立即应用CSS变量
            this.plugin.updateCSSVariables();
            await this.plugin.saveSettings();
          });
      });
  }
}