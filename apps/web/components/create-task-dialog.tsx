"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { useFormStatus } from "react-dom"

import { useQueryClient } from "@tanstack/react-query"
import { Pencil, Trash2 } from "lucide-react"

import { createLocalStorageTasksStorage } from "@/lib/tasks/adapters/localStorage"
import { tasksKeys } from "@/lib/tasks/queries"
import {
  CreateTaskFormSchema,
  TaskFormSchema,
  type Task,
  normalizeTaskFormInput,
} from "@/lib/tasks/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Textarea } from "@workspace/ui/components/textarea"

const tasksStorage = createLocalStorageTasksStorage()

type CreateTaskFormState = {
  status: "idle" | "error" | "success"
  message?: string
  fieldErrors?: Partial<
    Record<keyof Omit<ReturnType<typeof getFormValues>, "priority"> | "priority", string[]>
  >
}

const initialState: CreateTaskFormState = {
  status: "idle",
}

const getFormValues = (formData: FormData) => ({
  title: formData.get("title"),
  description: formData.get("description"),
  priority: formData.get("priority"),
  dueDate: formData.get("dueDate"),
})

type TaskDialogFormProps = {
  mode: "create" | "edit"
  task?: Task
  onSuccess?: () => void
}

function SubmitButton({ mode }: Pick<TaskDialogFormProps, "mode">) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending}>
      {pending ? (mode === "create" ? "Creating..." : "Saving...") : mode === "create" ? "Create task" : "Save changes"}
    </Button>
  )
}

function TaskDialogForm({ mode, task, onSuccess }: TaskDialogFormProps) {
  const queryClient = useQueryClient()
  const formRef = useRef<HTMLFormElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const priorityInputRef = useRef<HTMLInputElement>(null)
  const [priorityValue, setPriorityValue] = useState(task?.priority ?? "medium")

  const [state, formAction] = useActionState(
    async (_previousState: CreateTaskFormState, formData: FormData) => {
      const parsed = (mode === "create" ? CreateTaskFormSchema : TaskFormSchema).safeParse(
        getFormValues(formData)
      )

      if (!parsed.success) {
        return {
          status: "error" as const,
          message: "Please fix the errors below.",
          fieldErrors: parsed.error.flatten().fieldErrors,
        }
      }

      try {
        if (mode === "create") {
          const createParsed = CreateTaskFormSchema.parse(getFormValues(formData))
          await tasksStorage.create(createParsed)
        } else {
          const editParsed = TaskFormSchema.parse(getFormValues(formData))
          await tasksStorage.update(task!.id, normalizeTaskFormInput(editParsed))
        }

        await queryClient.invalidateQueries({ queryKey: tasksKeys.all })

        return {
          status: "success" as const,
          message: mode === "create" ? "Task created." : "Task updated.",
        }
      } catch (error) {
        return {
          status: "error" as const,
          message:
            error instanceof Error
              ? error.message
              : mode === "create"
                ? "Failed to create task."
                : "Failed to update task.",
        }
      }
    },
    initialState
  )

  useEffect(() => {
    if (state.status !== "success") {
      return
    }

    formRef.current?.reset()
    setPriorityValue("medium")

    if (priorityInputRef.current) {
      priorityInputRef.current.value = "medium"
    }

    closeButtonRef.current?.click()
    onSuccess?.()
  }, [onSuccess, state.status])

  useEffect(() => {
    const nextPriority = task?.priority ?? "medium"
    setPriorityValue(nextPriority)

    if (priorityInputRef.current) {
      priorityInputRef.current.value = nextPriority
    }
  }, [task])

  const titleErrorId = `${mode}-task-title-error`
  const descriptionErrorId = `${mode}-task-description-error`
  const dueDateErrorId = `${mode}-task-due-date-error`

  return (
    <>
      <form ref={formRef} action={formAction} className="space-y-4">
        <input ref={priorityInputRef} type="hidden" name="priority" value={priorityValue} readOnly />

        <div className="space-y-2">
          <Label htmlFor={`${mode}-title`}>Title</Label>
          <Input
            id={`${mode}-title`}
            name="title"
            placeholder="Ship create task modal"
            defaultValue={task?.title}
            aria-invalid={Boolean(state.fieldErrors?.title)}
            aria-describedby={state.fieldErrors?.title ? titleErrorId : undefined}
          />
          {state.fieldErrors?.title ? (
            <p id={titleErrorId} className="text-destructive text-sm">
              {state.fieldErrors.title[0]}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${mode}-description`}>Description</Label>
          <Textarea
            id={`${mode}-description`}
            name="description"
            placeholder="Add enough context for the task."
            defaultValue={task?.description ?? ""}
            aria-invalid={Boolean(state.fieldErrors?.description)}
            aria-describedby={state.fieldErrors?.description ? descriptionErrorId : undefined}
          />
          {state.fieldErrors?.description ? (
            <p id={descriptionErrorId} className="text-destructive text-sm">
              {state.fieldErrors.description[0]}
            </p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`${mode}-priority`}>Priority</Label>
            <Select
              value={priorityValue}
              onValueChange={(value) => setPriorityValue(value as Task["priority"])}
            >
              <SelectTrigger
                id={`${mode}-priority`}
                className="h-8 w-full"
                aria-invalid={Boolean(state.fieldErrors?.priority)}
              >
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
            {state.fieldErrors?.priority ? (
              <p className="text-destructive text-sm">{state.fieldErrors.priority[0]}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${mode}-dueDate`}>Due date</Label>
            <Input
              id={`${mode}-dueDate`}
              name="dueDate"
              type="date"
              defaultValue={task?.dueDate}
              aria-invalid={Boolean(state.fieldErrors?.dueDate)}
              aria-describedby={state.fieldErrors?.dueDate ? dueDateErrorId : undefined}
            />
            {state.fieldErrors?.dueDate ? (
              <p id={dueDateErrorId} className="text-destructive text-sm">
                {state.fieldErrors.dueDate[0]}
              </p>
            ) : null}
          </div>
        </div>

        {state.status === "error" && state.message ? (
          <p className="text-destructive text-sm">{state.message}</p>
        ) : null}

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <SubmitButton mode={mode} />
        </DialogFooter>
      </form>

      <DialogClose asChild>
        <button ref={closeButtonRef} type="button" className="hidden" tabIndex={-1} aria-hidden />
      </DialogClose>
    </>
  )
}

export function CreateTaskDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="h-10">Add task</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create task</DialogTitle>
          <DialogDescription>
            Add a new task with a title, description, priority, and due date.
          </DialogDescription>
        </DialogHeader>

        <TaskDialogForm mode="create" />
      </DialogContent>
    </Dialog>
  )
}

export function EditTaskDialog({ task }: { task: Task }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon-sm" aria-label={`Edit ${task.title}`}>
          <Pencil className="size-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit task</DialogTitle>
          <DialogDescription>
            Update the title, description, priority, or due date for this task.
          </DialogDescription>
        </DialogHeader>

        <TaskDialogForm mode="edit" task={task} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

export function DeleteTaskButton({ task }: { task: Task }) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      setErrorMessage(null)

      await tasksStorage.remove(task.id)
      await queryClient.invalidateQueries({ queryKey: tasksKeys.all })
      setOpen(false)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to delete task."
      )
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="icon-sm"
          aria-label={`Delete ${task.title}`}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete task?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove <strong>{task.title}</strong> from your task list.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {errorMessage ? (
          <p className="text-destructive text-sm">{errorMessage}</p>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isDeleting}
            onClick={async (event) => {
              event.preventDefault()
              await handleDelete()
            }}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
