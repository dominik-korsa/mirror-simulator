module.exports = {
  "env": {
    "es6": true,
    "node": true
  },
  "extends": [
    "airbnb-typescript/base",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2018,
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "plugins": [
    "@typescript-eslint"
  ],
  "settings": {
    "import/resolver": {
      "node": {
        "extensions": [
          ".ts"
        ]
      }
    }
  },
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "error",
    // "@typescript-eslint/typedef": [ "error" ],
    "import/order": [ "error" ],
    "import/prefer-default-export": "off",
    "no-console": "off",
    "@typescript-eslint/camelcase": "off"
  }
}
