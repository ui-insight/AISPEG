export interface Priority {
  code: string;
  pillar: string;
  text: string;
}

export interface Pillar {
  code: string;
  name: string;
  priorities: Priority[];
}
