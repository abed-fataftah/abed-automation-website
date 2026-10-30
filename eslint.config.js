import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import astro from 'eslint-plugin-astro';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
  globalIgnores([
    'dist/',
    '.astro/',
    'node_modules/',
    '.claude/',
    'docs/.agent-cache/',
    'public/',
    'config/',
  ]),

  js.configs.recommended,

  // Type aware rules for .ts files, where the real logic lives.
  {
    files: ['**/*.ts'],
    extends: [tseslint.configs.strictTypeChecked, tseslint.configs.stylisticTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // .astro files: strict rules without type information.
  {
    files: ['**/*.astro'],
    extends: [tseslint.configs.strict, tseslint.configs.stylistic],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.astro'],
      },
    },
  },

  astro.configs['flat/recommended'],
  astro.configs['flat/jsx-a11y-strict'],

  // Files outside the TypeScript project (plain JS, and the virtual files ESLint
  // makes for <script> blocks in .astro) would crash type aware rules.
  {
    files: ['**/*.{js,mjs,cjs}', '**/*.astro/*.ts'],
    extends: [tseslint.configs.disableTypeChecked],
  },

  // Build scripts run in Node.
  {
    files: ['scripts/**'],
    languageOptions: {
      globals: { console: 'readonly', process: 'readonly', URL: 'readonly' },
    },
  },

  {
    files: ['**/*.{ts,astro}'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },

  {
    files: ['src/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [{ group: ['../*'], message: 'Use the @/ alias' }] },
      ],
    },
  },

  eslintConfigPrettier,
);
