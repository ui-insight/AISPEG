import Link from "next/link";
import RevealDeck from "@/components/RevealDeck";
import { interventions, getPubliclyVisible } from "@/lib/portfolio";
import { getDeckBySlug } from "@/lib/decks";

const SLUG = "operational-excellence";

export function generateMetadata() {
  const deck = getDeckBySlug(SLUG);
  return {
    title: deck?.title,
    description: deck?.abstract,
  };
}

export default function OperationalExcellenceDeck() {
  const deck = getDeckBySlug(SLUG)!;
  const visible = getPubliclyVisible();
  const byOwner = (slug: string) => interventions.find((i) => i.slug === slug);

  const stratplan = byOwner("stratplan");
  const openera = byOwner("openera");
  const vandalizer = byOwner("vandalizer");
  const audit = byOwner("audit-dashboard");
  const rfd = byOwner("rfd-career");
  const sem = byOwner("sem-experiential");
  const mindrouter = byOwner("mindrouter");
  const dgx = byOwner("dgx-stack");
  const template = byOwner("template-app");

  return (
    <div className="space-y-6">
      {/* Breadcrumb & header (outside the deck) */}
      <nav className="text-sm text-gray-500">
        <Link href="/presentations" className="hover:text-ui-gold-dark">
          Presentations
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ui-charcoal">{deck.title}</span>
      </nav>

      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-ui-charcoal">{deck.title}</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {deck.audience} &middot; {deck.date} &middot; {deck.author}
          </p>
        </div>
        <p className="text-xs text-gray-400">
          Arrow keys to navigate &middot;{" "}
          <kbd className="rounded bg-gray-100 px-1 py-0.5">F</kbd> fullscreen
          &middot; <kbd className="rounded bg-gray-100 px-1 py-0.5">Esc</kbd>{" "}
          overview
        </p>
      </div>

      <div className="h-[720px] w-full overflow-hidden rounded-xl border border-gray-200 bg-ui-charcoal shadow-md">
        <RevealDeck>
          {/* 1. Title */}
          <section className="title-slide">
            <p className="deck-eyebrow">AISPEG · Spring 2026</p>
            <h1>
              AI Interventions for <br />
              <span className="deck-accent">Operational Excellence</span>
            </h1>
            <p style={{ fontSize: "1.1em", marginTop: "1em" }}>
              How the University of Idaho coordinates, builds, and tracks AI
              at institutional scale.
            </p>
            <p className="deck-meta">
              Barrie Robison &middot; AI Strategic Plan Execution Group
            </p>
          </section>

          {/* 2. What AISPEG is */}
          <section>
            <p className="deck-eyebrow">Who we are</p>
            <h2>AISPEG &mdash; <span className="deck-accent">AI Strategic Plan Execution Group</span></h2>
            <ul style={{ marginTop: "0.8em" }}>
              <li><strong>Presidential charter.</strong> A cross-cutting initiative to support execution of the University&rsquo;s Strategic Plan.</li>
              <li><strong>Chaired by Ben Hunter</strong>, Dean of the Libraries.</li>
              <li><strong>Members:</strong> Barrie Robison, Luke Sheneman, Dan Ewart, Bert Baumgaertner.</li>
              <li>Our verbs: <strong>inventory</strong>, <strong>coordinate</strong>, <strong>track</strong>, and <em>often</em> <strong>build</strong>.</li>
            </ul>
            <p className="deck-meta">
              We are not the institution&rsquo;s engineering team. We are the strategic layer that keeps institutional AI work visible, coherent, and aligned.
            </p>
          </section>

          {/* 3. The thesis */}
          <section>
            <p className="deck-eyebrow">The thesis</p>
            <h2>Operational excellence is a <span className="deck-accent">data problem</span>.</h2>
            <p style={{ marginTop: "0.8em" }}>
              You can&rsquo;t improve what you can&rsquo;t measure. You can&rsquo;t measure what you can&rsquo;t model. And you can&rsquo;t model what you can&rsquo;t name consistently.
            </p>
            <p style={{ marginTop: "0.6em" }}>
              <strong>AI accelerates every step &mdash; only if the underlying data is trustworthy.</strong>
            </p>
            <p className="deck-meta">
              That&rsquo;s why our portfolio starts with data standards and named operational owners, not chatbots.
            </p>
          </section>

          {/* 4. How this talk works */}
          <section>
            <p className="deck-eyebrow">What we&rsquo;ll cover</p>
            <h2>This is an <span className="deck-accent">inventory talk</span></h2>
            <ol>
              <li><strong>Our model</strong> &mdash; how AISPEG organizes UI AI work</li>
              <li><strong>The portfolio</strong> &mdash; {visible.length} AI interventions, grouped by UI home unit</li>
              <li><strong>The anchors</strong> &mdash; a few interventions highlighted by named owner</li>
              <li><strong>Capability diffusion</strong> &mdash; the SEM co-build pattern</li>
              <li><strong>Tracking, not just building</strong> &mdash; the OIT/Huron stub pattern</li>
              <li><strong>What we need</strong> from this working group</li>
            </ol>
          </section>

          {/* 5. The primitive */}
          <section>
            <p className="deck-eyebrow">The model</p>
            <h2>One primitive: the <span className="deck-accent">intervention</span></h2>
            <p style={{ marginTop: "0.6em" }}>
              Every AI effort on the UI inventory is defined by:
            </p>
            <div className="deck-grid deck-grid-2" style={{ marginTop: "0.6em" }}>
              <div className="deck-card">
                <strong>UI home unit</strong>
                Where the intervention lives operationally (OSP, DFA, SEM, UCM, etc.)
              </div>
              <div className="deck-card">
                <strong>Operational owner</strong>
                The named person whose job depends on this working
              </div>
              <div className="deck-card">
                <strong>Status at UI</strong>
                Prototype · Piloting · Production · Tracked
              </div>
              <div className="deck-card">
                <strong>Visibility</strong>
                Public · Partial (embargoed details) · Internal-only
              </div>
            </div>
            <p className="deck-meta">
              A GitHub repo is an artifact. An intervention is a UI deployment with a named human accountable for the outcome.
            </p>
          </section>

          {/* 6. Portfolio overview */}
          <section>
            <p className="deck-eyebrow">The inventory</p>
            <h2>{visible.length} AI interventions across UI units</h2>
            <div className="deck-grid deck-grid-2" style={{ marginTop: "0.6em" }}>
              <div className="deck-card">
                <strong>Office of the President</strong>
                Strategic Plan Dashboard
              </div>
              <div className="deck-card">
                <strong>Office of Sponsored Programs (ORED)</strong>
                OpenERA · Vandalizer · ProcessMapping
              </div>
              <div className="deck-card">
                <strong>Division of Financial Affairs</strong>
                Audit Dashboard
              </div>
              <div className="deck-card">
                <strong>University Comms &amp; Marketing</strong>
                UCM Daily Register
              </div>
              <div className="deck-card">
                <strong>Strategic Enrollment Mgmt</strong>
                SEM Experiential Learning
              </div>
              <div className="deck-card">
                <strong>Research Faculty Development</strong>
                RFD CAREER Dashboard
              </div>
              <div className="deck-card">
                <strong>IIDS &mdash; shared infrastructure</strong>
                MindRouter · DGX Stack · TEMPLATE-app
              </div>
              <div className="deck-card">
                <strong>Office of Information Technology</strong>
                OIT data modernization (tracked)
              </div>
            </div>
            <p className="deck-meta">
              Plus two embargoed interventions in OGC/ORED compliance space. Full inventory at aispeg.insight.uidaho.edu.
            </p>
          </section>

          {/* 7. Anchor: StratPlan */}
          {stratplan && (
            <section>
              <p className="deck-eyebrow">Anchor &middot; Office of the President</p>
              <h2>{stratplan.name}</h2>
              <p style={{ marginTop: "0.6em" }}>{stratplan.description}</p>
              <div className="deck-grid deck-grid-2" style={{ marginTop: "0.8em" }}>
                <div className="deck-card">
                  <strong>Operational owner</strong>
                  {stratplan.operationalOwners[0]?.name}
                </div>
                <div className="deck-card">
                  <strong>Status</strong>
                  {stratplan.status} &middot; public dashboard
                </div>
              </div>
              <p className="deck-meta">
                The strategic plan itself: 25 units, 337 tactics, 5 pillars. Visibility for executive review.
              </p>
            </section>
          )}

          {/* 8. Anchor: Vandalizer + OpenERA (OSP) */}
          {vandalizer && openera && (
            <section>
              <p className="deck-eyebrow">Anchor &middot; OSP (ORED)</p>
              <h2>Modernizing research administration</h2>
              <div className="deck-grid deck-grid-2" style={{ marginTop: "0.6em" }}>
                <div className="deck-card">
                  <strong>{vandalizer.name}</strong>
                  {vandalizer.tagline}
                  <br /><em style={{ fontSize: "0.85em", color: "rgba(248,249,250,0.6)" }}>Owner: Sarah Martonick · Lead dev: John Brunsfeld · Also at Southern Utah University · {vandalizer.funding}</em>
                </div>
                <div className="deck-card">
                  <strong>{openera.name}</strong>
                  Open-source pre-award ERA prototype. UI deployment details embargoed.
                  <br /><em style={{ fontSize: "0.85em", color: "rgba(248,249,250,0.6)" }}>Owner: Sarah Martonick · Dual-destiny (AI4RA + UI)</em>
                </div>
              </div>
              <p className="deck-meta">
                Two interventions, one owner. The same OSP leader is accountable whether the artifact is open-source community tooling or a UI-embargoed deployment.
              </p>
            </section>
          )}

          {/* 9. Anchor: Audit Dashboard */}
          {audit && (
            <section>
              <p className="deck-eyebrow">Anchor &middot; Division of Financial Affairs</p>
              <h2>{audit.name}</h2>
              <p style={{ marginTop: "0.6em" }}>{audit.description}</p>
              <div className="deck-grid deck-grid-2" style={{ marginTop: "0.8em" }}>
                <div className="deck-card">
                  <strong>Operational owner</strong>
                  {audit.operationalOwners[0]?.name}
                </div>
                <div className="deck-card">
                  <strong>Compliance outcome</strong>
                  Closes the audit follow-through loop; overdue observations surfaced automatically.
                </div>
              </div>
              <p className="deck-meta">
                AI-assisted compliance tracking: OCR + LLM extraction → human review → structured persistence. Human-in-the-loop by design.
              </p>
            </section>
          )}

          {/* 10. Anchor: RFD CAREER */}
          {rfd && (
            <section>
              <p className="deck-eyebrow">Anchor &middot; Research Faculty Development</p>
              <h2>{rfd.name}</h2>
              <p style={{ marginTop: "0.6em" }}>{rfd.description}</p>
              <div className="deck-grid deck-grid-2" style={{ marginTop: "0.8em" }}>
                <div className="deck-card">
                  <strong>Operational owner</strong>
                  {rfd.operationalOwners[0]?.name}
                </div>
                <div className="deck-card">
                  <strong>Status</strong>
                  {rfd.status} &mdash; live cohort using it now
                </div>
              </div>
              <p className="deck-meta">
                Small, focused, in use. Operational excellence is won one cohort at a time.
              </p>
            </section>
          )}

          {/* 11. Capability diffusion */}
          {sem && template && (
            <section>
              <p className="deck-eyebrow">The diffusion story</p>
              <h2>Agentic capability <span className="deck-accent">leaving IIDS</span></h2>
              <div className="deck-grid deck-grid-2" style={{ marginTop: "0.6em" }}>
                <div className="deck-card">
                  <strong>{template.name}</strong>
                  Production-ready scaffold: React 19 + FastAPI + data governance + security + CI + CLAUDE.md. Every new UI app starts aligned to institutional standards.
                </div>
                <div className="deck-card">
                  <strong>{sem.name}</strong>
                  <em>Co-built</em> by IIDS + Strategic Enrollment Management. Owner: Dean Kahler (Vice Provost of SEM). SEM is learning agentic development alongside us &mdash; not just consuming.
                </div>
              </div>
              <p className="deck-meta">
                This is the path to scale. AISPEG doesn&rsquo;t need to build everything; we need to make it easy for any UI unit to build what they need.
              </p>
            </section>
          )}

          {/* 12. Shared infrastructure */}
          {mindrouter && dgx && (
            <section>
              <p className="deck-eyebrow">Shared infrastructure</p>
              <h2>The substrate: <span className="deck-accent">IIDS-operated, on-prem</span></h2>
              <div className="deck-grid deck-grid-2" style={{ marginTop: "0.6em" }}>
                <div className="deck-card">
                  <strong>{mindrouter.name}</strong>
                  Production LLM load balancer &middot; unified API &middot; fair-share scheduling &middot; full audit logging. Open-sourced at <code>mindrouter.ai</code>.
                </div>
                <div className="deck-card">
                  <strong>{dgx.name}</strong>
                  NVIDIA DGX Spark &middot; on-prem LLM + OCR appliance &middot; backend for MindRouter &middot; also deployed at SUU.
                </div>
              </div>
              <p className="deck-meta">
                Every AI app at UI routes through MindRouter. Data stays on-prem. No per-seat vendor lock-in. Fair access across research and operations.
              </p>
            </section>
          )}

          {/* 13. Tracking, not just building */}
          <section>
            <p className="deck-eyebrow">Inventory &gt; engineering</p>
            <h2>We <span className="deck-accent">track</span> what we don&rsquo;t build</h2>
            <p style={{ marginTop: "0.6em" }}>
              The inventory is institutional, not AISPEG-owned. When other units lead AI work, we record it &mdash; even when we have no involvement.
            </p>
            <div className="deck-card" style={{ marginTop: "0.8em" }}>
              <strong>Example: OIT Data Modernization (Huron)</strong>
              OIT is leading institutional data modernization with Huron as consultant. AISPEG is tracking this work. Detailed information will be added as OIT shares scope and timelines.
            </div>
            <p className="deck-meta">
              <strong>Submit a project:</strong> any UI unit running AI work should appear here. <code>aispeg.insight.uidaho.edu/builder-guide</code>
            </p>
          </section>

          {/* 14. AI4RA */}
          <section>
            <p className="deck-eyebrow">The consortium</p>
            <h2>AI4RA: <span className="deck-accent">UI + SUU, NSF-funded</span></h2>
            <p style={{ marginTop: "0.6em" }}>
              AI4RA is a two-institution NSF GRANTED partnership (Award #2427549) producing open-source reference tools for research administration.
            </p>
            <div className="deck-grid deck-grid-2" style={{ marginTop: "0.8em" }}>
              <div className="deck-card">
                <strong>AI4RA reference material</strong>
                UDM spec · prompt-library · evaluation-harness · eCFR MCP · etc. Consumed by peer institutions.
              </div>
              <div className="deck-card">
                <strong>Dual-destiny</strong>
                UI maintains <em>deployment-specific</em> implementations of the reference tools (OpenERA, Vandalizer, MindRouter, ProcessMapping) alongside the community artifacts.
              </div>
            </div>
            <p className="deck-meta">
              AI4RA community tools are not UI interventions. UI&rsquo;s deployments of them are.
            </p>
          </section>

          {/* 15. The ask */}
          <section>
            <p className="deck-eyebrow">The ask</p>
            <h2>What we need from this working group</h2>
            <ol style={{ marginTop: "0.5em" }}>
              <li>
                <strong>Legitimize the institutional inventory.</strong> Endorse aispeg.insight.uidaho.edu as the authoritative record of UI AI interventions. Point your units there.
              </li>
              <li>
                <strong>Help us surface what we&rsquo;re missing.</strong> Every AI effort anywhere in the institution should appear in the inventory &mdash; even when AISPEG isn&rsquo;t building it.
              </li>
              <li>
                <strong>Protect the shared infrastructure.</strong> MindRouter and DGX Stack are the on-prem LLM substrate. They need institutional funding certainty.
              </li>
              <li>
                <strong>Back the diffusion pattern.</strong> SEM is co-building. More units should. TEMPLATE-app is the vehicle; AISPEG is the coach.
              </li>
              <li>
                <strong>Keep the humans in the loop.</strong> Every intervention names an operational owner for a reason. AI proposes, humans approve. Don&rsquo;t let anyone short-circuit that.
              </li>
            </ol>
          </section>

          {/* 16. Closing */}
          <section className="title-slide">
            <p className="deck-eyebrow">Thank you</p>
            <h1>Questions?</h1>
            <p style={{ fontSize: "1em", marginTop: "1.2em", color: "rgba(248,249,250,0.7)" }}>
              aispeg.insight.uidaho.edu
            </p>
            <p className="deck-meta">
              Barrie Robison &middot; AISPEG &middot; AI Strategic Plan Execution Group
            </p>
          </section>
        </RevealDeck>
      </div>
    </div>
  );
}
