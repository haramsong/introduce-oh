module.exports = {
env: {
    browser: true,
    es2021: true,
    node: true, // 추가
    },
    extends: ['eslint:recommended', 'prettier'],
    overrides: [],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    rules: {
        'no-unused-vars': 'off',
    },
};