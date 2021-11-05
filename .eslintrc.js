module.exports = {
    root: true,
    env: {
        node: true
    },
    extends: [
        'plugin:vue/vue3-essential',
        '@vue/standard'
    ],
    parserOptions: {
        ecmaVersion: 2020
    },
    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'indent': ['error', 'tab', { 'SwitchCase': 1 }],
        'no-tabs': 'off',
        // 处理vue script 标签
        'vue/script-indent': ['error', 4, { 'baseIndent': 1 }],
        'camelcase': [0, { properties: 'never' }],
        'curly': ['off', 'multi-or-nest']
    },
    overrides: [
        {
            files: [
                '**/__tests__/*.{j,t}s?(x)',
                '**/tests/unit/**/*.spec.{j,t}s?(x)'
            ],
            env: {
                jest: true
            }
        },
        {
            "files": ["*.vue"],
            "rules": {
                "indent": "off",
            }
        }
    ]
}
