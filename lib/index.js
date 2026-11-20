// dsh-remote-mcp-manager —— 一个包同时提供手机原生面板和 Web 设置页。
// 配置持久化在 profile 的 cordis.patch.yml（managed 标记块，insert mcp-client），
// 保存后 HMR 自动重载，工具随之注册；手机端面板读同一份配置并显示状态。
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import * as yaml from 'js-yaml'

export const name = 'dsh-remote-mcp-manager'
export const inject = []

// 文案：中文优先，英文界面回退
const L = {
  title: ['MCP 管理', 'MCP Manager'],
  summary: [(en, n, t) => `服务状态: 已启用 ${n}/${t} 服务`, (en, n, t) => `Status: ${n}/${t} enabled`],
  empty: ['服务状态: 还没有配置服务', 'Status: no servers configured'],
  hint: ['提示: 编辑请到网页【设置 → MCP管理】', 'Tip: edit in Web UI → Settings → MCP Manager'],
  probing: ['测式中', 'Probing'],
  ok: (ms) => `正常·${ms}ms`,
  bad: (ms) => `异常·${ms}ms`,
}
const zh = (caps) => !caps || !caps.locale || String(caps.locale).startsWith('zh')
const pick = (caps, pair) => zh(caps) ? pair[0] : pair[1]

const MANAGED_BEGIN = '# === dsh-remote-mcp-manager managed ===\n'
const MANAGED_END = '# === dsh-remote-mcp-manager end ===\n'

// —— 定位 profile 的 cordis.patch.yml ——
function profileDirs() {
  const home = process.env.DSH_HOME || path.join(os.homedir(), '.dsh')
  const base = path.join(home, 'profiles')
  try {
    return fs.readdirSync(base).map(n => path.join(base, n)).filter(d => {
      try { return fs.statSync(d).isDirectory() } catch { return false }
    })
  } catch {
    return []
  }
}

function findPatchFile(ctx) {
  // 1) 插件自己声明的 baseUrl（Cordis 会指向 profile 目录）
  if (ctx?.baseUrl) {
    try {
      const p = path.join(new URL(ctx.baseUrl).pathname, 'cordis.patch.yml')
      if (fs.existsSync(p)) return p
    } catch { /* 忽略 */ }
  }
  // 2) 扫描 profiles，找含有本插件 managed 块的那个
  for (const dir of profileDirs()) {
    const p = path.join(dir, 'cordis.patch.yml')
    try {
      if (fs.readFileSync(p, 'utf8').includes(MANAGED_BEGIN)) return p
    } catch { /* 忽略 */ }
  }
  // 3) 默认 web profile
  const home = process.env.DSH_HOME || path.join(os.homedir(), '.dsh')
  return path.join(home, 'profiles', 'web', 'cordis.patch.yml')
}

// —— 读配置 ——
function readServers(patchFile, logger) {
  try {
    const text = fs.readFileSync(patchFile, 'utf8')
    const start = text.indexOf(MANAGED_BEGIN)
    if (start === -1) return []
    const end = text.indexOf(MANAGED_END, start)
    if (end === -1) return []
    const data = yaml.load(text.slice(start + MANAGED_BEGIN.length, end))
    if (!Array.isArray(data)) return []
    const out = []
    for (const patch of data) {
      if (!patch || !Array.isArray(patch.insert)) continue
      for (const entry of patch.insert) {
        const cfg = entry?.config
        if (!cfg || !cfg.serverName) continue
        const s = {
          id: entry.id || ('remote-mcp-' + cfg.serverName),
          serverName: cfg.serverName,
          transport: cfg.transport || 'streamable-http',
          enabled: cfg.enabled !== false,
        }
        if (cfg.transport === 'stdio') {
          s.command = cfg.command || ''
          s.args = Array.isArray(cfg.args) ? cfg.args : []
          s.env = cfg.env && typeof cfg.env === 'object' ? cfg.env : {}
          s.cwd = cfg.cwd || ''
        } else {
          s.url = cfg.url || ''
          const auth = cfg.headers && cfg.headers.Authorization
          s.token = auth ? String(auth).replace(/^Bearer\s+/i, '') : ''
        }
        out.push(s)
      }
    }
    return out
  } catch (err) {
    logger?.warn?.('[mcp-manager] 读取配置失败: ' + (err.message || err))
    return []
  }
}

