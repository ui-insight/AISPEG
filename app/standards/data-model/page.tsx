export const metadata = {
  title: "Data Model — Standards",
  description:
    "Interactive explorer for the AI4RA Unified Data Model and per-project extensions across the IIDS portfolio.",
};

export default function DataModelPlaceholderPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-black tracking-tight text-ui-charcoal">
        Data Model
      </h1>
      <p className="mt-4 text-base leading-relaxed text-gray-700">
        An interactive explorer for the AI4RA Unified Data Model and the
        per-project extensions installed across the IIDS portfolio. The
        explorer surfaces tables, columns, controlled vocabularies, and
        cross-project usage so engineers can connect to our data and
        stakeholders can understand the definitions and business rules.
      </p>
      <p className="mt-6 rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
        Tracking issue:{" "}
        <a
          href="https://github.com/ui-insight/AISPEG/issues/53"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-ui-charcoal underline decoration-brand-clearwater decoration-[1.5px] underline-offset-4"
        >
          [Epic] Data Governance Explorer (#53)
        </a>
        . The first interactive view ships in #55.
      </p>
    </div>
  );
}
