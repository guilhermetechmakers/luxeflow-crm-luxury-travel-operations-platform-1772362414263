/**
 * ConflictDialog - Shown when drag-to-reschedule would create a conflict
 * LuxeFlow design: olive accent, clear messaging
 */
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export interface ConflictDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  message: string
  conflictingEventTitle?: string
}

export function ConflictDialog({
  open,
  onOpenChange,
  message,
  conflictingEventTitle,
}: ConflictDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showClose={true} className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100/80">
              <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden />
            </div>
            <div className="space-y-1">
              <DialogTitle>Schedule Conflict</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {message}
                {conflictingEventTitle && (
                  <span className="mt-2 block font-medium text-foreground">
                    Conflicts with: {conflictingEventTitle}
                  </span>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button onClick={() => onOpenChange(false)}>
            Choose Different Time
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
