# 前端项目说明

这是后台管理系统的 React 管理端。它负责登录、登录态恢复、统一请求、用户状态、权限菜单、动态路由、后台布局，以及用户、角色、菜单等业务页面的展示。

本文不是一份只介绍启动命令的模板 README，而是一张“代码阅读地图”。第一次接触项目时，建议先看“核心运行流程”，再按文末的步骤开发新页面。

## 1. 当前完成度

已经接通的通用能力：

- 账号密码登录、密码显隐与登录错误展示；
- Access Token 保存、请求头注入和 401 自动续期；
- Refresh Token HttpOnly Cookie 静默续期；
- 多个请求同时遇到 401 时，共用同一次刷新请求；
- 刷新页面后恢复用户、菜单、权限和动态路由；
- 后端菜单驱动的侧边栏、面包屑和页面路由；
- 访问标签页、后台基础布局、加载页、401 和 404 页面；
- 菜单管理页面已接入后端 CRUD；
- 角色管理页面已完成前端交互 Demo。

仍属于占位或演示的内容：

- 微信登录、忘记密码、创建账号尚未接入真实业务；
- 用户管理尚未接入完整后端接口；
- 角色管理使用前端模拟数据，刷新后新增和编辑结果会丢失；
- 权限字符串已经存入 Redux，但尚未封装统一的按钮权限组件；
- 标签页保存在组件内存中，浏览器刷新后只会根据当前 URL 重新建立当前标签。

## 2. 技术栈与运行环境

- React 19 + TypeScript
- Vite 8
- React Router 7
- Redux Toolkit
- Ant Design 6
- Axios
- pnpm

Vite 8 要求 Node.js `^20.19.0` 或 `>=22.12.0`。建议团队统一 Node.js 和 pnpm 版本，减少“公司能启动、家里不能启动”的环境差异。

## 3. 快速启动

先启动后端服务，默认监听 `http://localhost:9999`，再进入前端目录执行：

```bash
pnpm install
pnpm dev
```

前端开发地址默认为 `http://localhost:3000`。

常用命令：

```bash
pnpm dev       # 启动开发服务器
pnpm build     # TypeScript 检查并构建生产包
pnpm lint      # ESLint 检查
pnpm preview   # 本地预览构建结果
```

### 开发代理

业务请求统一以 `/api` 开头。`vite.config.ts` 会把它代理到后端，并移除 `/api` 前缀：

```text
浏览器请求  /api/auth/me
后端收到    /auth/me
```

因此页面代码中不要硬编码 `http://localhost:9999`。生产部署时，需要由 Nginx、网关或其他 Web 服务提供等价的 `/api` 转发，并保证 Cookie 能被正确转发。

项目提供两个路径别名：

```ts
import request from "@/utils/request";
import background from "@assets/images/background.jpg";
```

- `@` 指向 `src`；
- `@assets` 指向 `src/assets`。

## 4. 建议阅读顺序

按下面的顺序阅读，比较容易建立完整心智模型：

1. `src/main.tsx`：React 入口、Redux Provider、Ant Design 全局配置；
2. `src/App.tsx`：浏览器路由入口；
3. `src/router/index.tsx`：静态路由、受保护布局和动态路由如何组合；
4. `src/router/RequireAuth.tsx`：进入后台前如何恢复身份；
5. `src/utils/request.ts`：Token 注入、统一响应、401 刷新与请求重试；
6. `src/utils/authStorage.ts`：Access Token 和用户信息实际保存在哪里；
7. `src/store/slices/userSlice.ts`：Redux 中保存的用户、菜单与权限；
8. `src/router/dynamicRoutes.tsx`：菜单如何转换为 React Router 路由；
9. `src/router/componentResolver.tsx`：后端 `component` 如何匹配页面文件；
10. `src/layouts/`：侧边栏、Header、标签页和内容区域；
11. `src/pages/System/MenuManagement`：当前最完整的“查询 + 表格 + 弹窗 + API”页面范例。

## 5. 目录职责

