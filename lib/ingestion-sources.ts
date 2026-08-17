// ============================================================
// Ingestion sources — the channel an activity arrived through
// ============================================================
// One vocabulary across both activity populations. Open requests carry
// their registry origin (lib/utr.ts); inventory projects carry the
// channel their demand line entered through, recorded per slug below.
//
// The UTR stress-test report (app/reports/utr-stress-test-aug-2026/
// flow-data.ts) holds its own frozen copy of this classification —
// that module is a point-in-time snapshot and stays untouched. This
// module is the living source: when a project joins lib/portfolio.ts,
// add its slug here (an absent slug renders as unattributed, never as
// a silent guess).

import { REQUEST_ORIGIN_LABEL, type RequestOrigin } from "./utr";

/** Channels a project's demand line entered through. `clickup` marks
 *  projects that began as AI4UI ClickUp requests and converted into
 *  inventory entries. */
export type ProjectIngestionSource =
  | "clickup"
  | "ored"
  | "unit-partnership"
  | "iids-internal"
  | "oit-portfolio";

/** The union vocabulary: request origins + project channels.
 *  `clickup` appears in both populations and collapses to one value. */
export type IngestionSource = RequestOrigin | ProjectIngestionSource;

export const INGESTION_SOURCE_LABEL: Record<IngestionSource, string> = {
  ...REQUEST_ORIGIN_LABEL,
  ored: "ORED request",
  "unit-partnership": "Unit partnership",
  "iids-internal": "IIDS internal",
  "oit-portfolio": "OIT portfolio",
};

/** Canonical display order — request-registry channels first, then the
 *  project-only channels. */
export const INGESTION_SOURCE_ORDER: IngestionSource[] = [
  "oit-idea",
  "clickup",
  "site-submission",
  "direct",
  "tdx",
  "ored",
  "unit-partnership",
  "iids-internal",
  "oit-portfolio",
];

// Ingestion source per project slug. ORED work came via research-office
// channels; unit partnerships arrived by direct relationship with the
// owning unit; IIDS-internal work is platform and scaffold investment;
// the OIT portfolio rows are externally tracked.
export const PROJECT_INGESTION_SOURCE: Record<string, ProjectIngestionSource> =
  {
    vandalizer: "ored",
    openera: "ored",
    processmapping: "ored",
    execord: "ored",
    "rfd-companion": "ored",
    "rfd-career": "ored",
    "retroactive-payment-requests": "clickup",
    "water-law-database": "clickup",
    "out-of-state-tax-tracking": "clickup",
    "historical-contracts": "clickup",
    "bid-waiver-document-review": "clickup",
    "invoice-processing": "clickup",
    "ucm-daily-register": "clickup",
    mindrouter: "iids-internal",
    "dgx-stack": "iids-internal",
    "template-app": "iids-internal",
    "data-infrastructure-pilot": "iids-internal",
    stratplan: "unit-partnership",
    "audit-dashboard": "unit-partnership",
    "ongoing-contracts": "unit-partnership",
    "mindrouter-video-storyboard": "unit-partnership",
    "sem-experiential": "unit-partnership",
    "sidearm-pipeline": "unit-partnership",
    universo: "unit-partnership",
    "bls-cupa-code-prediction": "unit-partnership",
    "financial-planning-suite": "unit-partnership",
    "oit-data-modernization": "oit-portfolio",
    "ir-reporting-modernization": "oit-portfolio",
    nexus: "oit-portfolio",
  };
