// dsh-remote-mcp-manager —— 一个包同时提供手机原生面板和 Web 设置页。
// 配置持久化在 profile 的 cordis.patch.yml（managed 标记块，insert mcp-client），
// 保存后 HMR 自动重载，工具随之注册；
// 手机端面板直接编辑同一份配置：改字段 → 保存 → 写回 → 重载，全程不跳网页。
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import * as yaml from 'js-yaml'
import z from '@deepseek-ai/schemastery'
import * as McpClient from '@deepseek-ai/dsh-mcp-client'

export const name = 'dsh-remote-mcp-manager'
export const inject = []

// 插件配置（App 原生设置页按这份 schema 生成表单）

// 服务清单用 dict（键值表）暴露给 App：array 只要有一条元素 App 就把整页判成
// “由配置文件固定”而只读；dict 有元素照样能增删，是唯一能做真表单的类型。
// 键 = 服务名，值 = “地址[|令牌][|off]”，off/0/false/停用 表示不启用。

// 每个服务 = 一个对象字段：App 会把它展开成一整组字段（名字/地址/协议/密钥/开关…）
const ServiceObj = z.object({
  name: z.string().default('').description('服务名'),
  on: z.boolean().default(true).description('启用服务'),
  autoProbe: z.boolean().default(true).description('自动测速'),
  url: z.string().max(2048).default('').description('地址'),
  protocol: z.union([
    z.const('streamable-http'),
    z.const('sse'),
    z.const('stdio'),
  ]).default('streamable-http').description('协议'),
  token: z.string().max(4096).default('').description('密钥'),
  desc: z.string().max(2000).default('').description('描述'),
  timeoutMs: z.number().min(1000).max(60000).step(500).default(15000).description('超时（毫秒）'),
  remove: z.boolean().default(false).description('删除这个服务'),
})

// 槽位标题：加载时读出该槽位当前的服务名，直接拿名字当标题（改完名字重载一次即更新）
function slotTitlesFromPatch() {
  try {
    const home = process.env.DSH_HOME || path.join(os.homedir(), '.dsh')
    const file = path.join(home, 'profiles', 'web', 'cordis.patch.yml')
    const text = fs.readFileSync(file, 'utf8')
    const at = text.indexOf('- id: dsh-remote-mcp-manager')
    if (at < 0) return {}
    const nxt = text.indexOf('\n- ', at + 1)
    const end = nxt < 0 ? text.length : nxt
    const arr = yaml.load(text.slice(at, end))
    const parsed = (Array.isArray(arr) ? arr[0] : arr) || {}
    const cfg = parsed.config || {}
    const out = { names: {}, maxKey: 0 }
    for (let i = 1; i <= 64; i++) {
      const o = cfg['server' + i]
      if (o === undefined || o === null) continue
      out.maxKey = i
      const nm = o && typeof o === 'object' ? String(o.name || '').trim() : ''
      if (nm) out.names[i] = nm
    }
    return out
  } catch { return { names: {}, maxKey: 0 } }
}

// 槽位数量按现有服务自动增长：已用到的最大槽位 + 1 个空位（至少 4 个），填满会继续长
const slotInfo = slotTitlesFromPatch()
const slotTitles = slotInfo.names
const SLOT_INDEXES = Object.keys(slotTitles).map(Number).sort(function (a, b) { return a - b })
const MAX_SLOT = Math.max(0, slotInfo.maxKey, ...SLOT_INDEXES)

const slotFields = {}
for (const i of SLOT_INDEXES) {
  slotFields['server' + i] = ServiceObj.default({}).volatile().description(slotTitles[i])
}
// 新增位：只显示一个名字字段，填了就会追加一个完整服务槽位
slotFields.newServer = z.object({
  name: z.string().max(32).default('').description('填写新配置服务名'),
}).default({}).volatile().description('添加服务')

export const Config = z.object({
  ...slotFields,
})

