import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import playwright from 'eslint-plugin-playwright';
import prettier from 'eslint-config-prettier/flat';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    ...playwright.configs['flat/recommended'],
    files: ['tests/e2e/**', 'tests/a11y/**', 'tests/security/**', 'tests/selftest/**'],
  },
  prettier,
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'coverage/**',
    'playwright-report/**',
    'test-results/**',
    '.superpowers/**',
  ]),
]);
