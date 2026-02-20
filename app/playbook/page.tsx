import { playbookItems } from "@/lib/data";

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
              .map((item) => (
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
                </div>
              ))}
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
