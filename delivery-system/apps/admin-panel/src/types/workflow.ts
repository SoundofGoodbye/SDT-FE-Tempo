export interface WorkflowStep {
  id: string;
  name: string;
  color: string;
  position: { x: number; y: number };
  notifications: {
    shopAssistant: boolean;
    customerSms: boolean;
  };
  stats: {
    avgTime: number; // in minutes
    successRate: number; // percentage
  };
}

export interface WorkflowConnection {
  id: string;
  fromStepId: string;
  toStepId: string;
  avgTransitionTime: number; // in minutes
  isBottleneck: boolean;
}

export interface Workflow {
  id: string;
  companyId: string;
  name: string;
  steps: WorkflowStep[];
  connections: WorkflowConnection[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowStats {
  totalWorkflows: number;
  avgCompletionTime: number;
  successRate: number;
  bottlenecks: {
    stepId: string;
    stepName: string;
    avgDelay: number;
  }[];
}

export interface WorkflowMutations {
  updateWorkflow: (workflow: Partial<Workflow>) => Promise<void>;
  updateStep: (stepId: string, step: Partial<WorkflowStep>) => Promise<void>;
  addStep: (step: Omit<WorkflowStep, "id">) => Promise<void>;
  removeStep: (stepId: string) => Promise<void>;
  reorderSteps: (stepIds: string[]) => Promise<void>;
}
