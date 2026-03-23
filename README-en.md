# Quick Peek Sidebar
> This plugin is forked from [bwya77/open-sidebar-on-hover](https://github.com/bwya77/obsidian-quick-peek-sidebar)

>中文文档：[中文文档](README.md)

## Features
![Demo Video](/images/demo.gif)
* Original features:
   - Expand the left sidebar when hovering over the left edge of the window
   - Expand the right sidebar when hovering over the right edge of the window
   - Configurable hover trigger area (pixels from the edge)
   - Adjustable expand/collapse animation speed
   - Support overlaying sidebars on top of the main content
   - Configurable maximum width for left and right sidebars
   - Customizable delay before expanding
   - Customizable delay before collapsing
   - Support synchronized control of both sidebars (expand/collapse together)
* New features:
   - Chinese/English language switch
   - Control whether to auto-collapse left and right panels on workspace changes

### General Settings

| Setting               | Description                                                                 | Default    |
| --------------------- | --------------------------------------------------------------------------- | ---------- |
| Left Sidebar Hover    | Enable expanding/collapsing the left sidebar on hover                       | Enabled    |
| Right Sidebar Hover   | Enable expanding/collapsing the right sidebar on hover                      | Enabled    |
| Sync Left & Right     | Expand both sidebars together when hovering either (both must be enabled)    | Disabled   |
| Overlay Mode          | Sidebars slide over content instead of pushing it                           | Disabled   |
| Double-click to Pin   | Double-click to keep sidebar open; double-click again to unpin              | Disabled   |

### Behavior

| Setting                     | Description                                                   | Default |
| --------------------------- | ------------------------------------------------------------- | ------- |
| Left Trigger Pixel Width    | Pixels from left edge to trigger hover expansion              | 20      |
| Right Trigger Pixel Width   | Pixels from right edge to trigger hover expansion             | 20      |

### Timing

| Setting                         | Description                                               | Default |
| ------------------------------- | --------------------------------------------------------- | ------- |
| Sidebar Collapse Delay          | Delay in ms before collapsing after mouse leaves          | 250     |
| Sidebar Expand Delay            | Delay in ms before expanding on hover                     | 10      |
| Expand/Collapse Animation Speed | Animation duration for sidebar expand/collapse in ms      | 375     |

### Appearance

| Setting                     | Description                                   | Default |
| --------------------------- | --------------------------------------------- | ------- |
| Left Sidebar Max Width      | Maximum width of the left sidebar in pixels   | 325     |
| Right Sidebar Max Width     | Maximum width of the right sidebar in pixels  | 325     |

![alt text|200](/images/所有功能-en.png)

## Installation

~~1. Open Obsidian Settings~~
~~2. Go to Community Plugins and turn off Safe Mode~~
~~3. Click Browse and search for "Quick Peek Sidebar"~~
~~4. Install the plugin~~
~~5. Enable the plugin in your Community Plugins list~~

### Manual Installation

1. Download the latest release from the releases page
2. Extract the files to `.obsidian/plugins/quick-peek-sidebar/` in your vault
3. Reload Obsidian
4. Enable the plugin in the Community Plugins list

## Development
## Project Structure

```
src/
├── config/
│   └── settingsLayoutConfig.ts          # Setting layout configuration
├── lang/
│   ├── en.ts                            # English translations
│   ├── index.ts                         # Language index
│   └── zh.ts                            # Chinese translations
├── setting/
│   ├── DEFAULT_SETTINGS.ts              # Default setting values
│   └── sidebarHoverSettingsTab.ts       # Settings tab
├── types/
│   ├── LanguageTranslationInterface.ts  # Translation interface
│   ├── SettingsConfigInterface.ts       # Settings config interface
│   └── SettingsOptionInterface.ts       # Settings option interface
├── utils/
│   └── SettingFactory.ts                # Setting item factory class
└── main.ts                              # Main entry file
```

## How to Add a New Setting

Follow these steps to add a new setting to the plugin:

### 1. Add a new field to the settings interface

In `src/types/SettingsOptionInterface.ts`, add a new property to the `SettingsOptionInterface`:

```typescript
export interface SettingsOptionInterface {
    // ... existing properties
    
    // Add new setting
    newSetting: boolean;  // or number, string, etc.
}
```

### 2. Add a default value in default settings

In `src/setting/DEFAULT_SETTINGS.ts`, add the new property and its default value:

```typescript
const DEFAULT_SETTINGS: SettingsOptionInterface = {
    // ... existing settings
    
    // New setting with default value
    newSetting: true,
};
```

### 3. Add translation strings

Add translations in `src/lang/zh.ts` and `src/lang/en.ts`:

**Chinese (zh.ts):**
```typescript
const zh: LanguageTranslationInterface = {
    // ... existing translations
    
    newSetting: "New Setting Name",
    newSettingDesc: "Description for the new setting",
};
```

**English (en.ts):**
```typescript
const en: LanguageTranslationInterface = {
    // ... existing translations
    
    newSetting: "New Setting Name",
    newSettingDesc: "Description for the new setting",
};
```

### 4. Add setting configuration to the layout

In `src/config/settingsLayoutConfig.ts`, add the new setting to the appropriate `section`:

```typescript
export const SETTINGS_LAYOUT: SettingsLayoutConfig = {
    sections: [
        {
            titleKey: "behavior",  // or another section
            settings: [
                // ... existing settings
                
                {
                    type: "toggle",  // or "text", "dropdown"
                    nameKey: "newSetting",
                    descKey: "newSettingDesc",
                    settingKey: "newSetting",
                    onChange: async (value: boolean, plugin: any) => {
                        // Optional callback logic
                    }
                }
            ]
        }
    ]
};
```

### Supported Setting Types

- **toggle**: Boolean switch
- **text**: Text input (commonly used for numbers)
- **dropdown**: Dropdown selection
- **heading**: Section heading

### Full Example

To add an "Enable Animation" toggle:

1. **SettingsOptionInterface.ts:**
```typescript
export interface SettingsOptionInterface {
    // ...
    enableAnimation: boolean;
}
```

2. **DEFAULT_SETTINGS.ts:**
```typescript
const DEFAULT_SETTINGS: SettingsOptionInterface = {
    // ...
    enableAnimation: true,
};
```

3. **zh.ts:**
```typescript
const zh: LanguageTranslationInterface = {
    // ...
    enableAnimation: "Enable Animation",
    enableAnimationDesc: "Enable animation for sidebar expand/collapse",
};
```

4. **en.ts:**
```typescript
const en: LanguageTranslationInterface = {
    // ...
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
        plugin.updateCSSVariables();
    }
}
```

After completing these steps, rebuild the plugin with `npm run dev` and the new setting will appear in the plugin settings.

## License
MIT License. Full text available at [LICENSE](https://github.com/bwya77/obsidian-quick-peek-sidebar/blob/main/LICENSE).