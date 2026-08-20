//#region src/index.ts
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import * as yaml from "js-yaml";

const name = "remote-mcp-manager";
const inject = ["webServer"];

const MANAGED_BEGIN = "# === remote-mcp-manager managed ===\n";
const MANAGED_END = "# === remote-mcp-manager end ===\n";

function getPatchPath(ctx) {
	const base = ctx.baseUrl ? fileURLToPath(ctx.baseUrl) : process.cwd();
	return join(base, "cordis.patch.yml");
}

function readManagedServers(patchPath, logger) {
	try {
		const text = readFileSync(patchPath, "utf8");
		const start = text.indexOf(MANAGED_BEGIN);
		if (start === -1) return [];
		const end = text.indexOf(MANAGED_END, start);
		if (end === -1) return [];
		const yamlText = text.slice(start + MANAGED_BEGIN.length, end);
		const data = yaml.load(yamlText);
		if (!Array.isArray(data)) return [];
		const servers = [];
		for (const patch of data) {
			if (patch && Array.isArray(patch.insert)) {
				for (const entry of patch.insert) {
					if (entry.config && entry.config.serverName) {
						const cfg = entry.config;
						const s = {
							serverName: cfg.serverName,
							transport: cfg.transport || "streamable-http"
						};
						if (cfg.transport === "stdio") {
							s.command = cfg.command || "";
							s.args = Array.isArray(cfg.args) ? cfg.args : [];
							s.env = cfg.env || {};
							s.cwd = cfg.cwd || "";
							s.toolCallTimeoutMs = cfg.toolCallTimeoutMs ?? 120000;
							s.failOnStartupError = cfg.failOnStartupError ?? false;
						} else {
							s.url = cfg.url || "";
							s.path = cfg.path || "";
							s.token = cfg.headers && cfg.headers.Authorization
								? String(cfg.headers.Authorization)
								: "";
							s.toolCallTimeoutMs = cfg.toolCallTimeoutMs || 60000;
						}
						servers.push(s);
					}
				}
			}
		}
		return servers;
	} catch (err) {
		logger?.warn("[remote-mcp-manager] read managed servers failed: " + (err.message || err));
		return [];
	}
}

function buildManagedYaml(servers) {
	const entries = servers.map((s) => {
		const isStdio = s.transport === "stdio";
		let config;
		if (isStdio) {
			config = {
				serverName: s.serverName,
				transport: "stdio",
				command: s.command
			};
			if (Array.isArray(s.args) && s.args.length > 0) config.args = s.args;
			if (s.env && Object.keys(s.env).length > 0) config.env = s.env;
			if (s.cwd) config.cwd = s.cwd;
			config.toolCallTimeoutMs = s.toolCallTimeoutMs ?? 120000;
			config.failOnStartupError = s.failOnStartupError ?? false;
		} else {
			config = {
				serverName: s.serverName,
				transport: "streamable-http",
				url: s.url
			};
			if (s.path) config.path = s.path;
			const token = String(s.token || (s.headers && s.headers.Authorization) || "").trim();
			if (token) {
				config.headers = { Authorization: token };
			}
			if (s.toolCallTimeoutMs) config.toolCallTimeoutMs = s.toolCallTimeoutMs;
		}
		return {
			id: "remote-mcp-" + s.serverName.replace(/[^a-zA-Z0-9_-]/g, "_"),
			name: "@deepseek-ai/dsh-mcp-client",
			config
		};
	});
	if (entries.length === 0) return "";
	const patchContent = entries.map((e) => yaml.dump([{ insert: [e] }], { lineWidth: 120, noRefs: true, quotingType: '"' }).trim()).join("\n");
	return MANAGED_BEGIN + patchContent + "\n" + MANAGED_END;
}

function updatePatchFile(patchPath, servers, logger) {
	const newBlock = buildManagedYaml(servers);
	let text;
	try {
		text = readFileSync(patchPath, "utf8");
	} catch {
		text = "# Your patch layer for this dsh profile, applied after every bundle layer:\n" +
			"# a top-level YAML array of loader patch entries (id-targeted config\n" +
			"# overrides, disables, and insert lists; `!!js` expressions allowed).\n\n";
	}
	const start = text.indexOf(MANAGED_BEGIN);
	const end = text.indexOf(MANAGED_END);
	if (start !== -1 && end !== -1 && start < end) {
		// 完整标记块:整体替换
		text = text.slice(0, start) + newBlock + text.slice(end + MANAGED_END.length);
	} else if (start !== -1) {
		// 只有 begin 无 end:文件损坏,清理残缺块后重建
		logger?.warn("[remote-mcp-manager] managed block has begin but no end, repairing");
		text = text.slice(0, start).replace(/\n+$/, "") + "\n\n" + newBlock;
	} else {
		// 无标记块:末尾追加
		const trimmed = text.endsWith("\n") ? text : text + "\n";
		text = trimmed + "\n" + newBlock;
	}
	writeFileSync(patchPath, text, "utf8");
}

