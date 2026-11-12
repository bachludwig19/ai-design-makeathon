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
  set(patch) { const s = { ...this.get(), ...patch }; try { localStorage.setItem(this.key, JSON.stringify(s)); } catch {} window.dispatchEvent(new Event("engine-change")); return s; },

  label(s = this.get()) {
    if (s.mode !== "live") return "Simulated agent";
    if (s.provider === "ollama") return `${s.ollamaModel} \u00b7 local`;
    if (s.provider === "anthropic") return `Claude \u00b7 ${s.anthropicModel}`;
    return `OpenAI \u00b7 ${s.openaiModel || "model?"}`;
  },

  // ask({system, prompt, fallback}) -> {text, live, label, error}
  async ask({ system, prompt, fallback }) {
    const s = this.get();
    if (s.mode !== "live") {
      await new Promise(r => setTimeout(r, 650 + Math.random() * 500)); // feel like an agent, not a lookup
      return { text: fallback, live: false, label: "Simulated agent" };
    }
    try {
      const text = await this.call(s, system, prompt);
      return { text: text.trim(), live: true, label: this.label(s) };
    } catch (e) {
      return { text: fallback, live: false, label: "Simulated agent", error: `${this.label(s)} failed: ${e.message}. Showing the simulated reply.` };
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
    return this.call({ ...s, mode: "live" }, "Reply with the single word: ready", "Are you there?");
  }
};
