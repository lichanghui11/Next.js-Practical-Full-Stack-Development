# React 三大经典模式详解

## 概述

React 组件设计中有三大经典复用模式：

| 模式 | 英文名 | 核心思想 |
|------|--------|----------|
| 渲染属性 | Render Props | 通过函数 prop 把状态/数据注入到调用方控制的 UI 中 |
| 高阶组件 | Higher-Order Component (HOC) | 用函数包裹组件，返回增强后的新组件 |
| 自定义 Hook | Custom Hook | 把有状态逻辑提取成可复用的函数 |

---

## 一、Render Props 模式

### 核心思想

组件自己管理**逻辑和状态**，但把**如何渲染 UI** 的控制权通过一个函数 prop 交给调用方。

### 语法形式

```tsx
// 形式一：prop 名叫 render
<Component render={(data) => <SomeUI data={data} />} />

// 形式二：prop 名叫 children（更常见）
<Component>
  {(data) => <SomeUI data={data} />}
</Component>

// 形式三：带泛型约束（本项目中的写法）
render: <P extends Record<string, any> & { auth: User | null }>(props: P) => JSX.Element
```

### 本项目实例分析

```tsx
// src/app/_components/auth/index.tsx

export const AuthChecker: FC<{
  loading?: JSX.Element;
  render: <P extends Record<string, any> & { auth: User | null }>(props: P) => JSX.Element;
}> = (props) => {
  const { loading = <DefaultLoading />, render } = props;
  const auth = useAuth(); // 组件内部管理登录状态

  // 核心逻辑：
  // auth === false → 未完成校验 → 展示 loading
  // auth !== false → 已拿到状态 → 把 auth 交给调用方渲染
  return auth === false ? loading : render({ auth });
};
```

**调用方的写法：**

```tsx
<AuthChecker
  render={({ auth }) => (
    // auth 类型已被收窄为 User | null，不再是 false
    <div>
      {auth ? <UserDashboard user={auth} /> : <GuestView />}
    </div>
  )}
/>
```

**为什么这样设计？**

`AuthChecker` 内部封装了两件事：

1. 从 Context 读取 `auth` 状态
2. 处理 `false`（加载中）的情况，对外屏蔽这个中间态

调用方通过 `render` 函数拿到的 `auth` 类型已经被**收窄**为 `User | null`，永远不会是 `false`。这是 TypeScript 类型安全 + UI 关注点分离的完美结合。

### 真实业务场景

#### 场景一：权限控制

```tsx
// 权限检查组件：内部管理权限逻辑，外部控制 UI
const PermissionGuard: FC<{
  permission: string;
  render: (hasPermission: boolean) => JSX.Element;
}> = ({ permission, render }) => {
  const { permissions } = useCurrentUser();
  const hasPermission = permissions.includes(permission);
  return render(hasPermission);
};

// 使用方式：按钮根据权限决定是否禁用
<PermissionGuard
  permission="post:delete"
  render={(can) => (
    <Button disabled={!can} onClick={handleDelete}>
      删除文章
    </Button>
  )}
/>
```

#### 场景二：数据获取 + 状态管理

```tsx
// 封装列表数据获取、分页、加载状态
const DataList: FC<{
  url: string;
  render: (data: { items: Item[]; loading: boolean; loadMore: () => void }) => JSX.Element;
}> = ({ url, render }) => {
  const { items, loading, loadMore } = usePaginatedData(url);
  return render({ items, loading, loadMore });
};

// 调用方完全控制 UI，可以是列表、卡片、表格...
<DataList
  url="/api/posts"
  render={({ items, loading, loadMore }) => (
    <div>
      {loading ? <Spinner /> : items.map(item => <PostCard key={item.id} {...item} />)}
      <button onClick={loadMore}>加载更多</button>
    </div>
  )}
/>
```

#### 场景三：鼠标位置追踪（经典教学案例）

```tsx
const MouseTracker: FC<{
  children: (pos: { x: number; y: number }) => JSX.Element;
}> = ({ children }) => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  return (
    <div onMouseMove={(e) => setPos({ x: e.clientX, y: e.clientY })}>
      {children(pos)}
    </div>
  );
};

// 使用
<MouseTracker>
  {({ x, y }) => <div>鼠标位置：{x}, {y}</div>}
</MouseTracker>
```

### Render Props 的优势

- **逻辑复用**：多个不同 UI 可以共享同一套逻辑
- **类型收窄**：调用方拿到的数据类型已经过处理，更安全
- **关注点分离**：逻辑组件不关心 UI，UI 组件不关心数据来源
- **灵活性高**：调用方对 UI 有完整控制权

### Render Props 的缺点

- 嵌套多层时产生"回调地狱"（Wrapper Hell）
- 在 React DevTools 中组件树较深，调试稍麻烦

---

## 二、HOC 高阶组件模式

### 核心思想

用一个函数包裹一个组件，**注入额外的 props 或行为**，返回增强后的新组件。

```tsx
// 基本结构
function withSomething<T>(WrappedComponent: FC<T>): FC<Omit<T, 'injectedProp'>> {
  return function Enhanced(props) {
    const injectedProp = useGetSomething();
    return <WrappedComponent {...(props as T)} injectedProp={injectedProp} />;
  };
}
```

