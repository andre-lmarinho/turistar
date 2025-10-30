import { createRequire } from 'node:module';

import tsParser from '@typescript-eslint/parser';
import eslintTS from '@typescript-eslint/eslint-plugin';
import eslintReact from 'eslint-plugin-react';
import eslintHooks from 'eslint-plugin-react-hooks';
import eslintImport from 'eslint-plugin-import';
import eslintA11y from 'eslint-plugin-jsx-a11y';
import globals from 'globals';
import nextPlugin from '@next/eslint-plugin-next';
import nextParser from 'eslint-config-next/parser.js';

const require = createRequire(import.meta.url);

const basePlugins = {
  '@next/next': nextPlugin,
  import: eslintImport,
  react: eslintReact,
  'react-hooks': eslintHooks,
  'jsx-a11y': eslintA11y,
};

const reactRecommendedRules = eslintReact.configs.flat.recommended.rules;
const hooksRecommendedRules = eslintHooks.configs.flat.recommended.rules;
const nextRecommendedRules = nextPlugin.flatConfig.recommended.rules;
const sharedJsTsRules = {
  ...reactRecommendedRules,
  ...hooksRecommendedRules,
  ...nextRecommendedRules,
  'import/no-anonymous-default-export': 'warn',
  'react/jsx-no-target-blank': 'off',
  'react/no-unknown-property': 'off',
  'react/prop-types': 'off',
  'react/react-in-jsx-scope': 'off',
  'react-hooks/exhaustive-deps': 'warn',
  'react-hooks/globals': 'off',
  'react-hooks/preserve-manual-memoization': 'off',
  'react-hooks/set-state-in-effect': 'off',
  'jsx-a11y/alt-text': [
    'warn',
    {
      elements: ['img'],
      img: ['Image'],
    },
  ],
  'jsx-a11y/aria-props': 'warn',
  'jsx-a11y/aria-proptypes': 'warn',
  'jsx-a11y/aria-unsupported-elements': 'warn',
  'jsx-a11y/role-has-required-aria-props': 'warn',
  'jsx-a11y/role-supports-aria-props': 'warn',
};

const tsParserPath = require.resolve('@typescript-eslint/parser');
const importResolverNode = require.resolve('eslint-import-resolver-node');
const importResolverTypescript = require.resolve('eslint-import-resolver-typescript');

const eslintConfig = [
  {
    ignores: [
      '**/node_modules/**',
      '**/.ignored_node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/public/**',
      '**/.next/**',
      '**/.vercel/**',
      '**/coverage/**',
    ],
  },

  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: nextParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
        requireConfigFile: false,
        babelOptions: {
          presets: ['next/babel'],
          caller: {
            supportsTopLevelAwait: true,
          },
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: basePlugins,
    rules: sharedJsTsRules,
    settings: {
      react: { version: 'detect' },
      'import/parsers': {
        [tsParserPath]: ['.ts', '.mts', '.cts', '.tsx', '.d.ts'],
      },
      'import/resolver': {
        [importResolverNode]: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
        [importResolverTypescript]: {
          alwaysTryTypes: true,
        },
      },
    },
  },

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      '@typescript-eslint': eslintTS,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
];

export default eslintConfig;
