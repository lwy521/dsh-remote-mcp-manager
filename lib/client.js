window.__ModuleLoader__.load({
	id: "dsh-remote-mcp-manager",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		var React = require("react");

		// ── inject CSS ──
		var css = "\n.remoteMcpCard {\n  border: 1px solid var(--dsw-alias-border-l2);\n  background: var(--dsw-alias-bg-layer-3);\n  border-radius: 12px;\n  list-style: none;\n  transition: border-color 0.16s, background 0.16s;\n  overflow: hidden;\n}\n\n.remoteMcpCard:hover {\n  border-color: var(--dsw-alias-label-dimmed);\n}\n\n.remoteMcpCardOpen {\n  background: var(--dsw-alias-bg-layer-2);\n  border-color: var(--dsw-alias-label-dimmed);\n}\n\n.remoteMcpHeader {\n  appearance: none;\n  width: 100%;\n  font: inherit;\n  color: inherit;\n  text-align: left;\n  cursor: pointer;\n  background: transparent;\n  border: 0;\n  border-radius: 12px;\n  align-items: center;\n  gap: 12px;\n  padding: 14px 16px;\n  display: flex;\n}\n\n.remoteMcpHeader:focus-visible {\n  outline: 2px solid var(--dsw-alias-brand-primary);\n  outline-offset: -2px;\n}\n\n.remoteMcpHeadText {\n  flex-direction: column;\n  flex: 1;\n  gap: 4px;\n  min-width: 0;\n  display: flex;\n}\n\n.remoteMcpName {\n  color: var(--dsw-alias-label-primary);\n  font-size: 15px;\n  font-weight: 600;\n  line-height: 1.4;\n}\n\n.remoteMcpDescription {\n  color: var(--dsw-alias-label-tertiary);\n  font-size: 13px;\n  line-height: 1.5;\n}\n\n.remoteMcpChevron {\n  color: var(--dsw-alias-label-tertiary);\n  flex: none;\n  transition: transform 0.16s;\n}\n\n.remoteMcpChevronOpen {\n  transform: rotate(180deg);\n}\n\n.remoteMcpBody {\n  border-top: 1px solid var(--dsw-alias-border-l2);\n  margin: 0 16px;\n  padding: 12px 0 8px;\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n}\n\n.remoteMcpFooter {\n  border-top: 1px solid var(--dsw-alias-border-l2);\n  justify-content: flex-end;\n  align-items: center;\n  gap: 8px;\n  padding: 12px 0 4px;\n  display: flex;\n}\n\n.remoteMcpLabel {\n  color: var(--dsw-alias-label-primary);\n  font-size: 13px;\n  font-weight: 500;\n  line-height: 1.5;\n}\n\n.remoteMcpField {\n  flex-direction: column;\n  gap: 6px;\n  padding: 12px 0;\n  display: flex;\n}\n\n.remoteMcpField + .remoteMcpField {\n  border-top: 1px solid var(--dsw-alias-border-l1);\n  padding-top: 10px;\n}\n\n.remoteMcpInput {\n  border: 1px solid var(--dsw-alias-border-l2);\n  background: var(--dsw-alias-bg-layer-3);\n  color: var(--dsw-alias-label-primary);\n  border-radius: 8px;\n  height: 34px;\n  padding: 0 12px;\n  font-size: 13px;\n  line-height: 1.5;\n  font: inherit;\n  outline: none;\n}\n\n.remoteMcpInput:focus-visible {\n  border-color: var(--dsw-alias-brand-primary);\n  outline: none;\n}\n\n.remoteMcpSelect {\n  border: 1px solid var(--dsw-alias-border-l2);\n  background: var(--dsw-alias-bg-layer-3);\n  color: var(--dsw-alias-label-primary);\n  border-radius: 8px;\n  height: 34px;\n  padding: 0 12px;\n  font-size: 13px;\n  line-height: 1.5;\n  font: inherit;\n  outline: none;\n  cursor: pointer;\n}\n\n.remoteMcpSelect option {\n  background: var(--dsw-alias-interactive-bg-hover);\n}\n\n.remoteMcpSelect:focus-visible {\n  border-color: var(--dsw-alias-brand-primary);\n  outline: none;\n}\n\n.remoteMcpDropdown {\n  position: relative;\n  width: 100%;\n}\n\n.remoteMcpDropdownTrigger {\n  border: 1px solid var(--dsw-alias-border-l2);\n  background: var(--dsw-alias-bg-layer-3);\n  color: var(--dsw-alias-label-primary);\n  border-radius: 8px;\n  height: 34px;\n  padding: 0 12px;\n  font-size: 13px;\n  line-height: 1.5;\n  font: inherit;\n  width: 100%;\n  text-align: left;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n  outline: none;\n}\n\n.remoteMcpDropdownTrigger:focus-visible {\n  border-color: var(--dsw-alias-brand-primary);\n}\n\n.remoteMcpDropdownArrow {\n  color: var(--dsw-alias-label-tertiary);\n  flex: none;\n  font-size: 10px;\n  transition: transform 0.16s;\n}\n\n.remoteMcpDropdownArrowOpen {\n  transform: rotate(180deg);\n}\n\n.remoteMcpDropdownMenu {\n  position: absolute;\n  top: 100%;\n  left: 0;\n  right: 0;\n  z-index: 100;\n  margin-top: 4px;\n  border: 1px solid var(--dsw-alias-border-l2);\n  background: var(--dsw-alias-bg-layer-3);\n  border-radius: 8px;\n  overflow: hidden;\n  box-shadow: 0 8px 24px rgba(0,0,0,0.15);\n  background: var(--dsw-alias-bg-layer-3);\n  backdrop-filter: blur(12px);\n}\n\n.remoteMcpDropdownOption {\n  padding: 8px 12px;\n  font-size: 13px;\n  line-height: 1.5;\n  color: var(--dsw-alias-label-primary);\n  cursor: pointer;\n  background: var(--dsw-alias-interactive-bg-hover);\n}\n\n.remoteMcpDropdownOption:hover {\n  background: var(--dsw-alias-interactive-bg-hover);\n}\n\n.remoteMcpDropdownOptionSelected {\n  color: var(--dsw-alias-state-business-primary);\n  font-weight: 600;\n}\n\n.remoteMcpSave {\n  appearance: none;\n  font: inherit;\n  cursor: pointer;\n  border: 1px solid transparent;\n  border-radius: 8px;\n  padding: 6px 14px;\n  font-size: 13px;\n  line-height: 1.5;\n  background: var(--dsw-alias-button-info-fill);\n  color: var(--dsw-alias-label-primary-foreground);\n  font-weight: 600;\n}\n\n.remoteMcpSave:hover:not(:disabled) {\n  background: var(--dsw-alias-button-info-hover);\n}\n\n.remoteMcpSave:disabled {\n  opacity: 0.4;\n  cursor: default;\n}\n\n.remoteMcpTest {\n  appearance: none;\n  font: inherit;\n  cursor: pointer;\n  border: 1px solid var(--dsw-alias-border-l2);\n  border-radius: 8px;\n  padding: 5px 12px;\n  font-size: 12px;\n  line-height: 1.5;\n  background: transparent;\n  color: var(--dsw-alias-label-primary);\n}\n\n.remoteMcpTest:hover:not(:disabled) {\n  background: var(--dsw-alias-interactive-bg-hover);\n}\n\n.remoteMcpTest:disabled {\n  opacity: 0.7;\n  cursor: default;\n}\n\n.remoteMcpDelete {\n  appearance: none;\n  font: inherit;\n  cursor: pointer;\n  border: 1px solid var(--dsw-alias-state-error-border, #fecaca);\n  border-radius: 8px;\n  padding: 5px 12px;\n  font-size: 12px;\n  line-height: 1.5;\n  background: transparent;\n  color: var(--dsw-alias-state-error, #dc2626);\n}\n\n.remoteMcpDelete:hover:not(:disabled) {\n  background: var(--dsw-alias-state-error-soft, #fef2f2);\n}\n\n.remoteMcpEmpty {\n  padding: 24px 18px;\n  text-align: center;\n  color: var(--dsw-alias-label-tertiary);\n  font-size: 13px;\n  border: 1px dashed var(--dsw-alias-border-l2);\n  border-radius: 8px;\n}\n\n.remoteMcpServerItem {\n  border: 1px solid var(--dsw-alias-border-l2);\n  border-radius: 8px;\n  padding: 12px;\n  background: var(--dsw-alias-bg-layer-3);\n}\n\n.remoteMcpServerRow {\n  justify-content: space-between;\n  align-items: center;\n  gap: 12px;\n  display: flex;\n}\n\n.remoteMcpServerTitle {\n  color: var(--dsw-alias-label-primary);\n  font-size: 13px;\n  font-weight: 600;\n  line-height: 1.4;\n}\n\n.remoteMcpServerUrl {\n  color: var(--dsw-alias-label-tertiary);\n  font-size: 12px;\n  line-height: 1.5;\n  margin-top: 2px;\n  word-break: break-all;\n}\n\n.remoteMcpActions {\n  align-items: center;\n  gap: 6px;\n  display: inline-flex;\n}\n\n.remoteMcpOverlay {\n  position: fixed;\n  inset: 0;\n  background: rgba(0, 0, 0, 0.45);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  z-index: 9999;\n  animation: remoteMcpFadeIn 0.15s ease;\n}\n\n.remoteMcpModal {\n  background: var(--dsw-alias-bg-layer-2);\n  border: 1px solid var(--dsw-alias-border-l2);\n  border-radius: 14px;\n  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);\n  padding: 20px;\n  width: 360px;\n  max-width: calc(100vw - 40px);\n  animation: remoteMcpPopIn 0.16s ease;\n}\n\n.remoteMcpModalTitle {\n  color: var(--dsw-alias-label-primary);\n  font-size: 15px;\n  font-weight: 600;\n  line-height: 1.4;\n  margin-bottom: 8px;\n}\n\n.remoteMcpModalMessage {\n  color: var(--dsw-alias-label-tertiary);\n  font-size: 13px;\n  line-height: 1.6;\n  margin-bottom: 18px;\n}\n\n.remoteMcpModalActions {\n  display: flex;\n  justify-content: flex-end;\n  gap: 10px;\n}\n\n@keyframes remoteMcpFadeIn {\n  from { opacity: 0; }\n  to { opacity: 1; }\n}\n\n@keyframes remoteMcpPopIn {\n  from { opacity: 0; transform: translateY(8px) scale(0.98); }\n  to { opacity: 1; transform: translateY(0) scale(1); }\n}\n";
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
						return {
							serverName: s.serverName,
							transport: s.transport || "streamable-http",
							url: s.url || "",
							path: s.path || "",
							token: s.headers && s.headers.Authorization ? String(s.headers.Authorization) : "",
							command: s.command || "",
							args: Array.isArray(s.args) ? s.args : [],
							env: s.env || {},
							cwd: s.cwd || "",
							toolCallTimeoutMs: s.toolCallTimeoutMs || 60000
						};
					}));
				})
				.catch(function () { cb([]); });
		}
		function saveServers(servers) {
			var p = servers.map(function (s) {
				var out = { serverName: s.serverName, transport: s.transport || "streamable-http" };
				if (s.transport === "stdio") {
					out.command = s.command;
					if (s.args && s.args.length > 0) out.args = s.args;
					if (s.env && Object.keys(s.env).length > 0) out.env = s.env;
					if (s.cwd) out.cwd = s.cwd;
				} else {
					out.url = s.url;
					if (s.path) out.path = s.path;
					var t = (s.token || "").trim();
					if (t) out.headers = { Authorization: t };
					if (s.toolCallTimeoutMs) out.toolCallTimeoutMs = s.toolCallTimeoutMs;
				}
				return out;
			});
			fetch("/remote-mcp-manager", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ servers: p })
			}).catch(function () {});
		}
		function truncateUrl(full) {
			if (full.length <= 40) return full;
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
		function parseSSE(t) {
			var msgs = [], cur = null;
			(t || "").split(/\r?\n/).forEach(function (l) {
				if (l.startsWith("data:")) { cur = (cur === null ? "" : cur) + l.slice(5).trim(); }
				else if (l === "" && cur !== null) { try { msgs.push(JSON.parse(cur)); } catch (e) {} cur = null; }
			});
			if (cur !== null) try { msgs.push(JSON.parse(cur)); } catch (e) {}
			return msgs;
		}
		async function testConnection(server) {
			var url = new URL(server.url);
			if (server.path) url.pathname = server.path.replace(/^\//, "").replace(/\/$/, "");
			var h = {};
			if (server.token) h.Authorization = server.token;
			var init = await mcpRequest(url.toString(), "POST", {
				jsonrpc: "2.0", id: 1, method: "initialize",
				params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "dsh-remote-mcp", version: "0.1.0" } }
			}, h);
			if (init.data.error) throw new Error(init.data.error.message || JSON.stringify(init.data.error));
			var sid = init.headers["mcp-session-id"] || init.headers["Mcp-Session-Id"] || init.data["mcp-session-id"] || init.data["Mcp-Session-Id"];
			var tools = await mcpRequest(url.toString(), "POST", {
				jsonrpc: "2.0", id: 2, method: "tools/list", params: {}
			}, Object.assign({}, h, sid ? { "Mcp-Session-Id": sid } : {}));
			if (tools.data.error) throw new Error(tools.data.error.message || JSON.stringify(tools.data.error));
			return tools.data.result && tools.data.result.tools || [];
		}

		// ── chevron SVG ──
		function Chevron(props) {
			return React.createElement("svg", { width: "14", height: "14", viewBox: "0 0 14 14", fill: "none", xmlns: "http://www.w3.org/2000/svg", className: props.className },
				React.createElement("path", { d: "M11.8486 5.5L11.4238 5.92383L8.69727 8.65137C8.44157 8.90706 8.21562 9.13382 8.01172 9.29785C7.79912 9.46883 7.55595 9.61756 7.25 9.66602C7.08435 9.69222 6.91565 9.69222 6.75 9.66602C6.44405 9.61756 6.20088 9.46883 5.98828 9.29785C5.78438 9.13382 5.55843 8.90706 5.30273 8.65137L2.57617 5.92383L2.15137 5.5L3 4.65137L3.42383 5.07617L6.15137 7.80273C6.42595 8.07732 6.59876 8.24849 6.74023 8.3623C6.87291 8.46904 6.92272 8.47813 6.9375 8.48047C6.97895 8.48703 7.02105 8.48703 7.0625 8.48047C7.07728 8.47813 7.12709 8.46904 7.25977 8.3623C7.40124 8.24849 7.57405 8.07732 7.84863 7.80273L10.5762 5.07617L11 4.65137L11.8486 5.5Z", fill: "currentColor" })
			);
		}

		// ── custom dropdown ──
		function Select(props) {
			var _a = React.useState(false), open = _a[0], setOpen = _a[1];
			var ref = React.useRef(null);
			React.useEffect(function () {
				if (!open) return;
				function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
				document.addEventListener("mousedown", handler);
				return function () { document.removeEventListener("mousedown", handler); };
			}, [open]);
			var selected = null;
			for (var i = 0; i < props.options.length; i++) {
				if (props.options[i].value === props.value) { selected = props.options[i]; break; }
			}
			return React.createElement("div", { className: "remoteMcpDropdown", ref: ref },
				React.createElement("button", { className: "remoteMcpDropdownTrigger", type: "button", onClick: function () { setOpen(!open); } },
					React.createElement("span", null, selected ? selected.label : ""),
					React.createElement("span", { className: "remoteMcpDropdownArrow" + (open ? " remoteMcpDropdownArrowOpen" : "") }, "▼")
				),
				open && React.createElement("div", { className: "remoteMcpDropdownMenu" },
					props.options.map(function (opt) {
						return React.createElement("div", {
							key: opt.value,
							className: "remoteMcpDropdownOption" + (opt.value === props.value ? " remoteMcpDropdownOptionSelected" : ""),
							onClick: function () { props.onChange(opt.value); setOpen(false); }
						}, opt.label);
					})
				)
			);
		}

		// ── reusable card wrapper ──
		function Card(props) {
			var _a = React.useState(false), open = _a[0], setOpen = _a[1];
			return React.createElement("div", { id: props.id, className: "remoteMcpCard" + (open ? " remoteMcpCardOpen" : "") },
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

		// ── custom confirm modal ──
		function ConfirmModal(props) {
			if (!props.open) return null;
			return React.createElement("div", { className: "remoteMcpOverlay", onClick: function (e) { if (e.target === e.currentTarget) props.onCancel(); } },
				React.createElement("div", { className: "remoteMcpModal", role: "dialog", "aria-modal": "true" },
					React.createElement("div", { className: "remoteMcpModalTitle" }, props.title || "确认"),
					React.createElement("div", { className: "remoteMcpModalMessage" }, props.message),
					React.createElement("div", { className: "remoteMcpModalActions" },
						React.createElement("button", { className: "remoteMcpTest", onClick: props.onCancel }, props.cancelText || "取消"),
						React.createElement("button", { className: "remoteMcpSave", onClick: props.onConfirm }, props.confirmText || "确定")
					)
				)
			);
		}

		// ── main component ──
		function SettingsCard() {
			var _a = React.useState([]), servers = _a[0], setServers = _a[1];
			var _b = React.useState(false), loaded = _b[0], setLoaded = _b[1];
			var _c = React.useState({ serverName: "", transport: "streamable-http", url: "", token: "", path: "", command: "", args: "", env: "", cwd: "", toolCallTimeoutMs: "" }), form = _c[0], setForm = _c[1];
			var _d = React.useState({}), testing = _d[0], setTesting = _d[1];
			var _e = React.useState({}), results = _e[0], setResults = _e[1];
			var _f = React.useState(null), editing = _f[0], setEditing = _f[1];
			var _g = React.useState("list"), mode = _g[0], setMode = _g[1];
			var _h = React.useState(false), confirmOpen = _h[0], setConfirmOpen = _h[1];
			var formInitial = React.useRef(null);

			React.useEffect(function () { loadServers(function (l) { setServers(l); setLoaded(true); }); }, []);
			React.useEffect(function () { if (loaded) saveServers(servers); }, [servers, loaded]);

			function setFormField(field, value) {
				setForm(Object.assign({}, form, (function (o) { o[field] = value; return o; })({})));
			}

			function buildServerFromForm() {
				var e = { serverName: form.serverName, transport: form.transport };
				if (form.transport === "stdio") {
					e.command = form.command;
					e.args = form.args ? form.args.split(/\n|<br\s*\/?>/i).map(function (l) { return l.trim(); }).filter(function (l) { return l.length > 0; }) : [];
					e.env = {};
					if (form.env) {
						form.env.split("\n").forEach(function (l) {
							var idx = l.indexOf("=");
							if (idx > 0) e.env[l.slice(0, idx).trim()] = l.slice(idx + 1).trim();
						});
					}
					e.cwd = form.cwd || "";
				} else {
					e.url = form.url;
					e.path = form.path || "";
					e.token = form.token || "";
					e.toolCallTimeoutMs = parseInt(form.toolCallTimeoutMs, 10) || 60000;
				}
				return e;
			}

			function saveServer() {
				if (!form.serverName) return false;
				if (form.transport === "streamable-http" && !form.url) return false;
				if (form.transport === "stdio" && !form.command) return false;
				var e = buildServerFromForm();
				if (editing) {
					setServers(servers.map(function (s) { return s.serverName === editing ? e : s; }));
					setResults(function (p) { var n = Object.assign({}, p); delete n[editing]; return n; });
				} else {
					setServers([].concat(servers, [e]));
				}
				resetForm();
				return true;
			}

			function startEdit(server) {
				var f = { serverName: server.serverName, transport: server.transport || "streamable-http", url: server.url || "", token: server.token || "", path: server.path || "", command: server.command || "", args: Array.isArray(server.args) ? server.args.join("\n") : "", env: "", cwd: server.cwd || "", toolCallTimeoutMs: String(server.toolCallTimeoutMs || "") };
				if (server.env && typeof server.env === "object") {
					var lines = [];
					for (var k in server.env) { if (server.env.hasOwnProperty(k)) lines.push(k + "=" + server.env[k]); }
					f.env = lines.join("\n");
				}
				setForm(f);
				formInitial.current = Object.assign({}, f);
				setEditing(server.serverName);
				setMode("form");
			}

			function removeServer(name) {
				setServers(servers.filter(function (s) { return s.serverName !== name; }));
				setResults(function (p) { var n = Object.assign({}, p); delete n[name]; return n; });
			}

			function resetForm() {
				setForm({ serverName: "", transport: "streamable-http", url: "", token: "", path: "", command: "", args: "", env: "", cwd: "", toolCallTimeoutMs: "" });
				formInitial.current = null;
				setEditing(null);
				setMode("list");
			}

			function showNewForm() {
				setForm({ serverName: "", transport: "streamable-http", url: "", token: "", path: "", command: "", args: "", env: "", cwd: "", toolCallTimeoutMs: "" });
				formInitial.current = { serverName: "", transport: "streamable-http", url: "", token: "", path: "", command: "", args: "", env: "", cwd: "", toolCallTimeoutMs: "" };
				setEditing(null);
				setMode("form");
			}

			function formIsModified() {
				if (!formInitial.current) return false;
				return form.serverName !== formInitial.current.serverName
					|| form.transport !== formInitial.current.transport
					|| form.url !== formInitial.current.url
					|| form.token !== formInitial.current.token
					|| form.path !== formInitial.current.path
					|| form.command !== formInitial.current.command
					|| form.args !== formInitial.current.args
					|| form.env !== formInitial.current.env
					|| form.cwd !== formInitial.current.cwd
					|| form.toolCallTimeoutMs !== formInitial.current.toolCallTimeoutMs;
			}

			function backToList() {
				if (formIsModified()) {
					setConfirmOpen(true);
				} else {
					resetForm();
				}
			}

			async function doTest(server) {
				if (server.transport === "stdio") return;
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
				? React.createElement("div", { className: "remoteMcpEmpty" }, "暂无配置，点击「新建配置」添加")
				: servers.map(function (s) {
					var r = results[s.serverName], isT = !!testing[s.serverName];
					var isHttp = s.transport !== "stdio";
					var subtitle = isHttp ? truncateUrl(s.url + (s.path || "")) : (s.command + " " + (Array.isArray(s.args) && s.args.length > 0 ? s.args[0] : ""));
					return React.createElement("div", { className: "remoteMcpServerItem", key: s.serverName },
						React.createElement("div", { className: "remoteMcpServerRow" },
							React.createElement("div", { style: { minWidth: 0, flex: 1 } },
								React.createElement("div", { className: "remoteMcpServerTitle" },
									React.createElement(React.Fragment, null,
										s.serverName,
										"  ",
										React.createElement("span", { style: { fontSize: 11, color: "var(--dsw-alias-label-tertiary)", fontWeight: 400 } }, isHttp ? "HTTP" : "本地")
									)
								),
								React.createElement("div", { className: "remoteMcpServerUrl" }, subtitle)
							),
							React.createElement("div", { className: "remoteMcpActions" },
								isHttp ? React.createElement("button", { className: "remoteMcpTest", onClick: function () { doTest(s); }, disabled: isT }, isT ? "测试中..." : "测试") : null,
								React.createElement("button", { className: "remoteMcpTest", onClick: function () { startEdit(s); } }, "编辑"),
								React.createElement("button", { className: "remoteMcpDelete", onClick: function () { removeServer(s.serverName); } }, "删除")
							)
						),
						r && isHttp && React.createElement("div", { className: "remoteMcpServerUrl", style: { marginTop: 4 } },
							r.ok ? "✅ 连接成功，工具数：" + (r.tools && r.tools.length || 0) : "❌ 连接失败：" + r.error
						)
					);
				});

			// ── card 2: form ──
			var isHttpForm = form.transport !== "stdio";
			var formBody = React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } },
				React.createElement("div", { className: "remoteMcpField" },
					React.createElement("div", { className: "remoteMcpLabel" }, "Server 名称"),
					React.createElement("input", { placeholder: "禁止使用中文名称填写", value: form.serverName, onChange: function (e) { setFormField("serverName", e.target.value); }, className: "remoteMcpInput" })
				),
				React.createElement("div", { className: "remoteMcpField" },
					React.createElement("div", { className: "remoteMcpLabel" }, "传输类型"),
					React.createElement(Select, { value: form.transport, onChange: function (v) { setFormField("transport", v); }, options: [{ value: "streamable-http", label: "HTTP 远程" }, { value: "stdio", label: "本地进程" }] })
				),
				isHttpForm ? React.createElement(React.Fragment, null,
					React.createElement("div", { className: "remoteMcpField" },
						React.createElement("div", { className: "remoteMcpLabel" }, "URL"),
						React.createElement("input", { placeholder: "http://example.com:8080/mcp", value: form.url, onChange: function (e) { setFormField("url", e.target.value); }, className: "remoteMcpInput" })
					),
					React.createElement("div", { className: "remoteMcpField" },
						React.createElement("div", { className: "remoteMcpLabel" }, "API Key / Token"),
						React.createElement("input", { placeholder: "可选", value: form.token, onChange: function (e) { setFormField("token", e.target.value); }, className: "remoteMcpInput" })
					),
					React.createElement("div", { className: "remoteMcpField" },
						React.createElement("div", { className: "remoteMcpLabel" }, "Path（可选）"),
						React.createElement("input", { placeholder: "可选", value: form.path, onChange: function (e) { setFormField("path", e.target.value); }, className: "remoteMcpInput" })
					),
					React.createElement("div", { className: "remoteMcpField" },
						React.createElement("div", { className: "remoteMcpLabel" }, "超时（毫秒，默认 60000）"),
						React.createElement("input", { placeholder: "60000", value: form.toolCallTimeoutMs, onChange: function (e) { setFormField("toolCallTimeoutMs", e.target.value); }, className: "remoteMcpInput" })
					)
				) : React.createElement(React.Fragment, null,
					React.createElement("div", { className: "remoteMcpField" },
						React.createElement("div", { className: "remoteMcpLabel" }, "命令"),
						React.createElement("input", { placeholder: "node.exe / python / npx", value: form.command, onChange: function (e) { setFormField("command", e.target.value); }, className: "remoteMcpInput" })
					),
					React.createElement("div", { className: "remoteMcpField" },
						React.createElement("div", { className: "remoteMcpLabel" }, "参数（每行一个）"),
						React.createElement("textarea", { placeholder: "每行一个参数", value: form.args, onChange: function (e) { setFormField("args", e.target.value); }, className: "remoteMcpInput", style: { height: 60, padding: "6px 10px", resize: "vertical" } })
					),
					React.createElement("div", { className: "remoteMcpField" },
						React.createElement("div", { className: "remoteMcpLabel" }, "环境变量（可选，每行 KEY=VALUE）"),
						React.createElement("textarea", { placeholder: "KEY=VALUE", value: form.env, onChange: function (e) { setFormField("env", e.target.value); }, className: "remoteMcpInput", style: { height: 50, padding: "6px 10px", resize: "vertical" } })
					),
					React.createElement("div", { className: "remoteMcpField" },
						React.createElement("div", { className: "remoteMcpLabel" }, "工作目录（可选）"),
						React.createElement("input", { placeholder: "可选", value: form.cwd, onChange: function (e) { setFormField("cwd", e.target.value); }, className: "remoteMcpInput" })
					)
				),
				React.createElement("div", { className: "remoteMcpFooter" },
					React.createElement("button", { className: "remoteMcpTest", onClick: backToList }, "返回"),
					React.createElement("button", { className: "remoteMcpSave", onClick: saveServer, disabled: (form.transport === "streamable-http" && !form.url) || (form.transport === "stdio" && !form.command) || !form.serverName }, editing ? "保存修改" : "保存配置")
				)
			);

			return React.createElement(React.Fragment, null,
				React.createElement(Card, { title: mode === "form" ? (editing ? "编辑配置" : "新建配置") : "管理配置", description: mode === "form" ? (editing ? "修改已添加的 MCP Server" : "添加新的 MCP Server 到 DSH") : "查看和管理已添加的 MCP Server" },
					mode === "list"
						? React.createElement(React.Fragment, null,
							listBody,
							React.createElement("div", { className: "remoteMcpFooter" },
								React.createElement("button", { className: "remoteMcpSave", onClick: showNewForm }, "新建配置")
							)
						)
						: React.createElement(React.Fragment, null,
							formBody
						)
				),
				React.createElement(ConfirmModal, {
					open: confirmOpen,
					title: "提示",
					message: "表单有未保存的内容，是否保存？",
					cancelText: "不保存",
					confirmText: "保存",
					onCancel: function () { setConfirmOpen(false); resetForm(); },
					onConfirm: function () { if (saveServer()) setConfirmOpen(false); }
				})
			);
		}

		// ── exports ──
		var inject = [];
		function apply(ctx) {
			var slots = ctx.get("slots");
			if (slots !== undefined) {
				slots.inject("settings.section", function () {
					return slots.register(
						{ name: "settings.section", id: "remote-mcp-manager", order: 150, label: "MCP管理" },
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






