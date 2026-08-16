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

function readManagedServers(patchPath) {
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
	} catch {
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
			config.toolCallTimeoutMs = 120000;
			config.failOnStartupError = false;
		} else {
			config = {
				serverName: s.serverName,
				transport: "streamable-http",
				url: s.url
			};
			if (s.path) config.path = s.path;
			const token = (s.token || "").trim();
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

function updatePatchFile(patchPath, servers) {
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
	if (start !== -1 && end !== -1) {
		// Replace the managed block entirely
		text = text.slice(0, start) + newBlock + text.slice(end + MANAGED_END.length);
	} else {
		// Append managed block at the end
		const trimmed = text.endsWith("\n") ? text : text + "\n";
		text = trimmed + "\n" + newBlock;
	}
	writeFileSync(patchPath, text, "utf8");
}

function collectBody(req) {
	return new Promise((resolve, reject) => {
		const chunks = [];
		req.on("data", (chunk) => chunks.push(chunk));
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
				const servers = readManagedServers(patchPath);
				res.writeHead(200, { "content-type": "application/json" });
				res.end(JSON.stringify({ servers }));
				return;
			}

			if (req.method === "POST") {
				const body = await collectBody(req);
				let data;
				try {
					data = JSON.parse(body);
				} catch {
					res.writeHead(400);
					res.end("invalid JSON");
					return;
				}
				const servers = Array.isArray(data.servers) ? data.servers : [];
				const patchPath = getPatchPath(ctx);
				updatePatchFile(patchPath, servers);
				res.writeHead(200, { "content-type": "application/json" });
				res.end(JSON.stringify({ ok: true }));
				return;
			}

			res.writeHead(405);
			res.end("method not allowed");
		} catch (err) {
			ctx.logger?.warn("[remote-mcp-manager] route error: " + (err.message || err));
			res.writeHead(500);
			res.end("internal error");
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