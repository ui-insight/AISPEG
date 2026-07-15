// ============================================================
// Operational Excellence Survey — themes + explorer API
// ============================================================
// Strategic Plan Pillar 5 ("Optimizing Operational Excellence"),
// fielded October 2025. Two anonymous open-ended surveys: one for
// faculty/staff (113 respondents), one for students (54 respondents).
//
// The faculty cluster summaries and sub-themes follow the leadership
// summary deck presented in October 2025; student clusters are derived
// from the corpus (no leadership deck exists for the student survey).
// Response verbatims live in ./operational-excellence-responses.ts.
//
// To correct a summary or sub-theme, edit this file. To correct a
// verbatim or its privacy handling, edit the responses file.
// ============================================================

import type {
  SurveyAudience,
  SurveyCluster,
  SurveyClusterKey,
  SurveyMeta,
  SurveyResponse,
} from "./types";
import {
  OPERATIONAL_EXCELLENCE_RESPONSES,
  WITHHELD_RESPONSE_COUNT,
} from "./operational-excellence-responses";

export const OPERATIONAL_EXCELLENCE_META: SurveyMeta = {
  title: "Operational Excellence Survey",
  pillar: "Strategic Plan Pillar 5 — Optimizing Operational Excellence",
  fielded: "October 2025",
  respondents: [
    { audience: "faculty", label: "Faculty & staff", count: 113 },
    { audience: "student", label: "Students", count: 54 },
  ],
  withheldCount: WITHHELD_RESPONSE_COUNT,
};

