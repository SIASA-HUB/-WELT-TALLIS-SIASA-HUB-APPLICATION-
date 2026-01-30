const securityPlugin = require('eslint-plugin-security');

module.exports = [
  securityPlugin.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      ecmaVersion: 2022,
    },
    rules: {
      semi: 'error',
      'no-unused-vars': 'warn',
    },
  },
];