// 文案：中文优先，英文界面回退
const L = {
  title: ['MCP 管理', 'MCP Manager'],
  summary: [(en, n, t) => `共 ${t} 个服务 · 启用 ${n}`, (en, n, t) => `${t} servers · ${n} on`],
  empty: ['还没有配置服务，点下面的「新增服务」', 'No servers yet — tap Add server'],
  more: (n) => [`还有 ${n} 条未显示，请到网页版编辑`, `${n} more hidden — edit in Web UI`],
  saveAll: ['保存全部', 'Save all'],
  editTitle: ['编辑 MCP 服务', 'Edit MCP server'],
  editHint: ['改完点「保存全部」写入并重载；名称只允许字母、数字、下划线、短横', 'Save all to write and reload; name allows letters, digits, _ -'],
  noSelection: ['没有选中条目，回列表点一条', 'Nothing selected — pick one in the list'],
  notFound: ['没找到这一条', 'Row not found'],
  listHint: ['编辑请到：设置 → MCP管理（原生表单）；这里只显示状态', 'Edit in Settings → MCP Manager; status only'],
  hint: ['改完点「保存全部」写入并自动生效；一屏最多 6 条', 'Edit, then Save all — applies on save; up to 6 per screen'],
  probing: ['测式中', 'Probing'],
  ok: (ms) => `正常·${ms}ms`,
  bad: (ms) => `异常·${ms}ms`,
  fEnabled: ['启用', 'On'],
  fTransport: ['传输', 'Transport'],
  fName: ['名称', 'Name'],
  fUrl: ['地址', 'URL'],
  fToken: ['Token', 'Token'],
  fTokenHint: ['留空表示不带鉴权', 'Empty for no auth'],
  test: ['测试连接', 'Test'],
  del: ['删除', 'Delete'],
  add: ['新增服务', 'Add server'],
  goSettings: ['去设置编辑', 'Edit in Settings'],
  reload: ['重新载入', 'Reload'],
  stdio: ['stdio 型服务请到网页版编辑', 'stdio servers: edit in Web UI'],
  savedToast: ['已保存并生效', 'Saved and applied'],
  addedToast: ['已新增一条，填好再保存', 'Added — fill it in and save'],
  deletedToast: ['已删除', 'Deleted'],
  badName: ['名称只能字母数字下划线短横', 'Name: letters, digits, _ - only'],
  dupName: ['名称重复了', 'Duplicate name'],
  noInput: ['没读到输入，点一下输入框再保存', 'No input read — tap a field and retry'],
  optTransport: ['streamable-http', 'sse'],
}
const zh = (caps) => !caps || !caps.locale || String(caps.locale).startsWith('zh')
const pick = (caps, pair) => Array.isArray(pair) ? (zh(caps) ? pair[0] : pair[1]) : pair


// 发布版：不再内置任何服务与凭据。
// 服务由用户在 设置 → MCP管理 里自行添加（每个服务一个对象槽位）。
const DEFAULT_SERVERS = []

// —— 独立存储：完整服务清单（真源）——
function storePath() {
  const home = process.env.DSH_HOME || path.join(os.homedir(), '.dsh')
  return path.join(home, 'dsh-go', 'mcp-manager.servers.json')
}

function normServer(x) {
  const s = x && typeof x === 'object' ? x : {}
  const name = String(s.serverName || '').trim()
  if (!/^[A-Za-z0-9_-]{1,32}$/.test(name)) return null
  return {
    serverName: name,
    enabled: s.enabled !== false,
    transport: s.transport === 'stdio' ? 'stdio' : 'streamable-http',
    url: String(s.url || '').slice(0, 2048),
    token: String(s.token || '').slice(0, 4096),
    command: String(s.command || '').slice(0, 2048),
  }
}

function loadStore(logger) {
  const p = storePath()
  try {
    const raw = fs.readFileSync(p, 'utf8')
    const data = JSON.parse(raw)
    const list = Array.isArray(data) ? data : (Array.isArray(data?.servers) ? data.servers : [])
    return list.map(normServer).filter(Boolean)
  } catch (err) {
    if (err?.code !== 'ENOENT') logger?.warn?.('[mcp-manager] 读取服务清单失败: ' + (err.message || err))
    return null
  }
}