const FACULTY_CLUSTERS: SurveyCluster[] = [
  {
    key: "processes",
    audience: "faculty",
    label: "Processes",
    question:
      "What processes at the University could be simplified, automated, or improved to better support students and employees?",
    summary:
      "Faculty and staff describe a sprawl of disconnected administrative systems and slow, opaque approval chains that pull time away from teaching and research. The recurring ask is consolidation and speed, not more tools.",
    subThemes: [
      {
        label: "Consolidate fragmented systems",
        description:
          "Too many single-purpose platforms (Banner, Jaggaer, Chrome River, VERAS, EPAF, Softdocs). Repeated calls for single sign-on and a Workday-style integrated system.",
      },
      {
        label: "Speed up approvals & payments",
        description:
          "Reimbursement, Accounts Payable, and purchasing turnaround measured in weeks or months. Chrome River AP review times singled out.",
      },
      {
        label: "Simplify travel & reimbursement",
        description:
          "Travel pre-authorization and reimbursement is duplicative, slow, and forces employees to float costs personally.",
      },
      {
        label: "Accelerate onboarding & hiring",
        description:
          "I-9 / EPAF / email / system access is a multi-system, multi-day scavenger hunt; position-description approval and hiring are 'glacial.'",
      },
      {
        label: "Fix website & intranet findability",
        description:
          "The 2025 website/intranet migration broke resources people relied on — schedules, forms, policies, phone numbers.",
      },
      {
        label: "Modernize grants & research admin",
        description:
          "VERAS requires the same data in multiple places; grant/contract approval runs long with PIs left out of the loop.",
      },
    ],
  },
  {
    key: "data-tools",
    audience: "faculty",
    label: "Data & tools",
    question:
      "What kinds of data, tools, or resources would help you (or your unit) make more informed and efficient decisions?",
    summary:
      "Requests cluster on real-time financial visibility, self-serve dashboards, and integrated institutional data. A distinct minority asks for sanctioned AI access — and a vocal few say the problem is transparency, not tooling.",
    subThemes: [
      {
        label: "Real-time budget & financial visibility",
        description:
          "Index/fund balances and spend that update like a bank account, without days of manual spreadsheet work.",
      },
      {
        label: "Self-serve dashboards & BI",
        description:
          "Power BI / Tableau dashboards units can run without waiting on OIT or Institutional Research to build them.",
      },
      {
        label: "Integrated, warehoused data",
        description:
          "Bi-directional flow across Banner, Slate, Argos, Sunapsis; a data warehouse / lakehouse so numbers reconcile.",
      },
      {
        label: "Sanctioned AI tools & training",
        description:
          "Access to Copilot / ChatGPT / Gemini plus guidance on which tools are approved and how to use them well.",
      },
      {
        label: "Decision-ready student analytics",
        description:
          "Enrollment, retention, DFWI, and demographic data available on demand to inform recruitment and student success.",
      },
      {
        label: "Findable resources & current docs",
        description:
          "Up-to-date APMs, SOPs, and how-tos in one searchable place — the deeper need behind many 'tool' requests.",
      },
    ],
  },
  {
    key: "talent",
    audience: "faculty",
    label: "Talent",
    question:
      "How can the University best attract, retain, and support faculty and staff in ways that strengthen our culture of excellence?",
    summary:
      "Compensation dominates — the phrase '80% of 80% of market rate' recurs — alongside adequate staffing, career pathways, professional development, flexibility, and simply being heard.",
    subThemes: [
      {
        label: "Strengthen compensation",
        description:
          "Market-rate pay, pay-compression fixes, and benefit/parking costs that don't erode the offer. The most-repeated theme in the survey.",
      },
      {
        label: "Adequate staffing & resources",
        description:
          "Units 'one person deep' can't absorb turnover; understaffing is named as the root of the process delays elsewhere.",
      },
      {
        label: "Respect, trust & recognition",
        description:
          "People want to feel valued and heard, with leadership modeling a culture of trust rather than compliance.",
      },
      {
        label: "Career pathways & development",
        description:
          "Clear advancement tiers and funded professional development for staff, not just faculty on a promotion clock.",
      },
      {
        label: "Onboarding & mentoring",
        description:
          "Named mentors for new hires and a coherent first-weeks experience instead of piecemeal setup.",
      },
      {
        label: "Flexibility & clear policies",
        description:
          "Remote/hybrid options where reasonable, and transparent, consistent policies on raises and evaluation.",
      },
    ],
  },
  {
    key: "collaboration",
    audience: "faculty",
    label: "Collaboration",
    question:
      "What suggestions do you have for improving collaboration and project execution across units and teams?",
    summary:
      "The budget/metric model and college silos are named as the core structural barrier to collaboration. Faculty ask for project-management capacity, standing cross-unit forums, and leadership that visibly models it.",
    subThemes: [
      {
        label: "Reduce silos & budget-model competition",
        description:
          "The incentive model has colleges 'protecting assets' and competing for students and resources rather than cooperating.",
      },
      {
        label: "Project-management capacity",
        description:
          "A PMO / trained project managers, and workload accounting so collaboration isn't an unfunded add-on to a full job.",
      },
      {
        label: "Cross-unit structures & forums",
        description:
          "Standing cross-campus meetings for admin staff, advisors, and topic groups to share what each unit is doing.",
      },
      {
        label: "Communication & information sharing",
        description:
          "Frontline staff want notice of changes that affect them, and visibility into who is doing what across units.",
      },
      {
        label: "Leadership models collaboration",
        description:
          "Deans and directors co-sponsoring work and sharing a consistent message across colleges.",
      },
      {
        label: "Trust & a 'One Team' culture",
        description:
          "Recognize and reward collaborators; build trust so units stop guarding their 'secrets.'",
      },
    ],
  },
  {
    key: "additional",
    audience: "faculty",
    label: "Additional ideas",
    question:
      "Do you have additional ideas or initiatives that could help the University achieve operational excellence?",
    summary:
      "The closing question drew execution-and-follow-through themes: act on this feedback, stop destabilizing mid-year system changes, invest in people, and adopt continuous-improvement discipline.",
    subThemes: [
      {
        label: "Follow through & act on feedback",
        description:
          "Repeated skepticism that anything will change — 'acting on this survey would be a great start.'",
      },
      {
        label: "Stabilize change management",
        description:
          "Stop large software/policy changes at the start of the academic year; give notice, testing, and training.",
      },
      {
        label: "Continuous-improvement culture",
        description:
          "A process-improvement council and a 'what are we going to stop doing' discipline to retire low-value work.",
      },
      {
        label: "Invest in staffing & admin support",
        description:
          "Reinvest in purchasing/travel/grant staff so faculty aren't acting as purchasing officers.",
      },
      {
        label: "Reduce administrative burden",
        description:
          "Cap meeting load, cut redundant signatures, and shrink the busywork that produces no academic value.",
      },
      {
        label: "Assess & measure",
        description:
          "Exit interviews, institutional asset mapping, and measurement to know whether changes actually help.",
      },
    ],
  },
];

