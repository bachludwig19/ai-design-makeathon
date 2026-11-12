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
