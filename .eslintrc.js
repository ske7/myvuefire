module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint',
    ecmaVersion: 2017,
    sourceType: 'module'
  },
  env: {
    browser: true,
  },
  extends: [
    'plugin:vue/recommended', 
    'eslint:recommended',
    'standard'
  ],
  // required to lint *.vue files
  plugins: [
    'vue'
  ],
  // add your custom rules here
  rules: {
	"space-before-function-paren": [2, "never"],
	"no-console": 0,
	"no-tabs": 0,
	"no-new": 0,
			"semi": [
				"error",
				"always"
			],
			"quotes": [
				"error",
				"double"
			],
			"indent": [
				"error",
				"tab"
			],
			"vue/max-attributes-per-line": [2, {
				"singleline": 7,
				"multiline": {
					"max": 1,
					"allowFirstLine": false
				}
			}],	
    // allow async-await
    'generator-star-spacing': 'off',
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  }
}
