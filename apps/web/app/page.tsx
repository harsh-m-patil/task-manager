import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@workspace/ui/components/avatar"
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
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Progress } from "@workspace/ui/components/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Separator } from "@workspace/ui/components/separator"
import { Switch } from "@workspace/ui/components/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { Textarea } from "@workspace/ui/components/textarea"

export default function Page() {
  return (
    <div className="min-h-svh bg-background">
      <header className="border-b" role="banner">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-6 sm:px-6 lg:px-8">
          <div className="space-y-2">
            <Badge variant="secondary">Task workspace</Badge>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Task Management Dashboard
            </h1>
            <p className="text-muted-foreground max-w-2xl text-sm sm:text-base">
              Built entirely with shadcn/ui components so this page is ready for
              real task CRUD wiring.
            </p>
          </div>

          <AvatarGroup>
            <Avatar>
              <AvatarFallback>HP</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>AK</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>ST</AvatarFallback>
            </Avatar>
            <AvatarGroupCount>+4</AvatarGroupCount>
          </AvatarGroup>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[2fr_1fr] lg:px-8">
        <div className="space-y-6">
          <Card role="region" aria-label="Primary actions">
            <CardHeader>
              <CardTitle>Primary actions</CardTitle>
              <CardDescription>
                Trigger top-level operations from this stable shell area.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button type="button">New Task</Button>
                <Button type="button" variant="outline">
                  Import Template
                </Button>
                <Button type="button" variant="secondary">
                  Export
                </Button>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Setup progress</span>
                  <span className="font-medium">60%</span>
                </div>
                <Progress value={60} />
              </div>
            </CardContent>
          </Card>

          <Card role="region" aria-label="Search and filters">
            <CardHeader>
              <CardTitle>Search and filters</CardTitle>
              <CardDescription>
                Placeholder controls for future derived filtering logic.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="task-search">Search tasks</Label>
                <Input
                  id="task-search"
                  type="search"
                  placeholder="Search by title or description"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="status-filter">Status</Label>
                  <Select defaultValue="all">
                    <SelectTrigger id="status-filter" className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All tasks</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority-filter">Priority</Label>
                  <Select defaultValue="all">
                    <SelectTrigger id="priority-filter" className="w-full">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All priorities</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center justify-between rounded-md border p-3">
                  <Label htmlFor="show-completed">Show completed</Label>
                  <Switch id="show-completed" defaultChecked />
                </div>
                <div className="flex items-center gap-3 rounded-md border p-3">
                  <Checkbox id="high-priority-only" />
                  <Label htmlFor="high-priority-only">High priority only</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quick-note">Quick note</Label>
                <Textarea
                  id="quick-note"
                  placeholder="Capture a reminder before saving to task metadata"
                />
              </div>
            </CardContent>
          </Card>

          <Card role="region" aria-label="Task list">
            <CardHeader>
              <CardTitle>Task views</CardTitle>
              <CardDescription>
                Structured placeholders for list, board, and calendar modes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="list">
                <TabsList>
                  <TabsTrigger value="list">List</TabsTrigger>
                  <TabsTrigger value="board">Board</TabsTrigger>
                  <TabsTrigger value="calendar">Calendar</TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Task</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Owner</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Define dashboard shell</TableCell>
                        <TableCell>
                          <Badge variant="outline">Pending</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge>High</Badge>
                        </TableCell>
                        <TableCell>Harsh</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Hook up persistence</TableCell>
                        <TableCell>
                          <Badge variant="secondary">Planned</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">Medium</Badge>
                        </TableCell>
                        <TableCell>Team</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="board" className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                    Backlog lane placeholder
                  </div>
                  <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                    In-progress lane placeholder
                  </div>
                </TabsContent>

                <TabsContent value="calendar" className="mt-4">
                  <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                    Calendar integration will land here.
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <Card role="region" aria-label="Summary and metadata">
          <CardHeader>
            <CardTitle>Summary and metadata</CardTitle>
            <CardDescription>
              Snapshot panels for counts and persistence status.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-md border p-3">
              <span className="text-muted-foreground">Total tasks</span>
              <span className="font-medium">12</span>
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <span className="text-muted-foreground">Pending tasks</span>
              <span className="font-medium">7</span>
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <span className="text-muted-foreground">Completed tasks</span>
              <span className="font-medium">5</span>
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline">Open details</Button>
            <Button>Sync now</Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