```text
src/
├─ api/                    # 按业务模块封装后端接口
├─ assets/                 # 图片、字体等静态资源
├─ components/             # 跨页面复用组件、按钮和 Loading
├─ constants/              # 图标映射等固定配置
├─ layouts/                # 后台整体布局
│  └─ components/          # Sidebar、Navbar、TagsView、AppMain
├─ pages/                  # 路由页面，每个页面以 index.tsx 为入口
├─ providers/              # 全局 Provider 或第三方库适配
├─ router/                 # 路由守卫、动态路由、页面解析器
├─ services/               # 跨模块服务，例如 Ant Design message 注册
├─ store/                  # Redux Store 和 Slice
├─ styles/                 # 全局样式
├─ types/                  # 公共 TypeScript 类型
└─ utils/                  # 请求、JWT、存储和懒加载工具
```

一个业务页面建议这样拆分：

```text
pages/System/ExampleManagement/
├─ index.tsx               # 页面编排、查询、表格和状态
├─ index.css               # 页面级样式
└─ components/
   ├─ ExampleModal.tsx     # 新增/编辑弹窗
   └─ ExampleModal.css
```

原则是：页面负责“组装”，复杂弹窗和可独立理解的区域放进 `components`；跨多个页面复用的组件才提升到 `src/components`。

## 6. 应用启动与路由渲染

页面加载后的主链路是：

```text
main.tsx
  -> 挂载 Redux、Ant Design 和全局服务
  -> App.tsx 创建 BrowserRouter
  -> AppRoutes 生成路由表
  -> RequireAuth 检查并恢复身份
  -> BasicLayout 渲染后台框架
  -> AppMain 中的 Outlet 渲染当前业务页面
```

`AppRoutes` 中有两类路由：

- 静态路由：`/login`、`/401`、404、后台根布局；
- 动态路由：登录后根据 Redux 中的 `menus` 生成。

动态路由并不是后端返回一段 React 代码。后端只返回路径和组件标识，前端再将它们映射到本地 `src/pages/**/index.tsx`。

## 7. 登录鉴权：必须先理解的核心流程

### 7.1 当前 Token 到底保存在哪里

当前实现不是“Access Token 只保存在 Redux 内存中”，实际情况如下：

| 数据 | 保存位置 | 刷新浏览器后 | 主要用途 |
| --- | --- | --- | --- |
| Access Token | `sessionStorage` + Redux | `sessionStorage` 保留，Redux 清空后重建 | API 身份认证 |
| UserInfo | `sessionStorage` + Redux | `sessionStorage` 保留，随后以后端 `/auth/me` 为准重建 | 用户名、角色、权限展示 |
| Refresh Token | 后端写入的 HttpOnly Cookie | Cookie 有效期内保留 | Access Token 续期 |
| Menus | Redux | 会丢失，随后重新请求 | 侧边栏、面包屑、动态路由 |
| Permissions | Redux，由菜单递归收集 | 会丢失，随后重新计算 | 前端按钮显隐的预备数据 |

需要注意：

- Axios 请求拦截器当前通过 `getAccessToken()` 从 `sessionStorage` 读取 Token，并不是直接从 Redux Store 读取；
- Redux 中的 `token` 主要表示当前 React 运行期登录状态；
- `sessionStorage` 只在当前浏览器标签页会话内有效，关闭标签页后通常会被清除；
- Refresh Token 对 JavaScript 不可见，前端依靠 `withCredentials: true` 让浏览器自动携带 Cookie。

如果将来决定改成“Access Token 纯内存模式”，需要同时修改 `authStorage.ts`、登录页、`request.ts` 和 `RequireAuth.tsx`，不能只删除一个 `sessionStorage.setItem`。

### 7.2 登录流程

登录页提交后的执行顺序：

```text
Login 页面提交 username/password/rememberMe
  -> loginApi 调用 POST /auth/login
  -> 后端校验账号密码
  -> 响应体返回 accessToken、expiresIn、userInfo
  -> 响应 Cookie 写入 refresh_token 和 device_id
  -> saveAccessToken/saveUserInfo 写入 sessionStorage
  -> dispatch(setToken/setUserInfo) 更新 Redux
  -> 跳转 /dashboard
  -> RequireAuth 获取 /auth/me 和 /system/menu/user
  -> Redux 写入最终用户、菜单和权限
  -> 动态路由和后台布局完成渲染
```

