// Guided demo: a hint toast + a pulsing brass ring on the next thing to click.
// Rules are checked top to bottom on every DOM change; the first visible target wins.
(function () {
  const OFF = "mf.tour.off";
  const off = () => { try { return sessionStorage.getItem(OFF) === "1"; } catch (e) { return false; } };
  const setOff = (v) => { try { v ? sessionStorage.setItem(OFF, "1") : sessionStorage.removeItem(OFF); } catch (e) {} };
  const page = document.body.dataset.page || (location.pathname.match(/(\w+)\.html$/) || [, "index"])[1];
  const resolved = () => (window.MFApp && MFApp.isResolved ? MFApp.isResolved() : false);

  const RULES = {
    home: [
      { when: () => !(window.MFState && MFState.get().created), sel: '#ask button[type="submit"]', n: 1, text: "Start here: describe your goal, then click <b>Create goal</b>." },
      { when: () => !resolved(), sel: '#goals a.goal-card[href="goal.html"]', n: 2, text: "Your new goal is <b>at risk</b>. Open it to see why." },
      { when: resolved, sel: '#mf-nav a.nav-link[href="canvas.html"]', n: 8, text: "Delivery is back on track. See the workflow behind it in <b>Create workflows</b>." }
    ],
    goal: [
      { when: () => !resolved(), sel: 'a.btn[href="workflow.html"]', n: 3, text: "3 action items are blocking this goal. Click <b>Resolve blockers</b>." },
      { when: resolved, sel: '#mf-nav a.nav-link[href="index.html"]', n: 7, text: "Blockers cleared: 72% → 81%. Head back <b>Home</b>." }
    ],
    workflow: [
      { sel: "[data-accept]", n: 4, text: "Here is the agent's evidence and confidence. <b>Assign</b> its pick, or choose someone else." },
      { when: () => !(window.MFState && MFState.resolved()), sel: "[data-open]", n: 4, text: "The agent paused: it's under 90% sure who owns this. Click <b>Assign suggested owner</b>." },
      { sel: "[data-approve]", n: 5, text: "This owner hasn't confirmed yet. <b>Approve &amp; sync</b>, or send a reminder." },
      { sel: '#banner-slot a.btn[href="goal.html"]', n: 6, text: "The pipeline resumed and the goal recovered. Click <b>View goal</b>." }
    ],
    canvas: [
      { when: () => window.MFCanvas && MFCanvas.deployed && MFCanvas.modalOpen, sel: "#mClose", n: 4, text: "Your fix is live. Click <b>Done</b>." },
      { when: () => window.MFCanvas && MFCanvas.deployed, sel: '#nav a.mf-link[href="index.html"]', n: 5, text: "Done. Head back <b>Home</b>." },
      { when: () => window.MFCanvas && MFCanvas.state === "passed", sel: "#deployBtn", n: 4, text: "All green. Click <b>Deploy</b>." },
      { when: () => window.MFCanvas && MFCanvas.state === "failed", sel: "#insp [data-fix]", n: 2, text: "A step failed. Pick a fix on the right." },
      { when: () => window.MFCanvas && MFCanvas.state === "fixed", sel: "#runBtn", n: 3, text: "Click <b>Run test again</b>." },
      { when: () => window.MFCanvas && MFCanvas.state === "idle", sel: "#runBtn", n: 1, text: "Click <b>Run test</b>." }
    ]
  }[page];
  if (!RULES) return;

  const css = document.createElement("style");
  css.textContent = `
  .tour-target{position:relative;z-index:5;outline:2px solid var(--gold,#A07B3A)!important;outline-offset:4px;animation:tourPulse 1.6s ease-in-out infinite}
  @keyframes tourPulse{0%,100%{box-shadow:0 0 0 0 rgba(var(--gold-rgb,160,123,58),.55)}50%{box-shadow:0 0 0 10px rgba(var(--gold-rgb,160,123,58),0)}}
  .tour-tip{position:fixed;left:0;top:0;z-index:9999;display:flex;align-items:center;gap:14px;
    width:max-content;max-width:min(420px,calc(100vw - 24px));padding:14px 18px;background:#111;color:#fff;font:14px/1.45 var(--font,system-ui);
    border:1px solid rgba(var(--gold-rgb,160,123,58),.7);border-radius:var(--radius,4px);box-shadow:0 24px 48px -20px rgba(0,0,0,.6);animation:tourIn .35s ease both}
  .tour-tip .n{flex:none;width:26px;height:26px;border-radius:50%;display:grid;place-items:center;background:var(--gold,#A07B3A);color:#111;font-weight:700;font-size:12px}
  .tour-tip b{color:#E9C98A;font-weight:600}
  .tour-tip button{flex:none;margin-left:6px;background:none;border:0;color:rgba(255,255,255,.6);font:inherit;font-size:12px;text-decoration:underline;cursor:pointer}
  @keyframes tourIn{from{opacity:0}}
  .tour-tip::before{content:"";position:absolute;left:var(--ax,50%);width:12px;height:12px;margin-left:-6px;background:#111;transform:rotate(45deg);
    border:1px solid rgba(var(--gold-rgb,160,123,58),.7)}
  .tour-tip.below::before{top:-7px;border-right:0;border-bottom:0}
  .tour-tip.above::before{bottom:-7px;border-left:0;border-top:0}
  .tour-tip.left::before{left:auto;right:-7px;top:var(--ay,50%);margin:-6px 0 0;border-left:0;border-bottom:0}
  @media (prefers-reduced-motion:reduce){.tour-target,.tour-tip{animation:none}}`;
  document.head.appendChild(css);

  const tip = document.createElement("div");
  tip.className = "tour-tip"; tip.setAttribute("role", "status");
  let cur = null, curText = "";

  // Visible = rendered, enabled, and not clipped away by a collapsed ancestor (e.g. a closed .decide-wrap).
  function visible(el) {
    if (!el || el.offsetParent === null || el.disabled || el.closest(".off")) return false;
    const r = el.getBoundingClientRect(); if (r.width < 1 || r.height < 1) return false;
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      if (getComputedStyle(p).overflow === "visible") continue;
      const q = p.getBoundingClientRect();
      if (q.height < 2 || r.bottom <= q.top || r.top >= q.bottom) return false;
    }
    return true;
  }
  function update() {
    if (off()) { clear(); return; }
    let hit = null, rule = null;
    for (const r of RULES) {
      if (r.when && !r.when()) continue;
      const el = [...document.querySelectorAll(r.sel)].find(visible);
      if (el) { hit = el; rule = r; break; }
    }
    if (hit !== cur) {
      if (cur) cur.classList.remove("tour-target");
      cur = hit;
      if (cur) {
        cur.classList.add("tour-target");
        const b = cur.getBoundingClientRect();
        // Scroll the window only: scrollIntoView would also scroll overflow:hidden panels and clip their content.
        if (b.top < 70 || b.bottom > innerHeight - 110) scrollBy({ top: b.top - innerHeight / 2 + b.height / 2, behavior: "smooth" });
      }
    }
    if (!rule) { tip.remove(); curText = ""; return; }
    const html = `<span class="n">${rule.n}</span><span>${rule.text}</span><button type="button" data-tour-skip>Skip tour</button>`;
    if (html !== curText) { tip.innerHTML = html; curText = html; }
    if (!tip.isConnected) document.body.appendChild(tip);
    place();
  }
  // Pin the hint next to its target: below it if there's room, else above; arrow points at the target.
  function place() {
    if (!cur || !tip.isConnected) return;
    const r = cur.getBoundingClientRect(), w = tip.offsetWidth, h = tip.offsetHeight, gap = 14, m = 12;
    // Targets in a right-hand side panel: sit to their left so the hint doesn't cover the other options.
    if (r.left > innerWidth * 0.7 && r.left - gap - w >= m) {
      const t = Math.max(m, Math.min(r.top + r.height / 2 - h / 2, innerHeight - h - m));
      tip.classList.remove("below", "above"); tip.classList.add("left");
      tip.style.setProperty("top", t + "px", "important");
      tip.style.setProperty("left", (r.left - gap - w) + "px", "important");
      tip.style.setProperty("bottom", "auto", "important");
      tip.style.setProperty("transform", "none", "important");
      tip.style.setProperty("--ay", (r.top + r.height / 2 - t) + "px");
      return;
    }
    tip.classList.remove("left");
    const below = r.bottom + gap + h <= innerHeight - m || r.top - gap - h < m;
    const top = below ? r.bottom + gap : r.top - gap - h;
    const cx = r.left + r.width / 2;
    const left = Math.max(m, Math.min(cx - w / 2, innerWidth - w - m));
    tip.classList.toggle("below", below); tip.classList.toggle("above", !below);
    tip.style.setProperty("top", Math.max(m, Math.min(top, innerHeight - h - m)) + "px", "important");
    tip.style.setProperty("left", left + "px", "important");
    tip.style.setProperty("bottom", "auto", "important");
    tip.style.setProperty("transform", "none", "important");
    tip.style.setProperty("--ax", Math.max(16, Math.min(cx - left, w - 16)) + "px");
  }
  function clear() { if (cur) cur.classList.remove("tour-target"); cur = null; tip.remove(); curText = ""; }

  tip.addEventListener("click", (e) => { if (e.target.closest("[data-tour-skip]")) { setOff(true); clear(); } });
  // Reset demo restarts the tour.
  document.addEventListener("click", (e) => { if (e.target.closest("#mf-reset")) setOff(false); }, true);
  window.addEventListener("mf-reset", () => setOff(false));

  let raf = 0;
  const schedule = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; update(); }); };
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["disabled", "class"] });
  addEventListener("resize", schedule);
  addEventListener("scroll", () => requestAnimationFrame(place), { passive: true, capture: true });
  setInterval(place, 400); // follow targets that move during animations
  setTimeout(update, 600); // let the page's entry animation settle first
})();
