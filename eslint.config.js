// eslint.config.js
import prettier from 'eslint-config-prettier'
import path from 'node:path'
import { includeIgnoreFile } from '@eslint/compat'
import js from '@eslint/js'
import globals from 'globals'
import ts from 'typescript-eslint'
import svelte from 'eslint-plugin-svelte'

const gitignorePath = path.resolve(import.meta.dirname, '.gitignore')

export default [
	includeIgnoreFile(gitignorePath),
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs['flat/recommended'],
	prettier,
	{
		files: ['**/*.ts', '**/*.tsx'],
		languageOptions: {
			parser: ts.parser,
		},
		rules: {
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
		},
	},
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parser: svelte.parser,
			parserOptions: {
				parser: ts.parser,
			},
		},
		rules: {
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
		},
	},
	{
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'module',
			globals: { ...globals.browser, ...globals.node },
		},
		rules: {
			'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
			'no-var': 'error',
			'no-debugger': 'error',
			// 'eqeqeq': 'error',
			'prefer-const': 'error',
			// 'no-useless-return': 'error',
			// 'no-useless-catch': 'error',
			'complexity': ['error', 15],
			'max-depth': ['error', 3]
		},
	},
]
