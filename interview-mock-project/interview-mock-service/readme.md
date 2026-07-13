# 后端项目说明

这是后台管理系统的 Spring Boot 单体服务，当前主要负责账号认证、JWT 鉴权、Refresh 会话、用户角色权限加载，以及菜单查询和菜单管理。

本文使用 `<base-package>` 表示 Java 根包。这样文档不会与某个组织名或个人命名绑定，迁移或开源时只需要调整代码包名和构建坐标。

## 1. 当前完成度

已经实现：

- 从数据库读取用户并使用 BCrypt 校验密码；
- 加载用户角色和菜单权限；
- Spring Security 无状态认证；
- Access Token JWT 签发和校验；
- Refresh Token 随机生成、哈希保存、Cookie 下发和 Rotation；
- Redis 登录会话、刷新索引、已使用 Token 标记、Access Token 黑名单；
- `rememberMe` 对 Refresh 会话时长的控制；
- 当前用户信息接口；
- 管理员全部菜单、普通用户按角色查询菜单；
- 菜单树查询和菜单增删改；
- 统一业务响应和全局异常处理。

尚未完整实现：

- 用户管理和角色管理的完整 Controller/Service/API；
- 用户、角色、菜单授权关系的管理接口；
- 通用审计日志、登录日志和操作日志；
- 限流、验证码、登录失败次数锁定等进一步安全措施；
- 数据库迁移脚本和自动初始化数据；
- 完整的自动化测试。

## 2. 技术栈与运行环境

- Java 17
- Spring Boot 3.3
- Spring Web
- Spring Security
- MyBatis-Plus
- MySQL
- Spring Data Redis / Lettuce
- JJWT
- Jasypt
- Druid
- Maven

本地运行前需要准备：

1. JDK 17；
2. Maven；
3. 可访问的 MySQL；
4. 可访问的 Redis；
5. 解密配置所需的 Jasypt 密钥；
6. 长度足够的 JWT HMAC 密钥。

## 3. 快速启动

在后端目录执行：

```bash
mvn spring-boot:run
```

或者先构建再运行：

```bash
mvn clean package
java -jar target/*.jar
```

默认服务端口为：

```text
http://localhost:9999
```

前端开发代理会将 `/api/auth/login` 转发为后端的 `/auth/login`，所以后端 Controller 本身没有 `/api` 前缀。

常用验证命令：

```bash
mvn test
mvn clean package
```

## 4. 配置与密钥

主配置文件为 `src/main/resources/application.yaml`，包含：

- 数据源与 Druid 连接池；
- Redis 地址、密码、库和连接池；
- 服务端口；
- JWT 签名密钥与有效期；
- Refresh 会话与 Cookie 属性；
- MyBatis-Plus 配置。

### 4.1 Jasypt 解密密钥

启动类会按以下优先级读取 Jasypt 密钥：

1. JVM 系统属性 `jasypt.encryptor.password`；
2. 环境变量 `JASYPT_ENCRYPTOR_PASSWORD`；
3. classpath 根目录下的 `.jasypt.password` 文件。

推荐本地使用环境变量：

```powershell
$env:JASYPT_ENCRYPTOR_PASSWORD="你的本地解密密钥"
mvn spring-boot:run
```

也可以在 IDE 的运行配置中添加环境变量。不要将明文密钥或 `.jasypt.password` 提交到 Git。

如果公司环境能启动、本地无法绑定数据库或 Redis 密码，优先确认本地是否提供了同一 Jasypt 密钥，以及文件是否位于运行时 classpath，而不是仅存在于某个固定的绝对路径。

### 4.2 JWT 密钥

JWT 密钥可通过环境变量覆盖：

```powershell
$env:JWT_SECRET="至少 32 字节的随机密钥"
```

HMAC-SHA 密钥过短会触发 `WeakKeyException`。生产环境不要使用仓库中的开发默认值，也不要在多个无关环境共用同一密钥。

### 4.3 Cookie 配置

当前可配置项包括：

- Refresh Cookie 名称；
- Device Cookie 名称；
- Cookie Path；
- `Secure`；
- `SameSite`；
- 普通登录 Refresh 时长；
- “记住我” Refresh 时长；
- Refresh Token 重用宽限时间。

本地 HTTP 开发时通常使用 `cookie-secure: false`；HTTPS 生产环境应改为 `true`。跨站部署时还需要重新评估 `SameSite`、CORS 和 CSRF 策略。

## 5. 建议阅读顺序

第一次阅读后端代码，建议按请求经过的方向看：

