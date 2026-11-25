中文 | [English](README.en.md)

# dsh-remote-mcp-manager 

DSH 插件：在 **dsh-go 手机 App 的设置页** 与 DSH Web 设置面板里管理远程 MCP 服务器

![下载量](https://img.shields.io/github/downloads/lwy521/dsh-remote-mcp-manager/total?logo=github)
![许可证](https://img.shields.io/badge/License-GPLv3-blue.svg)
![版本号](https://img.shields.io/github/v/release/lwy521/dsh-remote-mcp-manager?logo=github)
<a href="https://github.com/ccch1mneyyy/dsh-go/stargazers"><img alt="GitHub Star 数" src="https://img.shields.io/github/stars/lwy521/dsh-remote-mcp-manager?style=flat-square&logo=github&label=Star&color=4B67B4&labelColor=2B3245"></a>

<p align="center">
<sub>有问题可以先看<a href="README.md">使用指南</a>遇到问题欢迎来</sub><br>
<sub>
<a href="https://qm.qq.com/q/n8IIExyQb6">QQ 群:1098700583</a></sub><br></p>

## 兼容 DSH 宿主版本（重要）

本插件的 `engines.dsh` 是：

```json
">=0.2.1-rc.2 <0.3.0-0 || >=0.2.3-alpha.0 <0.3.0-0"
```

为什么写这么长：npm 的 `semver` 有一条容易踩的规则 —— **只要范围里出现 prerelease，就只有 `major.minor.patch` 三段完全相同的 prerelease 才参与比较**。

| 写法 | `0.2.3-alpha.2` 是否满足 | 说明 |
| --- | --- | --- |
| `>=0.2.1-rc.2 <0.3.0-0` | **否** | 只认 `0.2.1-*` 的预发布 |
| `>=0.2.1-rc.2` | **否** | 去掉上界也没用，规则不变 |
| `>=0.2.1-rc.2 <0.4.0-0` | **否** | 上界放宽同样不解决 |
| `>=0.2.1-rc.2 <0.3.0-0 || >=0.2.3-alpha.0 <0.3.0-0` | **是** | 显式补一段同三段预发布区间 |

DSH 启动时会对每个 bundle 做这项校验，不满足就**跳过加载**（`skippedBundles` 里能看到原因），外观表现是「装上了但功能不出现」。以后适配新的 alpha / rc 宿主时，把对应三段补进 `||` 后面即可。

### 0.5.1 修正

- `package.json` 补回顶层 `icon` 字段 —— **npm 上的 0.5.0 发布于该修复之前**，装 0.5.0 的宿主不会显示插件图标

- `engines.dsh` 增加 `|| >=0.2.3-alpha.0 <0.3.0-0`，可在 0.2.3-alpha.x 宿主上正常加载
- `dsh.client.inject` 移除 `@deepseek-ai/dsh-client-runtime` 与 `@deepseek-ai/dsh-client-ui-slots`（新宿主已不含这两个包；`client-modules` 对缺失的 inject 会静默忽略，但留着会误导）

## 兼容 dsh-go 手机 App

- 手机装 dsh-go（≥ 1.0.2），装上本插件后会在 **设置 → MCP管理** 出现一个原生页面
- 页面由 App 按插件 schema 自动生成：每个服务是一个可展开的对象，点开就是名字/启用/自动测速/地址/协议/密钥/描述/超时 八项 + 「删除这个服务」
- 最下面一行 **添加服务** 只有一个字段，填服务名就会自动追加一个完整槽位，填满继续增长
- 不依赖原生面板（`contributes.panels` 已移除），所以不受 App 面板摆放位置限制

## 功能

### 设置页对象表单（v0.5.0）
- 每个 MCP 服务 = 一个可展开的对象槽位，标题直接显示服务名（`mcp-gateway`、`Firecrawl`…）
- 点开就是完整表单：服务名 / 启用服务 / 自动测速 / 地址 / 协议（左右滑动选 streamable-http、sse、stdio）/ 密钥 / 描述 / 超时
- **删除这个服务**：打开后该槽位被清空、服务停止挂载
- 最后一行是 **添加服务**，只有一个字段「填写新配置服务名」；填了就自动追加一个完整槽位，填满继续增长，**不限条数**
- 服务名留空只填地址时，插件会向该地址握手取 `serverInfo.name` 自动补名
- 整页可编辑，改完离开即保存，不再有「由配置文件固定」的只读状态

### 设置侧边栏一级页面（v0.3.0）
- **MCP管理**：设置侧边栏新增「MCP管理」一级页面
- **单个卡片集成**：配置列表和编辑/新建表单合并为单个卡片，通过状态切换
- **编辑即切换**：点击列表中的「编辑」按钮，卡片就地切换为编辑表单
- **未保存提示**：表单有修改时点击「返回」弹出自定义弹窗
- **自定义弹窗**：与卡片主题风格一致的模态对话框，支持深色/浅色主题

### 配置管理
- **HTTP 远程 MCP**：添加远程 Streamable HTTP MCP Server（URL、Token、Path、超时时间）
- **本地进程 MCP**：通过 stdio 启动本地 MCP Server（命令、参数、环境变量、工作目录）
- **测试连接**：HTTP 远程 MCP 支持实时测试连接（MCP 协议初始化 + tools/list）
- **CRUD 管理**：添加、编辑、删除已配置的 MCP Server
- **持久化**：配置写入 `cordis.patch.yml`，支持热重载

## 安装

```bash
dsh plugin add dsh-remote-mcp-manager
```

## 使用

### 管理配置
在 DSH Web GUI 的设置侧边栏找到「MCP管理」页面，查看已添加的 MCP Server，
点击「编辑」就地切换到编辑表单，可测试连接、删除。

### 新建配置（HTTP 远程）
- Server 名称：唯一标识，仅允许字母、数字、下划线和连字符，长度 1–32
- URL：MCP 服务器地址
- API Key / Token：可选，认证信息
- Path：可选，URL 路径
- 超时：可选，默认 60000ms

### 新建配置（本地进程）
- Server 名称：同上
- 命令：可执行文件路径（如 `node`、`python`、`npx`）
- 参数：每行一个参数
- 环境变量：每行 `KEY=VALUE`
- 工作目录：可选

## 传输类型

| 类型 | 协议 | 说明 |
|------|------|------|
| HTTP 远程 | `streamable-http` | 连接远程 MCP 服务器 |
| 本地进程 | `stdio` | 本地启动子进程 MCP |

## 变更记录

### v0.4.1
- **修复：npm 包内容不完整** — `files` 字段未包含 `cordis.patch.yml`、`icon.png`、`icon@2x.png`，
  从 npm 安装后插件无法加载
- **新增：`publishConfig`** — 固定发布到官方 registry 并声明 public

### v0.4.0
- **新增：手机端原生面板** — 注册 `mcp-manager` 原生面板，展示各 MCP Server 的连通状态与工具数
- **新增：国际化** — 提供 `locale/zh.json`、`locale/en.json`，标题与描述跟随系统语言
- **新增：插件图标** — 附带 `icon.png` / `icon@2x.png`
- **变更：插件标识统一** — 由 `remote-mcp-manager` 改为 `dsh-remote-mcp-manager`，与包名一致
- **修复：`cordis.patch.yml` 未入库** — 该文件是插件加载的必需配置，此前被 `.gitignore` 排除，导致克隆后无法加载
- **增强：serverName 校验** — 强制 `[A-Za-z0-9_-]{1,32}` 格式并检测重名
- **增强：客户端注入明确** — 显式声明依赖的 client 模块，避免加载顺序问题

> **升级注意**：插件标识已变更。从 v0.3.x 升级时，请在插件管理器中移除旧的
> `remote-mcp-manager`，再安装 `dsh-remote-mcp-manager`。
> `cordis.patch.yml` 中此前写入的 MCP 配置建议先备份。

### v0.3.1
- **修复：更新后 token 丢失** — 前后端 token 字段序列化一致，不再丢失 API Key
- **修复：测试连接阻塞** — HTTP 请求添加 15 秒超时（AbortController），避免测试卡死
- **修复：保存按钮失效** — 增加保存回调、首次加载防误存、错误提示展示
- **修复：表单校验增强** — 增加 serverName 格式校验、重名检测、中文名称禁止
- **修复：stdio 属性丢失** — `toolCallTimeoutMs` 和 `failOnStartupError` 正确读写透传
- **修复：patch 文件损坏恢复** — 只含 begin 无 end 标记时自动修复，不再静默失败
- **安全增强** — CSRF 同源校验、请求体大小上限 2MB、错误不重复写头
- **体验优化** — 保存失败/表单错误提示展示、忽略空加载数据、路径拼接修复

### v0.3.0
- 设置侧边栏一级页面：从「插件」设置页内卡片提升为独立设置页面
- 合并卡片：管理配置列表和编辑/新建表单合并为单个卡片，`mode` 状态切换
- 编辑即切换：点击列表中「编辑」按钮，卡片就地切换为编辑表单
- 未保存提示：自定义模态弹窗，表单有修改时提示保存/不保存
- 侧边栏标签：改为「MCP管理」

### v0.2.0
- 添加 stdio 传输支持（本地进程 MCP）
- 自定义下拉组件替代原生 select
- 超时时间配置
- 会话 ID 透传支持（MCP-Session-Id）

## 更新日志

- **v0.5.0** — 设置页改成对象槽位表单（服务名作标题、点开即完整字段、删除开关、添加服务不限条数）；移除只读原生面板
