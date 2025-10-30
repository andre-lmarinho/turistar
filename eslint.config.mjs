import tsParser from '@typescript-eslint/parser';
import eslintTS from '@typescript-eslint/eslint-plugin';
import eslintReact from 'eslint-plugin-react';
import eslintHooks from 'eslint-plugin-react-hooks';
import nextPlugin from '@next/eslint-plugin-next';

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
    ...eslintReact.configs.flat.recommended,
  },

  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    ...eslintHooks.configs.flat.recommended,
  },

  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    ...nextPlugin.flatConfig.recommended,
  },

  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/no-unknown-property': 'off',
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/globals': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
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
      '@typescript-eslint/no-unused-vars': 'warn',
    },
    settings: {
      react: { version: 'detect' },
    },
  },
];

export default eslintConfig;
