# Docker 完整学习笔记

## 目录

- [Docker 基础概念](#docker-基础概念)
- [Docker 架构](#docker-架构)
- [Docker 核心命令](#docker-核心命令)
- [Dockerfile 详解](#dockerfile-详解)
- [Docker Compose](#docker-compose)
- [Docker 网络](#docker-网络)
- [Docker 数据持久化](#docker-数据持久化)

---

## 📖 关于本文档

> **💡 学习说明**
>
> - 本文档列举了 Docker 的核心概念和常用命令，作为快速参考手册使用
> - 具体使用时建议结合官方文档或实际场景进行查询
> - 文档内容基于实际学习和项目实践整理而成

---

## 🖥️ 虚拟机环境实践笔记

在学习 Docker 之前，我通过在 Mac 宿主机上配置虚拟环境，模拟云服务器场景，积累了一些虚拟化相关的经验。

### 实践背景

**项目场景**：为量化交易项目 Freqtrade 搭建开发环境

**目标**：在本地 Mac M5 (ARM64) 上模拟 x86_64 云服务器环境

### 环境搭建步骤

#### 1. 创建虚拟机

使用 **OrbStack** 创建 Ubuntu 虚拟机

```bash
# OrbStack 是适用于 Mac 的轻量级 Docker 和 Linux 虚拟机工具
# 比 Docker Desktop 更快，资源占用更少
```

#### 2. 安装 Conda 环境管理器

在虚拟机中安装 **Miniconda** 来管理 Python 版本和项目环境

```bash
# 在虚拟机中下载并安装 Miniconda
# Miniconda 是 Anaconda 的轻量级版本
```

#### 3. 项目沙盒化管理

通过 Conda 为不同项目创建独立的虚拟环境，避免依赖冲突

```bash
# 创建新环境
conda create -n freqtrade python=3.11

# 激活项目环境
conda activate freqtrade

# 注意：deactivate 用于退出当前环境，exit 会退出整个 shell
conda deactivate
```

### 关键知识点

#### Linux 包管理器差异

不同 Linux 发行版使用不同的包管理器：

| 发行版 | 包管理器 | 更新软件源命令 |
| -------- | ---------- | ---------------- |
| Ubuntu/Debian | `apt` | `sudo apt update` |
| CentOS/RHEL/Fedora | `dnf` / `yum` | `sudo dnf check-update` |
| Arch Linux | `pacman` | `sudo pacman -Sy` |

#### 架构兼容性问题

> **⚠️ 重要提示**
>
> 大多数云服务器使用 **x86_64 (Intel/AMD)** 架构，而 Mac M 系列芯片使用 **ARM64** 架构。
>
> 在本地模拟时需要注意：
>
> - Conda 安装包要选择对应架构版本（Linux-aarch64 vs Linux-x86_64）
> - Docker 镜像也需要选择对应平台（`--platform linux/amd64` 或 `linux/arm64`）
> - 跨架构运行可能导致性能下降或兼容性问题

```bash
# 在 ARM 架构 Mac 上运行 x86 镜像（需要模拟层，性能较差）
docker run --platform linux/amd64 ubuntu

# 使用原生 ARM 镜像（性能最佳）
docker run --platform linux/arm64 ubuntu
```

---

## Docker 基础概念

### 什么是 Docker？

Docker 是一个开源的容器化平台，用于开发、交付和运行应用程序。它允许开发者将应用程序及其依赖项打包到一个可移植的容器中，然后在任何支持 Docker 的环境中运行。

### 核心组件

#### 1. 镜像 (Image)

- **镜像是容器的模板**，包含运行应用程序所需的所有内容（代码、运行时、库、环境变量、配置文件等）
- 镜像是只读的，不可修改
- 一个镜像可以生成多个容器实例
- 镜像采用分层结构，每一层都是只读的，最上层是可写层（容器层）

#### 2. 容器 (Container)

- 容器是镜像的运行实例
- 容器是可读写的，运行时的所有修改都在容器层
- 容器之间相互隔离，互不影响
- 容器是轻量级的，启动速度快

#### 3. 镜像仓库 (Registry)

- **镜像仓库（Docker Registry）用来存放和分发镜像**
- Docker Hub 是 Docker 官方的公共镜像仓库
- 可以搭建私有镜像仓库（如 Harbor、Nexus）

---

## Docker 架构

```bash
┌─────────────────────────────────────────────┐
│            Docker 客户端 (Client)            │
│         docker build, pull, run...          │
└──────────────────┬──────────────────────────┘
                   │ REST API
┌──────────────────▼──────────────────────────┐
│         Docker 守护进程 (Daemon)             │
│                dockerd                      │
│  ┌──────────────────────────────────────┐   │
│  │         容器管理                      │   │
│  │  ┌──────┐  ┌──────┐  ┌──────┐       │    │
│  │  │容器1 │  │容器2   │  │容器3 │         │    │
│  │  └──────┘  └──────┘  └──────┘       │    │
│  └──────────────────────────────────────┘   │
│  ┌──────────────────────────────────────┐   │
│  │         镜像管理                      │   │
│  │  ┌──────┐  ┌──────┐  ┌──────┐       │    │
│  │  │镜像1 │  │镜像2 │  │镜像3 │         │    │
│  │  └──────┘  └──────┘  └──────┘       │    │
│  └──────────────────────────────────────┘   │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│          Docker Registry (仓库)              │
│       Docker Hub / 私有仓库                  │
└─────────────────────────────────────────────┘
```

**工作流程：**

1. Docker 客户端发送命令到 Docker 守护进程
2. Docker 守护进程负责构建、运行和分发容器
3. Docker 客户端和守护进程可以在同一系统上，也可以通过网络通信

---

## Docker 核心命令

### 镜像相关命令

```bash
# 从仓库拉取镜像
docker pull <镜像名称>[:标签]
# 示例：docker pull nginx:latest

# 列举所有本地镜像
docker images
# 或 docker image ls

# 查看镜像详细信息
docker image inspect <镜像ID>

# 搜索镜像
docker search <镜像名>

# 删除镜像
docker rmi <镜像ID或镜像名>
# 或 docker image rm <镜像ID>

# 删除所有未使用的镜像
docker image prune -a

# 推送镜像到仓库
docker push <用户名>/<镜像名>[:标签]

# 给镜像打标签
docker tag <源镜像> <目标镜像名>[:标签]

# 保存镜像为 tar 文件
docker save -o <文件名.tar> <镜像名>

# 从 tar 文件加载镜像
docker load -i <文件名.tar>
```

### 容器相关命令

```bash
# 创建并运行容器（会自动下载镜像如果不存在）
docker run [选项] <镜像名称或镜像ID>
# 注意：这个命令每次执行都会创建一个新的容器实例

# 常用选项：
# -d                    后台运行容器（不会占用终端）
# -p 宿主机端口:容器端口  端口映射
# -v 宿主机路径:容器路径  目录挂载（数据持久化）
# --name <容器名>        指定容器名称
# -e KEY=VALUE          设置环境变量
# --rm                  容器退出后自动删除
# -it                   交互式运行（分配伪终端）
# --network <网络名>     指定网络模式

# 示例：
docker run -d -p 80:80 -v /data:/usr/share/nginx/html --name my-nginx nginx

# 查看运行中的容器
docker ps
# 查看所有容器（包括已停止的）
docker ps -a

# 只创建容器但不启动
docker create <镜像名>

# 启动已创建的容器
docker start <容器ID或容器名>

# 停止运行中的容器
docker stop <容器ID或容器名>

# 重启容器
docker restart <容器ID或容器名>

# 暂停容器
docker pause <容器ID>

# 恢复暂停的容器
docker unpause <容器ID>

# 删除容器（需要先停止）
docker rm <容器ID或容器名>

# 强制删除运行中的容器
docker rm -f <容器ID>

# 删除所有已停止的容器
docker container prune

# 查看容器日志
docker logs <容器ID>
docker logs -f <容器ID>  # 持续跟踪日志

# 进入运行中的容器
docker exec -it <容器ID> /bin/bash
# 或 docker exec -it <容器ID> sh

# 查看容器详细信息
docker inspect <容器ID>

# 查看容器资源使用情况
docker stats [容器ID]

# 查看容器进程
docker top <容器ID>

# 从容器复制文件到宿主机
docker cp <容器ID>:<容器路径> <宿主机路径>

# 从宿主机复制文件到容器
docker cp <宿主机路径> <容器ID>:<容器路径>
```

### 端口映射详解

```bash
# -p 宿主机端口:容器端口
# Docker 与宿主机是隔离的，默认情况下宿主机不能访问 Docker 内部网络
# 通过 -p 参数将容器内的端口映射到宿主机端口
# 这样访问 localhost:宿主机端口 就相当于访问容器的端口

docker run -p 8080:80 nginx
# 访问 http://localhost:8080 即可访问容器内的 80 端口服务
```

### 数据卷挂载详解

```bash
# -v 宿主机目录:容器目录
# 将宿主机目录与容器目录进行绑定，实现数据持久化
# 容器删除后，宿主机的数据仍然保留

docker run -v /home/user/data:/app/data nginx

# 也可以使用命名卷（Named Volume）
docker run -v my-volume:/app/data nginx
```

---

## Dockerfile 详解

**Dockerfile 是一个文本文件，详细列出了镜像的构建步骤**，包含一系列指令和参数。

### Dockerfile 常用指令

```dockerfile
# 指定基础镜像
FROM <镜像名>[:标签]
# 示例：FROM node:18-alpine

# 设置维护者信息
LABEL maintainer="your-email@example.com"

# 设置工作目录（后续命令的执行目录）
WORKDIR /app

# 复制文件到镜像中
COPY <源路径> <目标路径>
# 示例：COPY package.json .

# 类似 COPY，但支持 URL 和自动解压 tar 文件
ADD <源路径> <目标路径>

# 执行命令（构建时执行）
RUN <命令>
# 示例：RUN npm install
# 或使用 exec 格式：RUN ["npm", "install"]

# 设置环境变量
ENV <key>=<value>
# 示例：ENV NODE_ENV=production

# 暴露端口（声明容器运行时监听的端口）
EXPOSE <端口号>
# 示例：EXPOSE 3000

# 指定容器启动时执行的命令（运行时执行）
CMD ["executable", "param1", "param2"]
# 示例：CMD ["npm", "start"]
# 注意：一个 Dockerfile 只能有一个 CMD，多个时只有最后一个生效

# 指定容器入口点（与 CMD 配合使用）
ENTRYPOINT ["executable", "param1"]
# ENTRYPOINT 不会被 docker run 的命令覆盖

# 定义数据卷（匿名卷）
VOLUME ["/data"]

# 指定运行容器的用户
USER <用户名或 UID>

# 构建参数（仅在构建时有效）
ARG <参数名>[=<默认值>]

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost/ || exit 1
```

### Dockerfile 示例

```dockerfile
# Node.js 应用示例
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制应用代码
COPY . .

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=production

# 启动应用
CMD ["node", "index.js"]
```

### 构建镜像

```bash
# 使用 Dockerfile 构建镜像
docker build -t <镜像名>[:标签] <Dockerfile所在目录>

# 示例：
docker build -t my-app:1.0 .

# 指定 Dockerfile 名称
docker build -f Dockerfile.prod -t my-app:prod .

# 使用构建参数
docker build --build-arg VERSION=1.0 -t my-app .
```

### Dockerfile 最佳实践

1. **使用 .dockerignore 文件**：排除不需要的文件，减小镜像体积
2. **合并 RUN 指令**：减少镜像层数
3. **利用构建缓存**：把不常变化的指令放在前面
4. **使用多阶段构建**：减小最终镜像体积
5. **选择合适的基础镜像**：优先使用 alpine 等轻量级镜像

---

## Docker Compose

**Docker Compose 是用于定义和运行多容器 Docker 应用程序的工具**。使用 YAML 文件配置应用的服务、网络和卷，然后使用单个命令创建并启动所有服务。

```bash
# 启动所有服务（在后台运行）
docker-compose up -d

# 启动所有服务（前台运行，查看日志）
docker-compose up

# 构建或重新构建服务
docker-compose build

# 查看服务状态
docker-compose ps

# 查看服务日志
docker-compose logs
docker-compose logs -f  # 持续查看日志
docker-compose logs <服务名>  # 查看特定服务日志

# 停止服务（不删除容器）
docker-compose stop

# 启动已停止的服务
docker-compose start

# 重启服务
docker-compose restart

# 停止并删除容器、网络
docker-compose down

# 停止并删除容器、网络、卷
docker-compose down -v

# 在运行的服务中执行命令
docker-compose exec <服务名> <命令>
# 示例：docker-compose exec web sh

# 运行一次性命令
docker-compose run <服务名> <命令>

# 查看服务配置
docker-compose config

# 拉取服务依赖的镜像
docker-compose pull

# 暂停服务
docker-compose pause

# 恢复服务
docker-compose unpause
```

---

## Docker 网络

Docker 提供多种网络模式，实现容器间和容器与外部的通信。

### 网络模式

#### 1. Bridge（桥接模式）- 默认模式

- 这是 **Docker 的默认网络模式**
- 容器拥有独立的网络栈
- 容器通过虚拟网桥与宿主机和其他容器通信
- 需要通过端口映射（-p）才能从宿主机访问容器

```bash
# 使用默认 bridge 网络
docker run -d nginx

# 创建自定义 bridge 网络
docker network create my-bridge

# 使用自定义网络
docker run -d --network my-bridge nginx
```

#### 2. Host（主机模式）

- 容器与宿主机共享网络栈
- 容器不会获得独立的 IP 地址
- 性能最好，但端口容易冲突
- 不需要端口映射

```bash
docker run -d --network host nginx
```

#### 3. None（无网络模式）

- 容器没有网络功能
- 用于需要完全隔离的场景

```bash
docker run -d --network none nginx
```

#### 4. Container 模式

- 新容器与指定容器共享网络栈

```bash
docker run -d --network container:<容器ID> nginx
```

### 网络管理命令

```bash
# 查看所有网络
docker network ls

# 创建网络
docker network create <网络名>

# 查看网络详情
docker network inspect <网络名>

# 将容器连接到网络
docker network connect <网络名> <容器ID>

# 断开容器与网络的连接
docker network disconnect <网络名> <容器ID>

# 删除网络
docker network rm <网络名>

# 删除所有未使用的网络
docker network prune
```

### 容器间通信

在同一个自定义 bridge 网络中，容器可以通过**容器名**相互访问：

```bash
# 创建网络
docker network create my-net

# 启动数据库容器
docker run -d --name db --network my-net postgres

# 启动应用容器，可以通过 "db" 访问数据库
docker run -d --name app --network my-net -e DB_HOST=db my-app
```

---

## Docker 数据持久化

容器删除后，容器内的数据会丢失。Docker 提供两种数据持久化方式：

### 1. 数据卷（Volume）- 推荐方式

```bash
# 创建数据卷
docker volume create my-volume

# 查看所有数据卷
docker volume ls

# 查看数据卷详情
docker volume inspect my-volume

# 使用数据卷
docker run -v my-volume:/app/data nginx

# 删除数据卷
docker volume rm my-volume

# 删除所有未使用的数据卷
docker volume prune
```

**优点：**

- 由 Docker 管理，数据存储位置由 Docker 决定
- 可以在容器间共享
- 备份和迁移更方便
- 性能更好

### 2. 绑定挂载（Bind Mount）

```bash
# -v 宿主机目录:容器目录
docker run -v /home/user/data:/app/data nginx

# 或使用 --mount（更明确）
docker run --mount type=bind,source=/home/user/data,target=/app/data nginx
```

**用途：**

- 开发环境，实时同步代码
- 需要明确控制文件位置
- 配置文件注入

### 数据卷 vs 绑定挂载

| 特性 | 数据卷 (Volume) | 绑定挂载 (Bind Mount) |
| ------ | ---------------- | ---------------------- |
| 管理方式 | Docker 管理 | 用户管理 |
| 路径 | Docker 默认路径 | 用户指定路径 |
| 性能 | 更好 | 稍差（Linux 下相同） |
| 备份 | 更方便 | 需要手动处理 |
| 适用场景 | 生产环境数据持久化 | 开发环境代码同步 |

---

### 6. 日志管理

```bash
# 限制日志大小
docker run --log-opt max-size=10m --log-opt max-file=3 nginx
```

### 7. 清理未使用资源

```bash
# 清理所有未使用的对象（容器、镜像、网络、卷）
docker system prune -a

# 查看 Docker 磁盘使用情况
docker system df
```

---

## 总结

Docker 的核心优势：

- ✅ **环境一致性**：开发、测试、生产环境完全一致
- ✅ **快速部署**：秒级启动，快速扩缩容
- ✅ **资源隔离**：容器间互不影响
- ✅ **轻量高效**：比虚拟机更轻量
- ✅ **易于管理**：通过 Docker Compose 管理复杂应用
- ✅ **版本控制**：镜像可以像代码一样版本管理

掌握 Docker 能够大幅提升开发效率和部署流程！
