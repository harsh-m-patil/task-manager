import Page from "@/app/page"
import { describe, expect, test } from "vitest"
import { render } from "vitest-browser-react"

describe("dashboard shell", () => {
  test("renders semantic landmarks and task shell regions", async () => {
    const { getByRole } = await render(<Page />)

    await expect
      .element(getByRole("heading", { name: /task management dashboard/i }))
      .toBeInTheDocument()
    await expect.element(getByRole("banner")).toBeInTheDocument()
    await expect.element(getByRole("main")).toBeInTheDocument()

    await expect
      .element(getByRole("region", { name: /primary actions/i }))
      .toBeInTheDocument()
    await expect
      .element(getByRole("region", { name: /search and filters/i }))
      .toBeInTheDocument()
    await expect
      .element(getByRole("region", { name: /task list/i }))
      .toBeInTheDocument()
    await expect
      .element(getByRole("region", { name: /summary and metadata/i }))
      .toBeInTheDocument()
  })

  test("exposes keyboard-focusable controls with accessible names", async () => {
    const { getByRole } = await render(<Page />)

    const newTaskButton = getByRole("button", { name: /new task/i })
    const importTemplateButton = getByRole("button", {
      name: /import template/i,
    })
    const searchInput = getByRole("searchbox", { name: /search tasks/i })

    await expect.element(newTaskButton).toBeEnabled()
    await expect.element(importTemplateButton).toBeEnabled()
    await expect.element(searchInput).toBeEnabled()

    await expect.element(newTaskButton).not.toHaveAttribute("tabindex", "-1")
    await expect.element(importTemplateButton).not.toHaveAttribute(
      "tabindex",
      "-1"
    )
    await expect.element(searchInput).not.toHaveAttribute("tabindex", "-1")
  })

  test("uses responsive layout contracts for shell composition", async () => {
    const { getByRole } = await render(<Page />)

    const shellLayout = getByRole("main")

    await expect.element(shellLayout).toHaveClass("lg:grid-cols-[2fr_1fr]")
    await expect.element(shellLayout).toHaveClass("gap-6")
  })
})
