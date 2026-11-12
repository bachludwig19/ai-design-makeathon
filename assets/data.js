// Shared synthetic dataset. Every screen reads from here so counts always agree.
window.MF = {
  user: { name: "Alex Mercer", tier: "Alpine Pro Tier", persona: "Product Manager" },
  goal: { id: "delivery", title: "Keep product delivery on track", status: "at-risk", progress: 72,
          milestones: [18, 25], sprints: 4, target: "Nov 28" },
  meeting: { title: "Q3 Architecture Alignment", when: "yesterday" },
  // The same 3 items are flagged by step 3 (Owner & Deadline Validation).
  actionItems: [
    { id: "ai-1", title: "Finalize onboarding flow requirements & wireframes", state: "unassigned",
      quote: "We need someone to lock down the Figma screens for SSO onboarding by Tuesday morning or enterprise demo gets pushed back.",
      speaker: "Marcus Vance (Product Lead)", ts: "00:42:15", due: "Yesterday, 5:00 PM",
      suggestedOwner: { name: "Priya Shah", confidence: 0.86,
        evidence: ["Owns 4 open SSO onboarding tickets (ENG-CORE)", "Said \"I can take the Figma pass\" at 00:43:02", "Has capacity this sprint (3 of 8 pts)"] } },
    { id: "ai-2", title: "Confirm API dependencies with security team", state: "awaiting-confirmation",
      quote: "David, can you verify if OAuth2 tokens pass the regional data residency check before we trigger the automated webhook?",
      owner: "David Chen", due: "Tomorrow, 12:00 PM" },
    { id: "ai-3", title: "Update rate-limit config for the partner API", state: "overdue",
      quote: "Someone should bump the partner rate limits before the load test.", owner: null, due: "Today, 9:00 AM" }
  ],
  pipeline: ["Meeting Transcript Ingest","Extract Action Items","Owner & Deadline Validation",
             "Create Jira / Linear Task","Human Review & Signoff","Track & Follow-up"]
};