`rememberMe` 不控制 Access Token 的存储位置。它会被发送给后端，用来决定 Refresh 会话的有效期：未勾选时较短，勾选时较长。

### 7.3 浏览器刷新流程

浏览器刷新会清空 Redux，但不会立刻清除 `sessionStorage` 和 Cookie。`RequireAuth` 会执行以下初始化：

1. 从 `sessionStorage` 读取 Access Token；
2. Token 不存在或 JWT 已过期时，调用 `/auth/refresh`；
3. 调用 `/auth/me` 获取服务端确认过的用户信息；
4. 调用 `/system/menu/user` 获取当前用户菜单；
5. dispatch 用户、Token、菜单和权限；
6. 初始化成功后才渲染后台，失败则清理本地认证数据并跳转 `/login`。

`authBootstrapPromise` 用于合并 React StrictMode 或多个组件可能触发的重复初始化，避免同一时刻重复刷新会话。

### 7.4 普通 API 请求与自动续期

所有业务接口都应使用 `src/utils/request.ts` 导出的 Axios 实例：

```text
页面调用 api 函数
  -> 请求拦截器读取 Access Token
  -> 添加 Authorization: Bearer <token>
  -> 后端返回统一 Result
  -> code = 0 时直接把 data 返回给页面
```

如果响应的 HTTP 状态或业务 `code` 为 401：

```text
401
  -> 判断原请求是否已经重试
  -> 调用 POST /auth/refresh
  -> 保存新 Access Token
  -> 重放原请求
  -> 刷新失败时清理认证数据并跳转 /login
```

`refreshPromise` 是一个共享 Promise。多个请求同时 401 时，只有第一个请求真正调用刷新接口，其他请求等待同一个结果，避免 Refresh Token Rotation 下的并发冲突。

### 7.5 退出登录

Navbar 中的退出流程：

1. 调用 `POST /auth/logout`；
2. 后端删除 Refresh 会话、清除 Cookie，并将当前 Access Token 加入黑名单；
3. 无论接口是否成功，前端都清理 `sessionStorage` 和 Redux；
4. 使用 `replace` 返回登录页，避免浏览器后退回受保护页面。

## 8. Redux 状态的作用

`userSlice` 当前维护：

```ts
type UserState = {
  token: string | null;
  userInfo: UserInfo | null;
  menus: DbMenu[];
  permissions: string[];
};
```

- `token`：React 运行期间的 Access Token 状态；
- `userInfo`：当前用户 ID、用户名、角色和服务端权限；
- `menus`：后端返回的树形菜单；
- `permissions`：`setMenus` 时，从所有菜单节点递归提取的 `permission`。

Redux 解决的是“多个组件共享同一份运行期状态”，不是数据库，也不是可靠的身份凭证。刷新后必须重新初始化；前端权限也只能改善交互，不能替代后端授权。

读取和更新示例：

```tsx
const userInfo = useSelector((state: RootState) => state.user.userInfo);
const permissions = useSelector((state: RootState) => state.user.permissions);

dispatch(setMenus(menus));
```

## 9. 统一请求层

接口声明统一放在 `src/api`，页面不要直接创建新的 Axios 实例，也不要自行拼接 Token。

```ts
import request from "@/utils/request";

export type ExampleQuery = {
  keyword?: string;
  page: number;
  pageSize: number;
};

export type ExampleItem = {
  id: number;
  name: string;
};

export function getExampleListApi(params: ExampleQuery) {
  return request.get<ExampleItem[], ExampleItem[]>("/example/list", { params });
}
```

后端统一响应结构为：

```ts
type Result<T> = {
  code: number;
  message: string;
  data: T;
};
```

`request.ts` 会在 `code === 0` 时直接返回 `data`，所以页面拿到的是 `ExampleItem[]`，不是完整的 `Result<ExampleItem[]>`。这也是 Axios 方法目前写两个泛型参数的原因。

登录接口的业务错误会被抛给登录页，由表单上方展示；其他通用业务错误目前会由请求层使用 Ant Design message 展示。

