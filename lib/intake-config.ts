// lib/intake-config.ts
//
// Named-SLA configuration for the Submit-a-Project flow. Single source of
// truth for who the named human is, what the SLA reads, and how status
// values map to user-facing language. Edit here when staffing or copy
// changes; do not embed strings in the wizard or status page directly.

export const intakeConfig = {
  /** The IIDS staff member named on the post-submit confirmation. */
  intakeOwner: {
    name: "Colin Armitage",
    title: "IIDS",
    email: "carmitage@uidaho.edu",
  },
  /** Service-level commitment shown to submitters at confirmation time. */
  sla: {
    /** Plain-English version. */
    text: "Colin will follow up within 2 business days.",
    /** Numeric form for any future automation. */
    businessDaysToFirstResponse: 2,
  },
  /**
   * Threshold for surfacing similar projects during the assessment.
   * Lower than the post-submit threshold (0.3) — at intake time we'd
   * rather over-notify and let the submitter decide than miss a real
   * overlap.
   */
  liveSimilarityThreshold: 0.2,
} as const;

/**
 * User-facing label and short description for each submissions.status
 * value. Status states are defined in db/migrations/001_initial.sql:
 *   new | reviewed | in-progress | archived
 */
export const submissionStatusLabels: Record<
  string,
  { label: string; description: string; tone: "neutral" | "active" | "done" }
> = {
  new: {
    label: "Received",
    description:
      "Your submission has been logged and is in the IIDS intake queue.",
    tone: "neutral",
  },
  reviewed: {
    label: "Reviewed",
    description:
      "An IIDS reviewer has looked at the assessment and is preparing next steps.",
    tone: "active",
  },
  "in-progress": {
    label: "In progress",
    description:
      "Your project has been accepted and work has started or scoping is underway.",
    tone: "active",
  },
  archived: {
    label: "Closed",
    description:
      "This submission has been closed. Reach out to IIDS if you have questions about the outcome.",
    tone: "done",
  },
};

/**
 * The submission UUID is used directly as the status-page token. UUIDs
 * carry ~122 bits of entropy, enough to function as an unguessable
 * capability for a single submission.
 */
export function statusUrlFor(submissionId: string): string {
  return `/intake/${submissionId}`;
}
