// Single canonical explanation of the v1 heuristics that drive the Data
// Governance Explorer. Rendered once on the data-model index. Detail pages
// link to it via /standards/data-model#tagging-method instead of repeating
// the prose. When the upstream catalog adopts canonical/extension and
// classification fields, both the heuristics and this disclosure retire.

export default function TaggingMethod() {
  return (
    <details
      id="tagging-method"
      className="rounded-lg border border-hairline bg-surface-alt p-5 scroll-mt-6"
    >
      <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.14em] text-brand-clearwater hover:text-brand-black">
        Tagging method &mdash; how canonical / extension tags and vocabulary cross-walks are computed
      </summary>

      <div className="mt-4 space-y-3 border-t border-hairline pt-4 text-sm leading-relaxed text-ink-muted">
        <p>
          <span className="font-semibold text-brand-black">
            Canonical UDM tables
          </span>{" "}
          are adopted from the AI4RA Unified Data Model. Their names and shapes
          follow the institutional standard for research-administration data.{" "}
          <span className="font-semibold text-brand-black">
            Project extensions
          </span>{" "}
          are tables specific to one or more projects in the IIDS portfolio,
          not (yet) part of the institutional standard.
        </p>
        <p>
          The canonical / extension distinction is currently a v1 heuristic
          against a hand-curated list in{" "}
          <code className="rounded bg-white px-1 py-0.5 font-mono text-xs text-brand-black">
            lib/governance/canonical-udm-tables.ts
          </code>
          . When the upstream{" "}
          <a
            href="https://github.com/ui-insight/data-governance"
            target="_blank"
            rel="noopener noreferrer"
          >
            ui-insight/data-governance
          </a>{" "}
          catalog adopts the classification field, this overlay retires.
        </p>
        <p>
          <span className="font-semibold text-brand-black">
            Vocabulary cross-walks
          </span>{" "}
          &mdash; the &ldquo;Vocab&rdquo; pill on a column and the
          &ldquo;Projects using&rdquo; count on a vocabulary group &mdash; are
          also v1 heuristics. A column counts as using a vocabulary group when
          it has an{" "}
          <code className="rounded bg-white px-1 py-0.5 font-mono text-xs text-brand-black">
            AllowedValues.&lt;group&gt;
          </code>{" "}
          foreign key, or when its name matches the group name normalized
          across PascalCase, snake_case, and camelCase. Logic lives in{" "}
          <code className="rounded bg-white px-1 py-0.5 font-mono text-xs text-brand-black">
            lib/governance/vocabulary-usage.ts
          </code>
          .
        </p>
        <p>
          PII flags and column-level data classification are{" "}
          <span className="font-semibold text-brand-black">
            not yet captured
          </span>{" "}
          upstream. Tracking at{" "}
          <a
            href="https://github.com/ui-insight/data-governance/issues/9"
            target="_blank"
            rel="noopener noreferrer"
          >
            ui-insight/data-governance#9
          </a>
          ; full epic at{" "}
          <a
            href="https://github.com/ui-insight/AISPEG/issues/53"
            target="_blank"
            rel="noopener noreferrer"
          >
            AISPEG #53
          </a>
          .
        </p>
      </div>
    </details>
  );
}