## 10. 菜单、权限和动态路由

### 10.1 菜单类型

`GET /system/menu/user` 返回树形菜单：

| `menuType` | 含义 | 前端行为 |
| --- | --- | --- |
| `0` | 目录 | 显示在侧边栏，不直接生成业务页面路由 |
| `1` | 页面 | 显示在侧边栏，并生成动态路由 |
| `2` | 按钮权限 | 不显示为菜单，权限标识会被收集 |

重要字段：

- `path`：浏览器 URL，例如 `/system/user`；
- `component`：相对于 `src/pages` 的页面目录，例如 `System/UserManagement`；
- `permission`：权限标识，例如 `system:user:list`；
- `icon`：侧边栏图标名称；
- `parentId`：菜单树父节点；
- `orderNum`：同级排序；
- `status`：`1` 启用，`0` 停用。

`path` 和 `component` 是两个不同概念：前者决定 URL，后者决定加载哪个本地文件。

### 10.2 动态路由如何生成

```text
Redux menus
  -> flattenMenus 展平菜单树
  -> 仅保留 status=1 且 menuType=1 的节点
  -> resolvePageComponent(component)
  -> import.meta.glob 匹配 src/pages/**/index.tsx
  -> 生成 React Router RouteObject
```

例如后端返回：

```json
{
  "path": "/system/user",
  "component": "System/UserManagement",
  "menuType": 1
}
```

前端会加载：

```text
src/pages/System/UserManagement/index.tsx
```

匹配不到组件时，控制台会出现 `[router] 页面组件不存在`，页面显示 404。目录大小写应与 `component` 保持一致，不要依赖解析器的首字母兼容逻辑。

### 10.3 菜单同时驱动哪些区域

同一份 Redux `menus` 会同时被以下模块使用：

- `Sidebar`：生成多级侧边栏、选中项和展开项；
- `Navbar`：根据当前 URL 查找父子链并生成面包屑；
- `TagsView`：根据 URL 查找页面名称；
- `dynamicRoutes`：生成真正可访问的页面路由；
- `userSlice`：递归提取权限字符串。

因此菜单字段配置错误可能同时表现为“侧边栏能看到但页面 404”“URL 正确但面包屑不对”或“刷新后选中状态异常”。

## 11. 如何开发一个新页面

下面以“题目分类”为例。

### 第一步：建立页面目录

```text
src/pages/Interview/CategoryManagement/
├─ index.tsx
├─ index.css
└─ components/
   └─ CategoryModal.tsx
```

最小页面：

```tsx
import "./index.css";

export default function CategoryManagement() {
  return <div className="category-page">题目分类</div>;
}
```

页面组件必须 `default export`，因为动态组件解析器会以懒加载默认组件的方式使用它。

### 第二步：创建 API 文件

```ts
// src/api/category.ts
import request from "@/utils/request";

export type Category = {
  id: number;
  name: string;
};

export function getCategoryListApi() {
  return request.get<Category[], Category[]>("/interview/category/list");
}
```

### 第三步：在页面加载数据

```tsx
const [loading, setLoading] = useState(false);
const [data, setData] = useState<Category[]>([]);

const loadData = useCallback(async () => {
  setLoading(true);
  try {
    setData(await getCategoryListApi());
  } finally {
    setLoading(false);
  }
}, []);

useEffect(() => {
  void loadData();
}, [loadData]);
```

开发环境开启了 React StrictMode，初次挂载时 Effect 可能被额外执行一次。读取接口应尽量可重复执行；对新增、删除等写操作，不要放在挂载 Effect 中。

### 第四步：配置后端菜单

在菜单管理中新增页面节点：

```text
菜单类型：页面
路由地址：category
组件路径：Interview/CategoryManagement
权限标识：interview:category:list
上级菜单：面试管理
状态：启用
```

后端返回用户菜单时会把父子路径整理为完整 URL。通常不需要手工修改前端主路由表。

### 第五步：配置权限

如果新增“创建分类”按钮，可添加 `menuType=2` 的按钮权限节点：

```text
interview:category:create
```

页面可以暂时这样判断：

