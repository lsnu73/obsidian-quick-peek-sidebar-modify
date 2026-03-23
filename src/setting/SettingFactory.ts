import { Setting } from "obsidian";
import { SettingConfig } from "../types/SettingsConfigInterface";
import LanguageTranslationInterface from "../types/LanguageTranslationInterface";

/**
 * 设置项的简单工厂，根据 SETTINGS_LAYOUT 中的配置创建对应的 Setting
 */
export class SettingFactory {
    /**
     * 创建设置项
     * @param containerEl 容器元素
     * @param config 设置项配置
     * @param currentLanguage 当前语言翻译
     * @param plugin 插件实例
     * @param settingsTab 设置标签页实例
     * @returns Setting实例
     */
    static createSetting(
        containerEl: HTMLElement,
        config: SettingConfig,
        currentLanguage: LanguageTranslationInterface,
        plugin: any,
        settingsTab: any
    ): Setting | null {
        const setting = new Setting(containerEl);

        switch (config.type) {
            case "toggle":
                return this.createToggleSetting(setting, config, currentLanguage, plugin);
            case "text":
                return this.createTextSetting(setting, config, currentLanguage, plugin);
            case "dropdown":
                return this.createDropdownSetting(setting, config, currentLanguage, plugin, settingsTab);
            case "heading":
                return this.createHeadingSetting(setting, config, currentLanguage);
            default:
                console.warn(`Unknown setting type: ${config.type}`);
                return null;
        }
    }
    /**
     * 创建切换设置项
     * @param setting 设置项实例
     * @param config 设置项配置
     * @param currentLanguage 当前语言翻译
     * @param plugin 插件实例
     * @returns Setting实例
     */
    private static createToggleSetting(
        setting: Setting,
        config: SettingConfig,
        currentLanguage: LanguageTranslationInterface,
        plugin: any
    ): Setting {
        setting
            .setName(currentLanguage[config.nameKey])
            .setDesc(config.descKey ? currentLanguage[config.descKey] : "")
            .addToggle((t) =>
                t.setValue(plugin.settings[config.settingKey]).onChange(async (value) => {
                    plugin.settings[config.settingKey] = value;
                    if (config.onChange) {
                        await config.onChange(value, plugin);
                    }
                    await plugin.saveSettings();
                })
            );
        return setting;
    }
    /**
     * 创建文本设置项
     * @param setting 设置项实例
     * @param config 设置项配置
     * @param currentLanguage 当前语言翻译
     * @param plugin 插件实例
     * @returns Setting实例
     */
    private static createTextSetting(
        setting: Setting,
        config: SettingConfig,
        currentLanguage: LanguageTranslationInterface,
        plugin: any
    ): Setting {
        setting
            .setName(currentLanguage[config.nameKey])
            .setDesc(config.descKey ? currentLanguage[config.descKey] : "")
            .addText((text) => {
                const currentValue = plugin.settings[config.settingKey];
                text
                    .setPlaceholder(config.placeholder || "")
                    .setValue(currentValue?.toString() || "")
                    .onChange(async (value) => {
                        const v = Number(value);
                        if (!value || isNaN(v) || (config.validation && !config.validation(v))) {
                            plugin.settings[config.settingKey] = config.defaultValue;
                        } else {
                            plugin.settings[config.settingKey] = v;
                        }
                        if (config.onChange) {
                            await config.onChange(v, plugin);
                        }
                        await plugin.saveSettings();
                    });
            });
        return setting;
    }
    /**
     * 创建下拉设置项
     * @param setting 设置项实例
     * @param config 设置项配置
     * @param currentLanguage 当前语言翻译
     * @param plugin 插件实例
     * @param settingsTab 设置标签页实例
     * @returns Setting实例
     */
    private static createDropdownSetting(
        setting: Setting,
        config: SettingConfig,
        currentLanguage: LanguageTranslationInterface,
        plugin: any,
        settingsTab: any
    ): Setting {
        setting.setName(currentLanguage[config.nameKey]);

        if (config.descKey) {
            setting.setDesc(currentLanguage[config.descKey]);
        }

        setting.addDropdown((component) => {
            if (config.options) {
                Object.entries(config.options).forEach(([key, label]) => {
                    component.addOption(key, label);
                });
            }
            component.setValue(plugin.settings[config.settingKey]);
            component.onChange(async (value) => {
                plugin.settings[config.settingKey] = value;
                if (config.onChange) {
                    await config.onChange(value, plugin, settingsTab);
                }
                await plugin.saveSettings();
            });
        });
        return setting;
    }
    /**
     * 创建标题设置项
     * @param setting 设置项实例
     * @param config 设置项配置
     * @param currentLanguage 当前语言翻译
     * @returns Setting实例
     */
    private static createHeadingSetting(
        setting: Setting,
        config: SettingConfig,
        currentLanguage: LanguageTranslationInterface
    ): Setting {
        setting.setName(currentLanguage[config.nameKey]).setHeading();
        return setting;
    }
}
