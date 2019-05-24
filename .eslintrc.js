module.exports = {
  root: true,
  parserOptions: {
    parser: "babel-eslint",
    ecmaVersion: 2017,
    sourceType: "module"
  },
  env: {
    browser: true,
    es6: true
  },
  extends: [
    "standard",
    //"plugin:vue/recommended",
    "plugin:vue/essential",
    "eslint:recommended",
  ],
  // required to lint *.vue files
  plugins: ["vue"],
  // add your custom rules here
  rules: {
    "prefer-arrow-callback": [2, { allowNamedFunctions: false }],
    "arrow-parens": 2,
    "space-before-function-paren": [2, "never"],
    "no-console": 0,
    "no-tabs": 0,
    "no-new": 0,
    semi: [2, "always"],
    quotes: [2, "double"],
    indent: [2, 2],
    "vue/max-attributes-per-line": [
      0,
      {
        singleline: 7,
        multiline: {
          max: 7,
          allowFirstLine: true
        }
      }
    ],
    "generator-star-spacing": 0,
    "no-debugger": process.env.NODE_ENV === "production" ? 2 : 0
  }
};
