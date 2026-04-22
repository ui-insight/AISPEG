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
            <div className="deck-eyebrow">AISPEG &middot; Spring 2026</div>
            <h1>
              AI interventions <br />
              for <span className="deck-accent">operational excellence</span>
            </h1>
            <p className="subhead">
              How the University of Idaho coordinates, builds, and tracks AI
              at institutional scale.
            </p>
            <p className="deck-meta">
              Barrie Robison &middot; AI Strategic Plan Execution Group
            </p>
          </section>

          {/* 2. Who we are */}
          <section>
            <div className="deck-eyebrow">Who we are</div>
            <h2>
              AISPEG is the <span className="deck-accent">execution</span> group.
            </h2>
            <div className="deck-defs" style={{ marginTop: "1.8em" }}>
              <div className="deck-def">
                <div className="deck-def-term">Charter</div>
                <div className="deck-def-body">
                  Presidentially chartered cross-cutting initiative supporting execution of the University&rsquo;s Strategic Plan.
                </div>
              </div>
              <div className="deck-def">
                <div className="deck-def-term">Chair</div>
                <div className="deck-def-body">
                  <span className="deck-owner">Ben Hunter</span>, Dean of the Libraries.
                </div>
              </div>
              <div className="deck-def">
                <div className="deck-def-term">Members</div>
                <div className="deck-def-body">
                  <span className="deck-owner">Barrie Robison</span>,{" "}
                  <span className="deck-owner">Luke Sheneman</span>,{" "}
                  <span className="deck-owner">Dan Ewart</span>,{" "}
                  <span className="deck-owner">Bert Baumgaertner</span>.
                </div>
              </div>
              <div className="deck-def">
                <div className="deck-def-term">Our verbs</div>
                <div className="deck-def-body">
                  Inventory. Coordinate. Track. Often, build.
                </div>
              </div>
            </div>
            <p className="deck-meta">
              We are not the institution&rsquo;s engineering team. We are the strategic layer that keeps institutional AI work visible, coherent, and aligned.
            </p>
          </section>

          {/* 3. Thesis */}
          <section>
            <div className="deck-eyebrow">The thesis</div>
            <h2>
              Operational excellence is a <br /><span className="deck-accent">data problem</span>.
            </h2>
            <p style={{ marginTop: "1.4em", fontSize: "1.05em", maxWidth: "32ch", lineHeight: 1.5 }}>
              You can&rsquo;t improve what you can&rsquo;t measure. You can&rsquo;t measure what you can&rsquo;t model. And you can&rsquo;t model what you can&rsquo;t name consistently.
            </p>
            <p style={{ marginTop: "1em", fontSize: "1em", maxWidth: "34ch", color: "#f7f3e8" }}>
              AI accelerates every step &mdash; <em>only</em> if the underlying data is trustworthy.
            </p>
            <p className="deck-meta">
              That&rsquo;s why our portfolio starts with data standards and named operational owners, not chatbots.
            </p>
          </section>

          {/* 4. What we'll cover */}
          <section>
            <div className="deck-eyebrow">What we&rsquo;ll cover</div>
            <h2>An inventory talk.</h2>
            <ol style={{ marginTop: "1.4em", maxWidth: "40ch" }}>
              <li>Our model &mdash; how AISPEG organizes UI AI work</li>
              <li>The portfolio &mdash; {visible.length} interventions, grouped by home unit</li>
              <li>Four anchors &mdash; interventions by named owner</li>
              <li>Capability diffusion &mdash; the SEM co-build pattern</li>
              <li>Tracking, not just building &mdash; the OIT/Huron stub</li>
              <li>What we need from this working group</li>
            </ol>
          </section>

          {/* 5. The primitive */}
          <section>
            <div className="deck-eyebrow">The model</div>
            <h2>
              One primitive: the <span className="deck-accent">intervention</span>.
            </h2>
            <p style={{ marginTop: "1em", maxWidth: "40ch" }}>
              Every AI effort in the inventory is defined by four facts &mdash; not by a GitHub repo.
            </p>
            <div className="deck-defs" style={{ marginTop: "1.4em" }}>
              <div className="deck-def">
                <div className="deck-def-term">Home unit</div>
                <div className="deck-def-body">Where it lives operationally &mdash; OSP, DFA, SEM, UCM, and so on.</div>
              </div>
              <div className="deck-def">
                <div className="deck-def-term">Owner</div>
                <div className="deck-def-body">The named person whose job depends on this working.</div>
              </div>
              <div className="deck-def">
                <div className="deck-def-term">Status</div>
                <div className="deck-def-body">Prototype &middot; Piloting &middot; Production &middot; Tracked.</div>
              </div>
              <div className="deck-def">
                <div className="deck-def-term">Visibility</div>
                <div className="deck-def-body">Public &middot; Partial (embargoed) &middot; Internal-only.</div>
              </div>
            </div>
          </section>

          {/* 6. Portfolio by unit */}
          <section>
            <div className="deck-eyebrow">The inventory</div>
            <h2>
              {visible.length} interventions &mdash; <span className="deck-accent">grouped by home unit</span>.
            </h2>
            <div className="deck-unit-list">
              <div className="deck-unit">
                <div className="deck-unit-name">Office of the President</div>
                <div className="deck-unit-items">Strategic Plan Dashboard</div>
              </div>
              <div className="deck-unit">
                <div className="deck-unit-name">Office of Sponsored Programs, ORED</div>
                <div className="deck-unit-items">OpenERA &middot; Vandalizer &middot; ProcessMapping</div>
              </div>
              <div className="deck-unit">
                <div className="deck-unit-name">Division of Financial Affairs</div>
                <div className="deck-unit-items">Audit Dashboard</div>
              </div>
              <div className="deck-unit">
                <div className="deck-unit-name">University Comms &amp; Marketing</div>
                <div className="deck-unit-items">UCM Daily Register</div>
              </div>
              <div className="deck-unit">
                <div className="deck-unit-name">Strategic Enrollment Management</div>
                <div className="deck-unit-items">SEM Experiential Learning</div>
              </div>
              <div className="deck-unit">
                <div className="deck-unit-name">Research Faculty Development</div>
                <div className="deck-unit-items">RFD CAREER Dashboard</div>
              </div>
              <div className="deck-unit">
                <div className="deck-unit-name">IIDS &mdash; shared infrastructure</div>
                <div className="deck-unit-items">MindRouter &middot; DGX Stack &middot; TEMPLATE-app</div>
              </div>
              <div className="deck-unit">
                <div className="deck-unit-name">Office of Information Technology</div>
                <div className="deck-unit-items">OIT data modernization (tracked)</div>
              </div>
            </div>
            <p className="deck-meta">
              Two additional embargoed interventions in ORED/OGC compliance space. Full inventory at aispeg.insight.uidaho.edu.
            </p>
          </section>

          {/* 7. Anchor — StratPlan */}
          {stratplan && (
            <section>
              <div className="deck-eyebrow">Anchor &middot; Office of the President</div>
              <div className="deck-split deck-split-60-40">
                <div>
                  <h2>{stratplan.name}</h2>
                  <p style={{ marginTop: "1em" }}>{stratplan.description}</p>
                </div>
                <div style={{ paddingTop: "1.2em" }}>
                  <div className="deck-anchor-label">Owner</div>
                  <p style={{ fontSize: "1.2em" }}>
                    <span className="deck-owner">{stratplan.operationalOwners[0]?.name}</span>
                  </p>
                  <div className="deck-anchor-label" style={{ marginTop: "1.4em" }}>Status</div>
                  <p>{stratplan.status} &middot; public dashboard</p>
                </div>
              </div>
              <p className="deck-meta">
                25 units &middot; 337 tactics &middot; 5 pillars. Executive visibility of strategic-plan execution.
              </p>
            </section>
          )}

          {/* 8. Anchor — OSP (two interventions, one owner) */}
          {vandalizer && openera && (
            <section>
              <div className="deck-eyebrow">Anchor &middot; OSP, ORED</div>
              <h2>Modernizing research administration.</h2>
              <div className="deck-split deck-split-50-50" style={{ marginTop: "1.4em" }}>
                <div>
                  <div className="deck-anchor-label">{vandalizer.name}</div>
                  <p>{vandalizer.tagline}</p>
                  <p style={{ fontSize: "0.78em", color: "rgba(239,236,227,0.6)", marginTop: "0.8em" }}>
                    Owner: <span className="deck-owner">Sarah Martonick</span>{" "}
                    &middot; Lead dev: <span className="deck-owner">John Brunsfeld</span>{" "}
                    &middot; Also at Southern Utah University &middot; {vandalizer.funding}
                  </p>
                </div>
                <div>
                  <div className="deck-anchor-label">{openera.name}</div>
                  <p>Open-source pre-award ERA prototype. UI deployment details embargoed.</p>
                  <p style={{ fontSize: "0.78em", color: "rgba(239,236,227,0.6)", marginTop: "0.8em" }}>
                    Owner: <span className="deck-owner">Sarah Martonick</span>{" "}
                    &middot; Dual-destiny (AI4RA + UI)
                  </p>
                </div>
              </div>
              <p className="deck-meta">
                Two interventions, one owner. Accountability travels with the person &mdash; whether the artifact is open-source community tooling or a UI-embargoed deployment.
              </p>
            </section>
          )}

          {/* 9. Anchor — Audit Dashboard */}
          {audit && (
            <section>
              <div className="deck-eyebrow">Anchor &middot; Division of Financial Affairs</div>
              <div className="deck-split deck-split-60-40">
                <div>
                  <h2>{audit.name}</h2>
                  <p style={{ marginTop: "1em" }}>{audit.description}</p>
                </div>
                <div style={{ paddingTop: "1.2em" }}>
                  <div className="deck-anchor-label">Owner</div>
                  <p style={{ fontSize: "1.2em" }}>
                    <span className="deck-owner">{audit.operationalOwners[0]?.name}</span>
                  </p>
                  <div className="deck-anchor-label" style={{ marginTop: "1.4em" }}>
                    Human-in-the-loop
                  </div>
                  <p>OCR + LLM extraction &rarr; human review &rarr; structured persistence.</p>
                </div>
              </div>
              <p className="deck-meta">
                Closes the audit follow-through loop. Overdue observations surfaced automatically.
              </p>
            </section>
          )}

          {/* 10. Anchor — RFD */}
          {rfd && (
            <section>
              <div className="deck-eyebrow">Anchor &middot; Research Faculty Development</div>
              <div className="deck-split deck-split-60-40">
                <div>
                  <h2>{rfd.name}</h2>
                  <p style={{ marginTop: "1em" }}>{rfd.description}</p>
                </div>
                <div style={{ paddingTop: "1.2em" }}>
                  <div className="deck-anchor-label">Owner</div>
                  <p style={{ fontSize: "1.2em" }}>
                    <span className="deck-owner">{rfd.operationalOwners[0]?.name}</span>
                  </p>
                  <div className="deck-anchor-label" style={{ marginTop: "1.4em" }}>Status</div>
                  <p>{rfd.status} &mdash; live cohort using it now.</p>
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
              <div className="deck-eyebrow">The diffusion story</div>
              <h2>
                Agentic capability, <br /><span className="deck-accent">leaving IIDS</span>.
              </h2>
              <div className="deck-split deck-split-50-50" style={{ marginTop: "1.4em" }}>
                <div>
                  <div className="deck-anchor-label">{template.name}</div>
                  <p>
                    Production-ready scaffold: React 19 + FastAPI + data governance + security + CI + CLAUDE.md. Every new UI app starts aligned to institutional standards.
                  </p>
                </div>
                <div>
                  <div className="deck-anchor-label">{sem.name}</div>
                  <p>
                    <em>Co-built</em> by IIDS and Strategic Enrollment Management. Owner:{" "}
                    <span className="deck-owner">Dean Kahler</span>, Vice Provost of SEM. A UI unit learning agentic development alongside us &mdash; not just consuming.
                  </p>
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
              <div className="deck-eyebrow">Shared infrastructure</div>
              <h2>
                The substrate: <span className="deck-accent">on-prem, IIDS-operated</span>.
              </h2>
              <div className="deck-defs" style={{ marginTop: "1.2em" }}>
                <div className="deck-def">
                  <div className="deck-def-term">{mindrouter.name}</div>
                  <div className="deck-def-body">
                    Production LLM load balancer &middot; unified API &middot; fair-share scheduling &middot; full audit logging. Open-source at <code>mindrouter.ai</code>.
                  </div>
                </div>
                <div className="deck-def">
                  <div className="deck-def-term">{dgx.name}</div>
                  <div className="deck-def-body">
                    NVIDIA DGX Spark &middot; on-prem LLM + OCR appliance &middot; backend for MindRouter &middot; also deployed at Southern Utah University.
                  </div>
                </div>
                <div className="deck-def">
                  <div className="deck-def-term">Owner (both)</div>
                  <div className="deck-def-body">
                    <span className="deck-owner">Luke Sheneman</span>, IIDS.
                  </div>
                </div>
              </div>
              <p className="deck-meta">
                Every AI app at UI routes through MindRouter. Data stays on-prem. No per-seat vendor lock-in. Fair access across research and operations.
              </p>
            </section>
          )}

          {/* 13. Tracking, not building */}
          <section>
            <div className="deck-eyebrow">Inventory &gt; engineering</div>
            <h2>
              We <span className="deck-accent">track</span> what we don&rsquo;t build.
            </h2>
            <p style={{ marginTop: "1em", maxWidth: "40ch" }}>
              The inventory is institutional, not AISPEG-owned. When other units lead AI work, we record it &mdash; even when we have no involvement.
            </p>
            <div className="deck-defs" style={{ marginTop: "1em" }}>
              <div className="deck-def">
                <div className="deck-def-term">Example</div>
                <div className="deck-def-body">
                  <strong>OIT Data Modernization with Huron.</strong> OIT is leading institutional data modernization in partnership with Huron Consulting. AISPEG is tracking this work; details will be added as OIT shares scope and timelines.
                </div>
              </div>
            </div>
            <p className="deck-meta">
              Submit a project: any UI unit running AI work should appear in the inventory. <code>aispeg.insight.uidaho.edu/builder-guide</code>
            </p>
          </section>

          {/* 14. AI4RA */}
          <section>
            <div className="deck-eyebrow">The consortium</div>
            <h2>
              AI4RA: <span className="deck-accent">UI + SUU, NSF-funded</span>.
            </h2>
            <p style={{ marginTop: "1em", maxWidth: "42ch" }}>
              AI4RA is a two-institution NSF GRANTED partnership (Award #2427549) producing open-source reference tools for research administration.
            </p>
            <div className="deck-defs" style={{ marginTop: "1em" }}>
              <div className="deck-def">
                <div className="deck-def-term">Reference</div>
                <div className="deck-def-body">
                  UDM spec &middot; prompt library &middot; evaluation harness &middot; eCFR MCP. Consumed by peer institutions.
                </div>
              </div>
              <div className="deck-def">
                <div className="deck-def-term">Dual destiny</div>
                <div className="deck-def-body">
                  UI separately maintains deployment-specific implementations (OpenERA, Vandalizer, MindRouter, ProcessMapping) alongside the community artifacts.
                </div>
              </div>
            </div>
            <p className="deck-meta">
              AI4RA community tools are not UI interventions. UI&rsquo;s deployments of them are.
            </p>
          </section>

          {/* 15. The ask */}
          <section>
            <div className="deck-eyebrow">The ask</div>
            <h2>What we need from this group.</h2>
            <ol style={{ marginTop: "1.4em", maxWidth: "42ch" }}>
              <li>
                <strong>Legitimize the inventory.</strong> Endorse aispeg.insight.uidaho.edu as the authoritative record of UI AI work. Point units there.
              </li>
              <li>
                <strong>Help us surface what we&rsquo;re missing.</strong> Every AI effort at UI should appear in the inventory &mdash; even when AISPEG isn&rsquo;t building it.
              </li>
              <li>
                <strong>Protect the shared infrastructure.</strong> MindRouter and DGX Stack need institutional funding certainty.
              </li>
              <li>
                <strong>Back the diffusion pattern.</strong> SEM is co-building. More units should. TEMPLATE-app is the vehicle; AISPEG is the coach.
              </li>
              <li>
                <strong>Keep humans in the loop.</strong> Every intervention names an operational owner for a reason.
              </li>
            </ol>
          </section>

          {/* 16. Closing */}
          <section className="closing-slide">
            <div className="deck-eyebrow">Thank you</div>
            <h1>
              <span className="deck-accent">Questions?</span>
            </h1>
            <p style={{ marginTop: "1.6em", fontSize: "1em", color: "rgba(239,236,227,0.7)" }}>
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
