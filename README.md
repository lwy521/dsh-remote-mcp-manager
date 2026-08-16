# dsh-remote-mcp-manager

DSH 插件：远程 MCP 服务器管理器。

在 DSH Web GUI 设置面板中配置和管理远程 MCP Server，支持添加、编辑、删除、测试连接，连接后工具自动注册到 DSH。

## 安装

`ash
dsh plugin add dsh-remote-mcp-manager
`

## 使用

在 DSH Web GUI 的设置页面中找到「远程 MCP 管理」卡片，可：

- **管理配置**：查看已添加的 MCP Server，测试连接、编辑、删除
- **新建配置**：添加新的远程 MCP Server（名称、URL、Token、Path）

## 功能

- 远程 MCP Server 的 CRUD 管理
- 实时测试连接（MCP 协议初始化 + tools/list）
- 配置文件通过 cordis.patch.yml 持久化，支持热重载
- 遵循 DSH 插件规范，使用 settings.plugin.item slot