const STUDENT_CLUSTERS: SurveyCluster[] = [
  {
    key: "processes",
    audience: "student",
    label: "Processes",
    question:
      "What University processes (registration, financial aid, advising, housing, student services) feel complicated or time-consuming, and how could they be improved?",
    summary:
      "Financial aid is the dominant pain point, followed by class registration (system overload, law-vs-undergrad timing), advising, housing, and the SHIP health-insurance opt-out.",
    subThemes: [
      {
        label: "Financial aid: slow & opaque",
        description:
          "Late processing, confusing communication, and friction like being told to file a FAFSA to receive a merit scholarship.",
      },
      {
        label: "Registration overload",
        description:
          "The system freezes/crashes at open; students ask for staggered scheduling by class year (especially at the College of Law).",
      },
      {
        label: "Advising friction",
        description:
          "Mandatory advising holds feel like a constraint for advanced students; scheduling and advisor continuity are inconsistent.",
      },
      {
        label: "Housing confusion",
        description:
          "Application rules change year to year; waitlists, renovations, and slow maintenance responses.",
      },
      {
        label: "SHIP / insurance opt-out",
        description:
          "Opting out of student health insurance is a recurring, stressful, error-prone process each year.",
      },
      {
        label: "Navigation & the office runaround",
        description:
          "The new website/MyUI is hard to navigate, and simple questions bounce students across many offices.",
      },
    ],
  },
  {
    key: "data-access",
    audience: "student",
    label: "Information access",
    question:
      "In what areas would better access to information or real-time data (grades, degree progress, financial aid status, campus resources) make your student experience easier?",
    summary:
      "Students want real-time grades throughout the term, clearer degree-progress and financial-aid-status visibility, and easier discovery of campus resources. Boise students flag Moscow-centric communications.",
    subThemes: [
      {
        label: "Real-time grades",
        description:
          "Grades kept locked on Canvas all term; students want running grades and faster feedback to prioritize studying.",
      },
      {
        label: "Degree progress & audit clarity",
        description:
          "An accurate, auto-updating degree audit so students can plan courses without manual workarounds.",
      },
      {
        label: "Financial-aid status & timelines",
        description:
          "Clear pending/approved/disbursed status and disbursement dates instead of surprises near tuition deadlines.",
      },
      {
        label: "Campus-resource discovery",
        description:
          "Students keep finding out about helpful resources too late; they want ongoing, findable awareness of what exists.",
      },
      {
        label: "One navigable portal",
        description:
          "MyUI and the website should centralize and simplify — the redesign made things harder to find.",
      },
      {
        label: "Boise-relevant comms & fee clarity",
        description:
          "Boise students get Moscow-only emails; itemized fees need plain-language explanation.",
      },
    ],
  },
  {
    key: "technology",
    audience: "student",
    label: "Technology & AI",
    question:
      "How could the University use technology (apps, AI tools, online services) to save you time or provide more personalized support?",
    summary:
      "Students are sharply divided on AI — a vocal contingent opposes it (accuracy, integrity, environment) while others want a sanctioned, secure student assistant. Broad agreement on a real MyUI app, fewer logins, and consistent Canvas use.",
    subThemes: [
      {
        label: "AI skepticism & opposition",
        description:
          "A vocal group objects to AI being 'pushed,' citing inaccuracy, academic-integrity risk, and environmental cost.",
      },
      {
        label: "Sanctioned, secure student AI",
        description:
          "The pro camp wants an approved, private assistant (e.g., to navigate resources or degree planning) plus AI literacy.",
      },
      {
        label: "A real MyUI mobile app",
        description:
          "A working native app that syncs with Canvas for schedule, financial aid, and registration.",
      },
      {
        label: "Fewer logins / less DUO friction",
        description:
          "Reduce repeated sign-ins and duplicate two-factor prompts; stay logged in across services.",
      },
      {
        label: "Consistent Canvas use",
        description:
          "Require all instructors to use Canvas consistently for grades and assignment submission.",
      },
      {
        label: "Software access & planning tools",
        description:
          "Adobe access on personal devices and a clear course-by-semester degree-planning tool.",
      },
    ],
  },
  {
    key: "collaboration",
    audience: "student",
    label: "Communication",
    question:
      "What would make it easier for you to collaborate and communicate with your professors, advisors, or other offices on campus?",
    summary:
      "Email-response time is the top frustration; students want reliable posted office hours and an easy directory of who-does-what. Some want a messaging option, while many say plain email works fine.",
    subThemes: [
      {
        label: "Faster email & response times",
        description:
          "Slow or absent replies from professors and offices are the most-cited barrier to getting help.",
      },
      {
        label: "Reliable, posted office hours",
        description:
          "Office hours listed but not held; students want them posted (even on doors) and actually available.",
      },
      {
        label: "A searchable directory",
        description:
          "One place to find who to contact, their role, office hours, and location — with photos or profile links.",
      },
      {
        label: "Optional direct messaging",
        description:
          "An invitation-only way to message professors/advisors for time-sensitive questions.",
      },
      {
        label: "'Email is fine' (counter-current)",
        description:
          "A meaningful share of students explicitly prefer plain email and want no new platforms.",
      },
      {
        label: "Boise student-services staffing",
        description:
          "Boise relies on a single student-services contact; coverage gaps stall responses for weeks.",
      },
    ],
  },
  {
    key: "additional",
    audience: "student",
    label: "Additional ideas",
    question:
      "Do you have other suggestions for improving the overall student experience at U of I?",
    summary:
      "Boise / Moscow equity — especially for the College of Law — is the standout theme, alongside dining quality, the cost of fees and parking, facilities and accessibility, and a single app for everything.",
    subThemes: [
      {
        label: "Boise vs. Moscow equity",
        description:
          "Law students in Boise report neglect — graduation scheduling, resource access, and fees — despite equal tuition.",
      },
      {
        label: "Dining quality & capacity",
        description:
          "Dining is seen as behind peer campuses in quality, capacity, and wait times.",
      },
      {
        label: "Cost: fees, parking, textbooks",
        description:
          "Hidden fees, tiered and expensive parking, and bookstore churn draw repeated complaints.",
      },
      {
        label: "Facilities & accessibility",
        description:
          "Limited accessible entrances, slow/broken elevators, and aging dorms; requests for study space and a campus shuttle.",
      },
      {
        label: "One app / one place",
        description:
          "A single access point instead of logging into MyUI, Canvas, and email separately.",
      },
      {
        label: "Include Boise in planning",
        description:
          "Boise students want to be part of institutional planning rather than treated as second-class.",
      },
    ],
  },
];

