import Link from "next/link";
import RevealDeck from "@/components/RevealDeck";
import { interventions } from "@/lib/portfolio";
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
  const byOwner = (slug: string) => interventions.find((i) => i.slug === slug);

  const audit = byOwner("audit-dashboard");
  const nexus = byOwner("nexus");
  const embargoed = byOwner("embargoed-osp");

  return (
    <div className="space-y-6">
      <nav className="text-sm text-gray-500">
        <Link href="/presentations" className="hover:text-brand-gold-dark">
          Presentations
        </Link>
        <span className="mx-2">/</span>
        <span className="text-brand-black">{deck.title}</span>
      </nav>

      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h1 className="text-2xl font-black text-brand-black">{deck.title}</h1>
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

      <div className="h-[720px] w-full overflow-hidden rounded-xl border border-gray-200 shadow-md">
        <RevealDeck>
          {/* 1. TITLE */}
          <section className="title-slide">
            <div className="deck-eyebrow">Today &middot; April 22, 2026</div>
            <h1>
              AI interventions for <span className="hl">operational excellence</span>.
            </h1>
            <p className="subhead">
              A tour of where we&rsquo;ve been, what we&rsquo;re running now,
              and where we need this working group&rsquo;s help to go next.
            </p>
            <p className="deck-meta">
              Barrie Robison &middot; Lead, University of Idaho AI Initiative
            </p>
          </section>

          {/* 2. AI4RA ORIGIN — July 1, 2025 */}
          <section>
            <div className="deck-eyebrow">Origin &middot; July 1, 2025</div>
            <h2>
              It started with <span className="hl">AI4RA</span>.
            </h2>
            <div className="deck-split deck-split-60-40" style={{ marginTop: "1.4em" }}>
              <div>
                <p style={{ maxWidth: "48ch" }}>
                  NSF GRANTED Award{" "}
                  <span className="deck-owner">#2427549</span> &mdash; a
                  University of Idaho + Southern Utah University partnership
                  &mdash; put us in the research-administration trenches with a
                  clear remit: make AI-assisted workflows safer, more
                  reviewable, and more useful.
                </p>
                <p style={{ marginTop: "1em", maxWidth: "48ch" }}>
                  Within months we had a working playbook. The question
                  became: <em>why would we stop at one domain?</em>
                </p>
              </div>
              <div>
                <div className="deck-anchor-label">AI4RA taught us</div>
                <ul>
                  <li>Data model before UI</li>
                  <li>Human-in-the-loop, always</li>
                  <li>Reproducibility over demos</li>
                  <li>Shared infrastructure pays off fast</li>
                </ul>
              </div>
            </div>
            <p className="deck-meta">
              From July 2025 onward, the same playbook expanded to the rest of
              campus &mdash; finance, communications, enrollment, faculty
              development, compliance.
            </p>
          </section>

          {/* 3. DFA — First expansion */}
          <section>
            <div className="deck-eyebrow">Act I &middot; First expansion</div>
            <h2>
              Division of Financial Affairs.
            </h2>
            <div className="deck-split deck-split-60-40" style={{ marginTop: "1.2em" }}>
              <div>
                <p>
                  The first domain-transfer test for AI4RA: an{" "}
                  <span className="hl">AI-assisted audit</span> observation
                  lifecycle for Internal Audit. PDFs in, structured review out,
                  humans accountable at every gate.
                </p>
                {audit && (
                  <p style={{ marginTop: "1em" }}>{audit.description}</p>
                )}
              </div>
              <div style={{ paddingTop: "0.8em" }}>
                <div className="deck-anchor-label">Owner</div>
                <p style={{ fontSize: "1.2em", marginBottom: "1em" }}>
                  <span className="deck-owner">Kim Salisbury</span>
                </p>
                <div className="deck-anchor-label">Status</div>
                <p>Prototype in active use by DFA.</p>
              </div>
            </div>
            <p className="deck-meta">
              Proof point: the AI4RA pattern transferred cleanly to a
              non-research-admin domain. The playbook works beyond its origin.
            </p>
          </section>

          {/* 4. INFRASTRUCTURE & CAPACITY */}
          <section>
            <div className="deck-eyebrow">Substrate &middot; Infrastructure &amp; capacity</div>
            <h2>
              Infrastructure matters <span className="hl">more than apps</span>.
            </h2>
            <p style={{ marginTop: "0.8em", maxWidth: "46ch" }}>
              None of the interventions on the site would exist without a
              shared, secure, institution-owned compute layer. Two pieces:
            </p>
            <div className="deck-defs" style={{ marginTop: "1.4em" }}>
              <div className="deck-def">
                <div className="deck-def-term">MindRouter</div>
                <div className="deck-def-body">
                  Production LLM load balancer with fair-share scheduling,
                  quotas, tool-calling, and full audit trails. Every AI app at
                  UI routes through it. Open-sourced at{" "}
                  <strong>mindrouter.ai</strong>. Owner:{" "}
                  <span className="deck-owner">Luke Sheneman</span>.
                </div>
              </div>
              <div className="deck-def">
                <div className="deck-def-term">Mother cluster</div>
                <div className="deck-def-body">
                  <strong>20 × NVIDIA H200 GPUs</strong> hosted at{" "}
                  <strong>Idaho National Laboratory</strong>. On-prem compute
                  for institutional workloads — no cloud recurring cost,
                  compliance-sensitive data stays in-state.
                </div>
              </div>
              <div className="deck-def">
                <div className="deck-def-term">Collaboration</div>
                <div className="deck-def-body">
                  Jointly operated with <strong>OIT</strong>. Network,
                  identity, and security integration co-owned; architecture and
                  build carried by IIDS.
                </div>
              </div>
            </div>
          </section>

          {/* 5. NOTABLE EARLY PROJECTS */}
          <section>
            <div className="deck-eyebrow">Act II &middot; Notable early projects</div>
            <h2>Momentum across domains.</h2>
            <div className="deck-split deck-split-50-50" style={{ marginTop: "1.2em" }}>
              <div className="deck-panel">
                <strong>Vandalizer</strong>
                AI-powered document intelligence for research administration.
                NSF-funded, open-source, deployed at UI and Southern Utah
                University.
                <p style={{ fontSize: "0.82em", color: "#595959", marginTop: "0.6em" }}>
                  Owner: <span className="deck-owner">Sarah Martonick</span>
                </p>
              </div>
              <div className="deck-panel">
                <strong>SBOE response</strong>
                Rapid AI-assisted preparation of institutional responses to
                State Board of Education inquiries &mdash; a dry-run that
                showed what a 48-hour turnaround looks like when the data
                model is already in place.
              </div>
              <div className="deck-panel">
                <strong>Water Law database</strong>
                Document-OCR and metadata extraction for Idaho water rights
                filings &mdash; a distinct domain from research admin, same
                institutional playbook.
              </div>
              <div className="deck-panel">
                <strong>Feb 2026 sprint evidence</strong>
                Across all early projects: 830 commits, 237,900 net new lines
                of production code in 26 calendar days, 10&ndash;16&times;
                traditional-baseline productivity.
              </div>
            </div>
          </section>

          {/* 6. NEXUS */}
          <section>
            <div className="deck-eyebrow">Act III &middot; Where apps land</div>
            <h2>
              <span className="hl">Nexus</span>.
            </h2>
            {nexus && (
              <p style={{ marginTop: "0.8em", maxWidth: "50ch" }}>
                {nexus.description}
              </p>
            )}
            <div className="deck-defs" style={{ marginTop: "1.2em" }}>
              <div className="deck-def">
                <div className="deck-def-term">Owners</div>
                <div className="deck-def-body">
                  <span className="deck-owner">Kali Armitage</span>{" "}
                  and <span className="deck-owner">Colin Addington</span>.
                </div>
              </div>
              <div className="deck-def">
                <div className="deck-def-term">Collaboration</div>
                <div className="deck-def-body">
                  OIT + IIDS. React + FastAPI on OIT-managed secure
                  infrastructure.
                </div>
              </div>
              <div className="deck-def">
                <div className="deck-def-term">Role</div>
                <div className="deck-def-body">
                  Institutional landing zone: the template where UI application
                  modules are deployed. Complements TEMPLATE-app (the
                  development scaffold) with a production runtime.
                </div>
              </div>
            </div>
          </section>

          {/* 7. FEB 2026 INFLECTION */}
          <section>
            <div className="deck-eyebrow">Inflection &middot; February 2026</div>
            <h2>
              The models <span className="hl">changed</span>.
            </h2>
            <div className="deck-split deck-split-50-50" style={{ marginTop: "1.2em" }}>
              <div>
                <p>
                  In February 2026, two drops shifted the ground beneath us:
                </p>
                <ul style={{ marginTop: "0.6em" }}>
                  <li><strong>Codex 5.4</strong> &mdash; agentic coding at production quality</li>
                  <li><strong>Claude Opus 4.6</strong> &mdash; long-horizon reasoning + code</li>
                </ul>
                <p style={{ marginTop: "1em" }}>
                  Agentic development stopped being an experiment and became{" "}
                  <em>the default pace</em>.
                </p>
              </div>
              <div>
                <div className="deck-stats" style={{ gridTemplateColumns: "1fr 1fr", gap: "1.2em 2em", marginTop: 0 }}>
                  <div>
                    <div className="deck-stat-number">830</div>
                    <div className="deck-stat-label">Commits · 26 days</div>
                  </div>
                  <div>
                    <div className="deck-stat-number">237k</div>
                    <div className="deck-stat-label">Net new lines</div>
                  </div>
                  <div>
                    <div className="deck-stat-number">11</div>
                    <div className="deck-stat-label">Active repos</div>
                  </div>
                  <div>
                    <div className="deck-stat-number">10&ndash;16×</div>
                    <div className="deck-stat-label">Productivity multiplier</div>
                  </div>
                </div>
              </div>
            </div>
            <p className="deck-meta">
              The institutional question flipped: not &ldquo;can we build this?&rdquo; but
              &ldquo;how fast can governance, review, and inventory keep up?&rdquo;
            </p>
          </section>

          {/* 8. NEW PROJECTS — tour */}
          <section>
            <div className="deck-eyebrow">Act IV &middot; The inventory</div>
            <h2>
              The <span className="hl">portfolio</span> &mdash; grouped by home unit.
            </h2>
            <div className="deck-unit-list">
              <div className="deck-unit">
                <div className="deck-unit-name">Office of the President</div>
                <div className="deck-unit-items">Strategic Plan Dashboard</div>
              </div>
              <div className="deck-unit">
                <div className="deck-unit-name">Office of Sponsored Programs, ORED</div>
                <div className="deck-unit-items">Vandalizer &middot; ProcessMapping &middot; Embargoed project</div>
              </div>
              <div className="deck-unit">
                <div className="deck-unit-name">Division of Financial Affairs</div>
                <div className="deck-unit-items">Audit Dashboard</div>
              </div>
              <div className="deck-unit">
                <div className="deck-unit-name">University Communications &amp; Marketing</div>
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
                <div className="deck-unit-items">Nexus &middot; Data Modernization (tracked)</div>
              </div>
            </div>
            <p className="deck-meta">
              Full live inventory: <strong>aispeg.insight.uidaho.edu/portfolio</strong> &mdash; I&rsquo;ll demo it in a moment.
            </p>
          </section>

          {/* 9. META — the site itself */}
          <section>
            <div className="deck-eyebrow">Meta &middot; This website</div>
            <h2>
              We built <span className="hl">this site</span> the same way.
            </h2>
            <p style={{ marginTop: "0.8em", maxWidth: "48ch" }}>
              The site you&rsquo;ll see in a moment is itself an AI
              intervention &mdash; scaffolded from the same TEMPLATE-app,
              headed to the same production home on Nexus, routed through
              MindRouter for any AI surfaces it needs.
            </p>
            <div className="deck-defs" style={{ marginTop: "1em" }}>
              <div className="deck-def">
                <div className="deck-def-term">Purpose</div>
                <div className="deck-def-body">
                  The institutional inventory of AI interventions, a
                  submission portal for new work, and a stakeholder
                  communication surface.
                </div>
              </div>
              <div className="deck-def">
                <div className="deck-def-term">Demonstrates</div>
                <div className="deck-def-body">
                  The principles at play &mdash; evidence-forward,
                  owner-named, visibility-tiered, inspectable.
                </div>
              </div>
            </div>
          </section>

          {/* 10. SUBMISSION TOOL */}
          <section>
            <div className="deck-eyebrow">Contribute &middot; The portal</div>
            <h2>
              Got an AI idea? <span className="hl">Submit it</span>.
            </h2>
            <p style={{ marginTop: "0.8em", maxWidth: "46ch" }}>
              Every UI unit can submit a project or idea through the builder
              guide wizard. AISPEG tracks it, helps scope it, and connects it
              to related work across campus. The inventory is institutional
              &mdash; the goal is{" "}
              <em>no shadow AI work</em>, by any unit, anywhere.
            </p>
            <ul style={{ marginTop: "1em" }}>
              <li>Early ideas welcome &mdash; you don&rsquo;t need a spec.</li>
              <li>We track non-AISPEG-built work too (e.g., OIT Data Modernization with Huron).</li>
              <li>Submissions feed the registry, similarity check against existing projects, then promotion to the public portfolio.</li>
            </ul>
            <p className="deck-meta">
              <code>aispeg.insight.uidaho.edu/builder-guide</code>
            </p>
          </section>

          {/* 11. OPENERA EXAMPLE (embargoed reveal during demo) */}
          <section>
            <div className="deck-eyebrow">Demo &middot; Embargoed project</div>
            <h2>
              Let&rsquo;s look at one together.
            </h2>
            <div className="deck-split deck-split-50-50" style={{ marginTop: "1.2em" }}>
              <div>
                <p>
                  Over on the site, there&rsquo;s an{" "}
                  <span className="deck-owner">Embargoed project</span>{" "}
                  card under OSP / ORED. You&rsquo;ll see:
                </p>
                <ul>
                  <li>The card, with owner and status</li>
                  <li>An AI4RA Core chip</li>
                  <li>&ldquo;Embargoed&rdquo; visibility indicator</li>
                </ul>
                <p style={{ marginTop: "0.6em" }}>
                  What you <em>won&rsquo;t</em> see: name, description, repo,
                  docs. That&rsquo;s the Partial visibility tier at work.
                </p>
              </div>
              <div>
                {embargoed && (
                  <div className="deck-panel">
                    <strong>Embargoed project</strong>
                    <p style={{ fontSize: "0.82em", color: "#595959", marginTop: "0.4em" }}>
                      Owner: <span className="deck-owner">Sarah Martonick</span>
                    </p>
                    <p style={{ fontSize: "0.82em", color: "#595959", marginTop: "0.2em" }}>
                      Prototype &middot; AI4RA Core &middot; Partial visibility
                    </p>
                    <p style={{ fontSize: "0.78em", color: "#7a7a7a", marginTop: "0.6em", fontStyle: "italic" }}>
                      Full details and live demo reveal off-slide during the
                      session.
                    </p>
                  </div>
                )}
              </div>
            </div>
            <p className="deck-meta">
              Three visibility tiers:{" "}
              <strong>Public</strong> (everything shown) &middot;{" "}
              <strong>Partial</strong> (card + ownership, embargoed details)
              &middot; <strong>Internal-only</strong> (not listed publicly).
            </p>
          </section>

          {/* 12. CALL TO ACTION */}
          <section>
            <div className="deck-eyebrow">Call to action</div>
            <h2>
              <span className="hl">Four things</span> from this group.
            </h2>
            <ol style={{ marginTop: "1.2em", maxWidth: "46ch" }}>
              <li>
                <strong>Legitimize the inventory</strong> as the authoritative
                record of UI AI work. Point your units to it.
              </li>
              <li>
                <strong>Surface what we&rsquo;re missing.</strong> Every AI
                effort at UI should appear on the site &mdash; including work
                AISPEG isn&rsquo;t building.
              </li>
              <li>
                <strong>Protect the shared infrastructure.</strong>{" "}
                MindRouter and the mother cluster need institutional funding
                certainty &mdash; they&rsquo;re load-bearing for everything
                downstream.
              </li>
              <li>
                <strong>Back the diffusion pattern.</strong> SEM is
                co-building; more units should. Nexus + TEMPLATE-app is the
                runway.
              </li>
            </ol>
          </section>

          {/* 13. CLOSING */}
          <section className="closing-slide">
            <div className="deck-eyebrow">Thank you</div>
            <h1>
              <span className="hl">Questions?</span>
            </h1>
            <p style={{ marginTop: "1.6em", fontSize: "1em", color: "#3d3d3d" }}>
              <strong>aispeg.insight.uidaho.edu</strong>
            </p>
            <p className="deck-meta">
              Barrie Robison &middot; Lead, University of Idaho AI Initiative
              &middot; April 22, 2026
            </p>
          </section>
        </RevealDeck>
      </div>
    </div>
  );
}
