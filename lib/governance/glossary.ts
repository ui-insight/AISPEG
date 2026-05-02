// Plain-language definitions for engineer-shorthand terms used across the
// Data Governance Explorer. Wrapped via <GlossaryTerm term="..."> to render
// a dotted-underline trigger with a tooltip on hover, focus, or tap.
//
// The TaggingMethod disclosure on /standards/data-model is the deeper
// explanation; these are quick reminders for skimmers.

export const glossary = {
  PK: "Primary key — the unique identifier for a row in this table.",
  FK: "Foreign key — a reference to a row in another table, named in the form Target_Table.Target_Column.",
  Vocab: "Indicates this column draws values from a controlled vocabulary group — a defined list of allowed codes, not free-text.",
  "Canonical UDM":
    "A table whose name and shape are adopted from the AI4RA Unified Data Model — the institutional standard for research-administration data.",
  "Project extension":
    "A table specific to one or more projects in the IIDS portfolio, not (yet) part of the institutional standard.",
  "Allowed values":
    "Values drawn from a controlled vocabulary group. The field is enumerated, not free-text — every value has a code, a human-readable label, and an optional sort order.",
  "Projection table":
    "A view-like table whose data is derived from other source-of-truth tables. Read-only by convention; not the place to write new records.",
  Entity:
    "A table representing a real-world thing — a person, a grant, a device — rather than an event or a relationship between things.",
} as const;

export type GlossaryKey = keyof typeof glossary;
