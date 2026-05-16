import type {
  Task,
  TaskPriorityFilter,
  TaskStatusFilter,
} from "@/lib/tasks/types"

export interface TaskSummary {
  total: number
  pending: number
  completed: number
}

export interface TaskListFilters {
  searchQuery: string
  statusFilter: TaskStatusFilter
  priorityFilter: TaskPriorityFilter
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

export function filterTasks(tasks: Task[], filters: TaskListFilters): Task[] {
  const normalizedQuery = filters.searchQuery.trim().toLowerCase()

  return tasks.filter((task) => {
    const matchesSearch =
      normalizedQuery.length === 0 ||
      task.title.toLowerCase().includes(normalizedQuery) ||
      task.description.toLowerCase().includes(normalizedQuery)

    const matchesStatus =
      filters.statusFilter === "all" || task.status === filters.statusFilter

    const matchesPriority =
      filters.priorityFilter === "all" || task.priority === filters.priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })
}
