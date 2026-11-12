// MeetFlow Alpine shell: injects the left nav + top bar, and shares small helpers (icons, demo state, toasts).
// Page markup: <div class="app"><aside id="mf-nav"></aside><div class="main"><header id="mf-top"></header><main class="content">…
(function () {
  const MF = window.MF;
  const P = (d) => d;
  const ICONS = {
    home: P('<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>'),
    bot: P('<rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 8V4M9 4h6M2 13v3M22 13v3"/><circle cx="9" cy="14" r="1.1" fill="currentColor"/><circle cx="15" cy="14" r="1.1" fill="currentColor"/>'),
    store: P('<path d="M4 4h16l1 5H3zM3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0M5 12v8h14v-8M10 20v-5h4v5"/>'),
    checkCircle: P('<circle cx="12" cy="12" r="9"/><path d="m8.5 12.2 2.4 2.4 4.8-5"/>'),
    spark: P('<path d="M3 17 8 11l4 4 4-7 5 5"/><circle cx="21" cy="13" r=".6" fill="currentColor"/>'),
    agents: P('<path d="M12 3a7 7 0 0 0-4 12.7V19a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-3.3A7 7 0 0 0 12 3z"/><circle cx="12" cy="10" r="2.2"/><path d="M12 6v1.6M12 12.4V14M8.5 10h1.3M14.2 10h1.3"/>'),
    plug: P('<path d="M10 3h4v3.5a1.8 1.8 0 1 0 3.5 0V3H21v7h-3a2 2 0 1 0 0 4h3v7h-7v-3a2 2 0 1 0-4 0v3H3v-7h3a2 2 0 1 0 0-4H3V3h7z"/>'),
    db: P('<ellipse cx="12" cy="5.5" rx="8" ry="2.8"/><path d="M4 5.5v13c0 1.5 3.6 2.8 8 2.8s8-1.3 8-2.8v-13M4 12c0 1.5 3.6 2.8 8 2.8s8-1.3 8-2.8"/>'),
    menu: P('<path d="M3 6h13M3 12h9M3 18h13M21 8l-4 4 4 4"/>'),
    search: P('<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>'),
    bell: P('<path d="M6 16V11a6 6 0 1 1 12 0v5l2 2H4zM10 21h4"/>'),
    gear: P('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
    sparkles: P('<path d="M10 3l1.6 4.4L16 9l-4.4 1.6L10 15l-1.6-4.4L4 9l4.4-1.6zM18 13l.9 2.1L21 16l-2.1.9L18 19l-.9-2.1L15 16l2.1-.9z"/>'),
    arrow: P('<path d="M5 12h14M13 6l6 6-6 6"/>'),
    alert: P('<path d="M12 3 2 20h20zM12 10v4"/><circle cx="12" cy="17" r=".7" fill="currentColor"/>'),
    alertCircle: P('<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5"/><circle cx="12" cy="16.3" r=".7" fill="currentColor"/>'),
    check: P('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
    x: P('<path d="M6 6l12 12M18 6 6 18"/>'),
    trend: P('<path d="m3 17 6-6 4 4 8-8M15 7h6v6"/>'),
    zap: P('<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>'),
    clock: P('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    file: P('<path d="M14 3H6v18h12V7zM14 3v4h4M9 13h6M9 17h6"/>'),
    play: P('<path d="M7 4v16l13-8z"/>'),
    pencil: P('<path d="M4 20h4L19 9l-4-4L4 16zM14 6l4 4"/>'),
    download: P('<path d="M12 4v11M7 10l5 5 5-5M4 20h16"/>'),
    eye: P('<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
    msg: P('<path d="M4 5h16v11H9l-5 4z"/>'),
    userPlus: P('<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0M19 8v6M16 11h6"/>'),
    user: P('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
    hourglass: P('<path d="M6 3h12M6 21h12M7 3c0 5 10 5 10 9s-10 4-10 9M17 3c0 5-10 5-10 9s10 4 10 9"/>'),
    flow: P('<rect x="3" y="3" width="7" height="6" rx="1.5"/><rect x="14" y="15" width="7" height="6" rx="1.5"/><path d="M6.5 9v4a2 2 0 0 0 2 2H14"/>'),
    grid: P('<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>'),
    history: P('<path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 2"/>'),
    ticket: P('<path d="M3 8a2 2 0 0 0 0 4v0a2 2 0 0 0 0 4v3h18v-3a2 2 0 0 1 0-4 2 2 0 0 1 0-4V5H3z" transform="translate(0 -1)"/><path d="M14 5v14" stroke-dasharray="2 2"/>'),
    target: P('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/>'),
    shield: P('<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>'),
    chart: P('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
    nodes: P('<circle cx="12" cy="5" r="2.2"/><circle cx="5" cy="18" r="2.2"/><circle cx="19" cy="18" r="2.2"/><circle cx="12" cy="12" r="2.2"/><path d="M12 7.2v2.6M10.3 13.5l-3.6 3M13.7 13.5l3.6 3"/>'),
    sliders: P('<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>'),
    undo: P('<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>'),
    slack: P('<rect x="3" y="10" width="8" height="3" rx="1.5"/><rect x="13" y="11" width="8" height="3" rx="1.5"/><rect x="10" y="3" width="3" height="8" rx="1.5"/><rect x="11" y="13" width="3" height="8" rx="1.5"/>')
  };
  function icon(n, cls) {
    return `<svg class="ic ${cls || ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ""}</svg>`;
  }
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const initials = (n) => n.split(/\s+/).map((w) => w[0]).slice(0, 2).join("");

  // ---- Demo state. Decisions live in MFState (data.js, shared with other pages); persona is per tab. ----
  const PKEY = "mf.persona";
  function getState() { return window.MFState ? MFState.get() : { owners: {}, log: [] }; }
  function isResolved() { const s = getState(); return MF.actionItems.every((i) => s.owners && s.owners[i.id]); }
  function persona() { try { return sessionStorage.getItem(PKEY) || MF.user.persona; } catch (e) { return MF.user.persona; } }
  function setPersona(p) { try { sessionStorage.setItem(PKEY, p); } catch (e) {} }
  function clearLocal() { try { sessionStorage.removeItem(PKEY); sessionStorage.removeItem("mf.seen81"); } catch (e) {} }
  function reset() { if (window.MFState) MFState.reset(); clearLocal(); location.href = "index.html"; }
  window.addEventListener("mf-reset", clearLocal);
  // The delivery goal, as it stands now.
  function goalNow() {
    const r = isResolved();
    return { ...MF.goal, status: r ? "on-track" : MF.goal.status, progress: r ? MF.resolution.progressAfter : MF.goal.progress, resolved: r };
  }

  // ---- Toasts ----
  let tray;
  function toast(msg, ic) {
    if (!tray) { tray = document.createElement("div"); tray.className = "toasts"; document.body.appendChild(tray); }
    const t = document.createElement("div");
    t.className = "toast"; t.innerHTML = icon(ic || "sparkles") + `<span>${msg}</span>`;
    tray.appendChild(t);
    setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 300); }, 3200);
  }

  // ---- Shell ----
  function shell() {
    const page = document.body.dataset.page;
    const navEl = document.getElementById("mf-nav");
    const link = (id, label, ic, href) => {
      const on = id === page || (page === "goal" && id === "home") || (page === "workflow" && id === "tasks");
      return href
        ? `<a class="nav-link ${on ? "active" : ""}" href="${href}" title="${label.replace(/&amp;/g, "&")}">${icon(ic)}<span class="lbl">${label}</span></a>`
        : `<a class="nav-link off" tabindex="-1" aria-disabled="true" title="Not available in this demo">${icon(ic)}<span class="lbl">${label}</span></a>`;
    };
    if (navEl) {
      navEl.innerHTML = `
        <a class="brand" href="index.html"><span class="brand-mark">GF</span><span class="lbl">Goal with the Flow</span></a>
        <div class="nav-section">Platform</div>
        ${link("home", "Home", "home", "index.html")}
        ${link("assistant", "AI Assistant", "bot")}
        ${link("market", "Workflow Library", "store")}
        ${link("tasks", "My Tasks &amp; Approvals", "checkCircle", "workflow.html")}
        ${link("activity", "Activity &amp; Insights", "spark")}
        <div class="nav-section" style="margin-top:6px">Build &amp; Configure</div>
        ${link("agents", "Create workflows", "agents", "canvas.html")}
        ${link("integrations", "Integrations", "plug")}
        ${link("knowledge", "Knowledge &amp; Data", "db")}
        <div class="nav-foot">
          <div class="who"><span class="avatar">${icon("user", "ic-sm")}</span>
            <div><div class="who-name">${esc(MF.user.name)}</div><div class="who-tier">${esc(MF.user.tier)}</div></div></div>
        </div>`;
    }
    // Collapsible left menu (icons only), remembered per browser.
    const CK = "mf.nav.collapsed", app = document.querySelector(".app");
    const css = document.createElement("style");
    css.textContent = `.app{transition:grid-template-columns .25s ease}
      .app.nav-collapsed{grid-template-columns:76px 1fr}
      .app.nav-collapsed #mf-nav .lbl,.app.nav-collapsed #mf-nav .nav-section,.app.nav-collapsed #mf-nav .who>div,.app.nav-collapsed #mf-nav .reset-link{display:none}
      .app.nav-collapsed #mf-nav .brand{justify-content:center;padding-left:0;padding-right:0}
      .app.nav-collapsed #mf-nav .nav-link{justify-content:center;margin:2px 10px;padding:11px 0}
      .app.nav-collapsed #mf-nav .who{justify-content:center}
      #mf-nav{overflow:hidden}`;
    document.head.appendChild(css);
    const setC = (c) => { if (app) app.classList.toggle("nav-collapsed", c); try { localStorage.setItem(CK, c ? "1" : ""); } catch (e) {} };
    try { if (localStorage.getItem(CK) === "1" && app) app.classList.add("nav-collapsed"); } catch (e) {}
    const top = document.getElementById("mf-top");
    if (top) {
      top.innerHTML = `
        <button class="icon-btn" id="mf-collapse" aria-label="Collapse menu" title="Collapse menu">${icon("menu")}</button><span class="crumb"></span>
        <span style="flex:1"></span>
        <span class="mfs-chip" style="cursor:default"><i></i>Demo flow</span>
        <button class="btn btn-white btn-sm" id="mf-reset" title="Clear demo decisions and start over" style="margin-left:8px">Reset demo</button>`;
      top.querySelector("#mf-reset").addEventListener("click", (e) => { e.preventDefault(); reset(); });
      top.querySelector("#mf-collapse").addEventListener("click", () => setC(!(app && app.classList.contains("nav-collapsed"))));
      // No engine settings in the demo: always run the scripted flow.
      try { const k = "mf.engine.v1", e = JSON.parse(localStorage.getItem(k) || "{}"); if (e.mode === "live") { e.mode = "sim"; localStorage.setItem(k, JSON.stringify(e)); } } catch (e) {}
    }
  }

  // Anything marked .off is not wired in the demo: block it and say so briefly.
  document.addEventListener("click", (e) => {
    const off = e.target.closest(".off");
    if (!off) return;
    e.preventDefault(); e.stopPropagation();
    toast("Not available in this demo", "clock");
  }, true);

  window.MFApp = { icon, esc, initials, toast, getState, isResolved, goalNow, persona, setPersona, reset };
  shell();
})();
