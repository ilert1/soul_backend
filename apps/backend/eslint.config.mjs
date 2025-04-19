// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      ecmaVersion: 5,
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'padding-line-between-statements': [
        'error',

        // Отделяем импорты от остального кода
        { blankLine: 'always', prev: 'import', next: '*' },
        { blankLine: 'any', prev: 'import', next: 'import' }, // без двойных отступов между импортами

        // Отделяем блоки кода внутри функций
        { blankLine: 'always', prev: 'block', next: 'block' },

        // Отделяем логические блоки (if, for, while, switch) от кода вокруг
        {
          blankLine: 'always',
          prev: '*',
          next: ['if', 'for', 'while', 'switch'],
        },
        {
          blankLine: 'always',
          prev: ['if', 'for', 'while', 'switch'],
          next: '*',
        },

        // Отделяем return от кода выше
        { blankLine: 'always', prev: '*', next: 'return' },

        // Отделяем директивы от остального кода
        { blankLine: 'always', prev: 'directive', next: '*' },
      ],

      // **Добавляем пробел между методами класса**
      'lines-between-class-members': [
        'error',
        'always',
        { exceptAfterSingleLine: true },
      ],
    },
  },
);
