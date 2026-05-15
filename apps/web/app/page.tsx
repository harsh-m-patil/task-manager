import { Button } from "@workspace/ui/components/button"

export default function Page() {
  return (
    <div className="min-h-svh bg-background">
      <header className="border-b" role="banner">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
            Task workspace
          </p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Task Management Dashboard
          </h1>
          <p className="text-muted-foreground max-w-2xl text-sm sm:text-base">
            A responsive dashboard shell with semantic regions and extension
            points for task CRUD, derived state, and persistence.
          </p>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[2fr_1fr] lg:px-8">
        <div className="space-y-6">
          <section
            aria-labelledby="primary-actions-heading"
            className="rounded-xl border bg-card p-4 sm:p-6"
          >
            <h2 id="primary-actions-heading" className="text-base font-semibold">
              Primary actions
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Trigger upcoming task operations from this stable shell area.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button type="button">New Task</Button>
              <Button type="button" variant="outline">
                Import Template
              </Button>
            </div>
          </section>

          <section
            aria-labelledby="search-and-filters-heading"
            className="rounded-xl border bg-card p-4 sm:p-6"
          >
            <h2
              id="search-and-filters-heading"
              className="text-base font-semibold"
            >
              Search and filters
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Placeholder controls for future derived filtering logic.
            </p>

            <form
              className="mt-4 grid gap-3 sm:grid-cols-2"
              role="search"
              aria-label="Task filters"
            >
              <div className="sm:col-span-2">
                <label
                  htmlFor="task-search"
                  className="mb-1 block text-sm font-medium"
                >
                  Search tasks
                </label>
                <input
                  id="task-search"
                  type="search"
                  placeholder="Search by title or description"
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-2 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2"
                />
              </div>

              <div>
                <label
                  htmlFor="status-filter"
                  className="mb-1 block text-sm font-medium"
                >
                  Status
                </label>
                <select
                  id="status-filter"
                  className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-2 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2"
                  defaultValue="all"
                >
                  <option value="all">All tasks</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="priority-filter"
                  className="mb-1 block text-sm font-medium"
                >
                  Priority
                </label>
                <select
                  id="priority-filter"
                  className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-2 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2"
                  defaultValue="all"
                >
                  <option value="all">All priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </form>
          </section>

          <section
            aria-labelledby="task-list-heading"
            className="rounded-xl border bg-card p-4 sm:p-6"
          >
            <h2 id="task-list-heading" className="text-base font-semibold">
              Task list
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              This content region will host task list and card views.
            </p>
            <div className="bg-muted/40 text-muted-foreground mt-4 rounded-lg border border-dashed p-4 text-sm">
              Task items will appear here once task CRUD is integrated.
            </div>
          </section>
        </div>

        <section
          aria-labelledby="summary-and-metadata-heading"
          className="rounded-xl border bg-card p-4 sm:p-6"
        >
          <h2
            id="summary-and-metadata-heading"
            className="text-base font-semibold"
          >
            Summary and metadata
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Snapshot panels for upcoming counts and persistence status.
          </p>

          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-md border p-3">
              <dt className="text-muted-foreground">Total tasks</dt>
              <dd className="font-medium">0</dd>
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <dt className="text-muted-foreground">Pending tasks</dt>
              <dd className="font-medium">0</dd>
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <dt className="text-muted-foreground">Completed tasks</dt>
              <dd className="font-medium">0</dd>
            </div>
          </dl>
        </section>
      </main>
    </div>
  )
}
