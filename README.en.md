# dsh-remote-mcp-manager

A DSH plugin for managing remote and local MCP servers, from both the settings panel and the phone's native UI.

![Downloads](https://img.shields.io/github/downloads/lwy521/dsh-remote-mcp-manager/total?logo=github)

[中文](README.md) | English

## Features

### Native mobile panel (new in v0.4.0)
- Registers an **MCP Manager** native panel via `ctx.dshGo.panel()`, shown in the session tab bar and under "All features"
- Read-only overview: lists every configured MCP server with its connection status and tool count
- Results are cached for 60 seconds to keep the UI responsive
- Panel title follows the system language

### Dedicated settings page (since v0.3.0)
- **MCP Manager**: a top-level page in the settings sidebar
- **Single-card layout**: the server list and the editor form share one card and switch in place, so nothing scrolls out of view
- **Edit in place**: clicking "Edit" turns the card into a form
- **Unsaved-changes guard**: leaving a dirty form opens a modal offering "Save" or "Discard"
- **Themed modal**: matches the card styling in both light and dark themes

### Configuration
- **Remote HTTP MCP**: add a Streamable HTTP MCP server (URL, token, path, timeout)
- **Local process MCP**: launch a stdio MCP server (command, arguments, environment, working directory)
- **Connection test**: remote HTTP servers can be tested live (MCP initialization + `tools/list`)
- **CRUD**: add, edit, and delete configured servers
- **Persistence**: configuration is written to `cordis.patch.yml` and hot-reloaded

## Installation

```bash
dsh plugin add dsh-remote-mcp-manager
```

## Usage

### Managing servers
Open the **MCP Manager** page from the settings sidebar in the DSH Web UI. Existing servers are listed there; click **Edit** to switch that card into its form, where you can test the connection or delete the entry.

### Adding a remote HTTP server
- **Server name**: unique identifier, letters, digits, underscore and hyphen only, 1–32 characters
- **URL**: MCP server endpoint
- **API key / token**: optional authentication
- **Path**: optional URL path
- **Timeout**: optional, defaults to 60000 ms

### Adding a local process server
- **Server name**: same rules as above
- **Command**: executable path (for example `node`, `python`, `npx`)
- **Arguments**: one per line
- **Environment**: one `KEY=VALUE` per line
- **Working directory**: optional

## Transport types

| Type | Protocol | Description |
|------|----------|-------------|
| Remote HTTP | `streamable-http` | Connects to a remote MCP server |
| Local process | `stdio` | Spawns a local MCP subprocess |

## Changelog

### v0.4.1
- **Fix: incomplete npm package** — the `files` field omitted `cordis.patch.yml`, `icon.png` and `icon@2x.png`, so the plugin failed to load when installed from npm
- **Added: `publishConfig`** — pins publishing to the official registry and declares public access

### v0.4.0
- **Added: native mobile panel** — registers a `mcp-manager` panel showing each server's connection status and tool count
- **Added: localization** — ships `locale/zh.json` and `locale/en.json`; titles follow the system language
- **Added: plugin icons** — `icon.png` and `icon@2x.png`
- **Changed: unified plugin identifier** — renamed from `remote-mcp-manager` to `dsh-remote-mcp-manager` to match the package name
- **Fix: `cordis.patch.yml` was not tracked** — this file is required for the plugin to load and had been excluded by `.gitignore`, so a fresh clone could not load the plugin
- **Improved: server name validation** — enforces `[A-Za-z0-9_-]{1,32}` and rejects duplicates
- **Improved: explicit client injections** — client modules are now declared explicitly, avoiding load-order problems

> **Upgrade note**: the plugin identifier changed. When upgrading from v0.3.x, remove the old
> `remote-mcp-manager` in the plugin manager, then install `dsh-remote-mcp-manager`.
> Back up any MCP configuration previously written to `cordis.patch.yml`.

### v0.3.1
- **Fix: token lost after update** — front end and back end now serialize the token field consistently
- **Fix: connection test hanging** — HTTP requests use a 15-second timeout (`AbortController`)
- **Fix: save button not working** — added the save callback, guarded against saving on first load, surfaced error messages
- **Fix: stronger form validation** — server name format check, duplicate detection, rejects non-ASCII names
- **Fix: stdio options dropped** — `toolCallTimeoutMs` and `failOnStartupError` are read and written correctly
- **Fix: patch file recovery** — a file with only a begin marker and no end marker is repaired instead of failing silently
- **Security** — CSRF same-origin check, 2 MB request body limit, no duplicate header writes on error
- **UX** — save failures and form errors are shown, empty loads ignored, path joining fixed

### v0.3.0
- Top-level settings page: promoted from a card inside the "Plugins" page to its own settings page
- Merged card: the list and the create/edit form share one card, switched by a `mode` state
- Edit in place: clicking "Edit" turns the card into the form
- Unsaved-changes guard: a custom modal asks whether to save before leaving
- Sidebar label: renamed to "MCP Manager"

### v0.2.0
- Added stdio transport support (local process MCP)
- Replaced the native select with a custom dropdown
- Configurable timeout
- Session ID passthrough (`MCP-Session-Id`)

## License
![License](https://img.shields.io/badge/License-GPLv3-blue.svg)

## Version
![Version](https://img.shields.io/github/v/release/lwy521/dsh-remote-mcp-manager?logo=github)
