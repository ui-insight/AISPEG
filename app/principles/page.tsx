import PrincipleCard from "@/components/PrincipleCard";
import { principles } from "@/lib/data";

export default function PrinciplesPage() {
  const categories = Array.from(new Set(principles.map((p) => p.category)));

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-ui-charcoal">
          Strategic Principles
        </h1>
        <p className="mt-2 text-gray-600">
          Core principles guiding agentic AI adoption and institutional strategy
          at the University of Idaho.
        </p>
      </div>

      {categories.map((cat) => (
        <div key={cat}>
          <h2 className="mb-4 text-lg font-semibold text-ui-charcoal">{cat}</h2>
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
    </div>
  );
}