// —— 写配置（原子替换）——
function writeServers(patchFile, servers, logger) {
  const entries = servers.map((s) => {
    const cfg = {
      serverName: s.serverName,
      transport: s.transport || 'streamable-http',
    }
    if (s.transport === 'stdio') {
      cfg.command = s.command || ''
      if (Array.isArray(s.args) && s.args.length) cfg.args = s.args
      if (s.env && Object.keys(s.env).length) cfg.env = s.env
      if (s.cwd) cfg.cwd = s.cwd
    } else {
      let u = s.url || ''
      // mcp-client 0.2.2 没有 path 字段，路径拼进 url 才有效
      if (u && s.path) {
        const pp = String(s.path).replace(/^\/+/, '').replace(/\/+$/, '')
        if (pp) u = u.replace(/\/+$/, '') + '/' + pp
      }
      cfg.url = u
      const token = String(s.token || '').trim()
      if (token) cfg.headers = { Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}` }
    }
    return {
      id: 'remote-mcp-' + String(s.serverName).replace(/[^a-zA-Z0-9_-]/g, '_'),
      name: '@deepseek-ai/dsh-mcp-client',
      config: cfg,
    }
  })
  const block = entries.length
    ? MANAGED_BEGIN + entries.map(e => yaml.dump([{ insert: [e] }], { lineWidth: 120, noRefs: true }).trim()).join('\n') + '\n' + MANAGED_END
    : MANAGED_BEGIN + MANAGED_END

  let text
  try { text = fs.readFileSync(patchFile, 'utf8') } catch { text = '' }

  const start = text.indexOf(MANAGED_BEGIN)
  const end = text.indexOf(MANAGED_END)
  if (start !== -1 && end !== -1 && start < end) {
    text = text.slice(0, start) + block + text.slice(end + MANAGED_END.length)
  } else if (start !== -1) {
    logger?.warn?.('[mcp-manager] managed 块只有开头没有结尾，已修复')
    text = text.slice(0, start).replace(/\n+$/, '') + '\n\n' + block
  } else {
    const trimmed = text.endsWith('\n') ? text : text + '\n'
    text = trimmed + '\n' + block
  }

  // 先写临时文件再 rename，避免 HMR 读到半截
  const tmp = patchFile + '.tmp-' + process.pid
  fs.writeFileSync(tmp, text, 'utf8')
  fs.renameSync(tmp, patchFile)
  return true
}

// —— 测试连接（服务端代理，避免浏览器 CORS）——
function parseToolCount(text) {
  const tryJson = (s) => { try { return JSON.parse(s) } catch { return null } }
  let data = tryJson(text)
  if (!data) {
    const line = String(text).split('\n').find(l => l.startsWith('data:'))
    if (line) data = tryJson(line.slice(5).trim())
  }
  const tools = data && data.result && data.result.tools
  return Array.isArray(tools) ? tools.length : -1
}

async function testServer(server, timeoutMs = 15000) {
  const startedAt = Date.now()
  const cost = () => Date.now() - startedAt
  if (!server) return { ok: false, text: '没有选中的服务器', ms: cost() }
  if (server.transport === 'stdio') return { ok: false, text: '本地进程配置不支持远程测试' }
  if (!server.url) return { ok: false, text: '这条没填地址' }
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' }
  const token = String(server.token || '').trim()
  if (token) headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`
  try {
    const res = await fetch(server.url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        jsonrpc: '2.0', id: 1, method: 'initialize',
        params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'dsh-remote-mcp-manager', version: '1' } },
      }),
      signal: controller.signal,
    })
    if (!res.ok) return { ok: false, text: `连不上：HTTP ${res.status}`, ms: cost() }
    const initText = await res.text()
    if (!initText.includes('serverInfo')) return { ok: false, text: '连上了，但响应不像 MCP' }

    const sid = res.headers.get('mcp-session-id') || res.headers.get('Mcp-Session-Id') || ''
    const next = { ...headers }
    if (sid) next['Mcp-Session-Id'] = sid
    await fetch(server.url, {
      method: 'POST', headers: next,
      body: JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }),
      signal: controller.signal,
    }).catch(() => undefined)

    const listed = await fetch(server.url, {
      method: 'POST', headers: next,
      body: JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list' }),
      signal: controller.signal,
    })
    if (!listed.ok) return { ok: false, text: '连接正常，但取工具列表失败' }
    const n = parseToolCount(await listed.text())
    return { ok: true, text: n >= 0 ? `连接正常 · ${n} 个工具` : '连接正常', tools: n, ms: cost() }
  } catch (err) {
    return { ok: false, text: '连不上：' + String(err?.message || err).slice(0, 80), ms: cost() }
  } finally {
    clearTimeout(timer)
  }
}

