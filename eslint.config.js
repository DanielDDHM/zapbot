import { fileURLToPath } from 'url'
import { dirname } from 'path'
import typescriptParser from '@typescript-eslint/parser' // Certifique-se de importar o parser corretamente
import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin'
import eslintPluginPrettier from 'eslint-plugin-prettier'
import unusedImports from 'eslint-plugin-unused-imports'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default [
  {
    ignores: ['node_modules/**', '.wwebjs_auth/**', '.wwebjs_cache/**', 'dist/**'],
  },
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      parser: typescriptParser,
    },
    plugins: {
      '@typescript-eslint': typescriptEslintPlugin,
      prettier: eslintPluginPrettier,
      'unused-imports': unusedImports,
    },
    rules: {
      ...eslintPluginPrettier.configs.recommended.rules,
      ...typescriptEslintPlugin.configs.recommended.rules,
      'prettier/prettier': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn', // Transforma em warning
      '@typescript-eslint/no-unused-vars': 'warn', // Transforma em warning
      'unused-imports/no-unused-imports': 'error',
    },
  },
]
