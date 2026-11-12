// Shared synthetic dataset. Every screen reads from here so counts always agree.
// All people, meetings and tickets are fictional (hackathon rule: synthetic data only).
window.MF = {
  user: { name: "Alex Mercer", tier: "Alpine Pro Tier", persona: "Product Manager" },
  goal: { id: "delivery", title: "Keep product delivery on track", status: "at-risk", progress: 72,
          progressAfter: 78, milestones: [18, 25], sprints: 4, target: "Nov 28" },
  goalHealth: { before: { on: 7, risk: 2, off: 1 }, after: { on: 8, risk: 1, off: 1 } },
  goals: [
    { id: "needs", title: "Understand customer needs", blurb: "Synthesizing feedback from customer interviews.", status: "on-track", progress: 92 },
    { id: "delivery", title: "Keep product delivery on track", blurb: "Addressing review bottlenecks in engineering pipelines.", status: "at-risk", progress: 72 },
    { id: "adoption", title: "Improve product adoption", blurb: "Expanding meeting intelligence rollouts.", status: "on-track", progress: 85 }
  ],
  meeting: { title: "Q3 Architecture Alignment", when: "yesterday" },
  // Policy the agent follows: below this confidence it must not assign on its own.
  policy: { autoAssignThreshold: 0.9 },
  // The same 3 items are flagged on Home, the goal and the workflow.
  actionItems: [
    { id: "ai-1", title: "Finalize onboarding flow requirements & wireframes", state: "unassigned",
      quote: "We need someone to lock down the Figma screens for SSO onboarding by Tuesday morning or enterprise demo gets pushed back.",
      speaker: "Marcus Vance (Product Lead)", ts: "00:42:15", due: "Yesterday, 5:00 PM",
      suggestedOwner: { name: "Priya Shah", role: "Product Designer", confidence: 0.86,
        evidence: ["Owns 4 open SSO onboarding tickets (ENG-CORE)", "Said \"I can take the Figma pass\" at 00:43:02", "Has capacity this sprint (3 of 8 pts)"] },
      alternatives: [
        { name: "Tom Okafor", role: "Product Designer", confidence: 0.41, why: "Knows the design system, but is at full capacity (8 of 8 pts) and was not in the meeting." },
        { name: "Marcus Vance", role: "Product Lead", confidence: 0.22, why: "Raised the item, but he reviews wireframes rather than producing them." }
      ] },
    { id: "ai-2", title: "Confirm API dependencies with security team", state: "awaiting-confirmation",
      quote: "David, can you verify if OAuth2 tokens pass the regional data residency check before we trigger the automated webhook?",
      speaker: "Marcus Vance (Product Lead)", ts: "00:51:40", owner: "David Chen", due: "Tomorrow, 12:00 PM" },
    { id: "ai-3", title: "Update rate-limit config for the partner API", state: "overdue",
      quote: "Someone should bump the partner rate limits before the load test.",
      speaker: "Lena Ortiz (Eng Manager)", ts: "01:04:09", owner: null, due: "Today, 9:00 AM",
      suggestedOwner: { name: "Jordan Lee", role: "Backend Engineer", confidence: 0.71,
        evidence: ["Last 3 commits to partner-api/ratelimit.yaml", "On call for the load test on Thursday", "Not in the meeting, so has not agreed yet"] },
      alternatives: [
        { name: "Sam Rivera", role: "Platform Engineer", confidence: 0.38, why: "Owns the gateway, but rate limits for partners moved to the API team in Q2." },
        { name: "Lena Ortiz", role: "Eng Manager", confidence: 0.2, why: "Raised it and can delegate, but does not ship config changes herself." }
      ] }
  ],
  pipeline: ["Meeting Transcript Ingest","Extract Action Items","Owner & Deadline Validation",
             "Create Jira / Linear Task","Human Review & Signoff","Track & Follow-up"],
  pipelineDetail: ["Parsed Zoom VTT / audio stream","Found 4 items in the transcript","Flagged 2 items with missing ownership",
                   "Waiting for step 3","Queued","Queued"]};

// Demo state that survives page changes (the user's decisions). Reset from Settings.
window.MFState = {
  key: "mf.demo.v1",
  get() { try { return JSON.parse(localStorage.getItem(this.key)) || { owners: {}, log: [] }; } catch { return { owners: {}, log: [] }; } },
  set(s) { try { localStorage.setItem(this.key, JSON.stringify(s)); } catch {} },
  reset() { try { localStorage.removeItem(this.key); } catch {} },
  // The blocker clears once every flagged item (one with a suggestedOwner) has an owner.
  flagged() { return window.MF.actionItems.filter(i => i.suggestedOwner); },
  resolved() { const s = this.get(); return this.flagged().every(i => s.owners[i.id]); },
  assign(id, name, how) {
    const s = this.get(); s.owners[id] = name;
    s.log.unshift({ t: new Date().toISOString(), id, name, how });
    this.set(s);
  }
};
