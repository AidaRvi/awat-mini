module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    semi: 'off',
    'no-console': 'warn',
    '@typescript-eslint/semi': ['error'],
    '@typescript-eslint/no-unused-vars': [''],
    '@typescript-eslint/ban-ts-comment': [''],
    '@typescript-eslint/no-empty-function': ['warn'],
  },
};
