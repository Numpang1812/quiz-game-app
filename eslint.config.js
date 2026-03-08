import prettier from 'eslint-config-prettier'
import path from 'node:path'
import { includeIgnoreFile } from '@eslint/compat'
import js from '@eslint/js'
import svelte from 'eslint-plugin-svelte'
import { defineConfig } from 'eslint/config'
import globals from 'globals'
import ts from 'typescript-eslint'
import svelteConfig from './svelte.config.js'

const gitignorePath = path.resolve(import.meta.dirname, '.gitignore')

export default defineConfig(
	includeIgnoreFile(gitignorePath),
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	prettier,
	...svelte.configs.prettier,
	{
		languageOptions: { globals: { ...globals.browser, ...globals.node } },
		rules: {
			'no-undef': 'off',
			'@typescript-eslint/no-explicit-any': 'warn', // Flag any types
			'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // Allow _ prefixed
			'@typescript-eslint/consistent-type-imports': 'warn', // Enforce type imports
			'@svelte/no-at-html-tags': 'warn', // Warn on @html usage to prevent XSS risks
			'no-console': ['warn', { allow: ['warn', 'error'] }], // Allow console.warn and console.error
		},
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
				svelteConfig,
			},
		},
	},
)
