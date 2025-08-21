import next from '@ygqygq2/eslint-config/next.mjs'
import tseslint from 'typescript-eslint'

export default tseslint.config(...next, {
  ignores: ['*.cjs', 'scripts/**/*'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'simple-import-sort/imports': 'warn',
    'prettier/prettier': 'warn',
  },
})
