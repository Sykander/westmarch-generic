export type RunStep = {
  label: string;
  state: 'pending' | 'running' | 'success' | 'warning' | 'failed' | 'skipped';
  detail?: string;
};

export type SubsystemDefinition = {
  key: string;
  label: string;
  commands: string[];
  implemented: boolean;
  detail: string;
};

export type PlannedFeature = {
  title: string;
  detail: string;
  plannedItems: string[];
};
