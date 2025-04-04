/** @type {import('eslint").Linter.Config} */
module.exports = {
    root: true,
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    ignorePatterns: ['dist'],
    rules: {
        '@typescript-eslint/no-explicit-any': 1,
        '@typescript-eslint/no-unused-vars': 1,
        '@typescript-eslint/ban-types': 1,
        'no-empty-pattern': 1,
        'no-inner-declarations': 0,
        'no-unused-vars': 0,
        'prefer-const': 1
    }
};
