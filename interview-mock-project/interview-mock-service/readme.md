# 后端项目说明

这是项目的后端服务，当前重点提供账号登录、JWT 身份认证、Refresh Token 会话、退出登录、用户角色/权限加载和权限菜单查询等通用能力。业务模块可以在这套基础能力上继续扩展。

本文不依赖固定 Java 包名。下文使用 `<base-package>` 表示项目迁移后实际采用的根包，因此修改组织名或根包名不会影响文档的阅读方式。

## 当前能力

已经接通：

- Spring Security 无状态认证；
- BCrypt 密码校验；
- 短期 JWT Access Token；
- 基于 HttpOnly Cookie 的 Refresh Token；
- Redis 登录会话、Refresh Token 轮换与哈希索引；
- Access Token 黑名单与 Token Version 全局失效机制；
- 用户、角色、菜单和权限数据加载；
- 菜单树查询及菜单新增、修改、删除；
- 管理员全部菜单、普通用户按角色查询菜单；
- 统一响应结构和全局异常处理；
- Jasypt 敏感配置解密。

当前尚未完整实现：

- 用户、角色的增删改查接口；
- 忘记密码、注册、第三方登录；
- 数据库建表/迁移脚本；
- 完整的接口级方法权限注解和业务接口；
- 完整的自动化测试与接口文档。

## 技术栈

- Java 17
- Spring Boot 3.3
- Spring Web / Spring Security
- MyBatis-Plus 3.5
- MySQL
- Redis + Lettuce
- Druid
- JJWT 0.12
- Jasypt
- Maven

## 快速启动

### 1. 环境要求

- JDK 17
- Maven 3.9 或兼容版本（项目当前未提供 Maven Wrapper）
- MySQL 8.x
- Redis 6.x 或更高版本

### 2. 准备数据库

项目当前没有附带 SQL 初始化脚本，需要准备以下表：

| 表 | 用途 | 关键字段/关系 |
| --- | --- | --- |
| `sys_user` | 用户 | 用户名、BCrypt 密码、状态等 |
| `sys_role` | 角色 | 角色名称、角色标识、状态 |
| `sys_menu` | 目录、页面与按钮权限 | 父级、路径、组件、类型、权限标识、状态 |
| `sys_user_role` | 用户与角色关系 | `user_id`、`role_id` |
| `sys_role_menu` | 角色与菜单关系 | `role_id`、`menu_id` |

实体字段采用驼峰命名，MyBatis-Plus 默认映射到下划线列，例如 `createTime` 对应 `create_time`。用户密码必须使用 BCrypt 哈希，不能直接保存明文。

菜单类型约定：`0` 为目录、`1` 为页面、`2` 为按钮权限；状态 `1` 为启用。`admin` 角色标识会获得全部启用菜单，其他角色按用户与角色、角色与菜单关系查询。

### 3. 配置连接与密钥

主要配置位于 `src/main/resources/application.yaml`。启动前至少检查：

- MySQL URL、用户名和密码；
- Redis 主机、端口、数据库和密码；
- JWT 签名密钥；
- Access Token 与 Refresh Token 有效期；
- Cookie 的 Secure、SameSite 和 Path。

仓库中的连接信息不应直接用于新的环境。建议通过外部配置、环境变量或 Jasypt 密文提供敏感值，并为每个环境使用独立密钥。

当前启动类按以下顺序寻找 Jasypt 主密码：

1. JVM 参数 `jasypt.encryptor.password`；
2. 环境变量 `JASYPT_ENCRYPTOR_PASSWORD`；
3. classpath 根目录的 `.jasypt.password` 文件。

PowerShell 启动示例：

```powershell
$env:JASYPT_ENCRYPTOR_PASSWORD = "your-jasypt-master-password"
$env:JWT_SECRET = "replace-with-a-long-random-secret-at-least-32-bytes"
mvn spring-boot:run
```

也可以使用 JVM 参数：

