# 邮件推送模块学习文档

## 一、整体概述

本项目实现了一套支持多平台的邮件推送模块，核心设计思路是**统一抽象、多平台适配**：

- 对外暴露统一的 `sendMail(options, clientName?)` 接口
- 内部根据配置文件自动路由到对应平台（SMTP / 阿里云 / 腾讯云）
- 支持本地 Pug 模板渲染，以及云平台预设模板两种方式

### 背景知识

- **SMTP（Simple Mail Transfer Protocol）**：最原始的邮件发送方式，直接连接邮件服务器发信。适合开发测试和小项目，正式生产不推荐（垃圾邮件过滤严格、运营商限制多）。
- **云服务（阿里云 / 腾讯云 SES）**：Simple Email Service，云厂商提供的托管邮件服务。高送达率、可监控、支持大批量，正式产品首选。
- **SES**：Simple Email Service 的缩写，是云厂商邮件服务的通用叫法。

---

## 二、文件结构

```text
src/
├── config/
│   └── mail.config.ts          # 邮件配置（客户端列表、密钥、默认参数）
├── lib/
│   └── mail/
│       ├── types.ts            # 所有类型定义（参数类型、配置类型、客户端类型）
│       ├── client.ts           # 客户端工厂函数（根据配置创建对应平台的客户端实例）
│       ├── send.ts             # 三个平台各自的发送函数
│       └── index.ts            # 对外统一入口：sendMail()
└── app/
    └── utils/
        └── custom-merge.ts     # 深度合并工具（用于合并默认配置和用户传入参数）

files/
└── email-templates/            # 邮件 Pug 模板（SMTP 和阿里云本地模板模式使用）
    ├── email-verification/
    │   ├── html.pug            # 验证码邮件 HTML 版本
    │   └── text.pug            # 验证码邮件纯文本版本
    └── forget-password/
        ├── html.pug            # 忘记密码邮件 HTML 版本
        └── text.pug            # 忘记密码邮件纯文本版本
```

---

## 三、类型系统设计（types.ts）

类型设计是整个模块的地基，分三层：**发送参数类型**、**客户端配置类型**、**客户端实例类型**。

### 3.1 发送参数类型

```text
BaseMailSendOptions           ← 所有平台共享的基础参数
    ├── TencentCloudSendMailOptions   ← 腾讯云扩展：必填 templateId(number)
    ├── AliyunSendMailOptions         ← 阿里云扩展：templateId(string) 或 templatePath
    └── SmtpSendMailOptions           ← SMTP 扩展：必填 templatePath（本地模板路径）

MailSendOptions = 以上三者的联合类型
```

**设计要点**：

- `BaseMailSendOptions` 提炼出所有平台都有的字段：`from`、`to`、`subject`、`cc`、`bcc`、`replyTo`、`vars`（模板变量）
- 各平台差异用 **扩展类型（&）** 叠加，而不是重复定义
- `others` 字段用于透传平台特有的参数（使用 `Omit` 排除掉已封装的核心参数，避免冲突）
- 阿里云的 `templateId | templatePath` 用 **联合类型（|）** 区分两种模板来源，TypeScript 会在编译时强制只能选其一

### 3.2 客户端配置类型（MailClientConfig）

```typescript
// 三种平台配置各有独立接口，都继承 BaseMailClientConfig（只有 name 字段）
interface AliyunMailClientConfig {
  type: 'aliyun';
  options: Omit<DefaultAliyunConfig, 'toMap'>; // 阿里云 SDK 原生配置
  default: { from: string; fromName?; replyTo?; replyToName? };
}

interface TencentCloudMailClientConfig {
  type: 'tcloud';
  options: DefaultTencentCloudConfig; // 腾讯云 SDK 原生配置
  default: { from: string };
}

interface SmtpMailClientConfig {
  type: 'smtp';
  options: DefaultSmtpConfig; // nodemailer SMTP 原生配置
  default: { from: string; replyTo? };
}
```

`type` 字段是**字符串字面量类型**，配合 `switch(config.type)` 可以在每个分支中自动收窄类型（TypeScript discriminated union），让 IDE 提示更精准。

### 3.3 客户端实例类型（MailClient）

```typescript
// 客户端实例类型 = 配置类型（去掉 options）+ 实际的 SDK client 实例
interface SmtpMailClient extends Omit<SmtpMailClientConfig, 'options'> {
  client: Transporter<SMTPTransport.SentMessageInfo>; // nodemailer 的 Transporter
}
```

