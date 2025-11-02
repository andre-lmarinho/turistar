import eslintNext from '@next/eslint-plugin-next';
import eslintTS from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import eslintReact from 'eslint-plugin-react';
import eslintHooks from 'eslint-plugin-react-hooks';

if (eslintReact?.configs?.flat) {
  delete eslintReact.configs.flat;
}

if (eslintHooks?.configs?.flat) {
  delete eslintHooks.configs.flat;
}

const nextRules = {
  plugins: {
    '@next/next': eslintNext,
  },
  rules: {
    ...eslintNext.configs.recommended.rules,
    ...eslintNext.configs['core-web-vitals'].rules,
  },
};

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
  nextRules,
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
      'react-hooks': eslintHooks,
      react: eslintReact,
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
