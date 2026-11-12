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
      { when: () => !resolved(), sel: '#attention a.btn[href="goal.html"]', n: 1, text: "A goal you own is at risk. Click <b>Review</b>." },
      { when: resolved, sel: ".hero-cta a.btn", n: 5, text: "Delivery is back on track. Now see the workflow behind it: <b>Build a workflow</b>." }
    ],
    goal: [
      { when: () => !resolved(), sel: 'a.btn[href="workflow.html"]', n: 2, text: "3 action items are blocking this goal. Click <b>Resolve blockers</b>." },
      { when: resolved, sel: '#mf-nav a.nav-link[href="index.html"]', n: 5, text: "Blockers cleared: 72% → 81%. Head back <b>Home</b>." }
    ],
    workflow: [
      { sel: "[data-accept]", n: 3, text: "Here is the agent's evidence and confidence. <b>Assign</b> its pick, or choose someone else." },
      { sel: "[data-approve]", n: 4, text: "This owner hasn't confirmed yet. <b>Approve &amp; sync</b>, or send a reminder." },
      { sel: "#a-assign:not([disabled])", n: 3, text: "The agent paused: it's under 90% sure who owns these items. Click <b>Assign suggested owner</b>." },
      { sel: '#banner-slot a.btn[href="goal.html"]', n: 5, text: "The pipeline resumed and the goal recovered. Click <b>View goal</b>." }
    ]
  }[page];
  if (!RULES) return;

  const css = document.createElement("style");
  css.textContent = `
  .tour-target{position:relative;z-index:5;outline:2px solid var(--gold,#A07B3A)!important;outline-offset:4px;animation:tourPulse 1.6s ease-in-out infinite}
  @keyframes tourPulse{0%,100%{box-shadow:0 0 0 0 rgba(var(--gold-rgb,160,123,58),.55)}50%{box-shadow:0 0 0 10px rgba(var(--gold-rgb,160,123,58),0)}}
  .tour-tip{position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:9999;display:flex;align-items:center;gap:14px;
    max-width:min(640px,calc(100vw - 32px));padding:14px 18px;background:#111;color:#fff;font:14px/1.45 var(--font,system-ui);
    border:1px solid rgba(var(--gold-rgb,160,123,58),.7);border-radius:var(--radius,4px);box-shadow:0 24px 48px -20px rgba(0,0,0,.6);animation:tourIn .35s ease both}
  .tour-tip .n{flex:none;width:26px;height:26px;border-radius:50%;display:grid;place-items:center;background:var(--gold,#A07B3A);color:#111;font-weight:700;font-size:12px}
  .tour-tip b{color:#E9C98A;font-weight:600}
  .tour-tip button{flex:none;margin-left:6px;background:none;border:0;color:rgba(255,255,255,.6);font:inherit;font-size:12px;text-decoration:underline;cursor:pointer}
  @keyframes tourIn{from{opacity:0;transform:translate(-50%,10px)}}
  @media (prefers-reduced-motion:reduce){.tour-target,.tour-tip{animation:none}}`;
  document.head.appendChild(css);

  const tip = document.createElement("div");
  tip.className = "tour-tip"; tip.setAttribute("role", "status");
  let cur = null, curText = "";

  const visible = (el) => el && el.offsetParent !== null && !el.disabled && !el.closest(".off");
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
        if (b.top < 70 || b.bottom > innerHeight - 110) cur.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
    if (!rule) { tip.remove(); curText = ""; return; }
    const html = `<span class="n">${rule.n}</span><span>${rule.text}</span><button type="button" data-tour-skip>Skip tour</button>`;
    if (html !== curText) { tip.innerHTML = html; curText = html; }
    if (!tip.isConnected) document.body.appendChild(tip);
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
  setTimeout(update, 600); // let the page's entry animation settle first
})();
