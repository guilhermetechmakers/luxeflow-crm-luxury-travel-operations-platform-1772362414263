/**
 * NoteFromMessageModal - Convert message to note
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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { ChatMessage } from '@/types/chat'

const schema = z.object({
  content: z.string().min(1, 'Content is required'),
})

type FormValues = z.infer<typeof schema>

export interface NoteFromMessageModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  relatedMessage: ChatMessage | null
  onCreateNote: (content: string) => void
  isCreating?: boolean
}

export function NoteFromMessageModal({
  open,
  onOpenChange,
  relatedMessage,
  onCreateNote,
  isCreating,
}: NoteFromMessageModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { content: '' },
  })

  useEffect(() => {
    if (open && relatedMessage) {
      setValue('content', relatedMessage.content ?? '')
    }
  }, [open, relatedMessage, setValue])

  const onSubmit = (data: FormValues) => {
    onCreateNote(data.content)
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
          <DialogTitle className="font-serif">Convert to Note</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="content">Note content</Label>
            <Textarea
              id="content"
              {...register('content')}
              rows={5}
              className={cn(errors.content && 'border-destructive')}
              placeholder="Note content (prefilled from message)"
            />
            {errors.content && (
              <p className="mt-1 text-sm text-destructive">{errors.content.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Create Note
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