1. `StartUpApplication`：启动与 Jasypt 密钥加载；
2. `config/SecurityConfig`：哪些接口公开、认证过滤器在哪里；
3. `auth/controller/LoginController`：登录、刷新、登出、当前用户接口；
4. `auth/service/AuthService`：认证业务总编排；
5. `auth/service/LoginUserDetailsService`：用户、角色、权限如何从数据库加载；
6. `auth/filter/JwtAuthenticationFilter`：每个受保护请求如何验证 Access Token；
7. `auth/service/RefreshTokenService`：Redis 会话和 Refresh Rotation；
8. `utils/JwtTokenUtil`：JWT Claims、签名和过期时间；
9. `system/controller/MenuController`：菜单接口与方法权限；
10. `system/service/MenuService`：管理员/普通用户菜单差异和树构造；
11. `system/mapper`：具体 SQL 和表关系；
12. `entity/Result`、`exception/GlobalExceptionHandler`：统一响应和异常转换。

## 6. 目录与分层职责

以下路径省略 Java 根包，实际位于 `src/main/java/<base-package>/`：

```text
<base-package>/
├─ auth/
│  ├─ controller/          # 登录、刷新、登出、当前用户 HTTP 接口
│  ├─ entity/              # 登录请求、登录用户、会话和响应模型
│  ├─ filter/              # JWT 请求过滤器
│  └─ service/             # 认证、用户加载、Refresh 会话、Token 版本
├─ config/                 # Security 和认证配置属性
├─ constant/               # Redis key 等常量
├─ entity/                 # 通用 Result 和 ResultCode
├─ exception/              # 业务异常与全局异常处理
├─ system/
│  ├─ controller/          # 系统管理接口
│  ├─ entity/              # 用户、角色、菜单实体和 DTO/VO
│  ├─ mapper/              # MyBatis-Plus Mapper 与 SQL
│  └─ service/             # 菜单等系统业务
└─ utils/                  # JWT 等通用工具
```

分层约定：

- Controller 负责 HTTP 参数、Cookie 和响应，不堆积业务规则；
- Service 负责事务和业务流程；
- Mapper 负责数据库访问；
- Entity 映射数据库表，Request/DTO 接收输入，VO/Response 输出数据；
- Filter 负责请求进入 Controller 前的通用认证；
- `BusinessException` 表达可预期业务失败，全局异常处理器负责转成统一响应。

## 7. 数据模型与权限关系

当前核心表：

| 表 | 作用 |
| --- | --- |
| `sys_user` | 用户、BCrypt 密码、状态和基本资料 |
| `sys_role` | 角色名称、角色标识和状态 |
| `sys_menu` | 目录、页面、按钮权限和路由信息 |
| `sys_user_role` | 用户与角色多对多关系 |
| `sys_role_menu` | 角色与菜单/权限多对多关系 |

关系可以理解为：

```text
用户
  -> sys_user_role
  -> 角色
  -> sys_role_menu
  -> 菜单或按钮权限
```

`role_key` 会转换成 Spring Security 的 `ROLE_<roleKey>`；菜单表中的 `permission` 会直接转换成 Authority。

例如：

```java
@PreAuthorize("hasRole('admin') or hasAuthority('system:menu:list')")
```

`hasRole('admin')` 实际检查 `ROLE_admin`，而 `hasAuthority` 检查原始权限字符串。

数据库中的密码必须是 BCrypt 密文。登录时前端发送 HTTPS 保护下的明文密码，Spring Security 使用 `PasswordEncoder.matches(明文, 数据库密文)` 校验；不能对已有 BCrypt 密文再次 encode 后比较，因为 BCrypt 每次生成的盐不同。

## 8. Spring Security 总体结构

`SecurityConfig` 的关键设置：

- 关闭默认 CSRF；
- `SessionCreationPolicy.STATELESS`，不使用 HttpSession 保存登录态；
- `/auth/login` 和 `/auth/refresh` 匿名可访问；
- 其他请求必须认证；
- `DaoAuthenticationProvider` 使用 `LoginUserDetailsService` + BCrypt；
- `JwtAuthenticationFilter` 位于用户名密码过滤器之前；
- 启用方法级权限，支持 `@PreAuthorize`。

“无状态”是指应用服务器不使用 HttpSession。项目仍然在 Redis 保存 Refresh 登录会话，用来实现续期、登出失效、多设备和 Token Rotation。

## 9. 登录鉴权核心流程

### 9.1 登录

