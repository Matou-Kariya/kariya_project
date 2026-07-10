# 前端项目说明

这是项目的 Web 管理端，负责登录、登录态恢复、接口访问、权限菜单、动态路由和后台基础布局。本文面向第一次接触项目的开发者，建议先阅读“登录鉴权”与“菜单和动态路由”两节，再开始开发业务页面。

## 当前能力

已经接通的通用能力：

- 账号密码登录与“记住我”选项；
- Access Token 保存、请求头注入及过期判断；
- 基于 Refresh Token Cookie 的静默续期；
- 多个请求同时遇到 401 时复用同一次刷新请求；
- 刷新页面后的登录态、用户信息和菜单恢复；
- 退出登录与本地状态清理；
- 后端菜单驱动的侧边栏、面包屑和动态路由；
- 401、404 页面及后台基础布局；
- 用户、角色、菜单管理页面的 UI 骨架。

当前仍属于占位或演示的内容：

- 微信登录、忘记密码、创建账号按钮尚未接入业务；
- 用户管理尚未接入完整接口；
- 菜单管理已接入数据库 CRUD，可维护目录、页面、按钮权限和图标；
- 角色管理当前使用前端模拟数据，增删改不会持久化；
- 前端已收集权限标识，但通用按钮级权限组件尚未实现。

## 技术栈

- React 19 + TypeScript
- Vite 8
- React Router 7
- Redux Toolkit
- Ant Design 6
- Axios
- pnpm

Vite 8 要求 Node.js `^20.19.0` 或 `>=22.12.0`，建议团队统一使用一个 Node.js LTS 版本。

## 快速启动

先启动后端服务，默认地址为 `http://localhost:9999`，然后在当前目录执行：

```bash
pnpm install
pnpm dev
```

开发服务器默认打开 `http://localhost:3000`。开发环境中，请求统一访问 `/api`，Vite 会将其代理到后端并移除 `/api` 前缀。例如：

```text
浏览器请求 /api/auth/me
后端收到 /auth/me
```

如果后端地址发生变化，请修改 `vite.config.ts` 中的代理目标。

常用命令：

```bash
pnpm dev       # 启动开发服务器
pnpm build     # TypeScript 检查并构建生产包
pnpm lint      # ESLint 检查
pnpm preview   # 本地预览构建产物
```

生产环境需要由网关或 Web 服务器将 `/api` 转发到后端，并正确转发 Cookie。前后端跨域部署时，还需要同时检查后端 CORS、Cookie 的 SameSite/Secure 属性以及 Axios 的 `withCredentials` 设置。

## 建议阅读顺序

想快速理解项目，可以依次查看：

1. `src/main.tsx`：应用入口、Redux 和 Ant Design 全局配置；
2. `src/router/RequireAuth.tsx`：进入后台前如何恢复登录态；
3. `src/utils/request.ts`：Token 注入、统一响应和 401 自动刷新；
4. `src/utils/authStorage.ts`：Access Token 与用户信息的本地存储；
5. `src/store/slices/userSlice.ts`：当前用户、菜单和权限状态；
6. `src/router/dynamicRoutes.tsx`：菜单如何转换成路由；
7. `src/router/componentResolver.tsx`：后端组件标识如何匹配页面文件；
8. `src/layouts/`：后台布局、侧边栏、导航栏与内容区域。

## 目录结构

```text
src/
├─ api/                    # 按业务域封装接口
├─ assets/                 # 图片等静态资源
├─ components/             # 可复用组件与加载状态
├─ layouts/                # 后台整体布局
│  └─ components/          # 侧边栏、导航栏、标签页、内容区
├─ pages/                  # 路由页面，每个页面以 index.tsx 为入口
├─ providers/              # 全局 Provider 适配
├─ router/                 # 路由守卫、动态路由和组件解析
├─ services/               # 跨模块服务
├─ store/                  # Redux Store 与业务 Slice
├─ styles/                 # 全局样式
├─ types/                  # 公共 TypeScript 类型
└─ utils/                  # 请求、JWT、存储和加载工具
```

`@` 指向 `src`，业务代码优先使用 `@/` 绝对导入，避免多层相对路径。

## 登录鉴权

### Token 如何保存

- Access Token 保存在 `sessionStorage`，关闭当前浏览器标签页后会清除；
- Refresh Token 不暴露给 JavaScript，由后端写入 HttpOnly Cookie；
- 用户基本信息也保存在 `sessionStorage`，但它只用于界面展示，真正的身份和权限必须以后端校验结果为准；
- Redux 保存当前运行期间的 Token、用户、菜单和权限，刷新页面后由路由守卫重新构建。

### 登录流程

```text
提交账号密码
  -> POST /auth/login（携带 rememberMe）
  -> 后端返回 Access Token，并写入 Refresh Token Cookie
  -> 保存 Access Token 和用户信息
  -> 跳转 /dashboard
  -> 路由守卫获取 /auth/me 和 /system/menu/user
  -> Redux 写入用户、菜单、权限并生成可访问路由
```

