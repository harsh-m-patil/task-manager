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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
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
import type { CreateTaskInput } from "@/lib/tasks/state"
import { loadTasks, saveTasks } from "@/lib/tasks/storage"
import {
  cancelTaskEditing,
  createTaskWorkflowState,
  deleteTaskFromWorkflow,
  startTaskEditing,
  submitTaskWorkflow,
  toggleTaskWorkflowStatus,
  updateTaskWorkflowDraft,
} from "@/lib/tasks/workflow"
import type {
  Task,
  TaskPriority,
  TaskPriorityFilter,
  TaskSortOption,
  TaskStatusFilter,
} from "@/lib/tasks/types"
import { filterTasks, isTaskOverdue, sortTasks, summarizeTasks } from "@/lib/tasks/utils"

const selectClassName =
  "border-input bg-background ring-offset-background focus-visible:ring-ring focus-visible:ring-3 flex h-9 w-full rounded-md border px-3 py-2 text-sm"

const primaryButtonClassName = "h-9 px-4"
const taskActionButtonClassName = "h-9 px-3"

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

function statusRowClassName(task: Task): string {
  const baseClassName =
    task.status === "completed" ? "task-row-completed opacity-70" : "task-row-pending"

  if (isTaskOverdue(task)) {
    return `${baseClassName} task-row-overdue border-red-300 bg-red-50/60`
  }

  return baseClassName
}