这样设计让发送函数收到的参数里既有默认配置（`default`），又有可直接调用的 SDK 实例（`client`），一个对象搞定。

---

## 四、配置文件（mail.config.ts）

```typescript
export const mailConfig: MailConfig = {
  defaultClient: 'tcloud',    // 默认使用腾讯云
  clients: [
    {
      name: 'smtp',
      type: 'smtp',
      options: {
        host: process.env.SMTP_HOST || 'smtp.qq.com',
        port: Number.parseInt(process.env.SMTP_PORT || '465'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER || '...',
          pass: process.env.SMTP_PASS || '...',
        },
      },
      default: { from: 'xxx@foxmail.com' },
    },
    {
      name: 'aliyun',
      type: 'aliyun',
      options: {
        type: 'access_key',
        accessKeyId: process.env.ALIYUN_KEY || '',
        accessKeySecret: process.env.ALIYUN_SECRET || '',
        endpoint: 'dm.aliyuncs.com',  // 阿里云 DirectMail 接入点
      },
      default: { from: '...', fromName: '...', replyTo: '...', replyToName: '...' },
    },
    {
      name: 'tcloud',
      type: 'tcloud',
      options: {
        credential: {
          secretId: process.env.TENCENTCLOUD_SECRET_ID || '',
          secretKey: process.env.TENCENTCLOUD_SECRET_KEY || '',
        },
        region: 'ap-guangzhou',      // 腾讯云 SES 区域（仅广州）
        profile: {
          httpProfile: { endpoint: 'ses.tencentcloudapi.com' },
        },
      },
      default: { from: '...' },
    },
  ],
};
```

**设计要点**：

- 所有密钥都从**环境变量**读取，代码里只留兜底默认值（开发用，正式环境必须配 `.env`）
- `name` 字段是调用时传入的标识，`defaultClient` 指向默认使用哪个
- 配置与代码逻辑分离：想切换平台只改配置，不改代码

---

## 五、客户端工厂函数（client.ts）

```typescript
export const createMailClient = (name?: string): MailClient => {
  const clientName = name ?? mailConfig.defaultClient;
  const config = mailConfig.clients.find((item) => item.name === clientName);

  if (isNil(config)) throw new Error(`邮件发送配置名 ${clientName} 不存在`);

  switch (config.type) {
    case 'aliyun': return { ...result, type: 'aliyun', client: createAliyunClient(config.options) };
    case 'tcloud': return { ...result, type: 'tcloud', client: createTencentClient(config.options) };
    case 'smtp':   return { ...result, type: 'smtp',   client: createSmtpClient(config.options) };
    default: throw new Error(`不支持的类型`);
  }
};
```

### 5.1 阿里云客户端创建（4步流程）

```typescript
const createAliyunClient = (config) => {
  // 1. 将配置对象封装为阿里云 Config 实例
  const credentialsConfig = new AliYunConfig(config);

  // 2. 用 Config 创建凭证管理对象（负责签名和权限验证）
  const credentialClient = new AliyunCredential(credentialsConfig);

  // 3. 构建 OpenAPI Config（原始配置 + 凭证对象）
  const configinc = new AliyunOpenApi.Config({
    ...config,
    credential: credentialClient,  // 注入凭证管理对象
  });

  // 4. 创建并返回 DirectMail 客户端实例
  return new AliyunClient(configinc);
};
```

阿里云 SDK 需要先把 AccessKey 封装成凭证对象，再注入到 OpenAPI 配置里，这是其 SDK 的固定用法。

### 5.2 腾讯云和 SMTP 客户端创建（一行搞定）

```typescript
const createTencentClient = (config) => new TencentSES(config);
const createSmtpClient = (config) => nodemailer.createTransport(config);
```

腾讯云 SDK 和 nodemailer 的初始化更简洁，直接传配置即可。

---

## 六、发送函数（send.ts）

### 6.1 email-templates 实例

```typescript
const emailTemplates = new Email({
  send: false,           // 不直接发送，只渲染模板（实际发送由各平台 SDK 负责）
  views: {
    root: path.join(process.cwd(), 'files/email-templates'),  // 模板根目录
    options: { extension: 'pug' },                            // 使用 Pug 模板引擎
  },
});
```

`email-templates` 库的职责是**模板渲染**，把 Pug 模板 + 变量渲染成 HTML/纯文本字符串，`send: false` 让它不自己发信，只吐出渲染结果。

### 6.2 SMTP 发送流程

