/** @type {import('stylelint').Config} */
export default {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-tailwindcss',
  ],
  plugins: ['stylelint-order'],
  rules: {
    // 通用规则：所有 css / css modules 都生效
    'color-hex-alpha': null,
    'color-hex-length': 'short',
    'block-no-empty': true,
    'no-duplicate-selectors': true,
    // 属性顺序（可选，看你喜好）
    'order/properties-order': [
      // 这里只是示例，你可以以后再精细化
      'position',
      'top',
      'right',
      'bottom',
      'left',
      'display',
      'flex',
      'flex-direction',
      'justify-content',
      'align-items',
      'width',
      'height',
      'margin',
      'padding',
      'background',
      'color',
      'font-size',
    ],
  },
  // ⭐ 下面用 overrides 区分“全局 css”和“module css”
  overrides: [
    // 1️⃣ CSS Modules 规则
    {
      files: ['**/*.module.css'],
      extends: ['stylelint-config-css-modules'],
      rules: {
        // 限制类名风格（你可以自己改 regex）
        // 例如：驼峰 or 小写中划线，根据你习惯来
        'selector-class-pattern': [
          '^[a-z][a-zA-Z0-9]+$', // camelCase 示例
          {
            message: 'CSS Module 类名请使用 camelCase 命名',
          },
        ],
      },
    },

    // 2️⃣ 全局 css 规则（非 module）
    {
      files: ['**/*.css', '!**/*.module.css'],
      rules: {
        // 全局 css 通常是 reset / layout，可以适当放宽
        // 不强制 class 命名模式
        'selector-class-pattern': null,
        // 全局可以容忍较多 id、element 选择器，根据习惯调整
      },
    },
  ],
};