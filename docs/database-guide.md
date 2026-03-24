# 新 Mac 上配置 Next.js + PostgreSQL 的学习笔记

> 这份记录主要记录在全新的 Mac 设备上面的环境配置过程中学到的内容
> 以下的总结主要是针对 PostgreSQL 来的，因为还没有深入接触过其他数据库

## 今天做了三件事
1. 配置新 Mac 的开发环境（shell / ssh / git / 网络）。
2. 在本机安装了一个真正的数据库服务（PostgreSQL）。
3. 第一次以工程视角使用数据库（连接、创建表、试图理解「项目怎么对应数据库」）。

### 关键操作
- 配置 SSH 以连接 GitHub：需要把自己的公钥放在 GitHub 上；GitHub 会把指纹存到本机，之后传代码不再反复输密码，不需要把 GitHub 的公钥放本机。
- 全新机器没有 npm、pnpm、node、git，需要按官网指引下载安装。
- 最开始以为只要有硬件 + DBeaver + 项目里的迁移文件就能建表，但实际上必须先有数据库服务进程；因此下载安装了 PostgreSQL。
- 通过 `psql` 登录后进入数据库的命令行环境，所有操作都能在这里完成，DBeaver 只是可视化而已。

## 最重要的结论
- 一个 DATABASE_URL 连接的是“一个实例里的某一个数据库”：URL 里 /dbname 就是选定要进哪个数据库。
- 一个实例里可以有多个数据库：完全可以做到“一个项目一个数据库”。
- 数据库不是按「项目」分的，而是按「实例 → 数据库 → schema → 表」分的，表才是真正存数据的地方。
- 用户（user）不是项目，而是“权限身份”；表属于数据库，不属于用户。
- 之前混淆的核心：
  - 用户 ≠ 项目
  - 连接 ≠ 实例
  - Database URL ≠ 表集合
- 常规工程实践：一个项目 = 一个数据库；建议一项目一业务用户。
---
1. 一个电脑主机 ≠ 数据库。
2. PostgreSQL 服务（实例） = 一个“数据库服务器进程”：
   - 监听端口（默认 5432），后台运行，可被多个客户端同时连接。
   - 实例是最大的边界。
3. 一个实例里面可以有多个数据库（这里才是“项目级”划分）：
   ```
   PostgreSQL 实例
   ├── postgres        （默认管理数据库）
   ├── esti_blog       （你的项目数据库）
   └── another_project
   ```
4. 数据库里面再分 schema（可先忽略，但需要知道存在）：
   ```
   esti_blog
   ├── public (默认 schema)
   │   ├── users
   │   ├── posts
   │   └── comments
   ```
5. 表才是真正存数据的地方；表属于数据库，不属于用户。
6. 为什么每个实例都有一个 `postgres` 用户？
   - `postgres` 是默认超级用户，用来创建数据库、创建其他用户、授权，类似 Linux 的 root。
   - 真实项目里：不用 `postgres` 跑业务，用它初始化环境。

## Database URL 到底连到了什么?
- 典型 URL：`postgresql://user:password@127.0.0.1:5432/esti_blog`
  - `127.0.0.1:5432` 连哪个实例
  - `user` 用哪个身份
  - `password` 身份验证
  - `/esti_blog` 用哪个数据库
- `.env` 示例：`DATABASE_URL=postgresql://project_a_user:pwd@host:5432/project_a_db`
- 一个项目 = 一个数据库 + 一个用户。
  * 这个项目的数据放在一个独立的数据库里（例如 project_db）
  * 这个项目的程序用一个专属的数据库账号/角色去连接（例如 project_user）
  * 项目运行时的 DATABASE_URL 就用这对组合：project_user 连接 project_db

## 工具认知分层
- DBeaver 的定位：
  - 不是数据库，不存数据，只是客户端/可视化工具。
  - 通过网络连接 PostgreSQL，发送 SQL，把结果图形化。
- DBeaver 上能做的所有事，命令行里都能做。示例：
  - `psql -h localhost -p 5432 -U user dbname`
  - 然后可以 `CREATE TABLE` / `INSERT` / `SELECT` / `ALTER` 等。
- 重要认知：数据库世界里，SQL 才是第一性原理，GUI 只是皮肤。

## 什么时候会“跨用户 / 跨库”？
- 这是中高级场景：
  - 数据仓库
  - 多租户系统
  - 报表系统
  - 微服务之间的数据同步

## PostgreSQL 常用命令速查（Mac + Next.js + Prisma 场景）

### 1) 终端常用命令（PostgreSQL 自带工具，在 shell 里跑）
- 连接/交互：`psql -h <host> -p <port> -U <user> <db>`（例：`psql -h localhost -p 5432 -U project_user project_db`）
- 创建/删除数据库：`createdb -h <host> -p <port> -U <user> <db>`；`createdb -O <owner> <db>`；`dropdb <db>`
- 创建/删除用户（角色）：`createuser <name>`；`createuser --pwprompt <name>` 创建可登录角色并设密码；`dropuser <name>`
- 备份/恢复（高频）：`pg_dump <db> > backup.sql`；`pg_dump -Fc <db> -f backup.dump`；`pg_restore -d <db> backup.dump`；`pg_dumpall > all.sql`
- 实例/服务控制（取决于安装方式）：`pg_ctl -D <data_dir> start|stop|restart`；`initdb -D <data_dir>` 初始化新实例
- macOS Homebrew 常用：`brew services start postgresql@<version>` / `brew services stop postgresql@<version>`；Docker/Postgres.app 的命令会不同。

### 2) 进入 psql 后的元命令（以 `\` 开头）
- 帮助与退出：`\?` 查看 psql 元命令；`\h` 查看 SQL 语法（如 `\h CREATE TABLE`）；`\q` 退出
- 连接与当前信息：`\conninfo` 当前连接信息；`\c <db>` 切库；`\c <db> <user>` 切库并切用户
- 查看库/表/结构：`\l` 列库；`\du` 角色；`\dn` schema；`\dt` 表；`\dt *.*` 所有 schema 表；`\d <table>` 表结构；`\d+ <table>` 详细；`\dv` 视图
- 执行与显示：`\i file.sql` 执行 SQL 文件；`\x` 切换竖排显示；`\timing` 打印每条 SQL 耗时

### 3) 常用 SQL 管理语句（真正的 SQL）
```sql
-- 角色/用户
CREATE ROLE project_user WITH LOGIN PASSWORD 'xxx';
ALTER ROLE project_user WITH PASSWORD 'new_password';
SELECT current_user;
GRANT some_role TO project_user; -- 把角色当“权限组”

-- 数据库
CREATE DATABASE project_db OWNER project_user;
SELECT current_database();

-- 权限（跨用户访问表的关键）
GRANT USAGE ON SCHEMA public TO project_user;
GRANT CREATE ON SCHEMA public TO project_user; -- 迁移/建表需要
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO project_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO project_user; -- 批量授权

-- Schema（命名空间）
CREATE SCHEMA tenant_1 AUTHORIZATION project_user;
SET search_path TO tenant_1, public;
```

### 4) Next.js + Prisma 时最常用的 8 个命令（浓缩）
- `psql ...`：连库查问题
- `\l \du \dn \dt \d`：确认库/角色/schema/表结构
- `createdb` / `createuser`：初始化项目库与项目用户
- `pg_dump` / `pg_restore`：备份恢复，迁移/上线前很常用
- （配合 Prisma）确认 `.env` 的 `DATABASE_URL` 指向正确的 user/db/port