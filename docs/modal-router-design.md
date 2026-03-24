app/
├── layout.tsx          <-- 根布局
├── page.tsx            <-- 主页 (显示图片列表)
├── @modal/             <-- 1. 并行路由 (定义插槽)
│   ├── default.tsx     <-- 必须有！默认返回 null (没弹窗时显示啥)
│   └── (.)photo/       <-- 2. 拦截路由 (开始拦截逻辑)
│       └── [id]/
│           └── page.tsx <-- 这里写弹窗的 UI组件 (Modal)
└── photo/
    └── [id]/
        └── page.tsx    <-- 这里写完整页面的 UI组件 (刷新后看到的页面)