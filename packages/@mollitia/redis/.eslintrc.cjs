/* eslint-env node */
module.exports = {
    root: true,
    extends: ['mollitia/typescript'],
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: './tsconfig.eslint.json'
    }
};