```text
POST /auth/login
  -> LoginController 接收账号、密码、rememberMe、可选 deviceId
  -> AuthService 调用 AuthenticationManager
  -> LoginUserDetailsService 查询 sys_user
  -> 查询用户角色和菜单权限
  -> BCryptPasswordEncoder 校验密码
  -> 生成 Access Token JWT
  -> 生成随机 Refresh Token
  -> Refresh Token 做 SHA-256 哈希
  -> Redis 保存 LoginSession 和 Refresh 索引
  -> 响应体返回 Access Token 与 UserInfo
  -> Set-Cookie 写入 Refresh Token 和 deviceId
```

账号状态不是启用时抛出“账号已被禁用”；其他认证失败统一返回“账号或密码错误”，避免泄露账号是否存在。

当前 `rememberMe` 的作用：

- 未勾选：使用较短的 Refresh 会话时长；
- 勾选：使用按天计算的较长 Refresh 会话时长；
- Access Token 时长不因 `rememberMe` 改变。

### 9.2 Access Token 内容

JWT 当前包含：

- `sub`：用户 ID；
- `username`；
- `roles`；
- `tokenVersion`；
- `deviceId`；
- `type=access`；
- `jti`：Token 唯一 ID；
- 签发时间和过期时间。

虽然 JWT 中包含角色，但过滤器仍会通过用户名重新加载当前用户及权限，最终放入 `SecurityContext` 的是数据库当前状态。这会增加数据库查询，但能更快反映用户禁用或权限变化。

### 9.3 受保护请求

```text
Authorization: Bearer <accessToken>
  -> JwtAuthenticationFilter
  -> 校验签名和过期时间
  -> 校验 type=access
  -> Redis 检查 jti 黑名单
  -> Redis 检查用户 tokenVersion
  -> 重新加载用户、角色和权限
  -> 构造 Authentication 写入 SecurityContext
  -> Controller / @PreAuthorize
```

JWT 过期、签名错误、类型错误、黑名单命中或 Token 版本变化时，过滤器直接返回 HTTP 401：

```json
{
  "code": 401,
  "message": "登录已过期，请重新登录",
  "data": null
}
```

### 9.4 Refresh Token 与 Rotation

Refresh Token 本身不是 JWT，而是 32 字节安全随机数的 URL-safe Base64 文本。浏览器 Cookie 保存原文，Redis 只保存它的 SHA-256 哈希和会话信息。

刷新流程：

```text
POST /auth/refresh
  -> 从 HttpOnly Cookie 读取 Refresh Token
  -> 计算哈希并查 Refresh 索引
  -> 加载 LoginSession
  -> 校验会话中的哈希和 tokenVersion
  -> 重新加载用户、角色和权限
  -> 生成新 Access Token
  -> 生成新 Refresh Token
  -> 删除旧会话/索引
  -> 短时间标记旧 Refresh 已使用
  -> 保存新会话/索引
  -> 覆盖浏览器 Cookie
```

这叫 Refresh Token Rotation：每次刷新后旧 Refresh Token 不再长期有效。`refreshReuseGraceSeconds` 用来降低多标签页或并发请求带来的误判风险；值越大，并发容忍越高，但旧 Token 可重用窗口也越长。

### 9.5 Redis Key 的用途

| Key 前缀 | Value | 作用 |
| --- | --- | --- |
| `login:session:` | JSON LoginSession | 某用户某设备的登录会话 |
| `login:refresh:index:` | `userId:deviceId` | 由 Refresh 哈希反查会话 |
| `login:refresh:used:` | `1` | 短期记录已轮换的 Refresh Token |
| `token:blacklist:` | `1` | 主动登出的 Access Token 黑名单 |
| `user:tokenVersion:` | 版本数字 | 批量让某用户旧 Token 失效 |

### 9.6 登出

`POST /auth/logout` 会：

1. 根据 Refresh Cookie 删除 Redis 登录会话；
2. 解析当前 Access Token；
3. 按其剩余过期时间写入黑名单；
4. 将 Refresh 和 Device Cookie 的 `maxAge` 设为 0。

Cookie 清除时的 name、path、domain 等属性必须与写入时一致，否则浏览器中可能残留 Cookie。

## 10. 当前认证接口

| 方法 | 路径 | 是否匿名 | 作用 |
| --- | --- | --- | --- |
| POST | `/auth/login` | 是 | 账号密码登录，签发 Token |
| POST | `/auth/refresh` | 是 | 使用 Refresh Cookie 轮换并签发新 Token |
| POST | `/auth/logout` | 否 | 删除会话、拉黑 Access Token、清 Cookie |
| GET | `/auth/me` | 否 | 返回当前用户 ID、用户名、角色和权限 |

