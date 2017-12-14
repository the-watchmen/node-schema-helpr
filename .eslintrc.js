module.exports = {
  extends: ['eslint:recommended', 'prettier', 'prettier/react'],
  parser: 'babel-eslint',
  env: {
    es6: true,
    browser: true,
    node: true
  },
  ecmaFeatures: {
    modules: true,
    jsx: true
  },
  globals: {
    __DEV__: true
  },
  plugins: ['prettier'],
  rules: {
    'import/prefer-default-export': 'off',
    'react/forbid-component-props': 'off',
    'react/prop-types': 'off',
    'react/require-default-props': 'off',
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
