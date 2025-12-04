// import tailwind from 'eslint-plugin-tailwindcss';
import antfu from '@antfu/eslint-config'; // 配置核心，包含通用配置
import nextPlugin from '@next/eslint-plugin-next'; // Next.js 官方 ESLint 插件，避免违背 Next.js 约定的代码
import eslintConfigPrettier from 'eslint-config-prettier'; // 关闭所有不必要或可能与 Prettier 冲突的规则
import jsxA11y from 'eslint-plugin-jsx-a11y'; // 提供 JSX 可访问性检查规则
import perfectionist from 'eslint-plugin-perfectionist';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'; // 把 Prettier 当成一个 ESLint 规则执行（错误显示在 ESLint 层）;
import unusedImports from 'eslint-plugin-unused-imports'; // 检测并删除未使用的 import 语句
/**
 * 部分字段会合并，比如 plugins、rules、overrides 等等。
 * 有些字段则会覆盖，比如 ignores、files 等等。
 */
export default antfu(
  {
    isInEditor: false,
    react: {
      overrides: {
        'react/no-comment-textnodes': 'off',
      },
    },
    typescript: true,
    stylistic: false,
    markdown: false,
    toml: false,
    ignores: [
      'public',
      'node_modules',
      'build',
      '.history',
      '.next',
      'public',
      'pnpm-lock.yaml',
      'package-lock.json',
      'next-env.d.ts',
    ],
  },
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
    },
    rules: {
      'no-console': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'ts/no-use-before-define': 'off',
      'ts/strict-boolean-expressions': 'off',
      'ts/no-unsafe-member-access': 'off',
      'ts/no-unsafe-call': 'off',
      'ts/no-unsafe-assignment': 'off',
      'ts/no-unsafe-return': 'off',
      'ts/no-unsafe-argument': 'off',
      'ts/no-misused-promises': 'off',
      'ts/no-floating-promises': 'off',
      'node/prefer-global/process': 'off',
      'node/prefer-global/buffer': 'off',
      'import/no-named-default': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'react-refresh/only-export-components': 'off',
      'react/no-leaked-conditional-rendering': 'off',
      'react/no-forward-ref': 'off',
      'jsdoc/check-param-names': 'off',
    },
  },
  jsxA11y.flatConfigs.recommended,
  {
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
  },
  {
    name: 'perfectionist',
    rules: {
      'import/order': 'off',
      'sort-imports': 'off',
      'perfectionist/sort-imports':
        perfectionist.configs['recommended-natural'].rules['perfectionist/sort-imports'],
      'perfectionist/sort-exports':
        perfectionist.configs['recommended-natural'].rules['perfectionist/sort-exports'],
      'perfectionist/sort-named-imports':
        perfectionist.configs['recommended-natural'].rules['perfectionist/sort-named-imports'],
      'perfectionist/sort-named-exports':
        perfectionist.configs['recommended-natural'].rules['perfectionist/sort-named-exports'],
    },
  },
  {
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
    },
  },
  // tailwind 和 eslint-plugin-tailwindcss 由于版本升级后不兼容，暂时注释掉
  //   ...tailwind.configs['flat/recommended'],
  //   {
  //     name: 'tailwind-overrides',
  //     rules: {
  //       // 允许写非 Tailwind 的 class（比如你有 BEM 类名）
  //       'tailwindcss/no-custom-classname': 'off',

  //       // 不强制缩写（不想被逼着用 m-4 替代 mx-4 my-4）
  //       'tailwindcss/enforces-shorthand': 'off',

  //       // 这种明显错误的规则建议开着
  //       'tailwindcss/no-contradicting-classname': 'error',
  //     },
  //   },

  eslintConfigPrettier,
  eslintPluginPrettierRecommended,
);
