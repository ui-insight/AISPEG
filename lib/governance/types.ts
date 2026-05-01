export type TableKind = "table" | "entity" | "projection_table";

export type TableClassification = "canonical-udm" | "project-extension";

export interface ProjectTechStack {
  backend?: string;
  frontend?: string;
  database?: string;
}

export interface Project {
  slug: string;
  application: string;
  repository: string;
  domain: string;
  techStack: ProjectTechStack;
  runtimeModes?: string[];
  tableCount: number;
  canonicalUdmCount: number;
  projectExtensionCount: number;
}

export interface Column {
  name: string;
  type: string;
  nullable?: boolean;
  primaryKey?: boolean;
  foreignKey?: string | null;
}

export interface Relationship {
  name: string;
  target: string;
  type: string;
}

export interface Table {
  project: string;
  kind: TableKind;
  name: string;
  modelClass?: string;
  description?: string;
  columns: Column[];
  uniqueConstraints: string[][];
  relationships: Relationship[];
  classification: TableClassification;
}

export interface VocabularyValue {
  code: string;
  label: string;
  displayOrder?: number;
  description?: string;
}

export interface VocabularyGroup {
  domain: string;
  application?: string;
  group: string;
  description?: string;
  values: VocabularyValue[];
}