function saveStore(servers, logger) {
  const p = storePath()
  try {
    fs.mkdirSync(path.dirname(p), { recursive: true })
    const body = JSON.stringify({ version: 1, servers }, null, 2) + '\n'
    const tmp = p + '.tmp-' + process.pid
    fs.writeFileSync(tmp, body, 'utf8')
    fs.renameSync(tmp, p)
    return true
  } catch (err) {
    logger?.warn?.('[mcp-manager] 写入服务清单失败: ' + (err.message || err))
    return false
  }
}

// 「地址[|令牌][|off]」→ 服务项
function parseDictValue(name, raw) {
  const text = String(raw == null ? '' : raw).trim()
  const parts = text.split(/[|｜]/).map((x) => x.trim())
  const url = parts[0] || ''
  let token = ''
  let enabled = true
  for (let i = 1; i < parts.length; i++) {
    const v = parts[i]
    if (!v) continue
    if (/^(off|0|false|no|停用|禁用)$/i.test(v)) enabled = false
    else if (!token) token = v
  }
  return normServer({ serverName: name, enabled, transport: 'streamable-http', url, token })
}

// 服务项 → 「地址[|令牌][|off]」
function dictValueOf(s) {
  const bits = [String(s.url || '')]
  if (s.token) bits.push(String(s.token))
  if (s.enabled === false) bits.push('off')
  return bits.join(' | ')
}

// 读 App 设置页的对象槽位（name 为空的槽位 = 未使用，相当于「添加服务」）
function dictFromConfig(cfgVal, config) {
  const out = []
  for (const i of SLOT_INDEXES) {
    const o = cfgVal(config?.['server' + i], {}) || {}
    if (o.remove === true) continue
    const name = String(o.name || '').trim()
    if (!name) continue
    const item = normServer({
      serverName: name,
      enabled: o.on !== false,
      transport: o.protocol || 'streamable-http',
      url: o.url || '',
      token: o.token || '',
    })
    if (item) {
      item.autoProbe = o.autoProbe !== false
      item.desc = o.desc || ''
      item.timeoutMs = Number(o.timeoutMs) || 15000
      out.push(item)
    }
  }
  return out
}

// 把清单写回 profile patch 的对象槽位
function syncDictToPatch(patchFile, servers, logger) {
  try {
    const text = fs.readFileSync(patchFile, 'utf8')
    const at = text.indexOf('- id: dsh-remote-mcp-manager')
    if (at < 0) return false
    const nxt = text.indexOf('\n- ', at + 1)
    const end = nxt < 0 ? text.length : nxt
    const arr = yaml.load(text.slice(at, end))
    const parsed = (Array.isArray(arr) ? arr[0] : arr) || {}
    const cfg = { ...(parsed.config || {}) }
    for (const k of Object.keys(cfg)) if (/^server\d+$/.test(k)) delete cfg[k]
    for (let i = 1; i <= servers.length; i++) {
      const s = servers[i - 1]
      if (!s) continue
      cfg['server' + i] = {
        name: s.serverName,
        on: s.enabled !== false,
        autoProbe: s.autoProbe !== false,
        url: s.url || '',
        protocol: s.transport || 'streamable-http',
        token: s.token || '',
        desc: s.desc || '',
        timeoutMs: Number(s.timeoutMs) || 15000,
      }
    }
    const dumped = yaml.dump([{ id: parsed.id, name: parsed.name, config: cfg }], { lineWidth: 1000, noRefs: true })
    const tmp = patchFile + '.tmp-' + process.pid
    fs.writeFileSync(tmp, text.slice(0, at) + dumped + text.slice(end), 'utf8')
    fs.renameSync(tmp, patchFile)
    return true
  } catch (err) {
    logger?.warn?.('[mcp-manager] 同步设置页字段失败: ' + (err.message || err))
    return false
  }
}

