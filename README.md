# dsh-remote-mcp-manager

DSH Web GUI 插件：在设置面板中管理远程/本地 MCP 服务器。

## 功能

- **HTTP 远程 MCP**：添加远程 Streamable HTTP MCP Server（URL、Token、Path、超时时间）
- **本地进程 MCP**：通过 stdio 启动本地 MCP Server（命令、参数、环境变量、工作目录）
- **测试连接**：HTTP 远程 MCP 支持实时测试连接（MCP 协议初始化 + tools/list）
- **CRUD 管理**：添加、编辑、删除已配置的 MCP Server
- **持久化**：配置写入 `cordis.patch.yml`，支持热重载
- **自定义下拉组件**：传输类型选择器，支持深色/浅色主题自适应

## 安装

```bash
dsh plugin add dsh-remote-mcp-manager
```

## 使用

在 DSH Web GUI 的设置页面中找到「远程 MCP 管理」卡片，可：

### 管理配置
查看已添加的 MCP Server，测试连接、编辑、删除

### 新建配置（HTTP 远程）
- Server 名称：唯一标识，禁止使用中文
- URL：MCP 服务器地址
- API Key / Token：可选，认证信息
- Path：可选，URL 路径
- 超时：可选，默认 60000ms

### 新建配置（本地进程）
- Server 名称：唯一标识，禁止使用中文
- 命令：可执行文件路径（如 `node.exe`、`python`、`npx`）
- 参数：每行一个参数
- 环境变量：每行 `KEY=VALUE`
- 工作目录：可选

## 传输类型

| 类型 | 协议 | 说明 |
|---|---|---|
| HTTP 远程 | `streamable-http` | 连接远程 MCP 服务器 |
| 本地进程 | `stdio` | 本地启动子进程 MCP |