```typescript
export const sendSmtpMail = async (params: SmtpMailClient, options: SmtpSendMailOptions) => {
  const { others, templatePath, vars, ...rest } = options;

  // 合并参数：用户传入的覆盖默认配置
  const newOptions = customMerge(
    { ...rest, from: options.from ?? params.default.from, replyTo: options.replyTo ?? params.default.replyTo, ...others },
    options.others ?? {},
    'replace',  // 数组用源数组替换目标数组（而非合并）
  );

  // 渲染模板：传入模板路径和变量 → 得到 HTML + 纯文本内容
  newOptions.html = await emailTemplates.render(`${templatePath}/html`, vars);
  newOptions.text = await emailTemplates.render(`${templatePath}/text`, vars);

  // 调用 nodemailer 发送
  return params.client.sendMail(newOptions);
};
```

SMTP 模板**必须本地渲染**，因为 nodemailer 接收的是 HTML 字符串，不是平台模板 ID。

### 6.3 腾讯云发送流程

```typescript
export const sendTencentMail = async (params: TencentMailClient, options: TencentCloudSendMailOptions) => {
  // 步骤1：通用参数 → 腾讯云 SDK 参数名映射
  const newOptions: DefaultTencentSendOptions = customMerge(
    {
      FromEmailAddress: options.from ?? params.default.from,  // from → FromEmailAddress
      Destination: options.to,                                 // to   → Destination
      Subject: options.subject,
      ReplyToAddresses: options.replyTo,
      Cc: options.cc,
      Bcc: options.bcc,
    },
    options.others ?? {},
    'replace',
  );

  // 步骤2：填充模板（腾讯云使用平台预设模板）
  newOptions.Template = {
    TemplateID: Number(options.templateId),
    TemplateData: JSON.stringify(options.vars),  // vars 必须序列化为 JSON 字符串
  };

  return params.client.SendEmail(newOptions);
};
```

腾讯云的**参数名是大驼峰**（PascalCase），需要逐一映射。模板变量必须 `JSON.stringify`，这是腾讯云 API 的要求。

### 6.4 阿里云发送流程

```typescript
export const sendAliyunMail = async (params: AliyunMailClient, options: AliyunSendMailOptions) => {
  // 步骤1：通用参数 → 阿里云 SDK 参数名映射
  const newOptions = customMerge(
    {
      accountName: options.from ?? params.default.from,         // from     → accountName
      fromAlias: options.fromName ?? params.default.fromName,   // fromName → fromAlias
      addressType: options.others?.addressType ?? 1,            // 默认1=自定义发件人
      toAddress: options.to.join(','),                           // 数组 → 逗号分隔字符串（阿里云特有）
      subject: options.subject,
      replyToAddress: !isNil(options.replyTo) || !isNil(params.default.replyTo),
      replyAddress: options.replyTo ?? params.default.replyTo,
      replyAddressAlias: options.replyToName ?? params.default.replyToName,
    },
    options.others ?? {},
    'replace',
  );

  // 步骤2：分支处理模板
  if ('templateId' in options) {
    // 使用阿里云平台预设模板
    newOptions.template = new AliyunSender.SingleSendMailRequestTemplate({
      templateData: options.vars,
      templateId: options.templateId,
    });
  } else if ('templatePath' in options) {
    // 使用本地 Pug 模板渲染
    newOptions.htmlBody = await emailTemplates.render(`${options.templatePath}/html`, options.vars);
    newOptions.textBody = await emailTemplates.render(`${options.templatePath}/text`, options.vars);
  }

  // 步骤3：封装请求对象 + 发送
  const request = new AliyunSender.SingleSendMailRequest(newOptions);
  const runtime = new AliyunUtil.RuntimeOptions({});    // 运行时配置（超时/重试）
  return params.client.singleSendMailWithOptions(request, runtime);
};
```

阿里云的三个特殊点：

1. `toAddress` 要求**逗号分隔的字符串**（其他平台都是数组）
2. 支持两种模板方式：平台模板 ID 或本地 Pug 文件
3. 请求对象需要用 `new SingleSendMailRequest()` 封装，还需要传 `RuntimeOptions`

---

## 七、统一入口（index.ts）

```typescript
export const sendMail = async (option: MailSendOptions, clientName?: string) => {
  const rst = createMailClient(clientName);  // 创建客户端实例

  switch (rst.type) {
    case 'smtp':   return sendSmtpMail(rst, option as SmtpSendMailOptions);
    case 'aliyun': return sendAliyunMail(rst, option as AliyunSendMailOptions);
    case 'tcloud': return sendTencentMail(rst, option as TencentCloudSendMailOptions);
    default: throw new Error(`不支持的客户端: ${rst.name}`);
  }
};
```