```bash
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Djasypt.encryptor.password=your-password"
```

默认端口为 `9999`。启动后可通过前端开发服务器的 `/api` 代理访问，或直接访问 `http://localhost:9999`。

### 4. 构建和测试

```bash
mvn test
mvn clean package
java -jar target/*.jar
```

当前测试主要用于辅助生成 Jasypt 密文，还没有覆盖完整鉴权流程。将项目用于生产前，应补充登录、刷新、重放、退出、权限和异常场景测试。

## 建议阅读顺序

源码位于 `src/main/java/<base-package>/`。想快速理解项目，可以依次查看：

1. `config/SecurityConfig.java`：哪些接口公开、过滤器顺序、密码编码器；
2. `auth/controller/LoginController.java`：登录、刷新、退出、当前用户接口；
3. `auth/service/AuthService.java`：Access/Refresh Token 的完整生命周期；
4. `auth/filter/JwtAuthenticationFilter.java`：每次请求如何校验 JWT；
5. `auth/service/LoginUserDetailsService.java`：用户、角色和权限如何从数据库加载；
6. `auth/service/RefreshTokenService.java`：Redis 会话与 Refresh Token 索引；
7. `auth/service/TokenVersionService.java`：如何让用户历史 Token 整体失效；
8. `system/service/MenuService.java`：菜单查询、树构建和路径整理；
9. `entity/Result.java` 与 `exception/GlobalExceptionHandler.java`：统一响应和异常处理。

## 目录结构

```text
src/main/java/<base-package>/
├─ auth/
│  ├─ controller/          # 登录、刷新、退出、当前用户接口
│  ├─ entity/              # 登录参数、响应、登录用户与 Redis 会话模型
│  ├─ filter/              # JWT 请求过滤器
│  └─ service/             # 认证、刷新会话、用户加载、Token Version
├─ config/                 # Spring Security 与鉴权配置
├─ constant/               # Redis Key 等常量
├─ entity/                 # 统一响应与响应码
├─ exception/              # 业务异常和全局异常处理
├─ system/
│  ├─ controller/          # 系统模块接口
│  ├─ entity/              # 用户、角色、菜单实体及菜单视图对象
│  ├─ mapper/              # MyBatis-Plus Mapper 与权限查询 SQL
│  └─ service/             # 菜单业务逻辑
├─ utils/                  # JWT 生成与解析
└─ StartUpApplication.java # 应用入口及 Jasypt 主密码加载
```

根包名可以调整，但启动类应位于业务包的共同父级，或显式配置组件扫描和 Mapper 扫描范围。

## 登录鉴权设计

系统采用“短期 Access Token + 长期 Refresh Token”的组合：

- Access Token 是 JWT，客户端通过 `Authorization: Bearer <token>` 携带；
- Refresh Token 是随机字符串，仅通过 HttpOnly Cookie 传输；
- Redis 保存登录会话，但 Spring Security 本身不创建 HttpSession；
- Refresh Token 在 Redis 中只保存 SHA-256 哈希，不保存原文；
- 每次刷新都会轮换 Refresh Token，并更新 Cookie 与 Redis 会话。

### 登录

```text
POST /auth/login
  -> Spring Security 校验用户名与 BCrypt 密码
  -> 查询用户角色和菜单权限
  -> 生成短期 JWT Access Token
  -> 生成随机 Refresh Token
  -> Redis 保存设备会话与 Refresh Token 哈希索引
  -> Refresh Token 写入 HttpOnly Cookie
  -> 返回 Access Token、有效秒数和用户信息
```

登录请求：

```json
{
  "username": "your-account",
  "password": "your-password",
  "rememberMe": true,
  "deviceId": null
}
```

`rememberMe = false` 时 Refresh Token 默认有效 8 小时；为 `true` 时默认有效 14 天。Access Token 默认有效 15 分钟。实际值以环境配置为准。

### 请求认证

JWT 过滤器会依次检查：

