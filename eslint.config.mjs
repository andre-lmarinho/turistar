import nextConfig from 'eslint-config-next';
import tsParser from '@typescript-eslint/parser';
import eslintTS from '@typescript-eslint/eslint-plugin';
import eslintReact from 'eslint-plugin-react';
import eslintHooks from 'eslint-plugin-react-hooks';

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

  ...nextConfig,

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
      react: eslintReact,
      'react-hooks': eslintHooks,
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/globals': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
    },
    settings: {
      react: { version: 'detect' },
    },
  },
];

export default eslintConfig;
