# 邮件与 OTP 链路说明（SMTP / 腾讯云 / 阿里云）

本文档整理当前项目的邮件发送与 OTP（验证码）链路，包含：

- 端到端调用流程（前端 -> 后端 -> 队列 -> 邮件通道）
- `mail.config.ts` 每个字段含义
- `auth.config.ts` 中 OTP 邮件配置含义
- 三种通道（SMTP / Tencent Cloud SES / Aliyun DM）的模板机制差异
- 常见故障排查清单

---

## 1. 项目中 OTP 邮件链路

### 1.1 前端触发

- 注册页发送验证码：调用 `authApi.sendEmailVerificationOTP(email)`
- 忘记密码发送验证码：调用 `authApi.sendForgetPasswordOTP(credential)`

### 1.2 后端路由

- `POST /otp/email-verification`
- `POST /otp/forget-password`

其中忘记密码接口会先按 `credential`（用户名或邮箱）查询用户，再使用该用户的邮箱发送 OTP。

### 1.3 服务层与频控

统一经过 `UserRepo.sendOTP(email, type)`：

1. 先走 Redis 频率限制 `checkOTPRateLimit`
2. 通过后根据 `type` 进入发送流程

### 1.4 队列与实际发送

发送会经由 `addOTPQueue(email, code, type)`：

- 如果 OTP 队列可用：投递 BullMQ 任务
- Worker 消费任务后执行 `sendOTPHandler`
- `sendOTPHandler` 根据 `authConfig.mails.OTP.send[type].client` 选择具体通道发送

> 备注：队列不可用时会回退为同步发送。

---

## 2. 配置总览：两层结构

项目把邮件配置拆成两层：

1. **通道层（如何连接服务商）**
   - 文件：`src/config/mail.config.ts`
   - 决定 SMTP/腾讯云/阿里云客户端如何初始化

2. **业务层（什么业务走哪个通道）**
   - 文件：`src/config/auth.config.ts` -> `authConfig.mails.OTP`
   - 决定注册 OTP、忘记密码 OTP 各自使用的通道、模板、主题

---

## 3. `src/config/mail.config.ts` 字段详解

## 3.1 顶层字段

- `defaultClient`
  - 默认通道名。
  - `sendMail` 未显式传通道名时，使用该值。

- `clients`
  - 所有可用邮件通道配置数组。
  - 每个元素都包含：`name`、`type`、`options`、`default`。

## 3.2 每个 client 的公共字段

- `name`
  - 通道标识。
  - 在业务配置中通过 `client: '<name>'` 引用。

- `type`
  - 通道类型（决定走哪个发送实现）：
    - `smtp` -> `sendSmtpMail`
    - `tcloud` -> `sendTencentMail`
    - `aliyun` -> `sendAliyunMail`

- `default`
  - 默认发信参数（兜底）。
  - 发送时若未显式指定，会使用这些默认值补齐。

---

## 4. 三种通道字段说明

## 4.1 SMTP（`type: 'smtp'`）

### `options`

- `host`
  - SMTP 服务器地址（例如 `smtp.qq.com`、`smtp.gmail.com`）。
- `port`
  - SMTP 端口（常见 465 或 587）。
- `secure`
  - 是否 SSL 直连。
  - 常见经验：465=true，587=false。
- `auth.user`
  - SMTP 登录账号（通常为邮箱地址）。
- `auth.pass`
  - SMTP 授权码或密码（通常是授权码）。

### `default`

- `from`
  - 默认发件邮箱地址。

---

## 4.2 阿里云（`type: 'aliyun'`）

### `options`

- `defaultFrom`
  - SDK 默认发件人配置值（项目中作为通道默认信息的一部分）。
- `type`
  - 凭证类型，当前实现使用 `access_key`。
- `accessKeyId`
  - 阿里云 AccessKey ID。
- `accessKeySecret`
  - 阿里云 AccessKey Secret。
- `endpoint`
  - 阿里云邮件接口地址（当前为 `dm.aliyuncs.com`）。

### `default`

- `from`
  - 默认发件邮箱（映射为阿里云 `accountName`）。
- `fromName`
  - 默认发件人昵称（映射 `fromAlias`）。
- `replyTo`
  - 默认回复邮箱。
- `replyToName`
  - 默认回复昵称。

---

## 4.3 腾讯云（`type: 'tcloud'`）

### `options`

- `credential.secretId`
  - 腾讯云 SecretId。
- `credential.secretKey`
  - 腾讯云 SecretKey。
- `region`
  - 服务地域（例如 `ap-guangzhou`）。
- `profile.httpProfile.endpoint`
  - SES API 域名（当前为 `ses.tencentcloudapi.com`）。

### `default`

- `from`
  - 默认发件邮箱（映射腾讯云 `FromEmailAddress`）。

---

## 5. `src/config/auth.config.ts` OTP 业务配置

路径：`authConfig.mails.OTP`

- `rateLimit`
  - 发送频率限制（秒），用于防刷和按钮倒计时依据。

- `allowedAttempts`
  - OTP 最大尝试次数（传递给认证插件逻辑）。

- `expire`
  - OTP 过期时间（秒）。

- `send`
  - 不同 OTP 业务类型的发送策略：
    - `email-verification`
    - `forget-password`

每个类型下可配置：

- `client`
  - 指定该业务走哪个邮件通道（`smtp` / `tcloud` / `aliyun`）。

- `templatePath` 或 `templateId`
  - `templatePath`：使用本地模板目录。
  - `templateId`：使用云服务商控制台模板 ID。

- `subject`
  - 主题生成函数。
  - 项目里会传入 `appname` 和 `code` 生成最终主题。

---

## 6. 模板机制（重点）

三种通道模板定义方式如下：

- `smtp`：仅支持 `templatePath`（本地模板）
- `tcloud`：支持 `templateId`（平台模板）或 `templatePath`（本地模板）
  - SES 不支持本地模板，需要上传到平台进行审核，然后使用平台提供的模板id
- `aliyun`：支持 `templateId`（平台模板）或 `templatePath`（本地模板）

## 6.1 本地模板目录规范

根目录：`files/email-templates`

每个模板目录需要两个文件：

- `html.pug`
- `text.pug`

例如：

- `files/email-templates/email-verification/html.pug`
- `files/email-templates/email-verification/text.pug`
- `files/email-templates/forget-password/html.pug`
- `files/email-templates/forget-password/text.pug`

## 6.2 模板变量来源

项目发送 OTP 时会注入这些变量：

- `code`：验证码
- `appname`：应用名
- `expire`：验证码有效期（分钟）

这些变量可在本地模板中直接引用，也会作为平台模板变量透传。

---

## 7. 各通道打通前置清单

## 7.1 SMTP

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- 发件邮箱与服务商配置一致（`from`）

## 7.2 阿里云

- 项目里只实践了腾讯云，阿里云与腾讯云使用套路是一样的，此处省略

## 7.3 腾讯云

代码里读取：

- `TENCENTCLOUD_SECRET_ID`
- `TENCENTCLOUD_SECRET_KEY`

腾讯云控制台：

- 使用腾讯云的 SES 服务
- 1. 需要有一个合法的域名
- 1. 需要创建一个自己域名的邮箱地址
- 1. 在腾讯云使用子账号创建TENCENTCLOUD_SECRET_ID 和 TENCENTCLOUD_SECRET_KEY

---