1. Bearer Token 是否存在且签名、有效期正确；
2. Token 类型是否为 `access`；
3. JWT 的 `jti` 是否进入 Redis 黑名单；
4. JWT 中的 `tokenVersion` 是否与 Redis 当前版本一致；
5. 用户是否仍存在且启用；
6. 从数据库重新加载角色和权限，写入 Spring Security 上下文。

JWT 中包含用户 ID、用户名、角色、设备 ID、Token Version 和唯一 `jti`。接口授权应使用当前 Security Context 中重新加载的权限，不应只信任 JWT 中的角色数据。

### 刷新与轮换

```text
POST /auth/refresh（浏览器自动携带 Refresh Token Cookie）
  -> 计算 Refresh Token 哈希并查询 Redis 索引
  -> 校验会话、用户状态和 Token Version
  -> 删除旧会话与旧索引
  -> 标记旧 Refresh Token 已使用
  -> 生成新的 Access Token 与 Refresh Token
  -> 保存新会话并覆盖 Cookie
```

`refresh-reuse-grace-seconds` 是旧 Refresh Token 使用标记的保留时间，用来识别短时间内的重复使用。前端也会合并并发刷新请求。

### 退出

`POST /auth/logout` 会删除当前 Refresh Token 对应的 Redis 会话，将当前 Access Token 的 `jti` 写入黑名单直到 JWT 自然过期，并清除 Refresh Token 与设备 Cookie。

### Token Version

每个用户在 Redis 中有一个 Token Version。JWT 和登录会话都记录签发时的版本；提高该版本后，之前签发的 Access Token 和 Refresh Token 都会失效。该机制适合实现“强制用户全部下线”“修改密码后失效所有会话”等功能，目前已提供底层服务，尚未暴露管理接口。

## Redis 数据

Redis Key 使用以下逻辑前缀：

| 前缀 | 作用 | TTL |
| --- | --- | --- |
| `login:session:` | 用户与设备维度的登录会话 | Refresh Token 有效期 |
| `login:refresh:index:` | Refresh Token 哈希到会话的索引 | Refresh Token 有效期 |
| `login:refresh:used:` | 已使用旧 Refresh Token 的短期标记 | 重用检测宽限时间 |
| `token:blacklist:` | 已退出的 Access Token `jti` | Access Token 剩余时间 |
| `user:tokenVersion:` | 用户当前 Token Version | 当前未设置过期时间 |

不要在日志中输出原始 Refresh Token、JWT、用户密码或 Jasypt 主密码。

## 接口概览

除登录和刷新外，当前所有请求都需要有效 Access Token。

| 方法 | 路径 | 是否公开 | 说明 |
| --- | --- | --- | --- |
| `POST` | `/auth/login` | 是 | 账号密码登录，设置 Refresh Token Cookie |
| `POST` | `/auth/refresh` | 是 | 使用 Cookie 刷新并轮换 Token |
| `POST` | `/auth/logout` | 否 | 删除会话、拉黑当前 Access Token、清除 Cookie |
| `GET` | `/auth/me` | 否 | 获取当前用户、角色和权限 |
| `GET` | `/system/menu/user` | 否 | 获取当前用户树形菜单 |
| `GET` | `/system/menu/list` | 否 | 获取菜单管理树，包含启用和停用数据 |
| `POST` | `/system/menu` | 否 | 新增目录、页面菜单或按钮权限 |
| `PUT` | `/system/menu/{id}` | 否 | 修改菜单及其父级、路由、组件、权限等字段 |
| `DELETE` | `/system/menu/{id}` | 否 | 删除无子节点的菜单并清理角色授权关系 |

统一响应：

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

常用响应码：`0` 成功、`400` 参数错误、`401` 登录失效、`403` 无权限、`500` 系统异常、`1001` 账号或密码错误、`1002` Refresh Token 失效、`1003` 账号被禁用。

