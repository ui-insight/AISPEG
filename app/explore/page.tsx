import Link from "next/link";
import { getPubliclyVisible, type Intervention } from "@/lib/portfolio";
import {
  WORK_CATEGORIES,
  WORK_CATEGORY_LABELS,
  type WorkCategory,
} from "@/lib/work-categories";

export const metadata = {
  title: "Explore | UI AI Initiative",
  description:
    "Browse AI interventions at the University of Idaho by the kind of operational work they help with.",
};

interface CategoryTile {
  slug: WorkCategory;
  label: string;
  description: string;
  count: number;
  representatives: string[];
}

function buildTiles(interventions: Intervention[]): CategoryTile[] {
  return WORK_CATEGORIES.map((slug) => {
    const matches = interventions.filter((i) =>
      (i.workCategories ?? []).includes(slug)
    );
    return {
      slug,
      label: WORK_CATEGORY_LABELS[slug].label,
      description: WORK_CATEGORY_LABELS[slug].description,
      count: matches.length,
      representatives: matches.slice(0, 2).map((i) => i.name),
    };
  });
}

export default function ExplorePage() {
  const interventions = getPubliclyVisible();
  const tiles = buildTiles(interventions);

  return (
    <div className="space-y-10">
      <section>
        <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">
          Explore
        </p>
        <h1 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">
          Browse interventions by the kind of work they help with
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-ink-muted">
          Find AI work tackling problems like yours &mdash; documents,
          processes, coordination, reconciliation, and more. Each tile
          counts the interventions tagged with that kind of work and links
          straight into a filtered view of{" "}
          <Link href="/portfolio" className="font-medium text-brand-black hover:underline">
            The Work
          </Link>
          .
        </p>
      </section>

      <section
        aria-label="Categories"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {tiles.map((tile) => (
          <CategoryTileCard key={tile.slug} tile={tile} />
        ))}
      </section>
    </div>
  );
}

function CategoryTileCard({ tile }: { tile: CategoryTile }) {
  const isEmpty = tile.count === 0;

  // Empty categories render as a non-interactive tile so the taxonomy
  // stays visible (a Dean scanning for "knowledge retrieval" should see
  // it even before something is tagged) without offering a dead link.
  if (isEmpty) {
    return (
      <div className="flex h-full flex-col rounded-xl border border-hairline bg-white p-5 opacity-70">
        <h2 className="text-base font-semibold text-brand-black">
          {tile.label}
        </h2>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">
          {tile.description}
        </p>
        <p className="mt-4 text-xs font-medium text-ink-muted">
          No interventions tagged here yet
        </p>
      </div>
    );
  }

  return (
    <Link
      href={`/portfolio?category=${tile.slug}`}
      className="group flex h-full flex-col rounded-xl border border-hairline bg-white p-5 transition-shadow hover:shadow-md"
    >
      <h2 className="text-base font-semibold text-brand-black">
        {tile.label}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        {tile.description}
      </p>
      <p className="mt-3 flex-1 text-sm text-ink-muted">
        <span className="font-bold tabular-nums text-brand-black">
          {tile.count}
        </span>{" "}
        intervention{tile.count === 1 ? "" : "s"}
        {tile.representatives.length > 0 && (
          <>
            {" "}
            &middot;{" "}
            <span className="text-brand-black">
              {tile.representatives.join(", ")}
            </span>
          </>
        )}
      </p>
      <p className="mt-4 text-sm font-medium text-brand-black group-hover:underline">
        View &rarr;
      </p>
    </Link>
  );
}
