// 拦截组件的兜底页面
// 当没有匹配到具体的拦截路由时，返回 null，不渲染任何内容
// 这样在页面刷新或直接访问 URL 时，modal 不会显示
export default function Default() {
  return null;
}