// 向服务地址握手，取服务端自报的名字（serverInfo.name）
async function probeServerName(url, token, timeoutMs = 8000) {
  if (!url) return ''
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' }
  const t = String(token || '').trim()
  if (t) headers.Authorization = t.startsWith('Bearer ') ? t : `Bearer ${t}`
  try {
    const res = await fetch(url, {
      method: 'POST', headers,
      body: JSON.stringify({
        jsonrpc: '2.0', id: 1, method: 'initialize',
        params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'dsh-remote-mcp-manager', version: '2' } },
      }),
      signal: controller.signal,
    })
    if (!res.ok) return ''
    const text = await res.text()
    const m = text.match(/"serverInfo"\s*:\s*\{[^}]*?"name"\s*:\s*"([^"]{1,60})"/)
    return m ? m[1].trim() : ''
  } catch { return '' } finally { clearTimeout(timer) }
}

// 把探测到的真名写回 patch 的指定槽位
function writeSlotName(patchFile, slot, realName, logger) {
  try {
    const text = fs.readFileSync(patchFile, 'utf8')
    const at = text.indexOf('- id: dsh-remote-mcp-manager')
    if (at < 0) return false
    const nxt = text.indexOf('\n- ', at + 1)
    const end = nxt < 0 ? text.length : nxt
    const arr = yaml.load(text.slice(at, end))
    const parsed = (Array.isArray(arr) ? arr[0] : arr) || {}
    const cfg = { ...(parsed.config || {}) }
    const key = 'server' + slot
    const cur = cfg[key] && typeof cfg[key] === 'object' ? { ...cfg[key] } : {}
    if (String(cur.name || '').trim()) return false
    cur.name = realName
    cfg[key] = cur
    const dumped = yaml.dump([{ id: parsed.id, name: parsed.name, config: cfg }], { lineWidth: 1000, noRefs: true })
    const tmp = patchFile + '.tmp-' + process.pid
    fs.writeFileSync(tmp, text.slice(0, at) + dumped + text.slice(end), 'utf8')
    fs.renameSync(tmp, patchFile)
    logger?.info?.('[mcp-manager] 槽位 ' + slot + ' 自动取到服务名: ' + realName)
    return true
  } catch (err) {
    logger?.warn?.('[mcp-manager] 写回服务名失败: ' + (err.message || err))
    return false
  }
}

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
  // 2) 扫描 profiles，找写了本插件配置条目的那个
  for (const dir of profileDirs()) {
    const p = path.join(dir, 'cordis.patch.yml')
    try {
      if (fs.readFileSync(p, 'utf8').includes('- id: dsh-remote-mcp-manager')) return p
    } catch { /* 忽略 */ }
  }
  // 3) 默认 web profile
  const home = process.env.DSH_HOME || path.join(os.homedir(), '.dsh')
  return path.join(home, 'profiles', 'web', 'cordis.patch.yml')
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
        params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'dsh-remote-mcp-manager', version: '2' } },
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

// —— 展平表单回传值（宽容几种形状，键名去掉 data./values./form. 前缀）——
function flattenValue(value) {
  const flat = {}
  const walk = (v, prefix, depth) => {
    if (depth > 6 || v == null) return
    if (Array.isArray(v)) {
      v.forEach((item, i) => walk(item, prefix ? `${prefix}.${i}` : String(i), depth + 1))
      return
    }
    if (typeof v === 'object') {
      for (const [k, val] of Object.entries(v)) walk(val, prefix ? `${prefix}.${k}` : k, depth + 1)
      return
    }
    if (prefix) flat[prefix] = v
  }
  walk(value, '', 0)
  const out = {}
  for (const [k, v] of Object.entries(flat)) {
    const key = String(k).replace(/^data\./, '').replace(/^(values?|fields?|form)\./, '')
    out[key] = v
  }
  return out
}

function asBool(v, fallback) {
  if (typeof v === 'boolean') return v
  if (typeof v === 'string') {
    if (/^(false|0|off|no)$/i.test(v)) return false
    if (/^(true|1|on|yes)$/i.test(v)) return true
  }
  return fallback
}

