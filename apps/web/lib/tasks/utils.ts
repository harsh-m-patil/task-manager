import type { Task } from "@/lib/tasks/types"

export interface TaskSummary {
  total: number
  pending: number
  completed: number
}

export function summarizeTasks(tasks: Task[]): TaskSummary {
  const completed = tasks.filter((task) => task.status === "completed").length
  const total = tasks.length

  return {
    total,
    completed,
    pending: total - completed,
  }
}