```tsx
const canCreate = useSelector((state: RootState) =>
  state.user.permissions.includes("interview:category:create"),
);
```

后端对应接口仍必须做权限校验。隐藏按钮不是安全控制。

### 第六步：验证

1. 重新登录或刷新，让前端重新请求菜单；
2. 检查 Network 中 `/system/menu/user` 的 `path/component`；
3. 检查侧边栏、面包屑和标签页名称；
4. 直接刷新新页面 URL，确认不会回到 Dashboard；
5. 无权限账号验证菜单和接口授权；
6. 执行 `pnpm lint` 和 `pnpm build`。

## 12. 页面开发约定

- 页面放在 `src/pages`，跨页面组件放在 `src/components`；
- 页面专属弹窗放在页面自己的 `components` 目录；
- API 集中在 `src/api`，不要在 JSX 中散落 URL；
- 公共类型放 `src/types`，只在一个模块使用的类型可与 API 或组件放在一起；
- 主操作按钮复用 `AppButton`，表格行操作使用 Ant Design `Button type="link"`；
- 页面请求使用统一 `request`，不要手写 Authorization；
- 不直接修改 Redux state，只通过 Slice action 更新；
- 菜单 `component` 与实际页面目录严格保持一致；
- 查询、表格、Modal 等复杂页面可参考 `MenuManagement`；
- 提交前至少运行 `pnpm lint` 和 `pnpm build`。

## 13. 常见问题

### 登录成功后又回到登录页

依次检查：

1. 登录响应是否包含 `accessToken`；
2. Application -> Session Storage 是否写入 Token；
3. Application -> Cookies 是否存在 Refresh Cookie；
4. `/auth/me` 是否返回 401；
5. Redis 中登录会话是否存在；
6. 代理是否正确传递 Cookie。

### 刷新后 URL 没变，但内容显示 Dashboard

通常是动态路由尚未从菜单恢复，或路由结构里错误地给所有未匹配子路由渲染了 Dashboard。检查 `RequireAuth` 是否成功写入 menus、当前菜单 `component` 是否能匹配页面，以及 404 子路由是否位于动态路由之后。

### 菜单存在但页面 404

同时检查：

- `path` 是否是预期 URL；
- `component` 是否匹配 `src/pages/**/index.tsx`；
- 目录大小写是否一致；
- 页面入口是否使用默认导出。

### 请求发到了 `localhost:3000`，后端断点没有进入

开发环境看到 Request URL 为 `localhost:3000/api/...` 是正常的，Vite 会做代理。检查 `vite.config.ts` 的 target、rewrite，以及接口是否确实以 `/api` 开头。

### 清空浏览器存储后刷新仍保持登录

如果只清空 Session Storage，但 HttpOnly Refresh Cookie 仍存在，`RequireAuth` 会调用 `/auth/refresh` 恢复登录。这是当前代码的预期行为。要完整模拟未登录状态，应主动调用退出接口，或同时清除该站点 Cookie 和后端 Redis 会话。

### 本地样式短暂闪烁或 Loading 尺寸不正确

确认全局样式在 `main.tsx` 最早引入；布局 Loading 应放在与 `BasicLayout` 同级的位置，页面 Loading 则放在 `AppMain` 内。不要让全屏 Loading 依赖尚未加载完成的页面 CSS。

## 14. 当前实现需要留意的技术债

这些不是启动阻塞项，但后续重构时值得优先处理：

- Axios 从 `sessionStorage` 取 Token，而 Redux 也保存一份 Token，存在双数据源；
- `UserInfo` 同时保存在 `sessionStorage` 和 Redux，应明确哪份只用于首屏占位；
- 请求层使用较宽泛的类型断言，后续可统一封装泛型响应类型；
- 权限字符串已准备好，但缺少统一的 `Permission`/`Can` 组件；
- 标签页尚未持久化，也没有关闭左侧、关闭其他等操作；
- 角色管理和用户管理需要接入真实 API 后才能成为完整功能。

建议先保持功能稳定，再围绕“认证状态单一来源、请求类型安全、权限组件”分阶段重构，避免一次性改动登录、路由和请求三条核心链路。
