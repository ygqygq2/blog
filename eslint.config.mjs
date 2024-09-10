import next from '@ygqygq2/eslint-config/next.mjs';
import tseslint from 'typescript-eslint';

export default tseslint.config(...next, {
  ignores: ['*.cjs'],
  rules: {},
});