注意：部分业务异常使用 HTTP 200 返回、通过响应体 `code` 表示失败；JWT 过滤器校验失败则直接返回 HTTP 401。客户端需要同时处理 HTTP 状态码和响应体业务码。

## 权限模型

用户通过 `sys_user_role` 关联角色，角色通过 `sys_role_menu` 关联菜单和按钮权限。加载用户时：

- 角色标识转换为 `ROLE_<roleKey>` 权限；
- 菜单记录中的非空 `permission` 原样转换为权限；
- `@EnableMethodSecurity` 已启用，可在业务方法上增加 `@PreAuthorize`。

示例：

```java
@PreAuthorize("hasAuthority('system:user:list')")
public Result<?> listUsers() {
    // ...
}
```

前端隐藏菜单或按钮不能代替后端校验。新增敏感接口时，必须同时增加方法级权限控制，并为角色分配对应权限记录。

## 关键配置

推荐配置结构：

```yaml
jwt:
  secret: ${JWT_SECRET}
  access-token-expire-minutes: 15

auth:
  access-token-expire-minutes: 15
  refresh-token-expire-hours: 8
  remember-me-refresh-token-expire-days: 14
  refresh-token-cookie-name: refresh_token
  device-id-cookie-name: device_id
  refresh-token-cookie-path: /
  cookie-secure: false
  cookie-same-site: Lax
  refresh-reuse-grace-seconds: 5
```

JWT 的过期时间由 `jwt.access-token-expire-minutes` 控制；登录响应中的 `expiresIn` 由 `auth.access-token-expire-minutes` 计算。两项应保持一致，避免客户端显示的有效期与实际 JWT 不一致。

生产环境至少应做到：

- 使用足够长的随机 JWT Secret，不能保留默认值；
- 全站 HTTPS，并将 `cookie-secure` 设为 `true`；
- 根据真实部署域名检查 Cookie Path 与 SameSite；
- 数据库、Redis 和加密主密码通过安全的外部配置注入；
- 限制跨域来源，并重新评估 Cookie 刷新接口的 CSRF 防护；
- 不向仓库提交 `.jasypt.password`、明文密码或生产连接信息。

## 扩展业务模块

新增业务时建议保持以下分层：

```text
业务模块/
├─ controller/     # 参数接收、鉴权注解、统一响应
├─ service/        # 业务规则与事务
├─ mapper/         # 数据访问
└─ entity/         # 实体、请求对象和响应对象
```

新增接口的一般步骤：

1. 建立实体和 Mapper；
2. 在 Service 中实现业务规则；
3. Controller 返回统一 `Result`；
4. 为敏感方法添加 `@PreAuthorize`；
5. 在菜单/权限数据中增加权限标识并授权角色；
6. 补充正常、未登录、无权限和异常场景测试；
7. 与前端约定菜单 `component`、路由 `path` 和权限字符串。

## 常见问题

### 启动时报 Jasypt 解密失败

确认提供了正确的 Jasypt 主密码，并且密文由同一算法和主密码生成。不要把主密码直接写入仓库。

### 登录成功但访问接口返回 401

检查请求头是否为 `Authorization: Bearer <access-token>`，再检查 JWT Secret、Redis Token Version、黑名单和用户状态。

### 刷新接口一直返回 401 或 1002

检查浏览器是否携带 Refresh Token Cookie、Cookie Path 是否覆盖 `/auth/refresh`、Redis 会话和哈希索引是否仍在，以及前后端网关是否转发 `Set-Cookie` 和 `Cookie`。

### 普通用户没有菜单

检查用户是否关联启用角色、角色是否关联启用菜单，以及关系表中的 ID 是否正确。管理员的角色标识必须精确为 `admin` 才会读取全部启用菜单。

### 修改了 Access Token 有效期但前端显示不一致

同时检查 `jwt.access-token-expire-minutes` 和 `auth.access-token-expire-minutes`，两项应设置为相同值。
