import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import prettierPlugin from 'eslint-plugin-prettier';
import globals from 'globals';

const prettierRecommended = omitObjKeys(prettierPlugin.configs.recommended, 'extends', 'plugins');
const typescriptRecommended = {
  ...omitObjKeys(typescriptPlugin.configs.recommended, 'extends', 'plugins'),
  plugins: {
    prettier: prettierPlugin,
  },
};

export default [
  prettierRecommended,
  typescriptRecommended,
  {
    files: ['**/*.ts'],
    plugins: {
      '@typescript-eslint': typescriptPlugin,
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/return-await': ['error', 'always'],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_' },
      ],
      'max-lines-per-function': ['error', 40],
      '@typescript-eslint/naming-convention': [
        'warn',
        {
          selector: 'interface',
          format: ['PascalCase'],
          custom: {
            regex: '^I[A-Z]',
            match: true,
          },
        },
      ],
    },
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
        ...globals.es6,
      },
    },
  },
];

function omitObjKeys(obj, ...keysToOmit) {
  let result = obj;

  for (const key of keysToOmit) {
    const { [key]: _, ...tempResult } = result;

    result = tempResult;
  }

  return result;
}