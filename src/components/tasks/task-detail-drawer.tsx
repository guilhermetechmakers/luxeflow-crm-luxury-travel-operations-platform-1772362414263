/**
 * TaskDetailDrawer - Read/Write form for task details
 * Actions: Save, Delete, Add Remark, Create Subtask, Convert to Template
 */
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Trash2, Save, Loader2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAgentsForTasks } from '@/hooks/use-tasks'
import { cn } from '@/lib/utils'
import type { Task, TaskStatus, TaskPriority } from '@/types/task'

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'done', label: 'Done' },
]

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

const SLA_OPTIONS = ['24h', '48h', '72h']

const taskFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'review', 'blocked', 'done']),
  slaLabel: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
})

type TaskFormValues = z.infer<typeof taskFormSchema>

export interface TaskDetailDrawerProps {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (id: string, updates: Partial<TaskFormValues>) => void
  onDelete: (id: string) => void
  isSaving?: boolean
  isDeleting?: boolean
}

export function TaskDetailDrawer({
  task,
  open,
  onOpenChange,
  onSave,
  onDelete,
  isSaving,
  isDeleting,
}: TaskDetailDrawerProps) {
  const { agents } = useAgentsForTasks()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: '',
      description: '',
      assigneeId: '',
      dueDate: '',
      status: 'todo',
      slaLabel: '',
      priority: 'medium',
    },
  })

  useEffect(() => {
    if (task) {
      reset({
        title: task.title ?? '',
        description: task.description ?? '',
        assigneeId: task.assigneeId ?? '',
        dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
        status: task.status ?? 'todo',
        slaLabel: task.slaLabel ?? '',
        priority: task.priority ?? 'medium',
      })
    }
  }, [task, reset])

  const onSubmit = (data: TaskFormValues) => {
    if (!task) return
    onSave(task.id, data)
    onOpenChange(false)
  }

  const handleDelete = () => {
    if (!task) return
    onDelete(task.id)
    onOpenChange(false)
  }

  if (!task) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full max-w-md flex-col sm:max-w-lg"
      >
        <SheetHeader>
          <SheetTitle className="font-serif">Task Details</SheetTitle>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-1 flex-col gap-6 overflow-y-auto"
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                {...register('title')}
                className={cn(errors.title && 'border-destructive')}
                placeholder="Task title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                rows={3}
                placeholder="Task description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Status</Label>
                <Select
                  value={watch('status')}
                  onValueChange={(v) => setValue('status', v as TaskStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Priority</Label>
                <Select
                  value={watch('priority')}
                  onValueChange={(v) => setValue('priority', v as TaskPriority)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="assignee">Assignee</Label>
              <Select
                value={watch('assigneeId') ?? 'all'}
                onValueChange={(v) =>
                  setValue('assigneeId', v === 'all' ? '' : v)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Unassigned</SelectItem>
                  {(agents ?? []).map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input id="dueDate" type="date" {...register('dueDate')} />
              </div>

              <div>
                <Label>SLA</Label>
                <Select
                  value={watch('slaLabel') ?? 'none'}
                  onValueChange={(v) =>
                    setValue('slaLabel', v === 'none' ? '' : v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="SLA" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {SLA_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(task.bookingReference || task.clientName) && (
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  Linked
                </p>
                {task.bookingReference && (
                  <p className="text-sm">Booking: {task.bookingReference}</p>
                )}
                {task.clientName && (
                  <p className="text-sm">Client: {task.clientName}</p>
                )}
              </div>
            )}
          </div>

          <SheetFooter className="mt-auto flex flex-row gap-2 border-t pt-4">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete
            </Button>
            <div className="flex-1" />
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isDirty || isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
