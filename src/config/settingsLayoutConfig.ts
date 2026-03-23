import {SettingsLayoutConfig} from "../types/SettingsConfigInterface";
import DEFAULT_SETTINGS from "../setting/DEFAULT_SETTINGS";

export const SETTINGS_LAYOUT: SettingsLayoutConfig = {
    sections: [
        // 行为相关的选项
        {
            titleKey: "behavior",
            settings: [
                {
                    type: "toggle",
                    nameKey: "leftSidebarHover",
                    descKey: "leftSidebarHoverDesc",
                    settingKey: "leftSidebar"
                },
                {
                    type: "toggle",
                    nameKey: "rightSidebarHover",
                    descKey: "rightSidebarHoverDesc",
                    settingKey: "rightSidebar"
                },
                {
                    type: "toggle",
                    nameKey: "syncLeftRightSidebar",
                    descKey: "syncLeftRightSidebarDesc",
                    settingKey: "syncLeftRight"
                },
                {
                    type: "toggle",
                    nameKey: "overlayMode",
                    descKey: "overlayModeDesc",
                    settingKey: "overlayMode",
                    onChange: async (value: boolean, plugin: any) => {
                        if (value) {
                            document.body.classList.add("sidebar-overlay-mode");
                        } else {
                            document.body.classList.remove("sidebar-overlay-mode");
                        }
                    }
                },
                {
                    type: "toggle",
                    nameKey: "doubleClickPin",
                    descKey: "doubleClickPinDesc",
                    settingKey: "doubleClickPin"
                },
                {
                    type: "toggle",
                    nameKey: "onlyWhenFocused",
                    descKey: "onlyWhenFocusedDesc",
                    settingKey: "onlyWhenFocused"
                },
                // 工作区变化时（例如切换笔记），是否折叠左右侧面板
                {
                    type: "toggle",
                    nameKey: "collapseOnWorkspaceChange",
                    descKey: "collapseOnWorkspaceChangeDesc",
                    settingKey: "collapseOnWorkspaceChange"
                },
                {
                    type: "text",
                    nameKey: "leftSidebarPixelTrigger",
                    descKey: "leftSidebarPixelTriggerDesc",
                    settingKey: "leftSideBarPixelTrigger",
                    placeholder: "30",
                    defaultValue: DEFAULT_SETTINGS.leftSideBarPixelTrigger,
                    validation: (value: number) => value >= 1
                },
                {
                    type: "text",
                    nameKey: "rightSidebarPixelTrigger",
                    descKey: "rightSidebarPixelTriggerDesc",
                    settingKey: "rightSideBarPixelTrigger",
                    placeholder: "30",
                    defaultValue: DEFAULT_SETTINGS.rightSideBarPixelTrigger,
                    validation: (value: number) => value >= 1
                }

            ]
        },
        // 延迟相关的选项
        {
            titleKey: "timing",
            settings: [
                {
                    type: "text",
                    nameKey: "sidebarDelay",
                    descKey: "sidebarDelayDesc",
                    settingKey: "sidebarDelay",
                    placeholder: "300",
                    defaultValue: DEFAULT_SETTINGS.sidebarDelay,
                    validation: (value: number) => value >= 0
                },
                {
                    type: "text",
                    nameKey: "sidebarExpandDelay",
                    descKey: "sidebarExpandDelayDesc",
                    settingKey: "sidebarExpandDelay",
                    placeholder: "200",
                    defaultValue: DEFAULT_SETTINGS.sidebarExpandDelay,
                    validation: (value: number) => value >= 0,
                    onChange: async (_value: any, plugin: any) => {
                        plugin.updateCSSVariables();
                    }
                },
                {
                    type: "text",
                    nameKey: "expandCollapseSpeed",
                    descKey: "expandCollapseSpeedDesc",
                    settingKey: "expandCollapseSpeed",
                    placeholder: "300",
                    defaultValue: DEFAULT_SETTINGS.expandCollapseSpeed,
                    validation: (value: number) => value >= 0,
                    onChange: async (_value: any, plugin: any) => {
                        plugin.updateCSSVariables();
                    }
                }
            ]
        },
        // 外观相关的选项
        {
            titleKey: "appearance",
            settings: [
                {
                    type: "dropdown",
                    nameKey: "language",
                    settingKey: "language",
                    options: {} as Record<string, string>,
                    onChange: async (_value: any, plugin: any, settingsTab: any) => {
                        settingsTab.display();
                    }
                },
                {
                    type: "text",
                    nameKey: "leftSidebarMaxWidth",
                    descKey: "leftSidebarMaxWidthDesc",
                    settingKey: "leftSidebarMaxWidth",
                    placeholder: "300",
                    defaultValue: DEFAULT_SETTINGS.leftSidebarMaxWidth,
                    validation: (value: number) => value >= 100,
                    onChange: async (_value: any, plugin: any) => {
                        plugin.updateCSSVariables();
                    }
                },
                {
                    type: "text",
                    nameKey: "rightSidebarMaxWidth",
                    descKey: "rightSidebarMaxWidthDesc",
                    settingKey: "rightSidebarMaxWidth",
                    placeholder: "300",
                    defaultValue: DEFAULT_SETTINGS.rightSidebarMaxWidth,
                    validation: (value: number) => value >= 100,
                    onChange: async (_value: any, plugin: any) => {
                        plugin.updateCSSVariables();
                    }
                }
            ]
        }
    ]
};
