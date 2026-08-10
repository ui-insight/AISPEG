import Link from "next/link";
import { projects, computePublicStage } from "@/lib/portfolio";
import { resolveGovernanceProfile } from "@/lib/governance-profile";

export const metadata = {
  title:
    "Stress-testing the Unified Technology Request draft · Institutional AI Initiative",
  description:
    "Every inventoried project and every registered request, run through the August 2026 UTR draft process. Most demand routes cleanly; the fringe concentrates in six nameable seams.",
};

// ---- Registry snapshot -------------------------------------------------
// Point-in-time counts from the tech_requests registry (dev database),
// taken 2026-08-10 for this dated report. The live queue is at
// /portfolio/pipeline; these numbers deliberately do not auto-update —
// the report records what the draft process was tested against.
const REGISTRY_AS_OF = "August 10, 2026";
const REGISTRY = {
  total: 107, // excludes 2 merged duplicates
  byOrigin: [
    { label: "OIT IDEA form", count: 58 },
    { label: "ClickUp intake (scored backlog)", count: 40 },
    { label: "Direct entry (survey-derived + VandalChat)", count: 9 },
    { label: "Site submissions", count: 2 },
  ],
  sharedPlatformTarget: 29, // nexus-module 17 + vandalizer-workflow 7 + databricks-dashboard 5
  externalHosted: 47,
  tracked: 0, // requests carrying a UTR track assignment today
};

// ---- Fringe patterns ---------------------------------------------------
// Each example names a real inventory project or registry request title.

interface FringeExample {
  name: string;
  source: "inventory" | "registry";
}

interface FringePattern {
  id: string;
  title: string;
  evidence: string;
  miss: string;
  question: string;
  examples: FringeExample[];
  openItem?: string;
}

