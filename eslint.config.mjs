import js from '@eslint/js';
import json from '@eslint/json';
import { defineConfig } from 'eslint/config';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

const tsRecommended = tseslint.configs.recommended.map((config) => ({
  ...config,
  files: ['editor/**/*.{ts,tsx}'],
}));

const jsRecommended = {
  ...js.configs.recommended,
  files: ['**/*.{js,mjs,cjs}'],
};

export default defineConfig([
  {
    ignores: [
      'node_modules/**',
      'editor/node_modules/**',
      '.cursor/**',
      '.cache/**',
      'public/**',
      'coverage/**',
      'dist/**',
      'build/**',
      '**/*.tsbuildinfo',
      'package-lock.json',
      'editor/package-lock.json',
      '.varfile.json',
      'src/gvars/env.*.gvar',
    ],
  },
  jsRecommended,
  ...tsRecommended,
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    rules: {
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
  {
    files: ['**/*.json'],
    plugins: { json },
    language: 'json/json',
    extends: ['json/recommended'],
  },
  {
    files: ['utils/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: globals.node,
    },
  },
  {
    files: ['eslint.config.mjs', 'editor/test/**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
    },
  },
  {
    files: ['editor/**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2022,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: reactHooks.configs.recommended.rules,
  },
  {
    files: ['editor/vite.config.ts', 'editor/src/**/*.test.{ts,tsx}', 'editor/test/**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },
  },
  prettierRecommended,
]);
