import LanguageTranslationInterface from "./LanguageTranslationInterface";
import DEFAULT_SETTINGS from "../setting/DEFAULT_SETTINGS";
import {SettingsOptionInterface} from "./SettingsOptionInterface";

/**
 * 设置项类型
 */
export type SettingType = "toggle" | "text" | "dropdown" | "heading";

/**
 * 设置项配置
 */
export interface SettingsSectionConfig {
    /**
     *  标题键值（用于翻译）
     */
    titleKey: keyof LanguageTranslationInterface;
    /**
     *  设置项配置数组
     */
    settings: SettingConfig[];
}

/**
 * 设置项配置
 */
export interface SettingConfig {
    /**
     *  类型（toggle/text/dropdown）
     *  @see SettingType
     */
    type: SettingType;
    /**
     *  名称键值（用于翻译）
     */
    nameKey: keyof LanguageTranslationInterface;
    /**
     *  描述键值（用于翻译）
     */
    descKey?: keyof LanguageTranslationInterface;
    /**
     *  设置项键值（用于存储/读取设置）
     */
    settingKey: keyof SettingsOptionInterface;
    /**
     *  占位符（用于文本输入框）
     */
    placeholder?: string;
    /**
     *  默认值
     */
    defaultValue?: any;
    /**
     *  下拉选项选项值（用于下拉选择框）
     */
    options?: Record<string, string>;
    /**
     *  变化回调函数（用于处理设置项值变化）
     */
    onChange?: (value: any, plugin: any, settingsTab?: any) => void | Promise<void>;
    /**
     *  验证函数（用于验证设置项值）
     */
    validation?: (value: any) => boolean;
    /**
     *  是否为标题项（用于在设置项中显示）
     */
    heading?: boolean;
}


/**
 * 设置布局配置
 */
export interface SettingsLayoutConfig {
    /**
     *  设置项配置数组
     */
    sections: SettingsSectionConfig[];
}
