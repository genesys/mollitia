module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  extends: [
    '@nuxtjs/eslint-config-typescript',
    'plugin:nuxt/recommended'
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'semi': [2, 'always'],
    'import/order': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'indent': 'off',
    'vue/html-closing-bracket-spacing': 'off',
    'vue/html-self-closing': 'off',
    'vue/attributes-order': 'off',
    'vue/singleline-html-element-content-newline': 'off',
    'vue/no-v-html': 'off',
    'vue/order-in-components': 'off',
    'quote-props': 'off',
    'vue/html-closing-bracket-newline': [2, {
      singleline: 'never',
      multiline: 'never'
    }],
    'no-tabs': 'off',
    'vue/html-indent': 'off',
    'vue/name-property-casing': 'off'
  }
};