// ---- Appended for index / goal / workflow pages. Adds fields only; renames nothing. ----
(function (MF) {
  // The meeting line each suggestion's evidence cites (shown in the decision panel).
  Object.assign(MF.actionItems[0].suggestedOwner, { role: "Product Designer · SSO squad",
    sourceQuote: "I can take the Figma pass if someone sends me the SSO edge cases.", sourceSpeaker: "Priya Shah", sourceTs: "00:43:02" });
  Object.assign(MF.actionItems[1], { speaker: "Marcus Vance (Product Lead)", ts: "00:47:30" });
  Object.assign(MF.actionItems[2], { speaker: "Sam Ortiz (Engineering Manager)", ts: "00:50:32",
    suggestedOwner: { name: "Jordan Lee", role: "Platform Engineer · Partner API", confidence: 0.78,
      evidence: ["Authored the last 3 changes to the partner-gateway rate-limit config", "On call for the Partner API this week", "Said \"I'll watch gateway metrics during the load test\" at 00:51:10"],
      sourceQuote: "The load test kicks off Thursday. I'll watch gateway metrics while it runs.", sourceSpeaker: "Jordan Lee", sourceTs: "00:51:10" } });
  // Already done before the run paused (step 2 extracted 4 items: these 3 + this one).
  MF.completedItems = [{ title: "Review updated pricing tier requirements for Alpine Pro",
    quote: "Sarah will update the tier table in Notion by end of day Monday.", owner: "Sarah Jenkins", completed: "Today at 9:14 AM", jira: "MF-409" }];
  MF.team = [
    { name: "Priya Shah", role: "Product Designer", load: "3 of 8 pts" },
    { name: "Jordan Lee", role: "Platform Engineer", load: "5 of 8 pts" },
    { name: "David Chen", role: "Security Engineer", load: "6 of 8 pts" },
    { name: "Sarah Jenkins", role: "Product Ops", load: "4 of 8 pts" },
    { name: "Elena Ruiz", role: "Frontend Engineer", load: "7 of 8 pts" }
  ];
  MF.pipelineMeta = ["Parsed Zoom VTT / audio stream", "Alpine extraction model (4 items)", "Checks every item has an owner & date",
    "Creates tickets in ENG-CORE", "Owner confirms in Slack", "Reminders 24h before due"];
  MF.resolution = { progressBefore: 72, progressAfter: 81,
    jiraKeys: { "ai-1": "ENG-CORE-412", "ai-2": "ENG-CORE-413", "ai-3": "ENG-CORE-414" } };
  MF.supportingWorkflows = [
    { id: "meeting-intel", name: "Meeting Intelligence", desc: "Auto-extracts commitments from syncs", status: "healthy" },
    { id: "action-items", name: "Action Item Tracking", desc: "Monitors ownership & deadlines", status: "attention", href: "workflow.html" },
    { id: "sprint", name: "Sprint Monitoring", desc: "Tracks velocity and scope creep", status: "healthy" },
    { id: "deps", name: "Dependency Monitoring", desc: "Cross-team blocker detection", status: "healthy" }
  ];
  MF.recommendations = [
    { text: "Follow up on unassigned tasks to restore delivery confidence.", cta: "Execute action", href: "workflow.html" },
    { text: "Identify overdue delivery commitments across backend squads.", cta: "Review backlog" },
    { text: "Generate an updated delivery risk report for stakeholders.", cta: "Generate report" }
  ];
  // Switchable personas: same product, different goals. "Product Manager" is the wired demo path.
  MF.personas = {
    "Product Manager": { noun: "product", health: { onTrack: 7, atRisk: 2, offTrack: 1 },
      goals: [
        { title: "Understand customer needs", desc: "Synthesizing feedback from customer interviews.", status: "on-track", progress: 92 },
        { id: "delivery", title: "Keep product delivery on track", desc: "Addressing review bottlenecks in engineering pipelines.", status: "at-risk", progress: 72, href: "goal.html" },
        { title: "Improve product adoption", desc: "Expanding meeting intelligence rollouts.", status: "on-track", progress: 85 }
      ],
      attention: [
        { tag: "Action required", tone: "risk", title: "Customer insights report", desc: "Your approval is holding up the weekly report. Waiting 18 hours · You", cta: "Review" },
        { id: "delivery", tag: "Waiting on others", tone: "teal", title: "Engineering delivery commitments", desc: "{n} action items have no confirmed owner · 2 days", cta: "Review", href: "goal.html" },
        { tag: "System alert", tone: "risk", title: "Product analytics", desc: "Metrics data source has disconnected. AI can attempt recovery.", cta: "Attempt recovery", secondary: true }
      ] },
    "Engineering Lead": { noun: "engineering", health: { onTrack: 5, atRisk: 2, offTrack: 1 },
      goals: [
        { title: "Cut incident response time", desc: "On-call agent drafts timelines and paging summaries.", status: "at-risk", progress: 64 },
        { title: "Ship platform v3 migration", desc: "Tracking service cutovers across 6 squads.", status: "on-track", progress: 88 },
        { title: "Keep CI green", desc: "Flaky-test agent quarantining unstable suites.", status: "off-track", progress: 41 }
      ],
      attention: [
        { tag: "Action required", tone: "risk", title: "Production deploy freeze exception", desc: "Release agent wants approval to ship a hotfix during the freeze. Waiting 2 hours · You", cta: "Review" },
        { tag: "Waiting on others", tone: "teal", title: "PR review backlog", desc: "9 pull requests older than 48h with no reviewer · 3 days", cta: "Review" },
        { tag: "System alert", tone: "risk", title: "Flaky test detector", desc: "14 suites quarantined overnight. AI can open fix tickets.", cta: "Open tickets", secondary: true }
      ] }
  };
})(window.MF);

// ---- Appended by session ee (AI engine). Adds fields only; renames nothing. ----
(function (MF) {
  // Policy the agent follows: below this confidence it must ask a human instead of assigning.
  MF.policy = { autoAssignThreshold: 0.9 };
  // People the agent considered and rejected, for the decision panel ("why not X?").
  MF.actionItems[0].alternatives = [
    { name: "Elena Ruiz", role: "Frontend Engineer", confidence: 0.41, why: "Knows the onboarding code, but is near capacity (7 of 8 pts) and does not own design work." },
    { name: "Marcus Vance", role: "Product Lead", confidence: 0.22, why: "Raised the item, but he reviews wireframes rather than producing them." }
  ];
  MF.actionItems[2].alternatives = [
    { name: "Sam Ortiz", role: "Engineering Manager", confidence: 0.24, why: "Raised it and can delegate, but does not ship config changes himself." },
    { name: "David Chen", role: "Security Engineer", confidence: 0.18, why: "Reviews gateway changes for security, but is already busy with the OAuth2 residency check." }
  ];
})(window.MF);

// Demo decision store that survives page changes. Reset from the AI engine settings modal.
window.MFState = {
  key: "mf.demo.v1",
  get() { try { return JSON.parse(localStorage.getItem(this.key)) || { owners: {}, log: [] }; } catch { return { owners: {}, log: [] }; } },
  set(s) { try { localStorage.setItem(this.key, JSON.stringify(s)); } catch {} },
  reset() { try { localStorage.removeItem(this.key); } catch {} },
  flagged() { return window.MF.actionItems.filter(i => i.suggestedOwner); },
  resolved() { const s = this.get(); return this.flagged().every(i => s.owners[i.id]); },
  assign(id, name, how) { const s = this.get(); s.owners[id] = name; s.log.unshift({ t: new Date().toISOString(), id, name, how }); this.set(s); }
};