### 真实业务场景

#### 场景一：认证保护（等价于本项目 AuthChecker 的 HOC 写法）

```tsx
// withAuth HOC：如果未登录则重定向，已登录则注入 user
function withAuth<T extends { user: User }>(
  WrappedComponent: FC<T>
): FC<Omit<T, 'user'>> {
  return function AuthProtected(props) {
    const auth = useAuth();

    if (auth === false) return <Spinner />;
    if (auth === null) {
      redirect('/login');
      return null;
    }

    return <WrappedComponent {...(props as T)} user={auth} />;
  };
}

// 使用：ProfilePage 的 props 里不再需要手动传 user
const ProfilePage = withAuth(({ user }) => <div>{user.name}</div>);
```

#### 场景二：日志埋点

```tsx
function withTracking<T>(
  WrappedComponent: FC<T>,
  eventName: string
): FC<T> {
  return function Tracked(props) {
    useEffect(() => {
      track(eventName, 'mounted');
      return () => track(eventName, 'unmounted');
    }, []);

    return <WrappedComponent {...props} />;
  };
}

const TrackedButton = withTracking(Button, 'purchase_button');
```

### HOC 的优势

- 在组件外部完成增强，原组件无需感知
- 可以链式组合多个 HOC：`withA(withB(withC(Component)))`

### HOC 的缺点

- Props 来源不透明（"prop drilling 的反面"）
- 多个 HOC 嵌套时可能发生 prop 命名冲突
- TypeScript 类型推导较复杂

---

## 三、Custom Hook 自定义 Hook 模式

### 核心思想

把**有状态的逻辑**（useXxx）提取成独立函数，**不绑定任何 UI**，供多个组件直接调用。

### 真实业务场景

#### 场景一：本项目中的认证 Hook

```tsx
// src/app/_components/auth/hooks.ts

// 读取 auth 状态
export const useAuth = () => {
  const { auth } = use(AuthContext);
  return auth;
};

// 修改 auth 状态
export const useSetAuth = () => {
  const { setAuth } = use(AuthContext);
  return setAuth;
};
```

这正是本项目的做法：`AuthChecker` 和 `AuthSetter` 都通过 `useAuth()` 消费同一个 Context，而不是重复写 `useContext(AuthContext)`。

#### 场景二：分页数据请求

```tsx
function usePagination<T>(fetcher: (page: number) => Promise<T[]>) {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMore = async () => {
    setLoading(true);
    const newItems = await fetcher(page + 1);
    setItems(prev => [...prev, ...newItems]);
    setPage(prev => prev + 1);
    setLoading(false);
  };

  return { items, loading, loadMore };
}

// 在任何组件中使用
const { items, loading, loadMore } = usePagination(fetchPosts);
```

#### 场景三：表单处理

```tsx
function useForm<T extends Record<string, any>>(initialValues: T) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Partial<T>>({});

  const handleChange = (field: keyof T) => (value: T[keyof T]) => {
    setValues(prev => ({ ...prev, [field]: value }));
  };

  const reset = () => setValues(initialValues);

  return { values, errors, handleChange, reset };
}
```

### Custom Hook 的优势

- 最符合 React 现代设计哲学
- 逻辑与 UI 完全解耦，单独可测试
- 类型推导自然，无需复杂泛型技巧
- 无额外组件层级，DevTools 清晰

---

## 三种模式的选型指南

```
需要复用逻辑？
    ├── 逻辑里有 UI 渲染且调用方需要控制 UI 样式？
    │       └── 用 Render Props
    │
    ├── 需要在组件外部增强，且组件本身不应感知？（如埋点、权限包装）
    │       └── 用 HOC
    │
    └── 纯逻辑复用，UI 由各组件自己决定？
            └── 用 Custom Hook（首选）
```

### 实际项目中的组合使用

本项目的认证系统就是三种模式的完美组合：

```
Auth（Context Provider）
  └── AuthSetter（Custom Hook: useAuth + useSetAuth 消费 Context）
        └── AuthChecker（Render Props: 把收窄后的 auth 交给调用方）
```

1. **Custom Hook**（`useAuth`, `useSetAuth`）：封装 Context 读写逻辑
2. **Render Props**（`AuthChecker`）：封装"加载中"判断，把安全的 `auth` 交给调用方
3. 未来若需要保护整个页面路由，可以加一层 **HOC**（`withAuth`）

---

## 历史背景

- **Render Props**：React 16 之前（2018 年前）的主流方案，解决了 Mixin 的问题
- **HOC**：与 Render Props 同期，Redux 的 `connect()`、React Router 的 `withRouter()` 都是 HOC
- **Custom Hook**：React 16.8（2019年）引入 Hooks 后的现代方案，目前是**首选**

> 在现代 React（2020+）项目中，Custom Hook 覆盖了大多数逻辑复用场景。
> Render Props 在需要**类型收窄**或**调用方完全控制 UI** 的场景下仍有独特价值，如本项目的 `AuthChecker`。
> HOC 主要用于需要对外透明增强（埋点、权限路由保护）的场景。
