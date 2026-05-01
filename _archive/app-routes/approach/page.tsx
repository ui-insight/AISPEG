import Link from "next/link";
import PrincipleCard from "@/components/PrincipleCard";
import LessonCard from "@/components/LessonCard";
import {
  principles,
  lessons,
  playbookItems,
  standardDocuments,
} from "@/lib/data";

function getStandardsForPlaybookItem(itemId: string) {
  return standardDocuments.filter(
    (doc) => doc.relatedPlaybookIds?.includes(itemId)
  );
}

const sections = [
  { id: "principles", label: "Strategic Principles" },
  { id: "playbook", label: "Agent Playbook" },
  { id: "lessons", label: "Lessons Learned" },
];

export default function ApproachPage() {
  const principleCategories = Array.from(
    new Set(principles.map((p) => p.category))
  );
  const playbookCategories = Array.from(
    new Set(playbookItems.map((p) => p.category))
  );

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-bold text-ui-charcoal">Our Approach</h1>
        <p className="mt-2 max-w-3xl text-gray-600">
          How AISPEG approaches agentic AI at the University of Idaho — the
          principles that guide us, the playbook for agents and humans, and the
          lessons we&rsquo;ve learned along the way.
        </p>

        <nav className="mt-6 flex flex-wrap gap-2">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 hover:border-ui-gold/40 hover:text-ui-gold-dark"
            >
              {s.label}
            </a>
          ))}
        </nav>
      </div>

      {/* Strategic Principles */}
      <section id="principles" className="scroll-mt-8 space-y-6">
        <div className="border-l-4 border-ui-gold pl-4">
          <h2 className="text-2xl font-bold text-ui-charcoal">
            Strategic Principles
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Core principles guiding agentic AI adoption and institutional
            strategy.
          </p>
        </div>

        {principleCategories.map((cat) => (
          <div key={cat}>
            <h3 className="mb-4 text-base font-semibold text-ui-charcoal">
              {cat}
            </h3>
            <div className="space-y-4">
              {principles
                .filter((p) => p.category === cat)
                .map((p) => (
                  <PrincipleCard
                    key={p.id}
                    title={p.title}
                    summary={p.summary}
                    details={p.details}
                    category={p.category}
                  />
                ))}
            </div>
          </div>
        ))}
      </section>

      {/* Agent Playbook */}
      <section id="playbook" className="scroll-mt-8 space-y-6">
        <div className="border-l-4 border-ui-gold pl-4">
          <h2 className="text-2xl font-bold text-ui-charcoal">
            Agent Playbook
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Guidelines for agents AND humans. Preferred stacks, security
            patterns, and conventions for agentic development.
          </p>
        </div>

        {playbookCategories.map((cat) => (
          <div key={cat}>
            <h3 className="mb-4 text-base font-semibold text-ui-charcoal">
              {cat}
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {playbookItems
                .filter((p) => p.category === cat)
                .map((item) => {
                  const relatedStandards = getStandardsForPlaybookItem(item.id);
                  return (
                    <div
                      key={item.id}
                      className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
                    >
                      <h4 className="text-base font-semibold text-ui-charcoal">
                        {item.title}
                      </h4>
                      <p className="mt-2 text-sm leading-relaxed text-gray-600">
                        {item.description}
                      </p>
                      {relatedStandards.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {relatedStandards.map((std) => (
                            <Link
                              key={std.id}
                              href={`/standards/${std.id}`}
                              className="inline-flex items-center gap-1 rounded-full border border-ui-gold/30 bg-ui-gold/10 px-2.5 py-0.5 text-xs font-medium text-ui-gold-dark hover:bg-ui-gold/20"
                            >
                              <svg
                                className="h-3 w-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                />
                              </svg>
                              {std.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        ))}

        <div className="rounded-xl bg-ui-charcoal p-6 text-white">
          <p className="text-sm font-medium text-ui-gold">Key Principle</p>
          <p className="mt-2 text-lg">
            Guidelines should guide agents as much as people. Write
            documentation and standards that are machine-readable and
            human-friendly.
          </p>
        </div>
      </section>

      {/* Lessons Learned */}
      <section id="lessons" className="scroll-mt-8 space-y-6">
        <div className="border-l-4 border-ui-gold pl-4">
          <h2 className="text-2xl font-bold text-ui-charcoal">
            Lessons Learned
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Insights from repo-scale multi-agent collaboration and real-world
            agentic AI development.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
          {lessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              title={lesson.title}
              context={lesson.context}
              recommendations={lesson.recommendations}
              category={lesson.category}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