export function apply(ctx, config) {
  const patchFile = findPatchFile(ctx)
  const logger = ctx.logger
  // volatile 字段在运行时是 Ref，用 .get() 取值
  const cfgVal = (v, fb) => {
    try {
      const x = v && typeof v.get === 'function' ? v.get() : v
      return x === undefined || x === null ? fb : x
    } catch { return fb }
  }
  const autoProbe = cfgVal(config?.autoProbe, true) !== false
  const probeTimeoutMs = Math.max(1000, Math.min(30000, Number(cfgVal(config?.probeTimeoutMs, 8000)) || 8000))

  // 服务来源：App 设置页的 dict 字段是真源（谁在 App 里改就以它为准）；
  // 独立 JSON 是同步副本 + 超出表单能力时的补充。
  const fromDict = dictFromConfig(cfgVal, config)
  const stored = loadStore(logger)
  let cfgServers
  if (fromDict.length) {
    cfgServers = fromDict
    saveStore(cfgServers, logger)
  } else if (Array.isArray(stored) && stored.length) {
    cfgServers = stored
    syncDictToPatch(patchFile, cfgServers, logger)
  } else {
    cfgServers = DEFAULT_SERVERS.map(normServer).filter(Boolean)
    saveStore(cfgServers, logger)
    syncDictToPatch(patchFile, cfgServers, logger)
  }
  // 新增位：填了名字就追加一个完整服务槽位（其余字段全默认）
  const newName = String((cfgVal(config?.newServer, {}) || {}).name || '').trim()
  if (newName && /^[A-Za-z0-9_-]{1,32}$/.test(newName)) {
    setImmediate(() => {
      try {
        const text = fs.readFileSync(patchFile, 'utf8')
        const at = text.indexOf('- id: dsh-remote-mcp-manager')
        if (at < 0) return
        const nxt = text.indexOf('\n- ', at + 1)
        const end = nxt < 0 ? text.length : nxt
        const arr = yaml.load(text.slice(at, end))
        const parsed = (Array.isArray(arr) ? arr[0] : arr) || {}
        const cfg = { ...(parsed.config || {}) }
        const taken = Object.keys(cfg).some(function (k) {
          return /^server\d+$/.test(k) && cfg[k] && String(cfg[k].name || '').trim() === newName
        })
        if (!taken) {
          let slot = 1
          while (cfg['server' + slot] !== undefined) slot++
          cfg['server' + slot] = {
            name: newName, on: true, autoProbe: true, url: '',
            protocol: 'streamable-http', token: '', desc: '', timeoutMs: 15000, remove: false,
          }
        }
        cfg.newServer = { name: '' }
        const dumped = yaml.dump([{ id: parsed.id, name: parsed.name, config: cfg }], { lineWidth: 1000, noRefs: true })
        const tmp = patchFile + '.tmp-' + process.pid
        fs.writeFileSync(tmp, text.slice(0, at) + dumped + text.slice(end), 'utf8')
        fs.renameSync(tmp, patchFile)
        logger?.info?.('[mcp-manager] 新增服务槽位: ' + newName)
      } catch (err) {
        logger?.warn?.('[mcp-manager] 新增槽位失败: ' + (err.message || err))
      }
    })
  }

  // 名字空、地址有的槽位：向服务端要真名并写回（写回会触发一次重载，之后就稳定）
  ;(async () => {
    try {
      for (const i of SLOT_INDEXES) {
        const o = cfgVal(config?.['server' + i], {}) || {}
        if (String(o.name || '').trim()) continue
        if (!String(o.url || '').trim()) continue
        const real = await probeServerName(o.url, o.token, probeTimeoutMs)
        if (real) writeSlotName(patchFile, i, real, logger)
      }
    } catch { /* 探测失败不影响启动 */ }
  })()

  // 打开「删除这个服务」的槽位：清空该槽位并重载
  const pendingRemove = []
  for (const i of SLOT_INDEXES) {
    const o = cfgVal(config?.['server' + i], {}) || {}
    if (o.remove === true) pendingRemove.push(i)
  }
  if (pendingRemove.length) {
    setImmediate(() => {
      try {
        const text = fs.readFileSync(patchFile, 'utf8')
        const at = text.indexOf('- id: dsh-remote-mcp-manager')
        if (at < 0) return
        const nxt = text.indexOf('\n- ', at + 1)
        const end = nxt < 0 ? text.length : nxt
        const arr = yaml.load(text.slice(at, end))
        const parsed = (Array.isArray(arr) ? arr[0] : arr) || {}
        const cfg = { ...(parsed.config || {}) }
        for (const i of pendingRemove) {
          cfg['server' + i] = {
            name: '', on: true, autoProbe: true, url: '',
            protocol: 'streamable-http', token: '', desc: '', timeoutMs: 15000, remove: false,
          }
        }
        const dumped = yaml.dump([{ id: parsed.id, name: parsed.name, config: cfg }], { lineWidth: 1000, noRefs: true })
        const tmp = patchFile + '.tmp-' + process.pid
        fs.writeFileSync(tmp, text.slice(0, at) + dumped + text.slice(end), 'utf8')
        fs.renameSync(tmp, patchFile)
        logger?.info?.('[mcp-manager] 已删除槽位: ' + pendingRemove.join(','))
      } catch (err) {
        logger?.warn?.('[mcp-manager] 删除槽位失败: ' + (err.message || err))
      }
    })
  }

  if (cfgServers.length) {
    for (const item of cfgServers) {
      if (!item || !item.serverName || item.enabled === false) continue
      const token = String(item.token || '').trim()
      const headers = token ? { Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}` } : {}
      const cfg = item.transport === 'stdio'
        ? { transport: 'stdio', serverName: item.serverName, command: item.command || '', args: [], env: {}, cwd: '' }
        : { transport: 'streamable-http', serverName: item.serverName, url: item.url || '', headers }
      try { ctx.plugin(McpClient, cfg) } catch (err) {
        logger?.warn?.('[mcp-manager] 挂载 ' + item.serverName + ' 失败: ' + (err?.message || err))
      }
    }
  }

  // 编辑统一在 设置 → MCP管理（App 按对象槽位展开成完整表单）+ 插件自带网页设置页

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
            res.end(JSON.stringify({ servers: cfgServers, readonly: false }))
            return
          }

          if (method === 'POST') {
            // 网页设置页保存：写回 profile patch 里本插件条目的 config.servers
            const body = await readBody(req)
            let data = {}
            try { data = JSON.parse(body || '{}') } catch { data = {} }
            const servers = Array.isArray(data.servers) ? data.servers : null
            if (!servers) {
              res.writeHead(400, { 'content-type': 'application/json' })
              res.end(JSON.stringify({ ok: false, error: 'servers 必须是数组' }))
              return
            }
            const badName = servers.find((x) => !x || !/^[A-Za-z0-9_-]{1,32}$/.test(String(x.serverName || '')))
            if (badName) {
              res.writeHead(400, { 'content-type': 'application/json' })
              res.end(JSON.stringify({ ok: false, error: '服务名只能字母数字下划线短横' }))
              return
            }
            try {
              const clean = servers.map(normServer).filter(Boolean)
              if (!saveStore(clean, logger)) throw Error('写独立 JSON 失败')
              syncDictToPatch(patchFile, clean, logger)
            } catch (err) {
              res.writeHead(500, { 'content-type': 'application/json' })
              res.end(JSON.stringify({ ok: false, error: '写入失败: ' + (err.message || err) }))
              return
            }
            res.writeHead(200, { 'content-type': 'application/json' })
            res.end(JSON.stringify({ ok: true, note: '已写入服务清单，重启引擎后生效' }))
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

  // 手机端不再注册面板：编辑统一在 App 设置页（原生 schema 表单）
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
