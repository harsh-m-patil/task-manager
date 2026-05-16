"use client"

import { type FormEvent, useEffect, useMemo, useRef, useState } from "react"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { Textarea } from "@workspace/ui/components/textarea"
import {
  createTask,
  hasCreateTaskValidationErrors,
  type CreateTaskInput,
  type CreateTaskValidationErrors,
  validateCreateTaskInput,
} from "@/lib/tasks/state"
import { loadTasks, saveTasks } from "@/lib/tasks/storage"
import type {
  Task,
  TaskPriority,
  TaskPriorityFilter,
  TaskStatusFilter,
} from "@/lib/tasks/types"
import { filterTasks, summarizeTasks } from "@/lib/tasks/utils"

const defaultTaskInput: CreateTaskInput = {
  title: "",
  description: "",
  priority: "medium",
  dueDate: "",
}

const selectClassName =
  "border-input bg-background ring-offset-background focus-visible:ring-ring focus-visible:ring-3 flex min-h-11 w-full rounded-md border px-3 py-2 text-sm"

const primaryButtonClassName = "min-h-11 px-4 sm:min-h-9"
const taskActionButtonClassName = "min-h-11 px-3 sm:min-h-9"

type TaskViewMode = "list" | "card"

function priorityBadgeClassName(priority: TaskPriority): string {
  if (priority === "high") {
    return "bg-red-100 text-red-800 border-red-200"
  }

  if (priority === "medium") {
    return "bg-amber-100 text-amber-800 border-amber-200"
  }

  return "bg-emerald-100 text-emerald-800 border-emerald-200"
}

function statusRowClassName(status: Task["status"]): string {
  return status === "completed"
    ? "task-row-completed opacity-70"
    : "task-row-pending"
}

function toTaskInput(task: Task): CreateTaskInput {
  return {
    title: task.title,
    description: task.description,
    priority: task.priority,
    dueDate: task.dueDate,
  }
}

