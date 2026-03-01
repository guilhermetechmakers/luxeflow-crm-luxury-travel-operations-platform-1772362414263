/**
 * TaskFromMessageModal - Create task from message with prefilled context
 */
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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
import type { ChatMessage } from '@/types/chat'
import type { TaskCreatePayload } from '@/types/task'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional(),
  slaLabel: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
})

type FormValues = z.infer<typeof schema>

export interface TaskFromMessageModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  relatedMessage: ChatMessage | null
  onCreateTask: (payload: TaskCreatePayload) => void
  isCreating?: boolean
}

export function TaskFromMessageModal({
  open,
  onOpenChange,
  relatedMessage,
  onCreateTask,
  isCreating,
}: TaskFromMessageModalProps) {
  const { agents } = useAgentsForTasks()
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      assigneeId: '',
      dueDate: '',
      slaLabel: '',
      priority: 'medium',
    },
  })

  useEffect(() => {
    if (open && relatedMessage) {
      const content = (relatedMessage.content ?? '').slice(0, 200)
      setValue('title', content.slice(0, 80) || 'Task from message')
      setValue('description', content)
    }
  }, [open, relatedMessage, setValue])

  const onSubmit = (data: FormValues) => {
    const payload: TaskCreatePayload = {
      title: data.title,
      description: data.description,
      assigneeId: data.assigneeId || undefined,
      dueDate: data.dueDate || undefined,
      slaLabel: data.slaLabel || undefined,
      priority: data.priority,
      bookingId: relatedMessage?.linkedBookingId ?? undefined,
      clientId: relatedMessage?.linkedClientId ?? undefined,
    }
    onCreateTask(payload)
    reset()
    onOpenChange(false)
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) reset()
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif">Create Task from Message</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...register('title')}
              className={cn(errors.title && 'border-destructive')}
              placeholder="Task title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              rows={3}
              placeholder="Task description (prefilled from message)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Assignee</Label>
              <Select
                value={watch('assigneeId') ?? 'all'}
                onValueChange={(v) => setValue('assigneeId', v === 'all' ? '' : v)}
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

            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input id="dueDate" type="date" {...register('dueDate')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>SLA</Label>
              <Select
                value={watch('slaLabel') ?? 'none'}
                onValueChange={(v) => setValue('slaLabel', v === 'none' ? '' : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="SLA" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="24h">24h</SelectItem>
                  <SelectItem value="48h">48h</SelectItem>
                  <SelectItem value="72h">72h</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Priority</Label>
              <Select
                value={watch('priority')}
                onValueChange={(v) => setValue('priority', v as FormValues['priority'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Create Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
