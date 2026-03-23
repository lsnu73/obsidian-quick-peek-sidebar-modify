import LanguageTranslationInterface from "../types/LanguageTranslationInterface";
import zh from "./zh";
import en from "./en";
import {getLanguage, Notice} from "obsidian";

/**
 * 获取默认语言包翻译，如果当前语言包未支持，则返回 english
 * @desc code 参考 https://github.com/obsidianmd/obsidian-translations?tab=readme-ov-file#existing-languages
 */
export const getDefaultLanguageCode = (): string => {
    // 获取 obsidian 应用设置的语言
    const languageCode: string = getLanguage();

    // 如果语言包已支持，则返回语言包 code
    if (languageMap.has(languageCode)) {
        return languageCode;
    }
    // 提示用户当前语言包未支持
    new Notice("`[quick-peek-sideBar] 此插件目前尚不支持您当前的语言，已自动切换为中文");
    // 返回默认的 english
    return "zh";

};

/**
 * 设置语言包映射 Map
 * @desc key值命名需要遵循 https://github.com/obsidianmd/obsidian-translations?tab=readme-ov-file#existing-languages
 */
export const languageMap: Map<string, LanguageTranslationInterface> = new Map<string, LanguageTranslationInterface>();
languageMap.set("zh", zh);
languageMap.set("en", en);