export const OPERATIONAL_EXCELLENCE_CLUSTERS: SurveyCluster[] = [
  ...FACULTY_CLUSTERS,
  ...STUDENT_CLUSTERS,
];

// ── Accessors ────────────────────────────────────────────────

export function allResponses(): SurveyResponse[] {
  return OPERATIONAL_EXCELLENCE_RESPONSES;
}

export function clustersFor(audience: SurveyAudience): SurveyCluster[] {
  return OPERATIONAL_EXCELLENCE_CLUSTERS.filter((c) => c.audience === audience);
}

export function getCluster(
  audience: SurveyAudience,
  key: SurveyClusterKey,
): SurveyCluster | undefined {
  return OPERATIONAL_EXCELLENCE_CLUSTERS.find(
    (c) => c.audience === audience && c.key === key,
  );
}

export function responsesFor(
  audience: SurveyAudience,
  cluster: SurveyClusterKey,
): SurveyResponse[] {
  return OPERATIONAL_EXCELLENCE_RESPONSES.filter(
    (r) => r.audience === audience && r.cluster === cluster,
  );
}

export function responseCount(
  audience: SurveyAudience,
  cluster?: SurveyClusterKey,
): number {
  return OPERATIONAL_EXCELLENCE_RESPONSES.filter(
    (r) => r.audience === audience && (!cluster || r.cluster === cluster),
  ).length;
}

/** Curated representative verbatims for a cluster (Themes view). */
export function featuredFor(
  audience: SurveyAudience,
  cluster: SurveyClusterKey,
): SurveyResponse[] {
  return responsesFor(audience, cluster).filter((r) => r.featured);
}

export function totalResponseCount(): number {
  return OPERATIONAL_EXCELLENCE_RESPONSES.length;
}
