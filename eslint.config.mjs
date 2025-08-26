import next from '@ygqygq2/eslint-config/next.mjs'
import tseslint from 'typescript-eslint'

export default tseslint.config(...next, {
  ignores: [
    '*.cjs',
    'scripts/',
    'scripts/**',
    'scripts/**/*',
    'public/',
    'dist/',
    'build/',
    '*.js',
    'out/',
    '.next/',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    'simple-import-sort/imports': 'warn',
    'prettier/prettier': 'warn',
  },
})
