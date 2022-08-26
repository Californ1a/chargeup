/* eslint-env node */
module.exports = {
	"root": true,
	"extends": [
		"plugin:vue/vue3-recommended",
		"eslint:recommended"
	],
	"parserOptions": {
		"ecmaVersion": "latest"
	},
	"rules": {
		"vue/html-indent": ["error", "tab", {
			"attribute": 1,
			"baseIndent": 1,
			"closeBracket": 0,
			"alignAttributesVertically": true,
			"ignores": []
		}],
		"vue/html-closing-bracket-newline": ["error", {
			"singleline": "never",
			"multiline": "never"
		}],
		"vue/max-attributes-per-line": ["error", {
			"singleline": {
				"max": 3
			},
			"multiline": {
				"max": 1
			}
		}],
		"vue/first-attribute-linebreak": ["error", {
			"singleline": "beside",
			"multiline": "beside"
		}]
	}
}