登录响应体不会返回 Refresh Token；Refresh Token 只通过 HttpOnly Cookie 下发。

## 11. 菜单与动态路由后端逻辑

### 11.1 菜单类型

| `menu_type` | 含义 | 数据要求 |
| --- | --- | --- |
| `0` | 目录 | 必须有 path，不要求 component |
| `1` | 页面 | 必须有 path 和 component |
| `2` | 按钮权限 | 必须有 permission，不作为路由页面 |

`component` 是相对于前端 `src/pages` 的目录，例如 `System/UserManagement`。不要填写前端绝对路径，也不要包含 `/index.tsx`。

### 11.2 当前用户菜单

`GET /system/menu/user` 的规则：

- 角色列表包含 `admin`：返回全部启用菜单；
- 其他用户：通过 `sys_user_role -> sys_role_menu -> sys_menu` 查询已授权且启用的菜单；
- Service 将平铺数据转换成树；
- 用户菜单响应会把相对 path 递归拼接为完整 path。

例如父目录 `/system`，子页面 `user`，返回前端时子页面 path 为 `/system/user`。

### 11.3 菜单管理接口

| 方法 | 路径 | 作用 |
| --- | --- | --- |
| GET | `/system/menu/user` | 当前用户可用菜单树 |
| GET | `/system/menu/list` | 管理页面所需的完整菜单树 |
| POST | `/system/menu` | 新增菜单 |
| PUT | `/system/menu/{id}` | 修改菜单 |
| DELETE | `/system/menu/{id}` | 删除菜单 |

菜单管理接口要求管理员角色或 `system:menu:list` 权限。当前新增、修改、删除复用了 list 权限，后续可以细分为 `add/edit/delete`。

Service 已处理：

- 名称、类型、状态、排序和必填字段校验；
- 不能把按钮作为父节点；
- 不能把菜单移动到自己的下级；
- 有子节点的菜单不能改成按钮；
- 有子节点时禁止直接删除；
- 删除菜单前清理对应角色菜单关系。

## 12. 统一响应与异常

普通 Controller 使用：

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

常见业务码：

| code | 含义 |
| --- | --- |
| 0 | 成功 |
| 400 | 参数错误 |
| 401 | 未登录或登录过期 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 系统异常 |
| 1001 | 账号或密码错误 |
| 1002 | Refresh Token 失效 |
| 1003 | 当前代码中用于账号禁用 |

当前 `GlobalExceptionHandler` 对业务异常返回统一 JSON，但没有统一设置对应 HTTP 状态，因此一部分业务失败仍可能是 HTTP 200 + 非零业务 code；JWT Filter 则会直接返回 HTTP 401。前端请求层同时处理了 HTTP 401 和业务 `code=401`。

如果未来统一 REST 语义，建议让异常处理器返回对应 `ResponseEntity`，同时确认前端拦截器不会重复提示。

## 13. 如何新增一个后端业务模块

以“题目分类”为例，推荐按以下顺序开发。

### 第一步：确认表和接口模型

先明确：

- 数据库表字段；
- 列表查询条件和分页；
- 新增/编辑的必填规则；
- 删除约束；
- 需要哪些权限字符串。

不要直接把数据库 Entity 暴露为所有接口的请求和响应。复杂模块建议分别建立：

```text
Category                 # 数据库实体
CategoryQueryRequest     # 查询条件
CategorySaveRequest      # 新增/编辑参数
CategoryVO               # 返回前端的数据
```

### 第二步：Entity 和 Mapper

```java
@TableName("interview_category")
public class Category {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private Integer status;
}

@Mapper
public interface CategoryMapper extends BaseMapper<Category> {
}
```

简单单表操作可使用 MyBatis-Plus；多表查询、权限过滤或复杂统计可以写明确 SQL。

### 第三步：Service

```java
@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryMapper categoryMapper;

    @Transactional
    public Long create(CategorySaveRequest request) {
        // 参数校验、唯一性检查、构造实体、insert
        return id;
    }
}
```

业务规则、事务和跨 Mapper 协作放在 Service，不放进 Controller。

### 第四步：Controller 和权限

```java
@RestController
@RequestMapping("/interview/category")
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryService categoryService;

    @GetMapping("/list")
    @PreAuthorize("hasAuthority('interview:category:list')")
    public Result<List<CategoryVO>> list() {
        return Result.success(categoryService.list());
    }
}
```

