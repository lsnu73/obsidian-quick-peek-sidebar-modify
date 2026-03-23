# 快速预览侧边栏
> 本插件基于 [bwya77/open-sidebar-on-hover](https://github.com/bwya77/obsidian-quick-peek-sidebar) 开发

>英文文档：[English document](README-en.md)


## 功能特性
![演示视频](/images/demo.gif)
* 原先插件功能：
   - 鼠标悬停在窗口左边缘时展开左侧边栏
   - 鼠标悬停在窗口右边缘时展开右侧边栏
   - 可自定义悬停触发区域（距离边缘的像素值）
   - 可设置展开/收起动画速度
   - 支持侧边栏覆盖在主内容上方
   - 可设置左右侧边栏最大宽度
   - 可自定义展开前的延迟时间
   - 可自定义收起前的延迟时间
   - 支持同步控制左右侧边栏（同时展开/收起）
* 新增功能：
   - 中/英文切换
   - 控制工作区变化是否自动折叠左右面板

### 通用设置

| 设置项               | 说明                                                                 | 默认值   |
| -------------------- | -------------------------------------------------------------------- | -------- |
| 左侧边栏悬停触发     | 启用鼠标悬停时展开/收起左侧边栏                                      | 已启用   |
| 右侧边栏悬停触发     | 启用鼠标悬停时展开/收起右侧边栏                                      | 已启用   |
| 同步左右侧边栏       | 悬停任意一侧时同时展开双侧边栏（需两侧均已启用）                     | 已禁用   |
| 覆盖模式             | 侧边栏滑动覆盖主内容，而非挤压主内容                                | 已禁用   |
| 双击固定侧边栏       | 双击保持侧边栏展开，再次双击取消固定                                 | 已禁用   |

### 行为设置

| 设置项                   | 说明                                   | 默认值 |
| ------------------------ | -------------------------------------- | ------ |
| 左侧边栏触发像素距离     | 距离左边缘多少像素时触发悬停展开侧边栏 | 20     |
| 右侧边栏触发像素距离     | 距离右边缘多少像素时触发悬停展开侧边栏 | 20     |

### 时间设置

| 设置项                       | 说明                                       | 默认值 |
| ---------------------------- | ------------------------------------------ | ------ |
| 侧边栏收起延迟               | 鼠标离开后延迟多少毫秒收起侧边栏           | 250    |
| 侧边栏展开延迟               | 鼠标悬停后延迟多少毫秒展开侧边栏           | 10     |
| 展开/收起动画速度            | 侧边栏展开/收起动画时长，单位毫秒          | 375    |

### 外观设置

| 设置项                   | 说明                       | 默认值 |
| ------------------------ | -------------------------- | ------ |
| 左侧边栏最大宽度         | 左侧边栏最大像素宽度       | 325    |
| 右侧边栏最大宽度         | 右侧边栏最大像素宽度       | 325    |

![alt text|200](/images/所有功能.png)

## 安装方法

~~1. 打开 Obsidian 设置~~
~~2. 进入「社区插件」，关闭安全模式~~
~~3. 点击「浏览」，搜索「Quick Peek Sidebar」~~
~~4. 安装插件~~
~~5. 在社区插件列表中启用该插件~~

### 手动安装

1. 从发布页面下载最新版本
2. 将文件解压到你的库目录下的 `.obsidian/plugins/quick-peek-sidebar/`
3. 重新加载 Obsidian
4. 在社区插件列表中启用该插件

## 开发
## 项目代码结构

```
src/
├── config/
│   └── settingsLayoutConfig.ts          # 设置项布局配置
├── lang/
│   ├── en.ts                            # 英文翻译
│   ├── index.ts                         # 语言索引
│   └── zh.ts                            # 中文翻译
├── setting/
│   ├── DEFAULT_SETTINGS.ts              # 默认设置值
│   └── sidebarHoverSettingsTab.ts       # 设置标签页
├── types/
│   ├── LanguageTranslationInterface.ts  # 语言翻译接口
│   ├── SettingsConfigInterface.ts       # 设置配置接口
│   └── SettingsOptionInterface.ts       # 设置选项接口
├── utils/
│   └── SettingFactory.ts                # 设置项工厂类
└── main.ts                              # 主文件
```

## 如何添加一个设置项

要为插件添加新的设置项，请按照以下步骤操作：

### 1. 在设置接口中添加新字段

在 `src/types/SettingsOptionInterface.ts` 文件中，为 `SettingsOptionInterface` 接口添加新的属性：

```typescript
export interface SettingsOptionInterface {
    // ... 现有属性
    
    // 添加新的设置项
    newSetting: boolean;  // 或 number, string 等类型
}
```

### 2. 在默认设置中添加默认值

在 `src/setting/DEFAULT_SETTINGS.ts` 文件中，为 `DEFAULT_SETTINGS` 对象添加新的属性和默认值：

```typescript
const DEFAULT_SETTINGS: SettingsOptionInterface = {
    // ... 现有设置
    
    // 添加新的设置项及其默认值
    newSetting: true,
};
```

### 3. 在语言文件中添加翻译文本

在 `src/lang/zh.ts` 和 `src/lang/en.ts` 文件中，为新的设置项添加翻译文本：

**中文翻译 (zh.ts):**
```typescript
const zh: LanguageTranslationInterface = {
    // ... 现有翻译
    
    // 添加新的设置项翻译
    newSetting: "新设置项名称",
    newSettingDesc: "新设置项的描述说明",
};
```

**英文翻译 (en.ts):**
```typescript
const en: LanguageTranslationInterface = {
    // ... 现有翻译
    
    // 添加新的设置项翻译
    newSetting: "New Setting Name",
    newSettingDesc: "Description of the new setting",
};
```

### 4. 在设置布局配置中添加设置项配置

在 `src/config/settingsLayoutConfig.ts` 文件中，在相应的 `section` 中添加新的设置项配置：

```typescript
export const SETTINGS_LAYOUT: SettingsLayoutConfig = {
    sections: [
        {
            titleKey: "behavior",  // 或其他合适的 section
            settings: [
                // ... 现有设置项
                
                // 添加新的设置项配置
                {
                    type: "toggle",  // 或 "text", "dropdown"
                    nameKey: "newSetting",
                    descKey: "newSettingDesc",
                    settingKey: "newSetting",
                    onChange: async (value: boolean, plugin: any) => {
                        // 可选：添加值变化时的回调逻辑
                    }
                }
            ]
        }
    ]
};
```

### 设置项类型说明

插件支持以下几种设置项类型：

- **toggle**: 开关切换（布尔值）
- **text**: 文本输入（通常用于数字输入）
- **dropdown**: 下拉选择（从预设选项中选择）
- **heading**: 标题（用于分组显示）

### 完整示例

假设我们要添加一个"启用动画效果"的开关设置项：

1. **SettingsOptionInterface.ts:**
```typescript
export interface SettingsOptionInterface {
    // ... 现有属性
    enableAnimation: boolean;
}
```

2. **DEFAULT_SETTINGS.ts:**
```typescript
const DEFAULT_SETTINGS: SettingsOptionInterface = {
    // ... 现有设置
    enableAnimation: true,
};
```

3. **zh.ts:**
```typescript
const zh: LanguageTranslationInterface = {
    // ... 现有翻译
    enableAnimation: "启用动画效果",
    enableAnimationDesc: "启用侧边栏展开/收起的动画效果",
};
```

4. **en.ts:**
```typescript
const en: LanguageTranslationInterface = {
    // ... 现有翻译
    enableAnimation: "Enable Animation",
    enableAnimationDesc: "Enable animation for sidebar expand/collapse",
};
```

5. **settingsLayoutConfig.ts:**
```typescript
{
    type: "toggle",
    nameKey: "enableAnimation",
    descKey: "enableAnimationDesc",
    settingKey: "enableAnimation",
    onChange: async (value: boolean, plugin: any) => {
        // 更新 CSS 变量或其他逻辑
        plugin.updateCSSVariables();
    }
}
```

完成以上步骤后，重新构建插件（`npm run dev`），新设置项就会出现在插件设置页面中。


## 许可证
MIT 许可证。完整文本见 [LICENSE](https://github.com/bwya77/obsidian-quick-peek-sidebar/blob/main/LICENSE)。