// 同源校验:浏览器跨站请求必带 Origin,无 Origin 视为本地脚本放行;有 Origin 则比对 host 防止 CSRF
function isLocalRequest(req) {
	const host = req.headers.host;
	const origin = req.headers.origin;
	if (!origin) return true;
	try { return new URL(origin).host === host; } catch { return false; }
}

// 请求体大小上限(字节),防止内存耗尽 DoS
const MAX_BODY = 2 * 1024 * 1024;

function collectBody(req) {
	return new Promise((resolve, reject) => {
		const chunks = [];
		let size = 0;
		req.on("data", (chunk) => {
			size += chunk.length;
			if (size > MAX_BODY) {
				const err = new Error("payload too large");
				err.code = "PAYLOAD_TOO_LARGE";
				req.destroy();
				reject(err);
				return;
			}
			chunks.push(chunk);
		});
		req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
		req.on("error", reject);
	});
}

function createHandler(ctx) {
	return async (req, res) => {
		try {
			const url = new URL(req.url ?? "/", "http://x");
			const path = url.pathname.replace(/\/+$/, "") || "/";

			if (path !== "/remote-mcp-manager" && path !== "/remote-mcp-manager/") {
				res.writeHead(404);
				res.end("not found");
				return;
			}

			if (req.method === "GET") {
				const patchPath = getPatchPath(ctx);
				const servers = readManagedServers(patchPath, ctx.logger);
				res.writeHead(200, { "content-type": "application/json" });
				res.end(JSON.stringify({ servers }));
				return;
			}

			if (req.method === "POST") {
				// 同源校验(CSRF 防护)
				if (!isLocalRequest(req)) {
					res.writeHead(403);
					res.end("forbidden");
					return;
				}
				let body;
				try {
					body = await collectBody(req);
				} catch (err) {
					if (err && err.code === "PAYLOAD_TOO_LARGE") {
						res.writeHead(413);
						res.end("payload too large");
						return;
					}
					throw err;
				}
				let data;
				try {
					data = JSON.parse(body);
				} catch {
					res.writeHead(400);
					res.end("invalid JSON");
					return;
				}
				const servers = Array.isArray(data.servers) ? data.servers : [];
				// serverName 校验:非空 + 禁止非 ASCII(防 id 冲突);禁止重名(防 id 冲突)
				const names = [];
				for (const s of servers) {
					if (!s || typeof s.serverName !== "string" || !s.serverName) {
						res.writeHead(400); res.end("invalid serverName"); return;
					}
					if (!/^[a-zA-Z0-9_-]+$/.test(s.serverName)) {
						res.writeHead(400); res.end("serverName must match [a-zA-Z0-9_-]+"); return;
					}
					if (names.includes(s.serverName)) {
						res.writeHead(400); res.end("duplicate serverName"); return;
					}
					if (s.toolCallTimeoutMs !== undefined && s.toolCallTimeoutMs !== null &&
						!(typeof s.toolCallTimeoutMs === "number" && s.toolCallTimeoutMs > 0)) {
						res.writeHead(400); res.end("invalid toolCallTimeoutMs"); return;
					}
					names.push(s.serverName);
				}
				const patchPath = getPatchPath(ctx);
				updatePatchFile(patchPath, servers, ctx.logger);
				res.writeHead(200, { "content-type": "application/json" });
				res.end(JSON.stringify({ ok: true }));
				return;
			}

			res.writeHead(405);
			res.end("method not allowed");
		} catch (err) {
			ctx.logger?.warn("[remote-mcp-manager] route error: " + (err.message || err));
			if (!res.headersSent) {
				res.writeHead(500);
				res.end("internal error");
			}
		}
	};
}

function apply(ctx, config) {
	ctx.webServer.register({
		kind: "prefix",
		path: "/remote-mcp-manager",
		handler: createHandler(ctx)
	});
}
//#endregion
export { apply, inject, name };