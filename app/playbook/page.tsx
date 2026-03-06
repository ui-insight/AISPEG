import Link from "next/link";
import { playbookItems, standardDocuments } from "@/lib/data";

// Build reverse lookup: playbook item id → standard doc(s) that reference it
function getStandardsForPlaybookItem(itemId: string) {
  return standardDocuments.filter(
    (doc) => doc.relatedPlaybookIds?.includes(itemId)
  );
}

export default function PlaybookPage() {
  const categories = Array.from(new Set(playbookItems.map((p) => p.category)));

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-ui-charcoal">Agent Playbook</h1>
        <p className="mt-2 text-gray-600">
          Guidelines for agents AND humans. Preferred stacks, security patterns,
          and conventions for agentic development.
        </p>
      </div>

      {categories.map((cat) => (
        <div key={cat}>
          <h2 className="mb-4 text-lg font-semibold text-ui-charcoal">{cat}</h2>
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
                    <h3 className="text-base font-semibold text-ui-charcoal">
                      {item.title}
                    </h3>
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

      {/* Key Principle */}
      <div className="rounded-xl bg-ui-charcoal p-6 text-white">
        <p className="text-sm font-medium text-ui-gold">Key Principle</p>
        <p className="mt-2 text-lg">
          Guidelines should guide agents as much as people. Write documentation
          and standards that are machine-readable and human-friendly.
        </p>
      </div>

      <div className="rounded-xl border border-dashed border-gray-300 bg-white/50 p-8 text-center">
        <p className="text-sm text-gray-500">
          Contribute playbook entries by adding MDX files to{" "}
          <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">
            /content/playbook/
          </code>
        </p>
      </div>
    </div>
  );
}
