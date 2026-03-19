import type { HomePageConfig } from '@/app/_components/home/types';

/**
 * 个人博客首页配置
 */
export const homeConfig: HomePageConfig = {
  welcome: {
    title: '欢迎来到',
    colorTitle: '我的博客！',
    content: `这里是我的个人技术博客，也是我的第一个全栈项目 \n从HTML/CSS到Node.js、Vue、React，记录我一路走来的学习与成长 \n 愿每一篇文章都能帮助到同样在探索中前行的你...`,
  },
  video: {
    image: 'url(https://cn-nb1.rains3.com/3rcd/media/1739813698418.png)',
    videoUrl: 'https://cn-nb1.rains3.com/3rcd/media/1739846041317.mp4',
  },
  list: {
    first: {
      title: '技术文章',
      data: [
        { href: '#', text: 'HTML / CSS 基础与实战技巧' },
        { href: '#', text: 'JavaScript 核心原理与进阶' },
        { href: '#', text: 'Vue & React 前端框架对比与实践' },
        { href: '#', text: 'Node.js 后端开发与全栈探索' },
      ],
      button: { href: '#', text: '浏览文章', outline: true },
    },
    second: {
      title: '学习笔记',
      data: [
        { href: '#', text: '区块链与 Web3 入门探索' },
        { href: '#', text: 'Python / Java 学习记录' },
        { href: '#', text: '量化交易与数据分析初探' },
        { href: '#', text: '全栈项目从零到上线的完整历程' },
      ],
      button: { href: '#', text: '查看笔记', outline: true },
    },
  },
  typed: [
    '从一行 HTML 开始，到独立完成全栈项目，这条路我走了多久？',
    '学了 Vue 又学 React，前端框架的选择让你纠结过吗？',
    'Node.js 打开了后端的大门，原来 JS 也能写服务器！',
    '尝试过区块链、量化、数据分析……探索的边界在哪里？',
    '第一个全栈项目上线的那一刻，成就感无与伦比',
    '技术学习没有终点，但每一步都算数',
    '这里记录我的代码、我的思考、我的成长',
    '欢迎一起交流，共同进步！',
  ],
  timeline: [
    {
      title: '现在',
      content: `完成第一个 Next.js 全栈项目，持续学习中，探索更多可能性...`,
    },
    {
      title: '近期',
      content: `深入学习 React / Next.js，尝试全栈开发，将博客作为第一个完整项目上线`,
    },
    {
      title: '数据方向',
      content: `接触量化交易与数据分析，学习 Python 数据处理，了解金融与技术的交叉领域`,
    },
    {
      title: '多语言探索',
      content: `学习 Java 基础，了解后端生态；接触区块链与 Web3，探索去中心化应用开发`,
    },
    {
      title: 'React 阶段',
      content: `从 Vue 转向 React，理解组件化思想与状态管理，前端视野进一步拓宽`,
    },
    {
      title: 'Node.js 阶段',
      content: `学习 Node.js，打通前后端，开始理解服务端逻辑、API 设计与数据库操作`,
    },
    {
      title: 'Vue 阶段',
      content: `学习 Vue 框架，掌握响应式开发，完成第一个前端工程化项目`,
    },
    {
      title: 'JavaScript 阶段',
      content: `深入学习 JavaScript，理解原型链、异步、闭包等核心概念，前端能力大幅提升`,
    },
    {
      title: '起点',
      content: `从 HTML 和 CSS 开始，写下第一行代码，踏上前端开发之路`,
    },
  ],
};