export default function Page() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks())
  const [taskInput, setTaskInput] = useState<CreateTaskInput>(defaultTaskInput)
  const [errors, setErrors] = useState<CreateTaskValidationErrors>({})
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>("all")
  const [priorityFilter, setPriorityFilter] = useState<TaskPriorityFilter>("all")
  const [viewMode, setViewMode] = useState<TaskViewMode>("list")
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  const summary = useMemo(() => summarizeTasks(tasks), [tasks])
  const filteredTasks = useMemo(
    () =>
      filterTasks(tasks, {
        searchQuery,
        statusFilter,
        priorityFilter,
      }),
    [tasks, searchQuery, statusFilter, priorityFilter]
  )
  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    statusFilter !== "all" ||
    priorityFilter !== "all"

  const updateTaskInput = <K extends keyof CreateTaskInput>(
    key: K,
    value: CreateTaskInput[K]
  ) => {
    setTaskInput((current) => ({ ...current, [key]: value }))
    setErrors((current) => {
      const nextErrors = { ...current }
      delete nextErrors[key]
      return nextErrors
    })
  }

  const cancelEditingTask = () => {
    setEditingTaskId(null)
    setTaskInput(defaultTaskInput)
    setErrors({})
  }

  const startEditingTask = (task: Task) => {
    setEditingTaskId(task.id)
    setTaskInput(toTaskInput(task))
    setErrors({})
  }

  const onSubmitTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const validationErrors = validateCreateTaskInput(taskInput)

    if (hasCreateTaskValidationErrors(validationErrors)) {
      setErrors(validationErrors)
      return
    }

    if (editingTaskId) {
      setTasks((current) => {
        const nextTasks = current.map((task) =>
          task.id === editingTaskId
            ? {
                ...task,
                ...taskInput,
                updatedAt: new Date().toISOString(),
              }
            : task
        )
        saveTasks(nextTasks)
        return nextTasks
      })

      cancelEditingTask()
      return
    }

    const nextTask = createTask(taskInput)

    setTasks((current) => {
      const nextTasks = [nextTask, ...current]
      saveTasks(nextTasks)
      return nextTasks
    })

    setTaskInput(defaultTaskInput)
    setErrors({})
  }

  const toggleTaskStatus = (task: Task) => {
    setTasks((current) => {
      const nextTasks: Task[] = current.map((currentTask) => {
        if (currentTask.id !== task.id) {
          return currentTask
        }

        const nextStatus: Task["status"] =
          currentTask.status === "completed" ? "pending" : "completed"

        return {
          ...currentTask,
          status: nextStatus,
          updatedAt: new Date().toISOString(),
        }
      })

      saveTasks(nextTasks)
      return nextTasks
    })
  }

  const deleteTask = (task: Task) => {
    const shouldDelete = window.confirm(
      `Delete task "${task.title}"? This action cannot be undone.`
    )

    if (!shouldDelete) {
      return
    }

    if (editingTaskId === task.id) {
      cancelEditingTask()
    }

    setTasks((current) => {
      const nextTasks = current.filter((currentTask) => currentTask.id !== task.id)
      saveTasks(nextTasks)
      return nextTasks
    })
  }

  useEffect(() => {
    const onGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "/") {
        return
      }

      const target = event.target
      if (
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return
      }

      event.preventDefault()
      searchInputRef.current?.focus()
    }

    window.addEventListener("keydown", onGlobalKeyDown)
    return () => window.removeEventListener("keydown", onGlobalKeyDown)
  }, [])

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b" role="banner">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <Badge variant="secondary">Task workspace</Badge>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Task Management Dashboard
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl text-sm sm:text-base">
            Create tasks, track status, and keep dashboard counts in sync with
            canonical task data.
          </p>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[2fr_1fr] lg:px-8">
        <div className="space-y-6">
          <Card role="region" aria-label="Primary actions">
            <CardHeader>
              <CardTitle>
                {editingTaskId ? "Edit task" : "Create a task"}
              </CardTitle>
              <CardDescription>
                {editingTaskId
                  ? "Update title, description, priority, and due date for the selected task."
                  : "Add title, description, priority, and due date to create a pending task."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-4"
                onSubmit={onSubmitTask}
                onKeyDown={(event) => {
                  if (event.key === "Escape" && editingTaskId) {
                    event.preventDefault()
                    cancelEditingTask()
                    return
                  }

                  if (
                    event.key === "Enter" &&
                    (event.metaKey || event.ctrlKey) &&
                    event.currentTarget instanceof HTMLFormElement
                  ) {
                    event.preventDefault()
                    event.currentTarget.requestSubmit()
                  }
                }}
                noValidate
              >
                <div className="space-y-2">
                  <Label htmlFor="task-title">Title</Label>
                  <Input
                    id="task-title"
                    value={taskInput.title}
                    onChange={(event) =>
                      updateTaskInput("title", event.currentTarget.value)
                    }
                    aria-invalid={Boolean(errors.title)}
                    aria-describedby={errors.title ? "task-title-error" : undefined}
                  />
                  {errors.title ? (
                    <p id="task-title-error" className="text-sm text-red-600">
                      {errors.title}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="task-description">Description</Label>
                  <Textarea
                    id="task-description"
                    value={taskInput.description}
                    onChange={(event) =>
                      updateTaskInput("description", event.currentTarget.value)
                    }
                    aria-invalid={Boolean(errors.description)}
                    aria-describedby={
                      errors.description ? "task-description-error" : undefined
                    }
                  />
                  {errors.description ? (
                    <p id="task-description-error" className="text-sm text-red-600">
                      {errors.description}
                    </p>
                  ) : null}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="task-priority">Priority</Label>
                    <select
                      id="task-priority"
                      className={selectClassName}
                      value={taskInput.priority}
                      onChange={(event) =>
                        updateTaskInput(
                          "priority",
                          event.currentTarget.value as TaskPriority
                        )
                      }
                      aria-invalid={Boolean(errors.priority)}
                      aria-describedby={
                        errors.priority ? "task-priority-error" : undefined
                      }
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                    {errors.priority ? (
                      <p id="task-priority-error" className="text-sm text-red-600">
                        {errors.priority}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="task-due-date">Due date</Label>
                    <Input
                      id="task-due-date"
                      type="date"
                      value={taskInput.dueDate}
                      onChange={(event) =>
                        updateTaskInput("dueDate", event.currentTarget.value)
                      }
                      aria-invalid={Boolean(errors.dueDate)}
                      aria-describedby={
                        errors.dueDate ? "task-due-date-error" : undefined
                      }
                    />
                    {errors.dueDate ? (
                      <p id="task-due-date-error" className="text-sm text-red-600">
                        {errors.dueDate}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button type="submit" className={primaryButtonClassName}>
                    {editingTaskId ? "Save task changes" : "New Task"}
                  </Button>
                  {editingTaskId ? (
                    <Button
                      type="button"
                      variant="outline"
                      className={primaryButtonClassName}
                      onClick={cancelEditingTask}
                    >
                      Cancel edit
                    </Button>
                  ) : null}
                </div>
              </form>
            </CardContent>
          </Card>

          <Card role="region" aria-label="Search and filters">
            <CardHeader>
              <CardTitle>Search and filters</CardTitle>
              <CardDescription>
                Search tasks and combine status and priority filters.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="task-search">Search tasks</Label>
                <Input
                  id="task-search"
                  ref={searchInputRef}
                  type="search"
                  placeholder="Search by title or description"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.currentTarget.value)}
                  className="min-h-11"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="task-status-filter">Status filter</Label>
                  <select
                    id="task-status-filter"
                    className={selectClassName}
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(event.currentTarget.value as TaskStatusFilter)
                    }
                  >
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="task-priority-filter">Priority filter</Label>
                  <select
                    id="task-priority-filter"
                    className={selectClassName}
                    value={priorityFilter}
                    onChange={(event) =>
                      setPriorityFilter(event.currentTarget.value as TaskPriorityFilter)
                    }
                  >
                    <option value="all">All priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className={primaryButtonClassName}
                onClick={() => {
                  setSearchQuery("")
                  setStatusFilter("all")
                  setPriorityFilter("all")
                }}
                disabled={!hasActiveFilters}
              >
                Clear filters
              </Button>
            </CardContent>
          </Card>

          <Card role="region" aria-label="Task list">
            <CardHeader>
              <CardTitle>Task list</CardTitle>
              <CardDescription>
                Mandatory list view plus optional card view powered by task state.
              </CardDescription>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  type="button"
                  variant={viewMode === "list" ? "default" : "outline"}
                  className={primaryButtonClassName}
                  aria-pressed={viewMode === "list"}
                  onClick={() => setViewMode("list")}
                >
                  List view
                </Button>
                <Button
                  type="button"
                  variant={viewMode === "card" ? "default" : "outline"}
                  className={primaryButtonClassName}
                  aria-pressed={viewMode === "card"}
                  onClick={() => setViewMode("card")}
                >
                  Card view
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {tasks.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No tasks yet. Create your first task using the form above.
                </p>
              ) : filteredTasks.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No tasks match your current search and filters.
                </p>
              ) : viewMode === "list" ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Due date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTasks.map((task) => (
                      <TableRow key={task.id} className={statusRowClassName(task.status)}>
                        <TableCell>
                          <p
                            className={
                              task.status === "completed"
                                ? "font-medium line-through"
                                : "font-medium"
                            }
                          >
                            {task.title}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {task.description}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              task.status === "completed" ? "secondary" : "outline"
                            }
                            className={
                              task.status === "completed"
                                ? "border-green-200 bg-green-100 text-green-800"
                                : "border-slate-300 bg-slate-100 text-slate-700"
                            }
                          >
                            {task.status === "completed" ? "Completed" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={priorityBadgeClassName(task.priority)}
                          >
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{task.dueDate}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              className={taskActionButtonClassName}
                              onClick={() => toggleTaskStatus(task)}
                              aria-label={
                                task.status === "completed"
                                  ? `Mark task ${task.title} as pending`
                                  : `Mark task ${task.title} as completed`
                              }
                            >
                              {task.status === "completed"
                                ? "Mark pending"
                                : "Mark completed"}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              className={taskActionButtonClassName}
                              onClick={() => startEditingTask(task)}
                              aria-label={`Edit task ${task.title}`}
                            >
                              Edit
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              className={taskActionButtonClassName}
                              onClick={() => deleteTask(task)}
                              aria-label={`Delete task ${task.title}`}
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <ul
                  role="list"
                  aria-label="Task cards"
                  className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
                >
                  {filteredTasks.map((task) => (
                    <li key={task.id}>
                      <Card className={statusRowClassName(task.status)}>
                        <CardHeader>
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle
                              className={
                                task.status === "completed"
                                  ? "text-base line-through"
                                  : "text-base"
                              }
                            >
                              {task.title}
                            </CardTitle>
                            <Badge
                              variant="outline"
                              className={priorityBadgeClassName(task.priority)}
                            >
                              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                            </Badge>
                          </div>
                          <CardDescription>{task.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-muted-foreground">Status</span>
                            <Badge
                              variant={
                                task.status === "completed" ? "secondary" : "outline"
                              }
                              className={
                                task.status === "completed"
                                  ? "border-green-200 bg-green-100 text-green-800"
                                  : "border-slate-300 bg-slate-100 text-slate-700"
                              }
                            >
                              {task.status === "completed" ? "Completed" : "Pending"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-muted-foreground">Due date</span>
                            <span>{task.dueDate}</span>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              className={taskActionButtonClassName}
                              onClick={() => toggleTaskStatus(task)}
                              aria-label={
                                task.status === "completed"
                                  ? `Mark task ${task.title} as pending`
                                  : `Mark task ${task.title} as completed`
                              }
                            >
                              {task.status === "completed"
                                ? "Mark pending"
                                : "Mark completed"}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              className={taskActionButtonClassName}
                              onClick={() => startEditingTask(task)}
                              aria-label={`Edit task ${task.title}`}
                            >
                              Edit
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              className={taskActionButtonClassName}
                              onClick={() => deleteTask(task)}
                              aria-label={`Delete task ${task.title}`}
                            >
                              Delete
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <Card role="region" aria-label="Summary and metadata">
          <CardHeader>
            <CardTitle>Summary and metadata</CardTitle>
            <CardDescription>Counts derived from canonical task data.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-md border p-3">
              <span className="text-muted-foreground">Total tasks</span>
              <output aria-label="Total tasks count" className="font-medium">
                {summary.total}
              </output>
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <span className="text-muted-foreground">Pending tasks</span>
              <output aria-label="Pending tasks count" className="font-medium">
                {summary.pending}
              </output>
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <span className="text-muted-foreground">Completed tasks</span>
              <output aria-label="Completed tasks count" className="font-medium">
                {summary.completed}
              </output>
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button variant="outline">Open details</Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
