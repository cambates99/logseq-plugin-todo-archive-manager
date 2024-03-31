// Task.ts

import { EntityID } from "@logseq/libs/dist/LSPlugin";

export enum TaskState {
  TODO = 'TODO',
  DOING = 'DOING',
  DONE = 'DONE',
  // LATER = 'LATER',
  // NOW = 'NOW',
  // WAITING = 'WAITING',
  // CANCELED = 'CANCELED'
}

export enum TaskPriority {
  A = '[#A]',
  B = '[#B]',
  C = '[#C]',
}

export interface Task {
  state: TaskState;
  priority: TaskPriority | null; // Priority is nullable if no priority is set
  uuid: string;
  parentID: EntityID;
}
