/* eslint-env node */
const path = require('node:path');
const createAliasSetting = require('@vue/eslint-config-airbnb/createAliasSetting');

module.exports = {
	root: true,
	extends: [
		'plugin:vue/vue3-recommended',
		'eslint:recommended',
		'@vue/eslint-config-airbnb',
	],
	parserOptions: {
		ecmaVersion: 'latest',
	},
	rules: {
		'import/no-unresolved': 'error',
		'no-tabs': ['warn', {
			allowIndentationTabs: true,
		}],
		indent: ['error', 'tab', {
			SwitchCase: 1,
		}],
		'arrow-parens': ['error', 'as-needed', {
			requireForBlockBody: true,
		}],
		'object-curly-newline': ['error', {
			ImportDeclaration: {
				minProperties: 6,
				consistent: true,
			},
		}],
		'no-continue': 'warn',
		'no-param-reassign': ['error', {
			props: false,
		}],
		'vue/html-indent': ['error', 'tab', {
			attribute: 1,
			baseIndent: 1,
			closeBracket: 0,
			alignAttributesVertically: true,
			ignores: [],
		}],
		'vue/html-closing-bracket-newline': ['error', {
			singleline: 'never',
			multiline: 'never',
		}],
		'vue/max-attributes-per-line': ['error', {
			singleline: {
				max: 3,
			},
			multiline: {
				max: 1,
			},
		}],
		'vue/first-attribute-linebreak': ['error', {
			singleline: 'beside',
			multiline: 'beside',
		}],
		'no-restricted-syntax': ['error', {
			selector: 'ForInStatement',
			message: 'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
		}, {
			selector: 'LabeledStatement',
			message: 'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
		}, {
			selector: 'WithStatement',
			message: '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
		}],
	},
	settings: {
		...createAliasSetting({
			'@': `${path.resolve(__dirname, './src')}`,
		}),
	},
};