export function apply(ctx) {
  const patchFile = findPatchFile(ctx)
  const logger = ctx.logger

  // —— Web 端：设置页路由 ——
  ctx.inject(['webServer'], (ctx) => {
    ctx.webServer.register({
      kind: 'prefix',
      path: '/remote-mcp-manager',
      handler: async (req, res) => {
        try {
          const url = new URL(req.url ?? '/', 'http://x')
          const p = url.pathname.replace(/\/+$/, '') || '/'

          if (p !== '/remote-mcp-manager' && p !== '/remote-mcp-manager/') {
            res.writeHead(404); res.end('not found'); return
          }
          const method = req.method || 'GET'

          if (method === 'GET') {
            res.writeHead(200, { 'content-type': 'application/json' })
            res.end(JSON.stringify({ servers: readServers(patchFile, logger) }))
            return
          }

          if (method === 'POST') {
            // 同源校验：跨站请求必带 Origin，比对 host 防止 CSRF
            const origin = req.headers.origin
            if (origin) {
              try { if (new URL(origin).host !== req.headers.host) { res.writeHead(403); res.end('forbidden'); return } }
              catch { res.writeHead(403); res.end('forbidden'); return }
            }
            const action = url.searchParams.get('action') || 'save'
            if (action === 'test') {
              const body = await readBody(req)
              let server = null
              try { server = JSON.parse(body || '{}') } catch { /* 忽略 */ }
              const r = await testServer(server)
              res.writeHead(r.ok ? 200 : 502, { 'content-type': 'application/json' })
              res.end(JSON.stringify(r))
              return
            }
            const body = await readBody(req)
            let data
            try { data = JSON.parse(body || '{}') } catch {
              res.writeHead(400); res.end('invalid JSON'); return
            }
            const servers = Array.isArray(data.servers) ? data.servers : []
            const names = []
            for (const s of servers) {
              if (!s || typeof s.serverName !== 'string' || !s.serverName) {
                res.writeHead(400); res.end('invalid serverName'); return
              }
              if (!/^[A-Za-z0-9_-]{1,32}$/.test(s.serverName)) {
                res.writeHead(400); res.end('serverName 需匹配 [A-Za-z0-9_-]{1,32}'); return
              }
              if (names.includes(s.serverName)) {
                res.writeHead(400); res.end('serverName 重复'); return
              }
              names.push(s.serverName)
            }
            try {
              writeServers(patchFile, servers, logger)
            } catch (err) {
              res.writeHead(500); res.end('写入失败: ' + (err.message || err)); return
            }
            res.writeHead(200, { 'content-type': 'application/json' })
            res.end(JSON.stringify({ ok: true }))
            return
          }

          res.writeHead(405); res.end('method not allowed')
        } catch (err) {
          logger?.warn?.('[mcp-manager] 路由错误: ' + (err.message || err))
          if (!res.headersSent) { res.writeHead(500); res.end('internal error') }
        }
      },
    })
  })

  // —— 手机端：只读信息面板 ——
  ctx.inject(['dshGo'], (ctx) => {
    const toolCache = new Map()
    const TOOL_TTL = 60_000

    const probe = async (s) => {
      const hit = toolCache.get(s.serverName)
      if (hit && Date.now() - hit.at < TOOL_TTL) return hit
      let r = { tools: -1, ms: 0, ok: false }
      try { r = await testServer(s, 8000) } catch { r = { tools: -1, ms: 0, ok: false } }
      const out = { tools: r.tools ?? -1, ms: r.ms ?? 0, ok: !!r.ok, at: Date.now() }
      toolCache.set(s.serverName, out)
      return out
    }

    ctx.dshGo.panel('mcp-manager', {
      view: (scope, caps) => ({
        v: 2,
        type: 'stack',
        title: pick(caps, L.title),
        children: [
          { type: 'callout', tone: 'info', text: { $: 'data.summary' } },
          { type: 'list', items: { $: 'data.items' } },
          { type: 'text', text: { $: 'data.hint' }, tone: 'muted' },
        ],
      }),
      data: (scope, emit, caps) => {
        const render = () => {
          const servers = readServers(patchFile, logger)
          const enabled = servers.length
          const items = servers.map(s => {
            const c = toolCache.get(s.serverName)
            let trailing
            if (!c) trailing = pick(caps, L.probing)
            else if (c.ok) trailing = L.ok(c.ms)
            else trailing = L.bad(c.ms)
            return {
              title: s.serverName,
              trailing,
              tone: c && c.ok ? 'good' : 'bad',
            }
          })
          emit({
            summary: servers.length
              ? pick(caps, L.summary)(zh(caps), enabled, servers.length)
              : pick(caps, L.empty),
            hint: pick(caps, L.hint),
            items,
          })
        }
        render()
        // 只在面板打开时测一轮，避免后台持续发请求
        void (async () => {
          for (const s of readServers(patchFile, logger)) await probe(s)
          render()
        })()
        return () => {}
      },
    })
  })
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on('data', c => {
      size += c.length
      if (size > 2 * 1024 * 1024) { reject(new Error('payload too large')); req.destroy(); return }
      chunks.push(c)
    })
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}
