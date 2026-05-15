import type { TaskState } from "@/lib/tasks/types"

export const defaultTaskState: TaskState = {
  tasks: [],
  searchQuery: "",
  statusFilter: "all",
  priorityFilter: "all",
}

export function createInitialTaskState(
  overrides: Partial<TaskState> = {}
): TaskState {
  return {
    ...defaultTaskState,
    ...overrides,
  }
}
