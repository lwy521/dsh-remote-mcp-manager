window.__ModuleLoader__.load({
	id: "dsh-remote-mcp-manager",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		var React = require("react");

		// ── inject CSS ──
		var css = "\n.remoteMcpCard {\n  border: 1px solid var(--dsw-alias-border-l2);\n  background: var(--dsw-alias-bg-layer-3);\n  border-radius: 12px;\n  list-style: none;\n  transition: border-color 0.16s, background 0.16s;\n  overflow: hidden;\n}\n\n.remoteMcpCard:hover {\n  border-color: var(--dsw-alias-label-dimmed);\n}\n\n.remoteMcpCardOpen {\n  background: var(--dsw-alias-bg-layer-2);\n  border-color: var(--dsw-alias-label-dimmed);\n}\n\n.remoteMcpHeader {\n  appearance: none;\n  width: 100%;\n  font: inherit;\n  color: inherit;\n  text-align: left;\n  cursor: pointer;\n  background: transparent;\n  border: 0;\n  border-radius: 12px;\n  align-items: center;\n  gap: 12px;\n  padding: 14px 16px;\n  display: flex;\n}\n\n.remoteMcpHeader:focus-visible {\n  outline: 2px solid var(--dsw-alias-brand-primary);\n  outline-offset: -2px;\n}\n\n.remoteMcpHeadText {\n  flex-direction: column;\n  flex: 1;\n  gap: 4px;\n  min-width: 0;\n  display: flex;\n}\n\n.remoteMcpName {\n  color: var(--dsw-alias-label-primary);\n  font-size: 15px;\n  font-weight: 600;\n  line-height: 1.4;\n}\n\n.remoteMcpDescription {\n  color: var(--dsw-alias-label-tertiary);\n  font-size: 13px;\n  line-height: 1.5;\n}\n\n.remoteMcpChevron {\n  color: var(--dsw-alias-label-tertiary);\n  flex: none;\n  transition: transform 0.16s;\n}\n\n.remoteMcpChevronOpen {\n  transform: rotate(180deg);\n}\n\n.remoteMcpBody {\n  border-top: 1px solid var(--dsw-alias-border-l2);\n  margin: 0 16px;\n  padding: 12px 0 8px;\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n}\n\n.remoteMcpFooter {\n  border-top: 1px solid var(--dsw-alias-border-l2);\n  justify-content: flex-end;\n  align-items: center;\n  gap: 8px;\n  padding: 12px 0 4px;\n  display: flex;\n}\n\n.remoteMcpLabel {\n  color: var(--dsw-alias-label-primary);\n  font-size: 13px;\n  font-weight: 500;\n  line-height: 1.5;\n}\n\n.remoteMcpField {\n  flex-direction: column;\n  gap: 6px;\n  padding: 12px 0;\n  display: flex;\n}\n\n.remoteMcpField + .remoteMcpField {\n  border-top: 1px solid var(--dsw-alias-border-l1);\n  padding-top: 10px;\n}\n\n.remoteMcpInput {\n  border: 1px solid var(--dsw-alias-border-l2);\n  background: var(--dsw-alias-bg-layer-3);\n  color: var(--dsw-alias-label-primary);\n  border-radius: 8px;\n  height: 34px;\n  padding: 0 12px;\n  font-size: 13px;\n  line-height: 1.5;\n  font: inherit;\n  width: 460px;\n  max-width: 100%;\n  outline: none;\n}\n\n.remoteMcpInput:focus-visible {\n  border-color: var(--dsw-alias-brand-primary);\n  outline: none;\n}\n\n.remoteMcpSave {\n  appearance: none;\n  font: inherit;\n  cursor: pointer;\n  border: 1px solid transparent;\n  border-radius: 8px;\n  padding: 6px 14px;\n  font-size: 13px;\n  line-height: 1.5;\n  background: var(--dsw-alias-button-info-fill);\n  color: var(--dsw-alias-label-primary-foreground);\n  font-weight: 600;\n}\n\n.remoteMcpSave:hover:not(:disabled) {\n  background: var(--dsw-alias-button-info-hover);\n}\n\n.remoteMcpSave:disabled {\n  opacity: 0.4;\n  cursor: default;\n}\n\n.remoteMcpTest {\n  appearance: none;\n  font: inherit;\n  cursor: pointer;\n  border: 1px solid var(--dsw-alias-border-l2);\n  border-radius: 8px;\n  padding: 5px 12px;\n  font-size: 12px;\n  line-height: 1.5;\n  background: transparent;\n  color: var(--dsw-alias-label-primary);\n}\n\n.remoteMcpTest:hover:not(:disabled) {\n  background: var(--dsw-alias-interactive-bg-hover);\n}\n\n.remoteMcpTest:disabled {\n  opacity: 0.7;\n  cursor: default;\n}\n\n.remoteMcpDelete {\n  appearance: none;\n  font: inherit;\n  cursor: pointer;\n  border: 1px solid var(--dsw-alias-state-error-border, #fecaca);\n  border-radius: 8px;\n  padding: 5px 12px;\n  font-size: 12px;\n  line-height: 1.5;\n  background: transparent;\n  color: var(--dsw-alias-state-error, #dc2626);\n}\n\n.remoteMcpDelete:hover:not(:disabled) {\n  background: var(--dsw-alias-state-error-soft, #fef2f2);\n}\n\n.remoteMcpEmpty {\n  padding: 24px 18px;\n  text-align: center;\n  color: var(--dsw-alias-label-tertiary);\n  font-size: 13px;\n  border: 1px dashed var(--dsw-alias-border-l2);\n  border-radius: 8px;\n}\n\n.remoteMcpServerItem {\n  border: 1px solid var(--dsw-alias-border-l2);\n  border-radius: 8px;\n  padding: 12px;\n  background: var(--dsw-alias-bg-layer-3);\n}\n\n.remoteMcpServerRow {\n  justify-content: space-between;\n  align-items: center;\n  gap: 12px;\n  display: flex;\n}\n\n.remoteMcpServerTitle {\n  color: var(--dsw-alias-label-primary);\n  font-size: 13px;\n  font-weight: 600;\n  line-height: 1.4;\n}\n\n.remoteMcpServerUrl {\n  color: var(--dsw-alias-label-tertiary);\n  font-size: 12px;\n  line-height: 1.5;\n  margin-top: 2px;\n  word-break: break-all;\n}\n\n.remoteMcpActions {\n  align-items: center;\n  gap: 6px;\n  display: inline-flex;\n}\n";
		var cssId = "dsh-remote-mcp-manager/card.css";
		if (typeof document !== "undefined" && !document.querySelector("style[data-plugin-css=\"" + cssId + "\"]")) {
			var tag = document.createElement("style");
			tag.dataset.pluginCss = cssId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}

		// ── helpers ──
		function loadServers(cb) {
			fetch("/remote-mcp-manager", { method: "GET" })
				.then(function (r) { return r.json(); })
				.then(function (d) {
					var list = Array.isArray(d.servers) ? d.servers : [];
					cb(list.map(function (s) {
						var h = {};
						if (s.token) h.Authorization = s.token;
						return { serverName: s.serverName, url: s.url, headers: h, path: s.path || "" };
					}));
				})
				.catch(function () { cb([]); });
		}
		function saveServers(servers) {
			var p = servers.map(function (s) {
				var t = s.headers && s.headers.Authorization ? s.headers.Authorization : (s.token || "");
				return { serverName: s.serverName, url: s.url, token: t, path: s.path || "" };
			});
			fetch("/remote-mcp-manager", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ servers: p })
			}).catch(function () {});
		}
		function parseSSE(t) {
			var msgs = [], cur = null;
			(t || "").split(/\r?\n/).forEach(function (l) {
				if (l.startsWith("data:")) { cur = (cur === null ? "" : cur) + l.slice(5).trim(); }
				else if (l === "" && cur !== null) { try { msgs.push(JSON.parse(cur)); } catch (e) {} cur = null; }
			});
			if (cur !== null) try { msgs.push(JSON.parse(cur)); } catch (e) {}
			return msgs;
		}
		function truncateUrl(full) {
			if (full.length <= 36) return full;
			try { var u = new URL(full); return u.protocol + "//" + u.hostname; } catch (e) { return full; }
		}
		async function mcpRequest(url, method, body, headers) {
			var r = await fetch(url, {
				method: method,
				headers: Object.assign({ "Content-Type": "application/json", Accept: "application/json, text/event-stream" }, headers || {}),
				body: JSON.stringify(body)
			});
			var text = await r.text(), parsed;
			try { parsed = JSON.parse(text); } catch (e) {
				var msgs = parseSSE(text), rpc = null;
				for (var i = 0; i < msgs.length; i++) { if (msgs[i] && msgs[i].jsonrpc) { rpc = msgs[i]; break; } }
				parsed = rpc || { raw: text };
			}
			var rh = {};
			r.headers.forEach(function (v, k) { rh[k] = v; });
			return { status: r.status, data: parsed, headers: rh };
		}
		async function testConnection(server) {
			var url = new URL(server.url);
			if (server.path) url.pathname = server.path.replace(/^\//, "").replace(/\/$/, "");
			var init = await mcpRequest(url.toString(), "POST", {
				jsonrpc: "2.0", id: 1, method: "initialize",
				params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "dsh-remote-mcp", version: "0.1.0" } }
			}, server.headers || {});
			if (init.data.error) throw new Error(init.data.error.message || JSON.stringify(init.data.error));
			var sid = init.headers["mcp-session-id"] || init.headers["Mcp-Session-Id"] || init.data["mcp-session-id"] || init.data["Mcp-Session-Id"];
			var tools = await mcpRequest(url.toString(), "POST", {
				jsonrpc: "2.0", id: 2, method: "tools/list", params: {}
			}, Object.assign({}, server.headers || {}, sid ? { "Mcp-Session-Id": sid } : {}));
			if (tools.data.error) throw new Error(tools.data.error.message || JSON.stringify(tools.data.error));
			return tools.data.result && tools.data.result.tools || [];
		}

		// ── chevron SVG ──
		function Chevron(props) {
			return React.createElement("svg", { width: "14", height: "14", viewBox: "0 0 14 14", fill: "none", xmlns: "http://www.w3.org/2000/svg", className: props.className },
				React.createElement("path", { d: "M11.8486 5.5L11.4238 5.92383L8.69727 8.65137C8.44157 8.90706 8.21562 9.13382 8.01172 9.29785C7.79912 9.46883 7.55595 9.61756 7.25 9.66602C7.08435 9.69222 6.91565 9.69222 6.75 9.66602C6.44405 9.61756 6.20088 9.46883 5.98828 9.29785C5.78438 9.13382 5.55843 8.90706 5.30273 8.65137L2.57617 5.92383L2.15137 5.5L3 4.65137L3.42383 5.07617L6.15137 7.80273C6.42595 8.07732 6.59876 8.24849 6.74023 8.3623C6.87291 8.46904 6.92272 8.47813 6.9375 8.48047C6.97895 8.48703 7.02105 8.48703 7.0625 8.48047C7.07728 8.47813 7.12709 8.46904 7.25977 8.3623C7.40124 8.24849 7.57405 8.07732 7.84863 7.80273L10.5762 5.07617L11 4.65137L11.8486 5.5Z", fill: "currentColor" })
			);
		}

		// ── reusable card wrapper ──
		function Card(props) {
			var _a = React.useState(false), open = _a[0], setOpen = _a[1];
			return React.createElement("div", { className: "remoteMcpCard" + (open ? " remoteMcpCardOpen" : "") },
				React.createElement("button", { className: "remoteMcpHeader", onClick: function () { setOpen(!open); } },
					React.createElement("div", { className: "remoteMcpHeadText" },
						React.createElement("div", { className: "remoteMcpName" }, props.title),
						React.createElement("div", { className: "remoteMcpDescription" }, props.description)
					),
					React.createElement(Chevron, { className: "remoteMcpChevron" + (open ? " remoteMcpChevronOpen" : "") })
				),
				open && React.createElement("div", { className: "remoteMcpBody" }, props.children)
			);
		}

		// ── main component ──
		function SettingsCard() {
			var _a = React.useState([]), servers = _a[0], setServers = _a[1];
			var _b = React.useState(false), loaded = _b[0], setLoaded = _b[1];
			var _c = React.useState({ serverName: "", url: "", token: "", path: "" }), form = _c[0], setForm = _c[1];
			var _d = React.useState({}), testing = _d[0], setTesting = _d[1];
			var _e = React.useState({}), results = _e[0], setResults = _e[1];
			var _f = React.useState(null), editing = _f[0], setEditing = _f[1];

			React.useEffect(function () { loadServers(function (l) { setServers(l); setLoaded(true); }); }, []);
			React.useEffect(function () { if (loaded) saveServers(servers); }, [servers, loaded]);

			function saveServer() {
				if (!form.serverName || !form.url) return;
				var h = {}, t = (form.token || "").trim();
				if (t) h.Authorization = t;
				var e = { serverName: form.serverName, url: form.url, headers: h, path: form.path || "" };
				if (editing) {
					setServers(servers.map(function (s) { return s.serverName === editing ? e : s; }));
					setResults(function (p) { var n = Object.assign({}, p); delete n[editing]; return n; });
				} else {
					setServers([].concat(servers, [e]));
				}
				setForm({ serverName: "", url: "", token: "", path: "" });
				setEditing(null);
			}
			function startEdit(server) {
				var t = server.headers && server.headers.Authorization ? String(server.headers.Authorization) : "";
				setForm({ serverName: server.serverName, url: server.url, token: t, path: server.path || "" });
				setEditing(server.serverName);
			}
			function removeServer(name) {
				setServers(servers.filter(function (s) { return s.serverName !== name; }));
				setResults(function (p) { var n = Object.assign({}, p); delete n[name]; return n; });
			}
			async function doTest(server) {
				setTesting(function (p) { var n = Object.assign({}, p); n[server.serverName] = true; return n; });
				setResults(function (p) { var n = Object.assign({}, p); delete n[server.serverName]; return n; });
				try {
					var tools = await testConnection(server);
					setResults(function (p) { var n = Object.assign({}, p); n[server.serverName] = { ok: true, tools: tools }; return n; });
				} catch (err) {
					setResults(function (p) { var n = Object.assign({}, p); n[server.serverName] = { ok: false, error: err.message || String(err) }; return n; });
				} finally {
					setTesting(function (p) { var n = Object.assign({}, p); delete n[server.serverName]; return n; });
				}
			}

			// ── card 1: server list ──
			var listBody = servers.length === 0
				? React.createElement("div", { className: "remoteMcpEmpty" }, "暂无配置，在下方「新建配置」中添加")
				: servers.map(function (s) {
					var r = results[s.serverName], isT = !!testing[s.serverName];
					return React.createElement("div", { className: "remoteMcpServerItem", key: s.serverName },
						React.createElement("div", { className: "remoteMcpServerRow" },
							React.createElement("div", { style: { minWidth: 0, flex: 1 } },
								React.createElement("div", { className: "remoteMcpServerTitle" }, s.serverName),
								React.createElement("div", { className: "remoteMcpServerUrl" }, truncateUrl(s.url + (s.path || "")))
							),
							React.createElement("div", { className: "remoteMcpActions" },
								React.createElement("button", { className: "remoteMcpTest", onClick: function () { doTest(s); }, disabled: isT }, isT ? "测试中..." : "测试"),
								React.createElement("button", { className: "remoteMcpTest", onClick: function () { startEdit(s); } }, "编辑"),
								React.createElement("button", { className: "remoteMcpDelete", onClick: function () { removeServer(s.serverName); } }, "删除")
							)
						),
						r && React.createElement("div", { className: "remoteMcpServerUrl", style: { marginTop: 4 } },
							r.ok ? "✅ 连接成功，工具数：" + (r.tools && r.tools.length || 0) : "❌ 连接失败：" + r.error
						)
					);
				});

			// ── card 2: form ──
			var formBody = React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } },
				React.createElement("div", { className: "remoteMcpField" },
					React.createElement("div", { className: "remoteMcpLabel" }, "Server 名称"),
					React.createElement("input", { placeholder: "禁止使用中文名称填写", value: form.serverName, onChange: function (e) { setForm(Object.assign({}, form, { serverName: e.target.value })); }, className: "remoteMcpInput" })
				),
				React.createElement("div", { className: "remoteMcpField" },
					React.createElement("div", { className: "remoteMcpLabel" }, "URL"),
					React.createElement("input", { placeholder: "URL", value: form.url, onChange: function (e) { setForm(Object.assign({}, form, { url: e.target.value })); }, className: "remoteMcpInput" })
				),
				React.createElement("div", { className: "remoteMcpField" },
					React.createElement("div", { className: "remoteMcpLabel" }, "API Key / Token"),
					React.createElement("input", { placeholder: "API Key / Token", value: form.token, onChange: function (e) { setForm(Object.assign({}, form, { token: e.target.value })); }, className: "remoteMcpInput" })
				),
				React.createElement("div", { className: "remoteMcpField" },
					React.createElement("div", { className: "remoteMcpLabel" }, "Path（可选）"),
					React.createElement("input", { placeholder: "Path（可选）", value: form.path, onChange: function (e) { setForm(Object.assign({}, form, { path: e.target.value })); }, className: "remoteMcpInput" })
				),
				React.createElement("div", { className: "remoteMcpFooter" },
					React.createElement("button", { className: "remoteMcpTest", onClick: function () { setForm({ serverName: "", url: "", token: "", path: "" }); setEditing(null); } }, "重置"),
					React.createElement("button", { className: "remoteMcpSave", onClick: saveServer }, editing ? "保存修改" : "保存配置")
				)
			);

			return React.createElement(Card, { title: "远程 MCP 管理", description: "配置远程 MCP Server，连接后工具自动注册到 DSH" },
				React.createElement(Card, { title: "管理配置", description: "查看和管理已添加的 MCP Server" }, listBody),
				React.createElement(Card, { title: editing ? "编辑配置" : "新建配置", description: editing ? "修改已添加的 MCP Server" : "添加新的远程 MCP Server 到 DSH" }, formBody)
			);
		}

		// ── exports ──
		var inject = [];
		function apply(ctx) {
			var slots = ctx.get("slots");
			if (slots !== undefined) {
				slots.inject("settings.plugin.item", function () {
					return slots.register(
						{ name: "settings.plugin.item", id: "remote-mcp-manager", order: 100, title: "远程 MCP 管理", description: "配置远程 MCP Server" },
						function () { return React.createElement(SettingsCard, {}); }
					);
				});
			}
		}
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});












