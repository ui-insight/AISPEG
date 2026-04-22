import Link from "next/link";
import RevealDeck from "@/components/RevealDeck";
import { portfolioProjects } from "@/lib/portfolio";
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

  const flagships = portfolioProjects.filter(
    (p) => p.role === "Platform" && p.org === "ui-insight"
  );
  const institutionalApps = portfolioProjects.filter(
    (p) => p.role === "Institutional app"
  );
  const infra = portfolioProjects.filter((p) => p.role === "Infrastructure");
  const governance = portfolioProjects.filter((p) => p.role === "Governance");
  const evals = portfolioProjects.filter(
    (p) => p.role === "Evaluation infrastructure"
  );
  const outreach = portfolioProjects.filter((p) => p.role === "Outreach");

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

      {/* The deck itself */}
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
              How the University of Idaho is approaching the portfolio.
            </p>
            <p className="deck-meta">
              Barrie Robison &middot; AI Strategic Planning &amp; Evaluation
              Group
            </p>
          </section>

          {/* 2. The thesis */}
          <section>
            <p className="deck-eyebrow">The thesis</p>
            <h2>Operational excellence is a <span className="deck-accent">data problem</span>.</h2>
            <p style={{ marginTop: "0.8em" }}>
              You can&rsquo;t improve what you can&rsquo;t measure. You
              can&rsquo;t measure what you can&rsquo;t model. And you
              can&rsquo;t model what you can&rsquo;t name consistently.
            </p>
            <p style={{ marginTop: "0.6em" }}>
              <strong>
                AI accelerates every step &mdash; only if the underlying data
                is trustworthy.
              </strong>
            </p>
            <p className="deck-meta">
              That&rsquo;s why our portfolio starts with data standards and
              governance, not chatbots.
            </p>
          </section>

          {/* 3. What we're going to cover */}
          <section>
            <p className="deck-eyebrow">What we&rsquo;ll cover</p>
            <h2>Approach, portfolio, path forward</h2>
            <ol>
              <li>
                <strong>Approach</strong> &mdash; principles guiding our AI
                interventions
              </li>
              <li>
                <strong>Architecture</strong> &mdash; how the portfolio fits
                together
              </li>
              <li>
                <strong>Portfolio</strong> &mdash; projects in flight, grouped
                by role
              </li>
              <li>
                <strong>Proof</strong> &mdash; what we&rsquo;ve learned from
                the Feb 2026 sprint
              </li>
              <li>
                <strong>The ask</strong> &mdash; what we need from the
                Operational Excellence working group
              </li>
            </ol>
          </section>

          {/* 4. The institutional question */}
          <section>
            <p className="deck-eyebrow">The institutional question</p>
            <h2 style={{ color: "rgba(248,249,250,0.4)", textDecoration: "line-through" }}>
              &ldquo;How do we use AI?&rdquo;
            </h2>
            <h2 style={{ marginTop: "0.6em" }}>
              <span className="deck-accent">
                &ldquo;How do we make the right thing easy,
                <br />
                and the wrong thing difficult?&rdquo;
              </span>
            </h2>
            <p className="deck-meta">
              The right question reframes AI from a tool choice to an
              institutional design choice.
            </p>
          </section>

          {/* 5. Our approach — 4 principles */}
          <section>
            <p className="deck-eyebrow">Our approach</p>
            <h2>Four principles</h2>
            <div className="deck-grid deck-grid-2" style={{ marginTop: "0.8em" }}>
              <div className="deck-card">
                <strong>Data model first</strong>
                What&rsquo;s the most important model? Your data model. The UDM
                comes before the UI.
              </div>
              <div className="deck-card">
                <strong>Humans in the loop</strong>
                AI proposes, humans approve. Every LLM output has a review
                surface before it persists.
              </div>
              <div className="deck-card">
                <strong>Reproducibility over demos</strong>
                Can someone else get the same answer? If not, it&rsquo;s a
                demo, not a system.
              </div>
              <div className="deck-card">
                <strong>Guidelines guide agents too</strong>
                Write documentation that agents AND humans can follow.
                Machine-readable, human-friendly.
              </div>
            </div>
          </section>

          {/* 6. Architecture overview */}
          <section>
            <p className="deck-eyebrow">How the portfolio fits together</p>
            <h2>The stack, bottom-up</h2>
            <div style={{ marginTop: "0.5em" }}>
              <div className="deck-card" style={{ marginBottom: "0.5em" }}>
                <strong>Layer 5 &mdash; Outreach</strong>
                REACH Workshop 2026 &middot; Data Crawler Carl &middot; AI4RA
                Discussions
              </div>
              <div className="deck-card" style={{ marginBottom: "0.5em" }}>
                <strong>Layer 4 &mdash; Platforms &amp; Apps</strong>
                OpenERA &middot; Vandalizer &middot; Strategic Plan Dashboard
                &middot; Audit Dashboard &middot; UCM Daily Register &middot;
                ProcessMapping &middot; SEM &middot; RFD CAREER &middot;
                ExecOrd
              </div>
              <div className="deck-card" style={{ marginBottom: "0.5em" }}>
                <strong>Layer 3 &mdash; Quality</strong>
                AI4RA prompt-library &middot; evaluation-harness &middot;
                evaluation-data-sets &middot; eCFR MCP
              </div>
              <div className="deck-card" style={{ marginBottom: "0.5em" }}>
                <strong>Layer 2 &mdash; LLM infrastructure</strong>
                MindRouter (load balancer) &middot; DGX Stack (on-prem
                Grace-Blackwell) &middot; Azure AD SSO
              </div>
              <div className="deck-card">
                <strong>Layer 1 &mdash; Data &amp; Governance</strong>
                AI4RA UDM (spec) &middot; data-governance (adoption)
                &middot; TEMPLATE-app (propagation)
              </div>
            </div>
          </section>

          {/* 7. Flagship platforms */}
          <section>
            <p className="deck-eyebrow">Layer 4 · Flagship platforms</p>
            <h2>What institutional users touch</h2>
            <div className="deck-grid deck-grid-2" style={{ marginTop: "0.6em" }}>
              {flagships.map((p) => (
                <div className="deck-card" key={p.slug}>
                  <strong>{p.name}</strong>
                  {p.tagline}
                </div>
              ))}
            </div>
            <p className="deck-meta">
              {flagships.length} platforms &middot;{" "}
              {flagships.filter((p) => !p.isPrivate).length} open source &middot;
              Vandalizer funded by NSF GRANTED #2427549
            </p>
          </section>

          {/* 8. Institutional apps */}
          <section>
            <p className="deck-eyebrow">Layer 4 · Institutional apps</p>
            <h2>Single-domain wins</h2>
            <div className="deck-grid deck-grid-2" style={{ marginTop: "0.6em" }}>
              {institutionalApps.map((p) => (
                <div className="deck-card" key={p.slug}>
                  <strong>{p.name}</strong>
                  {p.tagline}
                </div>
              ))}
            </div>
            <p className="deck-meta">
              Each is a focused intervention; each adopts the same UDM vocabulary.
            </p>
          </section>

          {/* 9. Governance & standards */}
          <section>
            <p className="deck-eyebrow">Layer 1 · Governance</p>
            <h2>The quietest layer is the most important</h2>
            <div className="deck-grid" style={{ marginTop: "0.6em" }}>
              {governance.map((p) => (
                <div className="deck-card" key={p.slug}>
                  <strong>{p.name}</strong>
                  {p.tagline}
                </div>
              ))}
              <div className="deck-card">
                <strong>TEMPLATE-app</strong>
                Production-ready scaffold. Every new app starts aligned to the
                standard, not retrofitted.
              </div>
            </div>
            <p className="deck-meta">
              One institutional vocabulary. Every dashboard, every report, every
              AI prompt speaks it.
            </p>
          </section>

          {/* 10. LLM Infrastructure */}
          <section>
            <p className="deck-eyebrow">Layer 2 · LLM infrastructure</p>
            <h2>On-prem, shared, fair</h2>
            <div className="deck-grid deck-grid-2" style={{ marginTop: "0.6em" }}>
              {infra.map((p) => (
                <div className="deck-card" key={p.slug}>
                  <strong>{p.name}</strong>
                  {p.tagline}
                </div>
              ))}
            </div>
            <p className="deck-meta">
              No per-seat license costs. No vendor lock-in. Data stays on
              University infrastructure. Full audit trail.
            </p>
          </section>

          {/* 11. Evaluation */}
          <section>
            <p className="deck-eyebrow">Layer 3 · Quality</p>
            <h2>You don&rsquo;t ship what you can&rsquo;t measure</h2>
            <div className="deck-grid deck-grid-2" style={{ marginTop: "0.6em" }}>
              {evals.map((p) => (
                <div className="deck-card" key={p.slug}>
                  <strong>{p.name}</strong>
                  {p.tagline}
                </div>
              ))}
            </div>
            <p className="deck-meta">
              Triad evaluation: prompt &times; data &times; model. Every
              AI-powered feature has a quality signal before it goes live.
            </p>
          </section>

          {/* 12. Outreach */}
          <section>
            <p className="deck-eyebrow">Layer 5 · Outreach</p>
            <h2>Teaching, not preaching</h2>
            <div className="deck-grid deck-grid-2" style={{ marginTop: "0.6em" }}>
              {outreach.map((p) => (
                <div className="deck-card" key={p.slug}>
                  <strong>{p.name}</strong>
                  {p.tagline}
                </div>
              ))}
            </div>
            <p className="deck-meta">
              We bring peer institutions along with us. Shared tooling is
              stronger tooling.
            </p>
          </section>

          {/* 13. Proof: Feb 2026 */}
          <section>
            <p className="deck-eyebrow">The proof</p>
            <h2>February 2026 &mdash; what 26 days looks like</h2>
            <div className="deck-grid deck-grid-3" style={{ marginTop: "1em" }}>
              <div className="deck-card" style={{ textAlign: "center" }}>
                <div className="deck-stat-number">11</div>
                <div className="deck-stat-label">Active repositories</div>
              </div>
              <div className="deck-card" style={{ textAlign: "center" }}>
                <div className="deck-stat-number">830</div>
                <div className="deck-stat-label">Commits</div>
              </div>
              <div className="deck-card" style={{ textAlign: "center" }}>
                <div className="deck-stat-number">237,900</div>
                <div className="deck-stat-label">Net new lines</div>
              </div>
              <div className="deck-card" style={{ textAlign: "center" }}>
                <div className="deck-stat-number">10&ndash;16&times;</div>
                <div className="deck-stat-label">Productivity multiplier</div>
              </div>
              <div className="deck-card" style={{ textAlign: "center" }}>
                <div className="deck-stat-number">8</div>
                <div className="deck-stat-label">Contributors</div>
              </div>
              <div className="deck-card" style={{ textAlign: "center" }}>
                <div className="deck-stat-number">152</div>
                <div className="deck-stat-label">Actual dev-days</div>
              </div>
            </div>
            <p className="deck-meta">
              Estimated traditional effort: 1,586&ndash;2,379 dev-days
              (72&ndash;108 months).
            </p>
          </section>

          {/* 14. What operational excellence looks like */}
          <section>
            <p className="deck-eyebrow">Where it shows up</p>
            <h2>Operational excellence outcomes</h2>
            <div className="deck-grid deck-grid-2" style={{ marginTop: "0.6em" }}>
              <div className="deck-card">
                <strong>Cycle time</strong>
                Proposal-to-submission, audit-observation-to-closure,
                submission-to-newsletter.
              </div>
              <div className="deck-card">
                <strong>Compliance posture</strong>
                IACUC, IRB, IBC lifecycles tracked. Personnel compliance
                matrix by sponsor. EO tracking.
              </div>
              <div className="deck-card">
                <strong>Decision quality</strong>
                Strategic plan alignment made visible. Investment portfolio
                analytics. Audit overdue alerts.
              </div>
              <div className="deck-card">
                <strong>Delivery velocity</strong>
                Each new institutional app starts from a governed, secure,
                documented scaffold.
              </div>
            </div>
          </section>

          {/* 15. The ask */}
          <section>
            <p className="deck-eyebrow">The ask</p>
            <h2>What we need from this working group</h2>
            <ol style={{ marginTop: "0.5em" }}>
              <li>
                <strong>Legitimize the institutional standard.</strong> Endorse
                AI4RA UDM + data-governance as the portfolio-wide reference for
                data modeling and governance.
              </li>
              <li>
                <strong>Protect the shared infrastructure.</strong> MindRouter
                and DGX Stack are the on-prem LLM substrate. They need
                institutional funding certainty.
              </li>
              <li>
                <strong>Help us find the next interventions.</strong> Which
                operational cycles are most painful, most high-stakes, or
                most repetitive? That&rsquo;s where we want to go next.
              </li>
              <li>
                <strong>Keep the humans in the loop.</strong> Our governance
                model depends on reviewed, reproducible AI output &mdash; not
                black-box automation.
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
            <p className="deck-meta">Barrie Robison &middot; AISPEG</p>
          </section>
        </RevealDeck>
      </div>
    </div>
  );
}