### 页面刷新与静默续期

进入后台路由时，`RequireAuth` 会执行初始化：

1. 读取 Access Token；
2. Token 不存在或即将过期时，请求 `POST /auth/refresh`；
3. 请求 `GET /auth/me` 确认身份；
4. 请求 `GET /system/menu/user` 获取当前用户菜单；
5. 初始化成功后渲染后台，失败则清理本地状态并跳转登录页。

`request.ts` 还会处理运行期间的 401：先刷新 Access Token，再重放原请求。刷新请求由共享 Promise 合并，可避免接口并发失败时重复刷新。

### 退出流程

退出时请求 `POST /auth/logout`，让后端删除刷新会话并使当前 Access Token 失效；无论接口调用是否成功，前端最后都会清理本地 Token、Redux 用户状态并返回登录页。

### 使用请求工具

业务接口应统一使用 `src/utils/request.ts` 导出的 Axios 实例，不要在页面里自行拼接 Token：

```ts
import request from "@/utils/request";

export function getExampleList() {
  return request.get<Example[], Example[]>("/example/list");
}
```

后端统一响应格式为：

```ts
type Result<T> = {
  code: number;
  message: string;
  data: T;
};
```

请求工具会在 `code === 0` 时直接返回 `data`，因此页面拿到的不是完整 `Result`。业务失败、登录失效和网络错误也统一在此处理。

## 菜单和动态路由

登录后，`GET /system/menu/user` 返回树形菜单。菜单类型约定：

| `menuType` | 含义 | 前端行为 |
| --- | --- | --- |
| `0` | 目录 | 显示在侧边栏，但不生成页面路由 |
| `1` | 页面 | 显示在侧边栏并生成动态路由 |
| `2` | 按钮权限 | 不显示在侧边栏，权限标识会被收集 |

关键字段：

- `path`：浏览器访问路径；后端会把子菜单路径整理成完整路径；
- `component`：相对于 `src/pages` 的页面目录，例如 `System/UserManagement`；
- `permission`：权限标识，供按钮或接口权限控制使用；
- `icon`：侧边栏图标名称，目前需同时在 Sidebar 的图标映射中注册；
- `status`：`1` 表示启用；
- `orderNum`：同级菜单排序。

组件解析器会把 `component: "System/UserManagement"` 匹配到：

```text
src/pages/System/UserManagement/index.tsx
```

匹配不到时会记录警告并渲染 404 页面。目录名称大小写应与实际文件保持一致；现有解析器只对路径段首字母做兼容处理，不应依赖该兼容规则。

### 新增一个受权限控制的页面

1. 新建 `src/pages/业务目录/页面目录/index.tsx`；
2. 在后端菜单表中新增 `menuType = 1` 的记录；
3. 将 `component` 填为相对 `src/pages` 的目录，不要包含 `/src/pages` 和 `/index.tsx`；
4. 配置访问路径、权限标识、排序和父级目录；
5. 把菜单授权给角色，重新登录或刷新页面验证菜单与路由。

通常不需要手工修改前端主路由表。

## 状态与权限

`userSlice` 保存：

- `token`：当前 Access Token；
- `userInfo`：用户 ID、用户名、角色和权限；
- `menus`：后端返回的菜单树；
- `permissions`：从菜单树递归收集的权限标识。

前端权限控制只负责改善交互体验，不能替代后端授权。新增按钮权限组件时，可从 Redux 的 `permissions` 判断是否展示或禁用，但对应后端接口仍必须做权限校验。

## 开发约定

- 页面放在 `src/pages`，可复用 UI 放在 `src/components`；
- 接口调用集中在 `src/api`，页面不直接创建 Axios 实例；
- 登录信息只通过 `authStorage` 读写，退出时统一清理；
- 后端菜单的 `component` 与页面目录保持一致；
- 路由页面使用懒加载，加载状态复用已有 Loading 组件；
- 提交前至少运行 `pnpm lint` 和 `pnpm build`。

## 常见问题

### 登录成功后又回到登录页

依次检查 Refresh Token Cookie 是否写入、`/auth/me` 是否返回 401、Redis 登录会话是否存在，以及前后端代理是否正确传递 Cookie。

### 接口返回 401 后没有恢复

检查 `/auth/refresh` 响应和浏览器 Cookie。刷新失败时前端会清理 Access Token 并跳转登录页，这是预期行为。

### 菜单出现但页面是 404

检查菜单 `component` 是否能匹配 `src/pages/**/index.tsx`，并检查路径大小写。`path` 控制 URL，`component` 控制加载哪个页面，两者不是同一个字段。

### 本地接口请求到了前端服务器

业务接口应以 `/api` 为基础地址并通过统一请求实例调用；同时确认 `vite.config.ts` 的代理目标与后端端口一致。