const patterns: FringePattern[] = [
  {
    id: "existing-estate",
    title: "The existing estate has no on-ramp",
    evidence:
      "Every entry in the project inventory predates the process. The draft describes how new requests enter; it says nothing about applications that are already built, piloting, or in production without having passed a gate.",
    miss:
      "Track B assumes a finished app arriving for review before deployment. Retroactive entry — an app already serving users that should now acquire a security review, an acceptance gate, and a portfolio record — is undefined. VandalChat illustrates the live version of the problem: registered through intake mid-build, with a go-live date that will arrive before the process can exist around it.",
    question:
      "Does Track B accept already-deployed applications retroactively — review-as-remediation — or does the existing estate get a one-time registration lane with its own (lighter) evidence bar?",
    examples: [
      { name: "Retroactive Pay Request — in production for Payroll", source: "inventory" },
      { name: "Vandalizer — in production", source: "inventory" },
      { name: "UCM Daily Register — piloting", source: "inventory" },
      { name: "VandalChat — go-live Aug 24, registered mid-build", source: "registry" },
    ],
  },
  {
    id: "platforms",
    title: "Platforms aren't requests — but they're where requests land",
    evidence:
      "29 of the 107 registry requests (27%) classify to a shared-platform deployment target: a Nexus module, a Vandalizer workflow, or a Databricks dashboard. The platforms themselves — MindRouter, DGX Stack, Nexus, Databricks — fit no track: they are not a purchase, not a single app, and not an idea.",
    miss:
      "The draft reviews one request at a time. It has no concept of reviewing a platform once so that the workflows and modules deployed onto it inherit that review. Without inheritance, every small workflow re-triggers full Track B/C machinery; with undefined inheritance, platform review never happens at all.",
    question:
      "Should the spec define platform certification — security review and acceptance at the platform level, with a lighter per-workflow checklist for anything deployed onto a certified platform?",
    examples: [
      { name: "MindRouter — platform, no track fits", source: "inventory" },
      { name: "17 requests targeting a Nexus module", source: "registry" },
      { name: "7 requests targeting a Vandalizer workflow", source: "registry" },
      { name: "5 requests targeting a Databricks dashboard", source: "registry" },
    ],
  },
  {
    id: "configure-owned",
    title: "“Configure what we own” is neither buy nor build",
    evidence:
      "A steady stream of requests asks for a portal, integration, or feature-enable on a system the university already licenses: four separate TDX requests (a CNR portal, Admin-Ops work orders, Accounts Payable, a knowledge base), Argos X activation, Adobe Acrobat contract-routing integration, connectors for Claude Enterprise.",
    miss:
      "There is nothing to purchase (Track A) and nothing new to build or host (Tracks B/C). These are provisioning and configuration requests on owned platforms. Relatedly, the triage step “existing solution meets need?” currently reads as commercial-only — but the existing-solution answer is increasingly something the university built, and answering it requires a catalog of both: the project inventory here plus OIT’s EA portfolio.",
    question:
      "Does “existing solution meets need” get its own defined exit — a provisioning lane with an owner and an SLA — and does triage formally consult the built inventory alongside the purchased catalog?",
    examples: [
      { name: "TDX portal development for CNR", source: "registry" },
      { name: "Accounts Payable in TDX", source: "registry" },
      { name: "Argos X", source: "registry" },
      { name: "Connectors for Claude Enterprise", source: "registry" },
    ],
  },
  {
    id: "research-boundary",
    title: "The research boundary is a straddle, not a screen",
    evidence:
      "The draft's first box screens out “research software only.” But real cases straddle: researchers requesting enterprise licensing for research tools (SAS JMP, Stella Architect, Elicit), a faculty member using AI-detection tools on student essays for research, and — from the inventory — administrative applications built on NSF funds (Vandalizer, OpenERA, ProcessMapping) now deployed institutionally.",
    miss:
      "A yes/no self-screen at the portal landing page resolves none of these. Grant-built tools crossing into institutional operation is precisely the moment governance should engage — and it is the moment the current flow sends them away. What re-enters the process when the grant ends is undefined.",
    question:
      "Can the screen become a routing question rather than an exit — research-only goes to RTAB/RCDS, but “research-funded, institutionally deployed” and “research tool wanting enterprise licensing” route back into the flow with the right flags?",
    examples: [
      { name: "Vandalizer — NSF-funded, institutionally deployed", source: "inventory" },
      { name: "SAS JMP enterprise licensing", source: "registry" },
      { name: "AI-detection tools on student essays (GPTZero)", source: "registry" },
      { name: "Boodle.ai — SBOE research partnership", source: "registry" },
    ],
    openItem: "W24 / OD24 — research-software boundary and RTAB capacity",
  },
  {
    id: "data-products",
    title: "Data products sit exactly on Track D's open seam",
    evidence:
      "Track D cleanly catches access requests — “SSB Access for Alumni” is a day-one case. But at least six requests ask for a dashboard or recurring report that does not yet exist: fund-balance projections, self-serve unit budget views, staff ePAF reporting, post-payroll reconciliation.",
    miss:
      "“Access existing data” routes to Track D; “build a new data product” is Track C — and the intake question separating them is the flowchart's own open item (parking lot #13). Every Databricks-dashboard-targeted request in the registry will land on this seam the day the form goes live.",
    question:
      "What single intake question separates “see data that exists” from “build a data product that doesn't” — and does a governed data product then need both Track C review and Track D stewardship?",
    examples: [
      { name: "SSB Access for Alumni — clean Track D", source: "registry" },
      { name: "Fund Balance Projections", source: "registry" },
      { name: "Self-serve unit budget view", source: "registry" },
      { name: "Staff ePAF / HR Reporting", source: "registry" },
    ],
    openItem: "W29 / parking lot #13 — access-vs-build intake question",
  },
  {
    id: "no-requestor",
    title: "Institution-wide needs have no requestor",
    evidence:
      "Eight registry entries derive from the Operational Excellence survey: institution-wide problem statements — onboarding automation, reimbursement tracking, policy search — with no individual requestor, no unit, and no budget line. A ninth, “Sanctioned AI access & literacy,” is not a request for software at all; it is a request for the AI Tools List and its guidance to exist.",
    miss:
      "The single intake form assumes a named requestor in a named unit. Institution-derived demand — survey themes, strategic-plan commitments, leadership directives — enters nowhere, which means the highest-aggregate-ROI items are the ones the process cannot see.",
    question:
      "Who is the requestor of record for institution-wide needs — can the triage team itself (or the CDAO office) sponsor requests into the queue, and how are they prioritized against unit-sponsored ones?",
    examples: [
      { name: "Onboarding & access automation — survey-derived", source: "registry" },
      { name: "Institutional knowledge & policy search — survey-derived", source: "registry" },
      { name: "Sanctioned AI access & literacy — a policy ask", source: "registry" },
    ],
  },
];

