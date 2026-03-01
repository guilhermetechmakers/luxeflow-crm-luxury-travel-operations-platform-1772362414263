/**
 * QuickActionsBar - New Booking, New Task, Send Proposal, Add Note
 */
import { Link } from 'react-router-dom'
import { CalendarPlus, CheckSquare, FileText, StickyNote } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface QuickActionsBarProps {
  clientId: string
  onNewTask?: () => void
  onSendProposal?: () => void
  onAddNote?: () => void
  canEdit?: boolean
}

export function QuickActionsBar({
  clientId,
  onNewTask,
  onSendProposal,
  onAddNote,
  canEdit = true,
}: QuickActionsBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-secondary/30 p-3">
      <Button asChild size="sm" className="gap-2">
        <Link to={`/dashboard/bookings/new?client=${clientId}`}>
          <CalendarPlus className="h-4 w-4" />
          New Booking
        </Link>
      </Button>
      {canEdit && (
        <>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={onNewTask}
            aria-label="Create new task"
          >
            <CheckSquare className="h-4 w-4" />
            New Task
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={onSendProposal}
            aria-label="Send proposal"
          >
            <FileText className="h-4 w-4" />
            Send Proposal
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={onAddNote}
            aria-label="Add note"
          >
            <StickyNote className="h-4 w-4" />
            Add Note
          </Button>
        </>
      )}
    </div>
  )
}
