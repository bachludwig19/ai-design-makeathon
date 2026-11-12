// AI engine settings: a self-styled modal (.mfs-* classes, nothing in app.css) plus a status chip.
// Needs engine.js loaded first. Optional: data.js (for MFState, used by "Reset demo").
//   MFSettings.open()        open the modal
//   MFSettings.chip(el)      render the engine-status chip into el (keeps itself updated; click opens the modal)
(function () {
  const css = `
.mfs-scrim{position:fixed;inset:0;background:rgba(31,31,28,.28);z-index:90;opacity:0;pointer-events:none;transition:opacity .2s}
.mfs-scrim.on{opacity:1;pointer-events:auto}
.mfs-modal{position:fixed;left:50%;top:50%;width:min(600px,94vw);max-height:90vh;overflow:auto;transform:translate(-50%,-48%);opacity:0;pointer-events:none;
  transition:.22s cubic-bezier(.2,.7,.2,1);z-index:91;background:var(--bg,#F8F7F4);color:var(--text,#1F1F1C);border-radius:16px;padding:24px;
  box-shadow:0 24px 70px -20px rgba(0,0,0,.35);font-family:var(--font,system-ui,sans-serif);font-size:14px;line-height:1.5;text-align:left}
.mfs-modal.on{opacity:1;pointer-events:auto;transform:translate(-50%,-50%)}
.mfs-modal *{box-sizing:border-box}
.mfs-h{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px}
.mfs-h h3{margin:0;font-size:19px;font-weight:600;letter-spacing:-.01em}
.mfs-x{border:0;background:none;font-size:22px;line-height:1;cursor:pointer;color:var(--text-2,#5C5A54);padding:4px 8px;border-radius:8px}
.mfs-x:hover{background:var(--surface,#F3F2EE)}
.mfs-note{font-size:12.5px;color:var(--text-2,#5C5A54);margin:0}
.mfs-opt{display:flex;gap:12px;align-items:flex-start;padding:13px 14px;border:1px solid var(--line,#E6E3DC);border-radius:12px;background:var(--card,#fff);margin-top:10px;cursor:pointer;transition:border-color .15s,box-shadow .15s}
.mfs-opt.on{border-color:var(--primary,#C49A2C);box-shadow:0 0 0 3px var(--primary-soft,#F6EDD3)}
.mfs-opt input[type=radio]{margin-top:3px;accent-color:var(--primary,#C49A2C)}
.mfs-opt b{font-weight:600}
.mfs-sub{margin:10px 0 0 26px;padding:14px;border-radius:12px;background:var(--surface,#F3F2EE);border:1px solid var(--line,#E6E3DC)}
.mfs-sub .mfs-opt{margin-top:8px}
.mfs-pill{display:inline-block;font-size:11.5px;padding:2px 9px;border-radius:99px;margin-left:6px;vertical-align:1px;font-weight:500}
.mfs-pill.grey{background:var(--surface,#F3F2EE);color:var(--text-2,#5C5A54);border:1px solid var(--line,#E6E3DC)}
.mfs-pill.ok{background:var(--teal-soft,#DCEFE9);color:var(--teal,#2F7473)}
.mfs-row{display:grid;grid-template-columns:1.4fr 1fr;gap:8px;margin-top:8px}
.mfs-f span{display:block;font-size:11.5px;color:var(--text-2,#5C5A54);margin-bottom:3px}
.mfs-f input{width:100%;padding:7px 10px;border:1px solid var(--line,#E6E3DC);border-radius:8px;background:#fff;font:inherit;font-size:13.5px;color:inherit}
.mfs-modal code{font-family:var(--mono,ui-monospace,monospace);font-size:11.5px;background:var(--card,#fff);border:1px solid var(--line,#E6E3DC);padding:1px 5px;border-radius:5px}
.mfs-modal details summary{cursor:pointer;font-size:12.5px;color:var(--text-2,#5C5A54);margin-top:12px}
.mfs-btn{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line,#E6E3DC);background:var(--card,#fff);border-radius:10px;padding:7px 14px;font:inherit;font-size:13px;cursor:pointer;color:inherit}
.mfs-btn:hover{background:var(--surface,#F3F2EE)}
.mfs-foot{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-top:20px;padding-top:16px;border-top:1px solid var(--line,#E6E3DC)}
.mfs-test{display:flex;gap:10px;align-items:center;margin-top:12px}
.mfs-ok{color:var(--teal,#2F7473)} .mfs-err{color:var(--danger,#A3332B)}
.mfs-dots{display:inline-flex;gap:4px}.mfs-dots i{width:6px;height:6px;border-radius:50%;background:var(--primary,#C49A2C);animation:mfs-b 1s infinite}
.mfs-dots i:nth-child(2){animation-delay:.15s}.mfs-dots i:nth-child(3){animation-delay:.3s}
@keyframes mfs-b{0%,100%{opacity:.25}50%{opacity:1}}
.mfs-chip{display:inline-flex;align-items:center;gap:8px;height:34px;border:1px solid var(--line,#E6E3DC);background:var(--card,#fff);border-radius:99px;padding:0 13px;
  font:inherit;font-size:12.5px;color:var(--text-2,#5C5A54);cursor:pointer;white-space:nowrap}
.mfs-chip:hover{border-color:var(--primary,#C49A2C)}
.mfs-chip i{width:8px;height:8px;border-radius:50%;background:var(--text-3,#9A978F)}
.mfs-chip.live i{background:var(--teal,#2F7473);box-shadow:0 0 0 3px var(--teal-soft,#DCEFE9)}`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  let scrim, modal;

  function ensure() {
    if (modal) return;
    scrim = document.createElement("div"); scrim.className = "mfs-scrim"; scrim.onclick = close;
    modal = document.createElement("div"); modal.className = "mfs-modal"; modal.setAttribute("role", "dialog"); modal.setAttribute("aria-label", "AI engine settings");
    document.body.append(scrim, modal);
    document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
  }

  function html() {
    const s = Engine.get();
    const r = (n, v, cur) => `name="mfs-${n}" value="${v}" ${cur === v ? "checked" : ""}`;
    const live = s.mode === "live";
    return `<div class="mfs-h"><h3>AI engine</h3><button class="mfs-x" data-x aria-label="Close">&times;</button></div>
      <p class="mfs-note">Choose what powers the agent's reasoning and answers. The workspace data is the same either way.</p>
      <label class="mfs-opt ${!live ? "on" : ""}"><input type="radio" ${r("mode", "sim", s.mode)}>
        <div><b>Simulated demo</b><span class="mfs-pill grey">Default</span>
        <p class="mfs-note">Scripted dummy replies. Nothing to install, works offline, identical every run.</p></div></label>
      <label class="mfs-opt ${live ? "on" : ""}"><input type="radio" ${r("mode", "live", s.mode)}>
        <div><b>Live AI agent</b>
        <p class="mfs-note">A real model writes the agent's reasoning from the same data. If a call fails, the app falls back to the simulated reply.</p></div></label>
      ${live ? `<div class="mfs-sub">
        <label class="mfs-opt ${s.provider === "ollama" ? "on" : ""}" style="margin-top:0"><input type="radio" ${r("provider", "ollama", s.provider)}>
          <div style="flex:1"><b>Local Gemma via Ollama</b><span class="mfs-pill ok">Data stays on this computer</span>
            <p class="mfs-note" style="margin-top:4px">One-time setup: install <a href="https://ollama.com" target="_blank" rel="noopener">Ollama</a>, then run <code>ollama pull ${esc(s.ollamaModel)}</code>. If this page is served from the web instead of opened from disk, start Ollama with <code>OLLAMA_ORIGINS=*</code>.</p>
            <div class="mfs-row"><label class="mfs-f"><span>Ollama URL</span><input data-k="ollamaUrl" value="${esc(s.ollamaUrl)}"></label>
              <label class="mfs-f"><span>Model</span><input data-k="ollamaModel" value="${esc(s.ollamaModel)}"></label></div></div></label>
        <details ${s.provider !== "ollama" ? "open" : ""}><summary>Use a cloud model instead (your own API key)</summary>
          <label class="mfs-opt ${s.provider === "anthropic" ? "on" : ""}"><input type="radio" ${r("provider", "anthropic", s.provider)}>
            <div style="flex:1"><b>Claude</b><div class="mfs-row">
              <label class="mfs-f"><span>API key</span><input type="password" data-k="anthropicKey" value="${esc(s.anthropicKey)}" placeholder="sk-ant-..." autocomplete="off"></label>
              <label class="mfs-f"><span>Model</span><input data-k="anthropicModel" value="${esc(s.anthropicModel)}"></label></div></div></label>
          <label class="mfs-opt ${s.provider === "openai" ? "on" : ""}"><input type="radio" ${r("provider", "openai", s.provider)}>
            <div style="flex:1"><b>OpenAI</b><div class="mfs-row">
              <label class="mfs-f"><span>API key</span><input type="password" data-k="openaiKey" value="${esc(s.openaiKey)}" placeholder="sk-..." autocomplete="off"></label>
              <label class="mfs-f"><span>Model</span><input data-k="openaiModel" value="${esc(s.openaiModel)}" placeholder="model id"></label></div></div></label>
          <p class="mfs-note" style="margin-top:8px">A Claude or ChatGPT chat subscription can't be connected here: those plans don't include API access for other apps. Keys are stored only in this browser.</p>
        </details>
        <div class="mfs-test"><button class="mfs-btn" data-test>Test connection</button><span data-out class="mfs-note"></span></div>
      </div>` : ""}
      <div class="mfs-foot"><span class="mfs-note">Demo: put every decision back to the starting state.</span>
        <button class="mfs-btn" data-reset>Reset demo</button></div>`;
  }

  function render() {
    modal.innerHTML = html();
    modal.querySelector("[data-x]").onclick = close;
    modal.querySelectorAll("input[name^=mfs-]").forEach(i => i.addEventListener("change", () => { Engine.set({ [i.name.slice(4)]: i.value }); render(); }));
    modal.querySelectorAll("input[data-k]").forEach(i => i.addEventListener("change", () => Engine.set({ [i.dataset.k]: i.value.trim() })));
    modal.querySelector("[data-reset]").onclick = () => {
      if (window.MFState) MFState.reset();
      window.dispatchEvent(new Event("mf-reset"));
      location.reload();
    };
    const t = modal.querySelector("[data-test]");
    if (t) t.onclick = async () => {
      modal.querySelectorAll("input[data-k]").forEach(i => Engine.set({ [i.dataset.k]: i.value.trim() }));
      const out = modal.querySelector("[data-out]");
      out.innerHTML = '<span class="mfs-dots"><i></i><i></i><i></i></span>';
      try { const r = await Engine.test(); out.innerHTML = `<span class="mfs-ok">Connected \u00b7 replied "${esc(r.trim().slice(0, 40))}"</span>`; }
      catch (e) { out.innerHTML = `<span class="mfs-err">${esc(e.message)}</span>`; }
    };
  }

  function open() { ensure(); render(); scrim.classList.add("on"); modal.classList.add("on"); }
  function close() { if (!modal) return; scrim.classList.remove("on"); modal.classList.remove("on"); }

  function chip(el) {
    if (!el) return;
    const draw = () => {
      const s = Engine.get();
      el.innerHTML = `<button class="mfs-chip ${s.mode === "live" ? "live" : ""}" title="AI engine settings"><i></i>${esc(Engine.label(s))}</button>`;
      el.firstChild.onclick = open;
    };
    draw(); window.addEventListener("engine-change", draw);
  }

  window.MFSettings = { open, close, chip };
})();
