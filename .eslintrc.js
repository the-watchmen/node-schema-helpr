module.exports = {
  extends: ['eslint:recommended', 'prettier'],
  // parser: 'babel-eslint',
  env: {
    // es6: true,
    // browser: true,
    node: true
  },
  // ecmaFeatures: {
  //   modules: true
  // },
  // globals: {
  //   __DEV__: true
  // },
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: ['prettier'],
  rules: {
    'import/prefer-default-export': 'off',
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        semi: false,
        bracketSpacing: false,
        printWidth: 100
      }
    ]
  }
}