对外只暴露这一个函数，调用方无需关心底层用了哪个平台：

```typescript
// 调用示例
const example = async () => {
  // 使用默认客户端（即腾讯云）
  await sendMail({
    to: ['user@example.com'],
    subject: '邮箱验证码',
    templateId: 12345,
    vars: { code: '123456', expire: 10 },
  });

  // 指定使用 SMTP
  await sendMail({
    to: ['user@example.com'],
    subject: '邮箱验证码',
    templatePath: 'email-verification',
    vars: { code: '123456', expire: 10 },
  }, 'smtp');
};
```

---

## 八、邮件模板（Pug 模板引擎）

模板放在 `files/email-templates/` 下，每个业务场景一个子目录，每个子目录包含：

- `html.pug`：富文本 HTML 版本（显示样式）
- `text.pug`：纯文本版本（兼容不支持 HTML 的邮件客户端）

### 8.1 验证码邮件模板示例

`files/email-templates/email-verification/html.pug`：

```pug
doctype html
html
  head
    style.
      .code { font-size: 32px; color: #007bff; ... }
  body
    .container
      h1 邮箱验证码
      .code= code                                 // 直接输出变量
      p.expire 验证码有效期为 #{expire} 分钟     // 插值语法
```

`files/email-templates/email-verification/text.pug`（纯文本版）：

```pug
| 您的验证码是：#{code}
| 验证码有效期为 #{expire} 分钟，请及时使用
```

### 8.2 Pug 模板变量渲染

调用 `emailTemplates.render('email-verification/html', { code: '123456', expire: 10 })` 时：

- `email-templates` 会在配置的 root 目录下找 `email-verification/html.pug`
- 将 `vars` 对象里的字段注入模板
- 返回渲染好的 HTML 字符串

---

## 九、customMerge 工具函数

```typescript
export const customMerge = <A, B>(
  destination: Partial<A>,  // 目标对象（默认值/基础参数）
  source: Partial<B>,       // 源对象（用户传入的覆盖参数）
  arrayMode: 'replace' | 'merge' = 'merge',
) => {
  // replace 模式：源数组完全替换目标数组
  // merge 模式：合并数组并去重（Set 去重）
  return deepmerge(destination, source, options);
};
```

为什么需要这个工具：

- 直接用 `Object.assign` 或展开运算符 `{...a, ...b}` 对**嵌套对象**的合并是浅合并（顶层覆盖）
- `deepmerge` 会递归合并嵌套对象，但默认会把两个数组合并（`[1,2]` + `[3,4]` = `[1,2,3,4]`）
- 邮件场景中 `to`（收件人列表）应该直接用传入的值，而不是追加，所以用 `replace` 模式

---

## 十、模块依赖关系

```text
sendMail(index.ts)
    ↓ 调用
createMailClient(client.ts)    →  mailConfig(mail.config.ts)  →  .env 环境变量
    ↓ 返回客户端实例
sendSmtpMail / sendAliyunMail / sendTencentMail (send.ts)
    ↓ 使用
emailTemplates(email-templates库)  →  files/email-templates/*.pug
customMerge(utils/custom-merge.ts)
```

---

## 十一、关键设计思路总结

| 问题 | 解决方案 |
| ------ | --------- |
| 三种平台 API 差异很大 | 定义统一的 `BaseMailSendOptions`，各平台用 `&` 扩展 |
| 参数名称不一致 | 在每个 `send` 函数里做映射（如 `from` → `FromEmailAddress`） |
| 默认值与用户参数合并 | `customMerge` + `options.xxx ?? params.default.xxx` |
| 动态选择平台 | `createMailClient(name?)` 工厂函数 + switch 分发 |
| 模板渲染 | `email-templates` 库统一处理 Pug 渲染，云平台预设模板则直接传 ID |
| 环境变量安全 | 所有密钥从 `process.env` 读取，不硬编码到代码中 |

---

## 十二、扩展新平台的步骤

1. 在 `types.ts` 中添加新平台的 `SendMailOptions`、`ClientConfig`、`Client` 类型
2. 在 `client.ts` 中添加 `createXxxClient()` 函数，并在 switch 中添加新分支
3. 在 `send.ts` 中添加 `sendXxxMail()` 函数，完成参数映射
4. 在 `index.ts` 的 switch 中添加新分支，路由到新发送函数
5. 在 `mail.config.ts` 中添加新平台的配置项
