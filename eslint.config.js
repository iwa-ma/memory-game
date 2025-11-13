import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default [
  {
    /* 無視するファイル */
    ignores: ['dist/**', 'node_modules/**', '*.config.js'],
  },
  /* JavaScriptのルール */
  js.configs.recommended,
  /* TypeScriptのルール */
  ...tseslint.configs.recommended,
  /* Reactのルール */
  {
    /* 対象ファイル */
    files: ['**/*.{ts,tsx,js,jsx}'],
    /* プラグイン */
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    /* 言語オプション */
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    /* 設定 */
    settings: {
      react: {
        version: 'detect',
      },
    },
    /* ルール */
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
  },
];