建议权限粒度：

```text
interview:category:list
interview:category:create
interview:category:update
interview:category:delete
```

### 第五步：菜单和授权

在 `sys_menu` 中配置目录/页面/按钮权限，并通过 `sys_role_menu` 授权给角色。前端页面 `component` 必须与实际页面目录匹配。

### 第六步：验证完整链路

至少验证：

1. 未携带 Token 返回未认证；
2. 有 Token 但无 Authority 时不能调用；
3. 管理员和普通角色得到不同菜单；
4. 参数错误返回清晰业务消息；
5. 新增、修改、删除的事务和约束正确；
6. 前端刷新后动态路由仍能加载页面。

## 14. 开发约定

- 不在 Controller 中直接编写复杂 SQL 或事务；
- 密码只保存 BCrypt 密文，日志中禁止输出密码和 Token；
- Refresh Token 原文只存在于 Cookie 和当前请求内，Redis 保存哈希；
- 新接口默认需要认证，只有确实公开的接口才加入 permit list；
- 页面按钮权限与后端 `@PreAuthorize` 使用同一权限字符串；
- 删除操作先检查子数据、引用关系和权限；
- 统一抛 `BusinessException` 表达可预期业务失败；
- 配置密钥使用环境变量或安全配置中心，不提交明文；
- 提交前至少执行 `mvn test` 和 `mvn clean package`。

## 15. 常见问题

### 启动时报数据库或 Redis password 无法绑定

优先检查 Jasypt 解密密钥是否被启动进程读到。IDE、终端和打包后的 Jar 是三个不同运行环境，不要假设它们共享环境变量或 classpath 文件。

### JWT 报 WeakKeyException

JWT HMAC 密钥字节数过短。使用至少 32 字节的随机密钥，并保证签发与验签使用同一值。

### 账号密码确定正确但仍提示错误

检查：

- 数据库密码是否为完整 BCrypt 密文；
- 字段是否被截断，常见 BCrypt 字符串长度为 60；
- 用户 `status` 是否为启用；
- 使用的是 `matches(明文, 密文)`，而不是再次 encode 后字符串相等比较；
- 前端实际提交的用户名、密码是否有空格或大小写差异。

### 登录后访问接口仍是 401

检查 Authorization 是否为 `Bearer <token>`、JWT 密钥是否一致、Token 是否过期、jti 是否在黑名单、用户 Token 版本是否变化，以及 Redis 是否可用。

### Access Token 过期后无法刷新

检查浏览器是否携带 Refresh Cookie、Cookie Path 是否覆盖 `/auth/refresh`、Redis 会话与 Refresh 索引是否存在，以及代理是否保留 Cookie。

### 管理员菜单正常，普通用户没有菜单

检查 `sys_user_role`、角色状态、`sys_role_menu`、菜单状态。普通用户查询依赖完整的两张关联表；管理员角色标识必须与代码判断使用的 `admin` 一致。

### 菜单返回了但前端显示 404

后端重点检查 `path` 和 `component`。`path` 决定 URL，`component` 决定前端页面文件，两者不能混用。

## 16. 当前实现需要留意的技术债

- 配置中 JWT 有效期同时存在于 `jwt` 和 `auth` 两组属性：JWT 实际过期时间使用前者，响应 `expiresIn` 使用后者；两者必须保持一致，后续建议合并为单一来源；
- 当前配置键 `remember-me-ref resh-token-expire-days` 中疑似混入空格，无法正常绑定；由于 Java 配置类有默认值，当前可能不易察觉，建议后续修正为 `remember-me-refresh-token-expire-days`；
- Controller 读取 Refresh Cookie 时使用了固定名称，而写 Cookie 使用可配置名称；若修改 Cookie 名称，需要同步调整读取方式，后续可统一通过请求工具方法读取；
- Refresh Rotation 的宽限标记当前主要用于识别旧 Token，尚未实现更完整的 Token 重用攻击处置策略；
- 每次 JWT 请求都会重新查询用户角色权限，安全状态更新及时，但数据库压力较大；后续可根据一致性要求引入短期缓存；
- 菜单新增、修改、删除当前共用 `system:menu:list`，建议拆分权限；
- 全局异常处理尚未统一 HTTP 状态；
- 配置文件仍包含具体环境连接信息，开源前应改为环境变量占位和示例配置。

这些问题建议逐项重构，并为登录、刷新、登出、普通用户菜单和菜单 CRUD 增加集成测试后再调整核心认证流程。
