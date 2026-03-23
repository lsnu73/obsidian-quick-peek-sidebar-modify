import {App, Notice, PluginSettingTab} from "obsidian";
import LanguageTranslationInterface from "../types/LanguageTranslationInterface";
import {languageMap} from "../lang";
import OpenSidebarHover from "../main";
import {SETTINGS_LAYOUT} from "./settingsLayoutConfig";
import {SettingFactory} from "./SettingFactory";


/**
 * 侧边栏悬停设置选项卡
 */
export class SidebarHoverSettingsTab extends PluginSettingTab {
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
        const {containerEl} = this;

        const currentLanguage: LanguageTranslationInterface | undefined = languageMap.get(this.plugin.settings.language);
        if (currentLanguage === undefined) {
            new Notice("无法获取插件语言包，请检查 languageMap 中是否设置对应的语言包")
            this.plugin.onunload();
            return;
        }
        containerEl.empty();
        /**
         * 设置布局
         * 根据 SETTINGS_LAYOUT 配置创建设置项
         */
        SETTINGS_LAYOUT.sections.forEach(section => {
            const headingConfig = {
                type: "heading" as const,
                nameKey: section.titleKey,
                settingKey: "" as any
            };
            SettingFactory.createSetting(containerEl, headingConfig, currentLanguage, this.plugin, this);

            section.settings.forEach(settingConfig => {
                const config = {...settingConfig};

                if (config.type === "dropdown" && config.settingKey === "language") {
                    config.options = {};
                    languageMap.forEach((_value, key) => {
                        (config.options as Record<string, string>)[key] = key;
                    });
                }

                SettingFactory.createSetting(containerEl, config, currentLanguage, this.plugin, this);
            });
        });
    }
}