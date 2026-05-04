// Agent tool registry — see Epic #107.
//
// Each tool is read-only and returns a structured payload plus a
// `canonicalUrl` (or `links: []`) so the model can cite back to the site.
// The loop never trusts the model to enforce visibility — each tool is
// scoped to an audience tier at registration time.

import "server-only";
import type { ToolDefinition } from "@/lib/mindrouter";

export type Audience = "public" | "internal";

export interface ToolResult {
  /** Free-form structured payload — serialised as JSON for the model. */
  data: unknown;
  /** Primary URL the model should cite when surfacing this data. */
  canonicalUrl?: string;
  /** Additional URLs to cite (e.g. per-entry deep links). */
  links?: { label: string; url: string }[];
}

export interface ToolHandler {
  definition: ToolDefinition;
  execute: (
    args: Record<string, unknown>,
    ctx: { audience: Audience }
  ) => Promise<ToolResult>;
}

export interface ToolRegistry {
  list(): ToolDefinition[];
  get(name: string): ToolHandler | undefined;
}

export function createRegistry(handlers: ToolHandler[]): ToolRegistry {
  const byName = new Map<string, ToolHandler>();
  for (const h of handlers) {
    byName.set(h.definition.function.name, h);
  }
  return {
    list: () => handlers.map((h) => h.definition),
    get: (name) => byName.get(name),
  };
}
