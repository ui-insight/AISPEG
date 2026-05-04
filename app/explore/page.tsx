import Link from "next/link";
import {
  getPubliclyVisible,
  PUBLIC_STAGE_LABEL,
  stageBreakdown,
  type Project,
  type PublicStage,
} from "@/lib/portfolio";
import {
  WORK_CATEGORIES,
  WORK_CATEGORY_LABELS,
  type WorkCategory,
} from "@/lib/work-categories";

export const metadata = {
  title: "Explore | UI AI Initiative",
  description:
    "Browse AI projects at the University of Idaho by the kind of operational work they help with.",
};

interface CategoryTile {
  slug: WorkCategory;
  label: string;
  description: string;
  count: number;
  representatives: string[];
  // Public-stage breakdown for this category. Suppressed when the
  // entire category sits in a single stage (avoids "4 live" tautology).
  stageBreakdown: Array<{ stage: PublicStage; count: number }>;
}

function buildTiles(projects: Project[]): CategoryTile[] {
  return WORK_CATEGORIES.map((slug) => {
    const matches = projects.filter((i) =>
      (i.workCategories ?? []).includes(slug)
    );
    const stages = stageBreakdown(matches);
    return {
      slug,
      label: WORK_CATEGORY_LABELS[slug].label,
      description: WORK_CATEGORY_LABELS[slug].description,
      count: matches.length,
      representatives: matches.slice(0, 2).map((i) => i.name),
      stageBreakdown: stages.length > 1 ? stages : [],
    };
  });
}

export default function ExplorePage() {
  const projects = getPubliclyVisible();
  const tiles = buildTiles(projects);

  return (
    <div className="space-y-10">
      <section>
        <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">
          Explore
        </p>
        <h1 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">
          Browse projects by the kind of work they help with
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-ink-muted">
          Find AI work tackling problems like yours &mdash; documents,
          processes, coordination, reconciliation, and more. Each tile
          counts the projects tagged with that kind of work and links
          straight into a filtered view of{" "}
          <Link href="/portfolio" className="font-medium text-brand-black hover:underline">
            Projects
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
      <div
        id={`category-${tile.slug}`}
        className="flex h-full scroll-mt-12 flex-col rounded-xl border border-hairline bg-white p-5 opacity-70"
      >
        <h2 className="text-base font-semibold text-brand-black">
          {tile.label}
        </h2>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">
          {tile.description}
        </p>
        <p className="mt-4 text-xs font-medium text-ink-muted">
          No projects tagged here yet
        </p>
      </div>
    );
  }

  return (
    <Link
      id={`category-${tile.slug}`}
      href={`/portfolio?category=${tile.slug}`}
      className="group flex h-full scroll-mt-12 flex-col rounded-xl border border-hairline bg-white p-5 transition-shadow hover:shadow-md"
    >
      <h2 className="text-base font-semibold text-brand-black">
        {tile.label}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        {tile.description}
      </p>
      <p className="mt-3 text-sm text-ink-muted">
        <span className="font-bold tabular-nums text-brand-black">
          {tile.count}
        </span>{" "}
        project{tile.count === 1 ? "" : "s"}
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
      {tile.stageBreakdown.length > 0 && (
        <p className="mt-1 flex-1 text-xs text-ink-muted">
          {tile.stageBreakdown.map((s, idx) => (
            <span key={s.stage}>
              {idx > 0 && (
                <span aria-hidden className="text-brand-silver">
                  {" · "}
                </span>
              )}
              <span className="font-semibold tabular-nums text-brand-black">
                {s.count}
              </span>{" "}
              {PUBLIC_STAGE_LABEL[s.stage].toLowerCase()}
            </span>
          ))}
        </p>
      )}
      {tile.stageBreakdown.length === 0 && <div className="flex-1" />}
      <p className="mt-4 text-sm font-medium text-brand-black group-hover:underline">
        View &rarr;
      </p>
    </Link>
  );
}
