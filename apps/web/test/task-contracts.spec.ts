import {
  type Task,
  type TaskPriority,
  type TaskState,
  type TaskStatus,
} from "@/lib/tasks/types"
import { createInitialTaskState } from "@/lib/tasks/state"
import { summarizeTasks } from "@/lib/tasks/utils"
import { describe, expect, test } from "vitest"

describe("task domain contracts", () => {
  test("provides stable task-state defaults for future slices", () => {
    const state = createInitialTaskState()

    expect(state).toEqual({
      tasks: [],
      searchQuery: "",
      statusFilter: "all",
      priorityFilter: "all",
    })
  })

  test("summarizes task metadata from public task type", () => {
    const pendingTask: Task = {
      id: "task-1",
      title: "Design shell",
      description: "Create semantic shell",
      priority: "medium",
      dueDate: "2026-05-20",
      status: "pending",
      createdAt: "2026-05-15T00:00:00.000Z",
      updatedAt: "2026-05-15T00:00:00.000Z",
    }

    const completedTask: Task = {
      ...pendingTask,
      id: "task-2",
      status: "completed",
    }

    expect(summarizeTasks([pendingTask, completedTask])).toEqual({
      total: 2,
      pending: 1,
      completed: 1,
    })
  })

  test("keeps priority and status unions constrained", () => {
    const priority: TaskPriority = "high"
    const status: TaskStatus = "completed"
    const state: TaskState = createInitialTaskState({
      priorityFilter: priority,
      statusFilter: status,
    })

    expect(state.priorityFilter).toBe("high")
    expect(state.statusFilter).toBe("completed")
  })
})