const cleanFits = [
  {
    label: "Track A — standard software",
    detail:
      "The bulk of the OIT IDEA queue (47 of 107 requests classify to an external-hosted target) is textbook Track A: course software, vendor platforms, license purchases. The draft handles its largest single population well.",
  },
  {
    label: "Track C — idea / concept",
    detail:
      "The 40-request ClickUp backlog — already scored on the 11-criterion rubric — maps directly onto Track C's registration → feasibility → prioritization spine. The scored-backlog discipline the draft asks for already exists in practice.",
  },
  {
    label: "Track D — data & report access",
    detail:
      "“SSB Access for Alumni” routes cleanly through classification and entitlement screening to steward review. Track D earns its place on day one.",
  },
  {
    label: "AI flag — material exposure",
    detail:
      "“Facial Recognition” (DFA Security) trips the material-exposure rubric exactly as designed: public-facing, consequential to individuals, escalates past standard review. The flag taxonomy works on real input.",
  },
];

export default function UtrStressTestPage() {
  const inventoryTotal = projects.length;
  const liveCount = projects.filter(
    (p) => computePublicStage(p.status) === "live"
  ).length;
  const preProcessCount = projects.filter((p) => {
    const track = resolveGovernanceProfile(p).intakeTrack;
    return track === "track-b" || track === "track-c";
  }).length;

  return (
    <article className="space-y-10">
      <nav className="text-sm text-gray-500">
        <Link href="/reports" className="hover:text-brand-black">
          Reports
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ui-charcoal">
          Stress-testing the Unified Technology Request draft
        </span>
      </nav>

      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-silver">
          Analysis &middot; {REGISTRY_AS_OF}
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-brand-black">
          Stress-testing the Unified Technology Request draft against real
          demand
        </h1>
        <p className="mt-3 max-w-3xl text-base text-gray-700">
          The August 2026 draft of the Unified Technology Request process is
          close to fully realized. Before the spec sheet gets written, we ran
          the entire known demand picture through it — every project in the
          inventory and every request in the unified registry. Most of it
          routes cleanly. The part that doesn&apos;t concentrates in six
          nameable seams, each of which is a decision, not a redesign.
        </p>
      </header>

      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Process under test
        </p>
        <p className="mt-1 text-sm text-brand-black">
          <a
            href="https://bhunter-uidaho.github.io/UnifiedTechnologyRequest/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-brand-black underline decoration-clearwater underline-offset-4 hover:decoration-2"
          >
            Unified Technology Request Process — flowchart &amp; interactive
            walkthrough
          </a>
          <br />
          <span className="text-gray-600">
            Ben Hunter, CDAO office &middot; August 2026 revision — one intake
            form, four tracks, DATA/AI/BUY flags, two gates
          </span>
        </p>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
          The test corpus
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-3xl font-black text-brand-black">
              {inventoryTotal}
            </p>
            <p className="mt-1 text-sm text-gray-600">
              inventoried projects — {liveCount} live today, {preProcessCount}{" "}
              built or building without having entered any intake process
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-3xl font-black text-brand-black">
              {REGISTRY.total}
            </p>
            <p className="mt-1 text-sm text-gray-600">
              requests in the unified registry (as of {REGISTRY_AS_OF}),
              from four origins
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-3xl font-black text-brand-black">
              {REGISTRY.tracked}
            </p>
            <p className="mt-1 text-sm text-gray-600">
              requests carrying a UTR track assignment today — triage under
              the draft process has not started
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-3xl font-black text-brand-black">
              {REGISTRY.sharedPlatformTarget}
            </p>
            <p className="mt-1 text-sm text-gray-600">
              requests whose proposed deployment target is a shared platform
              — a Nexus module, Vandalizer workflow, or Databricks dashboard
            </p>
          </div>
        </div>
        <p className="mt-3 text-sm text-gray-600">
          Registry origins:{" "}
          {REGISTRY.byOrigin
            .map((o) => `${o.label} (${o.count})`)
            .join(" · ")}
          . The live queue is at{" "}
          <Link
            href="/portfolio/pipeline"
            className="underline decoration-clearwater underline-offset-4 hover:decoration-2"
          >
            /portfolio/pipeline
          </Link>
          .
        </p>
      </section>

      <section className="rounded-xl border border-brand-clearwater/30 bg-brand-clearwater/5 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-clearwater">
          What routes cleanly
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-brand-black">
          The draft is not fragile. Run against real input, its core
          machinery handles the majority of demand without strain:
        </p>
        <ul className="mt-3 space-y-3">
          {cleanFits.map((item) => (
            <li key={item.label} className="text-sm leading-relaxed">
              <span className="font-semibold text-brand-black">
                {item.label}.
              </span>{" "}
              <span className="text-gray-700">{item.detail}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-8">
        <div>
          <h2 className="text-xl font-black tracking-tight text-brand-black">
            Six seams where real demand doesn&apos;t fit
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-gray-700">
            Each pattern below names its real examples, why the current draft
            misses it, and the single question the spec sheet needs answered.
            None requires restructuring the flow — they are boundary
            definitions and one new concept (platform certification).
          </p>
        </div>

        {patterns.map((pattern, i) => (
          <div
            key={pattern.id}
            className="rounded-xl border border-gray-200 bg-white p-6"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-silver">
              Seam {i + 1} of {patterns.length}
            </p>
            <h3 className="mt-1 text-lg font-black tracking-tight text-brand-black">
              {pattern.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-gray-700">
              {pattern.evidence}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-gray-700">
              {pattern.miss}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {pattern.examples.map((ex) => (
                <span
                  key={ex.name}
                  className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-surface-alt px-3 py-1 text-xs text-brand-black"
                >
                  <span
                    aria-hidden="true"
                    className={`h-1.5 w-1.5 rounded-full ${
                      ex.source === "inventory"
                        ? "bg-brand-huckleberry"
                        : "bg-brand-clearwater"
                    }`}
                  />
                  {ex.name}
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              <span
                aria-hidden="true"
                className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-brand-huckleberry align-middle"
              />
              inventory project &nbsp;
              <span
                aria-hidden="true"
                className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-brand-clearwater align-middle"
              />
              registry request
            </p>
            <div className="mt-4 rounded-lg bg-surface-alt p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Question for the spec sheet
              </p>
              <p className="mt-1 text-sm font-semibold leading-relaxed text-brand-black">
                {pattern.question}
              </p>
              {pattern.openItem ? (
                <p className="mt-2 text-xs text-gray-500">
                  Maps to existing open item: {pattern.openItem}
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-hairline bg-surface-alt p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
          What this argues
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-brand-black">
          &ldquo;Minimize the fringe cases that just don&apos;t fit&rdquo; is
          the right instinct, and the evidence says the fringe is not a long
          tail — it is six recurring patterns, each already visible in the
          demand the university has in hand. Five of the six resolve with a
          boundary definition or a defined exit; one (platform certification)
          asks for a new concept the deployment-target work has already made
          concrete. Settling these six questions in the spec sheet would
          leave the draft covering effectively all known demand.
        </p>
      </section>
    </article>
  );
}
