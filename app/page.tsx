import Link from "next/link";
import { getPubliclyVisible } from "@/lib/portfolio";

export const dynamic = "force-dynamic";

const cards = [
  {
    href: "/portfolio",
    eyebrow: "The Work",
    heading: "AI interventions across UI units",
    body: "Projects, their operational owners, and current status.",
    cta: "Explore the portfolio",
    showCount: true,
  },
  {
    href: "/builder-guide",
    eyebrow: "Have an AI project idea?",
    heading: "Submit a project",
    body: "A short assessment scopes your idea, recommends a path, and connects you to a named owner at IIDS.",
    cta: "Start the assessment",
  },
  {
    href: "/reports",
    eyebrow: "Reports",
    heading: "Activity reports and presentations",
    body: "Time-stamped artifacts: monthly briefs, decks, and public communications.",
    cta: "Browse reports",
  },
  {
    href: "/standards",
    eyebrow: "Institutional Standards",
    heading: "Standards documentation",
    body: "Software-development and user-experience standards governing AI work at the University of Idaho.",
    cta: "View standards",
  },
];

export default async function Home() {
  const portfolioCount = getPubliclyVisible().length;

  return (
    <div className="space-y-12">
      <section>
        <p className="text-xs font-semibold uppercase tracking-wider text-ui-gold-dark">
          Institutional AI Initiative
        </p>
        <h1 className="mt-2 text-4xl font-black leading-tight tracking-tight text-ui-charcoal">
          University of Idaho
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-600">
          AI work at the University of Idaho, coordinated by the Institute
          for Interdisciplinary Data Sciences.
        </p>
      </section>

      <section>
        <div className="grid gap-4 md:grid-cols-2">
          {cards.map((card) => {
            const heading =
              card.showCount && card.href === "/portfolio"
                ? `${portfolioCount} AI interventions across UI units`
                : card.heading;
            return (
              <Link
                key={card.href}
                href={card.href}
                className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-ui-gold/40 hover:shadow-md"
              >
                <p className="text-xs font-medium uppercase tracking-wider text-ui-gold-dark">
                  {card.eyebrow}
                </p>
                <h2 className="mt-2 text-xl font-semibold text-ui-charcoal group-hover:text-ui-gold-dark">
                  {heading}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {card.body}
                </p>
                <p className="mt-3 text-sm font-medium text-ui-gold-dark group-hover:underline">
                  {card.cta} &rarr;
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
