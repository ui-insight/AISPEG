// Data backing app/reports/presidential-brief-feb-2026/page.tsx — the
// February 7, 2026 executive briefing. Point-in-time content; do not
// amend retroactively.

export const adoptionPhases = [
  {
    phase: "Pre-Agentic",
    period: "Feb 1-5",
    avgCommitsPerDay: 2.6,
    avgNetLOCPerDay: 539,
  },
  {
    phase: "Tools Available",
    period: "Feb 6-11",
    avgCommitsPerDay: 8.5,
    avgNetLOCPerDay: 4681,
  },
  {
    phase: "Robison & Sheneman Adopt",
    period: "Feb 12-19",
    avgCommitsPerDay: 32.1,
    avgNetLOCPerDay: 14777,
  },
  {
    phase: "Full Team",
    period: "Feb 20-26",
    avgCommitsPerDay: 72.7,
    avgNetLOCPerDay: 12701,
  },
];

export const shadowApplications = [
  { name: "Dissertation reformatting", owner: "Jerry McMurtry" },
  { name: "Strategic Plan Dashboard", owner: "Michele Bartlett" },
  { name: "Institutional AI Initiative coordination site", owner: "IIDS" },
  { name: "RFD Career Dashboard", owner: "Carly Cummings" },
  { name: "Out of State Tax tool", owner: "Cretia Bunney" },
  { name: "SEM Experiential Learning Dashboard", owner: "Dean Kahler, SEM Vibe Coder in Chief" },
  { name: "Public Administration Education Tool", owner: "Michael Overton" },
  { name: "UCM Daily Register Newsletter Application", owner: "Jodi Walker" },
  { name: "GPSA Exhibition Judging Application", owner: "GPSA" },
  { name: "Process Mapping Dashboard", owner: "AI4RA" },
];

export const oredProjects = [
  { name: "AI4RA UDM / Data Lakehouse", lead: "Layman", unit: "AI4RA", featured: true },
  { name: "Vandalizer", lead: "Brunsfeld", unit: "AI4RA", featured: true },
  { name: "MindRouter 2.0", lead: "Sheneman", unit: "RCDS", featured: true },
  { name: "OpenERA", lead: "Robison", unit: "AI4RA", featured: true },
  { name: "ProposalForge", lead: "Sheneman", unit: "RCDS", featured: false },
  { name: "Idaho Unfiltered", lead: "Child", unit: "RCDS", featured: false },
];

export const currentConstraints = [
  "Cultural resistance: 'Yeah, but...' framing limits exploration",
  "Cannot deploy the tools with university data and systems",
  "No approved deployment target for shadow applications increases risks and reduces ROI",
];

export const recommendations = [
  {
    title: "Framing and Culture",
    description: "YES, AND... — shift from resistance framing to additive exploration",
  },
  {
    title: "Internal Infrastructure",
    description: "Enterprise agreement(s) that allow us to securely use these tools with institutional data and systems. Institutional Ecosystem supporting templated development, testing, and deployment of Agentic AI coded applications.",
  },
  {
    title: "New Approach to SaaS",
    description: "Create and implement a plan for data repatriation alongside the governance and data modernization initiative. Open Source deployment into the higher ed sector is an opportunity for widespread impact.",
  },
];
