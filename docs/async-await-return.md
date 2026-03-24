# async/await 使用规则

## 核心概念：async 函数总是返回 Promise

不管你写不写 `await`，`async` 函数的返回值**一定**是 Promise：

```typescript
// 普通函数：返回什么就是什么
function normal() {
  return 123; // 返回 number
}

// async 函数：返回值自动被 Promise 包裹
async function asyncFn() {
  return 123; // 返回 Promise<number>，不是 number
}
asyncFn(); // Promise { 123 }
await asyncFn(); // 123（await 解开 Promise 拿到里面的值）
```

## 规则 1：`return await` vs `return`

当函数最后一步是 `return` 一个 Promise，且**不需要使用返回值**时，`await` 是多余的：

### 写法 A：`return await`（多余的 await）

```typescript
detail: async (item: string) => {
  return await fetchApi(...);
};
// 1. fetchApi(...) 返回 Promise<Response>
// 2. await 解开 Promise，拿到 Response
// 3. return Response
// 4. async 又把 Response 包成 Promise<Response>
// 最终：Promise<Response>（多了一次拆包再装包）
```

### 写法 B：直接 `return`（推荐）

```typescript
detail: async (item: string) => {
  return fetchApi(...);
};
// 1. fetchApi(...) 返回 Promise<Response>
// 2. 直接返回这个 Promise
// JavaScript 引擎自动把嵌套的 Promise 解开了，不会产生双重 Promise 包裹。
// 最终：Promise<Response>
```

**两种结果完全一样**，调用方都需要 `await` 才能拿到值。

### 什么时候 `await` 是必须的？

**当你需要在函数内使用返回值时**：

```typescript
// ✅ 必须 await：因为后续代码要用 response
detail: async (item: string) => {
  const response = await fetchApi(...); // 必须 await，否则 response 是 Promise
  if (!response.ok) throw new Error(); // 需要用 response.ok
  return response;
};

// ❌ 不需要 await：拿到就直接返回
detail: async (item: string) => {
  return await fetchApi(...); // 没有使用返回值，await 多余
};
```

> **判断标准**：`await` 之后是否**使用了**这个值（做判断、取属性、传参等）？
>
> - **用了** → `await` 必须写
> - **没用，直接 return** → `await` 可以省掉

ESLint 规则 `no-return-await` 专门检查这种多余的 `await`。

## 规则 2：`async` 关键字本身何时可以省掉

如果函数体内**没有使用 `await`**，那么 `async` 关键字也是多余的：

```typescript
// 有 async（多余但不报错）
list: async (options: PostPaginateRequestQuery): Promise<Response> => {
  let { page, limit, ...rest } = options;
  page = isNil(page) || page < 1 ? 1 : page;
  return fetchApi(blogClient, (client) => client.index.$get({ ... }));
};

// 去掉 async（效果一样，因为 fetchApi 返回的已经是 Promise）
list: (options: PostPaginateRequestQuery): Promise<Response> => {
  let { page, limit, ...rest } = options;
  page = isNil(page) || page < 1 ? 1 : page;
  return fetchApi(blogClient, (client) => client.index.$get({ ... }));
};
```

**同样适用于回调函数**：

```typescript
// async 多余：回调内没有 await
fetchApi(blogClient, async (client) => {
  return client.index.$get({ ... });
});

// 去掉 async（效果一样）
fetchApi(blogClient, (client) => {
  return client.index.$get({ ... });
});

// 进一步简化为箭头函数
fetchApi(blogClient, (client) => client.index.$get({ ... }));
```

> 保留 `async` 不会出错，有些开发者习惯写上以标记"这是异步函数"，属于风格偏好。

## 为什么 hc 客户端的 `$get()` 返回 Promise？

`client.index.$get()` 返回 `Promise<Response>` 不是由服务端路由决定的，而是由 **hc 客户端内部使用的 `fetch` API** 决定的。

hc 客户端的 `$get()` 内部本质上是调用了浏览器/Node.js 的原生 `fetch()` 函数：

```typescript
// client.index.$get({ query: { page: '1', limit: '10' } })
// hc 内部大致执行了：
fetch('http://localhost:3000/api/blogs?page=1&limit=10')
// fetch() 发送网络请求，返回 Promise<Response>
```

网络请求（HTTP）是 I/O 操作，需要等待服务器处理和网络传输，无法同步完成，因此 `fetch()` 的返回值是 `Promise<Response>`，这是由 Web API 规范决定的。

### 完整链路

```text
client.index.$get()        服务端路由 blog.route.ts
        │                           │
        │  fetch() 发出 HTTP 请求    │
        │ ─────────────────────►    │ 接收请求
        │                          │ 查数据库
        │                          │ c.json(result, 200) ← 决定响应内容
        │  HTTP 响应                │
        │ ◄─────────────────────   │
        │
        ▼
  Promise<Response> 解析完成
```

- `fetch()` 决定了返回值是 `Promise`（因为网络请求是异步的）
- 服务端路由的 `c.json(result, 200)` 决定了 Response **里面的数据内容**
- 两者是不同层面的事情

## 规则 3：用 `Awaited` 防止双层 Promise 包裹

### 问题场景

当一个 `async` 函数的返回类型使用泛型 `ReturnType<F>`，而 `F` 本身又返回 `Promise` 时，会出现双层 Promise：

```typescript
// F 的类型是 (c: C) => Promise<ClientResponse<...>>
// ReturnType<F> = Promise<ClientResponse<...>>

// ❌ 双层 Promise
): Promise<ReturnType<F>> => { ... }
// = Promise<Promise<ClientResponse<...>>>
```

TypeScript 类型系统不会自动解开嵌套的 Promise，所以返回类型变成了 `Promise<Promise<...>>`，导致类型不匹配。

### 解决方案：`Awaited<T>`

`Awaited` 是 TypeScript 内置的工具类型，作用是**解开 Promise 拿到里面的类型**：

```typescript
Awaited<string>                    // string（不是 Promise，原样返回）
Awaited<Promise<string>>           // string（解开一层）
Awaited<Promise<Promise<string>>>  // string（递归解开所有层）
```

### 应用到 `fetchApi`

```typescript
// ❌ 双层 Promise
): Promise<ReturnType<F>> => { ... }
// ReturnType<F> = Promise<ClientResponse<...>>
// 整体 = Promise<Promise<ClientResponse<...>>>

// ✅ 用 Awaited 解开
): Promise<Awaited<ReturnType<F>>> => { ... }
// Awaited<ReturnType<F>> = Awaited<Promise<ClientResponse<...>>> = ClientResponse<...>
// 整体 = Promise<ClientResponse<...>>
```

### 常见使用场景

`Awaited` 最常用在**泛型函数的返回类型**中，当泛型参数本身可能是 Promise 时：

```typescript
// 包装任意异步函数，保持正确的返回类型
async function withRetry<F extends () => Promise<any>>(
  fn: F,
  retries: number,
): Promise<Awaited<ReturnType<F>>> {
  // ...
}

// 包装任意 Promise，添加超时功能
async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
): Promise<Awaited<T>> {
  // ...
}
```

> **记忆规则**：当你写 `Promise<ReturnType<F>>`，而 `F` 的返回值已经是 Promise 时，改成 `Promise<Awaited<ReturnType<F>>>`。