export default function Page() {
  const [workflow, setWorkflow] = useState(() =>
    createTaskWorkflowState(loadTasks())
  )
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>("all")
  const [priorityFilter, setPriorityFilter] = useState<TaskPriorityFilter>("all")
  const [sortBy, setSortBy] = useState<TaskSortOption>("default")
  const [viewMode, setViewMode] = useState<TaskViewMode>("list")
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  const summary = useMemo(() => summarizeTasks(workflow.tasks), [workflow.tasks])
  const filteredTasks = useMemo(
    () =>
      filterTasks(workflow.tasks, {
        searchQuery,
        statusFilter,
        priorityFilter,
      }),
    [workflow.tasks, searchQuery, statusFilter, priorityFilter]
  )
  const visibleTasks = useMemo(
    () => sortTasks(filteredTasks, { sortBy }),
    [filteredTasks, sortBy]
  )
  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    statusFilter !== "all" ||
    priorityFilter !== "all" ||
    sortBy !== "default"

  const updateTaskInput = <K extends keyof CreateTaskInput>(
    key: K,
    value: CreateTaskInput[K]
  ) => {
    setWorkflow((current) => updateTaskWorkflowDraft(current, key, value))
  }

  const openCreateTaskDialog = () => {
    setWorkflow((current) => cancelTaskEditing(current))
    setIsTaskDialogOpen(true)
  }

  const closeTaskDialog = () => {
    setWorkflow((current) => cancelTaskEditing(current))
    setIsTaskDialogOpen(false)
  }

  const startEditingTask = (task: Task) => {
    setWorkflow((current) => startTaskEditing(current, task.id))
    setIsTaskDialogOpen(true)
  }

  const onSubmitTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setWorkflow((current) => {
      const nextState = submitTaskWorkflow(current)

      if (Object.keys(nextState.errors).length === 0) {
        setIsTaskDialogOpen(false)
      }

      return nextState
    })
  }

  const toggleTaskStatus = (task: Task) => {
    setWorkflow((current) => toggleTaskWorkflowStatus(current, task.id))
  }

  const deleteTask = (task: Task) => {
    const shouldDelete = window.confirm(
      `Delete task "${task.title}"? This action cannot be undone.`
    )

    if (!shouldDelete) {
      return
    }

    setWorkflow((current) => deleteTaskFromWorkflow(current, task.id))
  }

  useEffect(() => {
    saveTasks(workflow.tasks)
  }, [workflow.tasks])

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

      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <p role="status" aria-live="polite" className="sr-only">
          {workflow.feedbackMessage}
        </p>

        <section
          role="region"
          aria-label="Summary and metadata"
          className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="px-3 py-1 text-sm">
              <span className="text-muted-foreground mr-2">Total tasks</span>
              <output aria-label="Total tasks count" className="font-semibold">
                {summary.total}
              </output>
            </Badge>
            <Badge variant="outline" className="px-3 py-1 text-sm">
              <span className="text-muted-foreground mr-2">Pending tasks</span>
              <output aria-label="Pending tasks count" className="font-semibold">
                {summary.pending}
              </output>
            </Badge>
            <Badge variant="outline" className="px-3 py-1 text-sm">
              <span className="text-muted-foreground mr-2">Completed tasks</span>
              <output aria-label="Completed tasks count" className="font-semibold">
                {summary.completed}
              </output>
            </Badge>
          </div>

          <Button
            type="button"
            className={primaryButtonClassName}
            onClick={openCreateTaskDialog}
          >
            New Task
          </Button>
        </section>

        <Card role="region" aria-label="Task list">
          <CardHeader>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <CardTitle>Task list</CardTitle>
                <CardDescription>
                  Your tasks stay front and center, with filters and view controls inline.
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
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
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <section role="region" aria-label="Search and filters" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="task-search">Search tasks</Label>
                <Input
                  id="task-search"
                  ref={searchInputRef}
                  type="search"
                  placeholder="Search by title or description"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.currentTarget.value)}
                  className="h-9"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
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

                <div className="space-y-2">
                  <Label htmlFor="task-sort-by">Sort by</Label>
                  <select
                    id="task-sort-by"
                    className={selectClassName}
                    value={sortBy}
                    onChange={(event) =>
                      setSortBy(event.currentTarget.value as TaskSortOption)
                    }
                  >
                    <option value="default">Default</option>
                    <option value="due-date-asc">Due date (earliest first)</option>
                    <option value="due-date-desc">Due date (latest first)</option>
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
                  setSortBy("default")
                }}
                disabled={!hasActiveFilters}
              >
                Clear filters
              </Button>
            </section>

            {workflow.tasks.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No tasks yet. Create your first task to get started.
              </p>
            ) : visibleTasks.length === 0 ? (
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
                  {visibleTasks.map((task) => (
                    <TableRow key={task.id} className={statusRowClassName(task)}>
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
                          variant={task.status === "completed" ? "secondary" : "outline"}
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
                {visibleTasks.map((task) => (
                  <li key={task.id}>
                    <Card className={statusRowClassName(task)}>
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
                            variant={task.status === "completed" ? "secondary" : "outline"}
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

        <Dialog
          open={isTaskDialogOpen}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) {
              closeTaskDialog()
              return
            }

            setIsTaskDialogOpen(true)
          }}
        >
          <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {workflow.editingTaskId ? "Edit task" : "Create a task"}
              </DialogTitle>
              <DialogDescription>
                {workflow.editingTaskId
                  ? "Update title, description, priority, and due date for the selected task."
                  : "Add title, description, priority, and due date to create a pending task."}
              </DialogDescription>
            </DialogHeader>

            <form
              className="space-y-4"
              onSubmit={onSubmitTask}
              onKeyDown={(event) => {
                if (event.key === "Escape" && workflow.editingTaskId) {
                  event.preventDefault()
                  closeTaskDialog()
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
                  value={workflow.draft.title}
                  onChange={(event) =>
                    updateTaskInput("title", event.currentTarget.value)
                  }
                  aria-invalid={Boolean(workflow.errors.title)}
                  aria-describedby={
                    workflow.errors.title ? "task-title-error" : undefined
                  }
                />
                {workflow.errors.title ? (
                  <p id="task-title-error" className="text-sm text-red-600">
                    {workflow.errors.title}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-description">Description</Label>
                <Textarea
                  id="task-description"
                  value={workflow.draft.description}
                  onChange={(event) =>
                    updateTaskInput("description", event.currentTarget.value)
                  }
                  aria-invalid={Boolean(workflow.errors.description)}
                  aria-describedby={
                    workflow.errors.description
                      ? "task-description-error"
                      : undefined
                  }
                />
                {workflow.errors.description ? (
                  <p id="task-description-error" className="text-sm text-red-600">
                    {workflow.errors.description}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="task-priority">Priority</Label>
                  <select
                    id="task-priority"
                    className={selectClassName}
                    value={workflow.draft.priority}
                    onChange={(event) =>
                      updateTaskInput(
                        "priority",
                        event.currentTarget.value as TaskPriority
                      )
                    }
                    aria-invalid={Boolean(workflow.errors.priority)}
                    aria-describedby={
                      workflow.errors.priority ? "task-priority-error" : undefined
                    }
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  {workflow.errors.priority ? (
                    <p id="task-priority-error" className="text-sm text-red-600">
                      {workflow.errors.priority}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="task-due-date">Due date</Label>
                  <Input
                    id="task-due-date"
                    type="date"
                    value={workflow.draft.dueDate}
                    onChange={(event) =>
                      updateTaskInput("dueDate", event.currentTarget.value)
                    }
                    aria-invalid={Boolean(workflow.errors.dueDate)}
                    aria-describedby={
                      workflow.errors.dueDate ? "task-due-date-error" : undefined
                    }
                  />
                  {workflow.errors.dueDate ? (
                    <p id="task-due-date-error" className="text-sm text-red-600">
                      {workflow.errors.dueDate}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button type="submit" className={primaryButtonClassName}>
                  {workflow.editingTaskId ? "Save task changes" : "Create task"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className={primaryButtonClassName}
                  onClick={closeTaskDialog}
                >
                  {workflow.editingTaskId ? "Cancel edit" : "Cancel"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
