中文 | [English](README.en.md)

# dsh-remote-mcp-manager 

DSH 插件:设置面板与手机原生界面上管理远程MCP 服务器

![下载量](https://img.shields.io/github/downloads/lwy521/dsh-remote-mcp-manager/total?logo=github)
![许可证](https://img.shields.io/badge/License-GPLv3-blue.svg)
![版本号](https://img.shields.io/github/v/release/lwy521/dsh-remote-mcp-manager?logo=github)
<a href="https://github.com/ccch1mneyyy/dsh-go/stargazers"><img alt="GitHub Star 数" src="https://img.shields.io/github/stars/lwy521/dsh-remote-mcp-manager?style=flat-square&logo=github&label=Star&color=4B67B4&labelColor=2B3245"></a>

<p align="center">
<sub>有问题可以先看<a href="docs/guide/README.md">使用指南</a>遇到问题欢迎来</sub><br>
<sub>
<a href="https://qm.qq.com/q/n8IIExyQb6">QQ 群:1098700583</a></sub><br></p>

## 功能

### 手机端原生面板（v0.4.0 新增）
- 通过 `ctx.dshGo.panel()` 注册 **MCP 管理** 原生面板，出现在会话标签页与「全部功能」
- 只读信息面板：列出所有已配置的 MCP Server，显示连通状态与工具数量
- 结果缓存 60 秒，避免频繁探测拖慢界面
- 中英文标题跟随系统语言

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
