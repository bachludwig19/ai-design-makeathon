// AI engine: Simulated (default, scripted dummy replies) or a live model.
// Live = local Gemma via Ollama by default; Claude or OpenAI with the user's own API key as alternatives.
// Settings and keys live only in this browser (localStorage). Any live failure falls back to the simulated reply.
window.Engine = {
  key: "mf.engine.v1",
  defaults: {
    mode: "sim",              // "sim" | "live"
    provider: "ollama",       // "ollama" | "anthropic" | "openai"
    ollamaUrl: "http://localhost:11434", ollamaModel: "gemma3",
    anthropicKey: "", anthropicModel: "claude-opus-5-5",
    openaiKey: "", openaiModel: ""
  },
  get() { try { return { ...this.defaults, ...(JSON.parse(localStorage.getItem(this.key)) || {}) }; } catch { return { ...this.defaults }; } },
  set(patch) {
    if ("ollamaUrl" in patch || "ollamaModel" in patch) { try { localStorage.removeItem(this.statusKey); } catch {} }
    const s = { ...this.get(), ...patch }; try { localStorage.setItem(this.key, JSON.stringify(s)); } catch {} window.dispatchEvent(new Event("engine-change")); return s; },

  // Local model reachability. Cached in localStorage so pages don't re-probe (and log a refused
  // connection) on every load; re-checked when the settings modal opens or on "Check again".
  OFFLINE: "Local model not running. Using the simulation.",
  statusKey: "mf.engine.local.v1",
  local() { try { return JSON.parse(localStorage.getItem(this.statusKey)) || { state: "unknown" }; } catch { return { state: "unknown" }; } },
  setLocal(st) { try { localStorage.setItem(this.statusKey, JSON.stringify({ ...st, at: Date.now() })); } catch {} window.dispatchEvent(new Event("engine-change")); return st; },

  // probe() -> {state: "ok"|"down", reason, hint}. Never throws.
  async probe() {
    const s = this.get(), base = s.ollamaUrl.replace(/\/$/, "");
    const origin = /^https?:/.test(location.origin) ? location.origin : "*";
    const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 1500);
    try {
      const r = await fetch(`${base}/api/tags`, { signal: ctl.signal });
      if (!r.ok) return this.setLocal({ state: "down", reason: `Ollama answered HTTP ${r.status}. Restart it with:`, hint: "ollama serve" });
      const j = await r.json(), want = s.ollamaModel.split(":")[0];
      const has = (j.models || []).some(m => (m.name || m.model || "").split(":")[0] === want);
      if (!has) return this.setLocal({ state: "down", reason: `Ollama is running, but ${s.ollamaModel} isn't downloaded. Run:`, hint: `ollama pull ${s.ollamaModel}` });
      return this.setLocal({ state: "ok" });
    } catch {
      // Not installed, not started, or blocked by CORS: the browser can't tell these apart.
      return this.setLocal({ state: "down", reason: "Ollama isn't answering at " + base.replace(/^https?:\/\//, "") + ". Install it, then start it with:",
        hint: `OLLAMA_ORIGINS=${origin} ollama serve` });
    } finally { clearTimeout(t); }
  },

  // True when the chosen engine can't run right now, so replies come from the simulation.
  offline(s = this.get()) { return s.mode === "live" && s.provider === "ollama" && this.local().state === "down"; },

  label(s = this.get()) {
    if (s.mode !== "live" || this.offline(s)) return "Simulated agent";
    if (s.provider === "ollama") return `${s.ollamaModel} \u00b7 local`;
    if (s.provider === "anthropic") return `Claude \u00b7 ${s.anthropicModel}`;
    return `OpenAI \u00b7 ${s.openaiModel || "model?"}`;
  },

  _sim(fallback, error) {
    return new Promise(r => setTimeout(() => r({ text: fallback, live: false, label: "Simulated agent", ...(error ? { error } : {}) }), 650 + Math.random() * 500));
  },
  _warned: false, // say "Using the simulation" once per page, not on every reply
  _once(msg) { if (this._warned) return undefined; this._warned = true; return msg; },

  // ask({system, prompt, fallback}) -> {text, live, label, error?}. Never throws.
  async ask({ system, prompt, fallback }) {
    const s = this.get();
    if (s.mode !== "live") return this._sim(fallback);
    if (s.provider === "ollama") {
      if (this.local().state !== "ok") await this.probe();
      if (this.local().state !== "ok") return this._sim(fallback, this._once(this.OFFLINE));
    }
    try {
      const text = await this.call(s, system, prompt);
      return { text: text.trim(), live: true, label: this.label(s) };
    } catch (e) {
      if (s.provider === "ollama") { this.setLocal({ state: "down", reason: "The local model stopped answering. Check that it is still running:", hint: "ollama serve" }); return { text: fallback, live: false, label: "Simulated agent", error: this._once(this.OFFLINE) }; }
      return { text: fallback, live: false, label: "Simulated agent", error: this._once(`${this.label(s)} failed (${e.message}). Using the simulation.`) };
    }
  },

  async call(s, system, prompt) {
    if (s.provider === "ollama") {
      const r = await fetch(`${s.ollamaUrl.replace(/\/$/, "")}/api/chat`, {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ model: s.ollamaModel, stream: false,
          messages: [{ role: "system", content: system }, { role: "user", content: prompt }] })
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}${r.status === 404 ? " (model not pulled? run: ollama pull " + s.ollamaModel + ")" : ""}`);
      const j = await r.json();
      return j.message?.content || "";
    }
    if (s.provider === "anthropic") {
      if (!s.anthropicKey) throw new Error("no API key");
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": s.anthropicKey,
          "anthropic-version": "2026-10-21", "anthropic-dangerous-direct-browser-access": "true",
          "anthropic-beta": "server-side-fallback-2026-07-01" },
        body: JSON.stringify({ model: s.anthropicModel, max_tokens: 4000, system,
          output_config: { effort: "low" }, fallbacks: "default",
          messages: [{ role: "user", content: prompt }] })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error?.message || `HTTP ${r.status}`);
      if (j.stop_reason === "refusal") throw new Error("the model declined");
      return j.content.filter(b => b.type === "text").map(b => b.text).join("\n");
    }
    if (s.provider === "openai") {
      if (!s.openaiKey || !s.openaiModel) throw new Error("API key and model are required");
      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${s.openaiKey}` },
        body: JSON.stringify({ model: s.openaiModel,
          messages: [{ role: "system", content: system }, { role: "user", content: prompt }] })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error?.message || `HTTP ${r.status}`);
      return j.choices?.[0]?.message?.content || "";
    }
    throw new Error("unknown provider");
  },

  async test() {
    const s = this.get();
    if (s.provider === "ollama") { const p = await this.probe(); if (p.state !== "ok") throw new Error(p.reason); }
    return this.call({ ...s, mode: "live" }, "Reply with the single word: ready", "Are you there?");
  }
};
