import Page from "@/app/page"
import { TASKS_STORAGE_KEY } from "@/lib/tasks/storage"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, test } from "vitest"

describe("dashboard task workflow", () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    cleanup()
  })

  test("renders semantic regions and empty-state guidance", () => {
    render(<Page />)

    expect(
      screen.getByRole("heading", { name: /task management dashboard/i })
    ).toBeTruthy()
    expect(screen.getByRole("banner")).toBeTruthy()
    expect(screen.getByRole("main")).toBeTruthy()

    expect(screen.getByRole("region", { name: /primary actions/i })).toBeTruthy()
    expect(
      screen.getByRole("region", { name: /search and filters/i })
    ).toBeTruthy()
    expect(screen.getByRole("region", { name: /task list/i })).toBeTruthy()
    expect(
      screen.getByRole("region", { name: /summary and metadata/i })
    ).toBeTruthy()

    expect(
      screen.getByText(/no tasks yet\. create your first task/i)
    ).toBeTruthy()
    expect(screen.getByText("Total tasks")).toBeTruthy()
    expect(screen.getByText("Pending tasks")).toBeTruthy()
    expect(screen.getByText("Completed tasks")).toBeTruthy()

    expect(screen.getByLabelText("Total tasks count").textContent).toBe("0")
    expect(screen.getByLabelText("Pending tasks count").textContent).toBe("0")
    expect(screen.getByLabelText("Completed tasks count").textContent).toBe("0")
  })

  test("creates a task, renders it in list view, and updates derived counts", () => {
    render(<Page />)

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Ship first workflow" },
    })
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "Implement create + list + persistence" },
    })
    fireEvent.change(screen.getByLabelText("Priority"), {
      target: { value: "high" },
    })
    fireEvent.change(screen.getByLabelText("Due date"), {
      target: { value: "2026-06-01" },
    })

    fireEvent.click(screen.getByRole("button", { name: /new task/i }))

    expect(screen.getByText("Ship first workflow")).toBeTruthy()
    expect(
      screen.getByText("Implement create + list + persistence")
    ).toBeTruthy()
    expect(screen.getByText("Pending")).toBeTruthy()
    const createdTaskRow = screen.getByText("Ship first workflow").closest("tr")
    expect(createdTaskRow).toBeTruthy()
    expect(createdTaskRow?.textContent).toContain("High")
    expect(screen.getByText("2026-06-01")).toBeTruthy()

    expect(screen.getByLabelText("Total tasks count").textContent).toBe("1")
    expect(screen.getByLabelText("Pending tasks count").textContent).toBe("1")
    expect(screen.getByLabelText("Completed tasks count").textContent).toBe("0")
  })

  test("blocks invalid submit with field-adjacent validation messages", () => {
    render(<Page />)

    fireEvent.click(screen.getByRole("button", { name: /new task/i }))

    expect(screen.getByText("Title is required")).toBeTruthy()
    expect(screen.getByText("Description is required")).toBeTruthy()
    expect(screen.getByText("Due date is required")).toBeTruthy()
    expect(
      screen.getByText(/no tasks yet\. create your first task/i)
    ).toBeTruthy()
  })

  test("loads tasks from local storage", () => {
    const storedTask = [
      {
        id: "task-1",
        title: "Hydrate from storage",
        description: "Load persisted tasks on startup",
        priority: "medium",
        dueDate: "2026-06-02",
        status: "pending",
        createdAt: "2026-05-15T00:00:00.000Z",
        updatedAt: "2026-05-15T00:00:00.000Z",
      },
    ]

    window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(storedTask))

    render(<Page />)

    expect(screen.getByText("Hydrate from storage")).toBeTruthy()
  })

  test("persists created tasks to local storage", () => {
    render(<Page />)

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Persist me" },
    })
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "Save after create" },
    })
    fireEvent.change(screen.getByLabelText("Priority"), {
      target: { value: "medium" },
    })
    fireEvent.change(screen.getByLabelText("Due date"), {
      target: { value: "2026-06-10" },
    })

    fireEvent.click(screen.getByRole("button", { name: /new task/i }))

    const rawValue = window.localStorage.getItem(TASKS_STORAGE_KEY)
    expect(rawValue).toBeTruthy()

    const persistedTasks = JSON.parse(rawValue ?? "[]") as Array<{
      title: string
      description: string
      priority: string
      dueDate: string
      status: string
    }>

    expect(persistedTasks).toHaveLength(1)
    expect(persistedTasks[0]).toMatchObject({
      title: "Persist me",
      description: "Save after create",
      priority: "medium",
      dueDate: "2026-06-10",
      status: "pending",
    })
  })

  test("renders pending and completed status styles from canonical task data", () => {
    const storedTasks = [
      {
        id: "task-pending",
        title: "Open item",
        description: "Needs work",
        priority: "low",
        dueDate: "2026-06-04",
        status: "pending",
        createdAt: "2026-05-15T00:00:00.000Z",
        updatedAt: "2026-05-15T00:00:00.000Z",
      },
      {
        id: "task-completed",
        title: "Closed item",
        description: "Already done",
        priority: "high",
        dueDate: "2026-06-05",
        status: "completed",
        createdAt: "2026-05-15T00:00:00.000Z",
        updatedAt: "2026-05-15T00:00:00.000Z",
      },
    ]

    window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(storedTasks))

    render(<Page />)

    const pendingRow = screen.getByText("Open item").closest("tr")
    const completedRow = screen.getByText("Closed item").closest("tr")

    expect(pendingRow).toBeTruthy()
    expect(completedRow).toBeTruthy()
    expect(pendingRow?.className).toContain("task-row-pending")
    expect(completedRow?.className).toContain("task-row-completed")

    expect(screen.getByLabelText("Total tasks count").textContent).toBe("2")
    expect(screen.getByLabelText("Pending tasks count").textContent).toBe("1")
    expect(screen.getByLabelText("Completed tasks count").textContent).toBe("1")
  })

  test("falls back to empty list when storage payload is corrupt", () => {
    window.localStorage.setItem(TASKS_STORAGE_KEY, "{not-json")

    render(<Page />)

    expect(
      screen.getByText(/no tasks yet\. create your first task/i)
    ).toBeTruthy()
  })

  test("falls back to empty list when storage payload shape is invalid", () => {
    window.localStorage.setItem(
      TASKS_STORAGE_KEY,
      JSON.stringify([{ id: "bad-task-shape" }])
    )

    render(<Page />)

    expect(
      screen.getByText(/no tasks yet\. create your first task/i)
    ).toBeTruthy()
  })
})
