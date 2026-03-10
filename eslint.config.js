// eslint.config.js
import prettier from 'eslint-config-prettier'
import path from 'node:path'
import { includeIgnoreFile } from '@eslint/compat'
import js from '@eslint/js'
import globals from 'globals'

const gitignorePath = path.resolve(import.meta.dirname, '.gitignore')

export default [
	includeIgnoreFile(gitignorePath),
	js.configs.recommended,
	prettier,
	{
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'module',
			globals: { ...globals.browser, ...globals.node },
		},
		rules: {
			'no-console': ['warn', { allow: ['warn', 'error'] }],
			'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
		},
	},
]
