import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import { defineConfig } from 'eslint/config'

export default defineConfig([
    // 1. 通用基础配置（所有 JS/TS/Vue 文件）
    {
        files: ['**/*.{js,mjs,cjs,ts,mts,cts,vue}'],
        extends: [
            js.configs.recommended, // JS 官方推荐规则
            ...tseslint.configs.recommended, // TS 推荐规则
            ...pluginVue.configs['flat/essential'], // Vue 基础规则
        ],
        languageOptions: {
            globals: {
                ...globals.browser, // 浏览器全局变量
                ...globals.node, // Node 全局变量
            },
        },
    },

    // 2. Vue 文件专用配置
    {
        files: ['**/*.vue'],
        languageOptions: {
            parserOptions: {
                parser: tseslint.parser, // Vue 中解析 TS
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
        },
        rules: {
            // Vue 常用自定义规则（可按需调整）
            'vue/multi-word-component-names': 'off', // 关闭组件名必须多单词
            'vue/no-v-html': 'warn', // v-html 仅警告
        },
    },

    // 3. TypeScript 专用规则
    {
        files: ['**/*.{ts,mts,cts,vue}'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'warn', // any 仅警告不报错
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }], // 允许下划线参数
        },
    },

    // 4. 忽略文件（等价于 .eslintignore）
    {
        ignores: [
            'node_modules/',
            'dist/',
            'dist-ssr/',
            '*.local',
            'coverage/',
            'public/',
            'vite.config.ts',
        ],
    },
])