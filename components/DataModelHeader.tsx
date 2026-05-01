import Link from "next/link";
import { projects } from "@/lib/governance/catalog";
import { vocabularyGroups } from "@/lib/governance/vocabularies";

export type DataModelTab = "projects" | "tables" | "vocabularies";

interface TabItem {
  id: DataModelTab;
  label: string;
  href: string;
  stub?: boolean;
}

const TAB_ITEMS: TabItem[] = [
  { id: "projects", label: "Projects", href: "/standards/data-model" },
  {
    id: "tables",
    label: "Tables",
    href: "/standards/data-model/tables",
  },
  {
    id: "vocabularies",
    label: "Vocabularies",
    href: "/standards/data-model/vocabularies",
  },
];

function TabBar({ active }: { active: DataModelTab }) {
  return (
    <div className="flex gap-6 border-b border-gray-200">
      {TAB_ITEMS.map((t) => {
        const isActive = t.id === active;
        const baseClasses =
          "-mb-px border-b-2 pb-2 text-xs font-semibold uppercase tracking-wider";
        const stateClasses = isActive
          ? "border-brand-clearwater text-ui-charcoal"
          : "border-transparent text-gray-400 hover:text-ui-charcoal";

        if (t.stub) {
          return (
            <span
              key={t.id}
              aria-current={isActive ? "page" : undefined}
              className={`${baseClasses} ${stateClasses} cursor-default`}
            >
              {t.label}
              <span className="ml-1.5 text-[10px] font-normal normal-case tracking-normal text-gray-400">
                (next)
              </span>
            </span>
          );
        }

        return (
          <Link
            key={t.id}
            href={t.href}
            aria-current={isActive ? "page" : undefined}
            className={`unstyled ${baseClasses} ${stateClasses}`}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}

export default function DataModelHeader({ active }: { active: DataModelTab }) {
  const totalTables = projects.reduce((sum, p) => sum + p.tableCount, 0);
  const totalVocab = vocabularyGroups.length;

  return (
    <header className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-ui-charcoal">
          Data Model
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-gray-700">
          The AI4RA Unified Data Model and the per-project extensions
          installed across the IIDS portfolio. Engineers can use this to
          connect to our data; stakeholders can use it to understand the
          definitions and business rules. Source of truth:{" "}
          <a
            href="https://github.com/ui-insight/data-governance"
            target="_blank"
            rel="noopener noreferrer"
          >
            ui-insight/data-governance
          </a>
          .
        </p>
      </div>

      <dl className="grid grid-cols-3 gap-6 text-sm">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Projects governed
          </dt>
          <dd className="mt-1 text-2xl font-black text-ui-charcoal">
            {projects.length}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Tables across portfolio
          </dt>
          <dd className="mt-1 text-2xl font-black text-ui-charcoal">
            {totalTables}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Vocabulary groups
          </dt>
          <dd className="mt-1 text-2xl font-black text-ui-charcoal">
            {totalVocab}
          </dd>
        </div>
      </dl>

      <TabBar active={active} />
    </header>
  );
}
