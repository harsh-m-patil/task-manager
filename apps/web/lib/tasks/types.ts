export type TaskPriority = "low" | "medium" | "high"

export type TaskStatus = "pending" | "completed"

export type TaskStatusFilter = "all" | TaskStatus

export type TaskPriorityFilter = "all" | TaskPriority

export interface Task {
  id: string
  title: string
  description: string
  priority: TaskPriority
  dueDate: string
  status: TaskStatus
  createdAt: string
  updatedAt: string
}

export interface TaskState {
  tasks: Task[]
  searchQuery: string
  statusFilter: TaskStatusFilter
  priorityFilter: TaskPriorityFilter
}
