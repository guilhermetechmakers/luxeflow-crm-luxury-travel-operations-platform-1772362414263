/**
 * ActionsBar - Contextual actions: Send Proposal, Issue Invoice, Request Approval, Create Task, Link Message, Add Note
 */
import { Send, FileText, CheckSquare, Link2, StickyNote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ActionsBarProps {
  onSendProposal?: () => void
  onIssueInvoice?: () => void
  onRequestApproval?: () => void
  onCreateTask?: () => void
  onLinkMessage?: () => void
  onAddNote?: () => void
  isCreatingInvoice?: boolean
  className?: string
}

export function ActionsBar({
  onSendProposal,
  onIssueInvoice,
  onRequestApproval,
  onCreateTask,
  onLinkMessage,
  onAddNote,
  isCreatingInvoice = false,
  className,
}: ActionsBarProps) {
  const hasActions =
    onSendProposal ||
    onIssueInvoice ||
    onRequestApproval ||
    onCreateTask ||
    onLinkMessage ||
    onAddNote

  if (!hasActions) return null

  return (
    <div
      className={cn(
        'flex flex-wrap gap-2',
        className
      )}
      role="group"
      aria-label="Booking actions"
    >
      {onSendProposal && (
        <Button
          variant="outline"
          size="sm"
          onClick={onSendProposal}
          className="transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
        >
          <Send className="h-4 w-4" />
          Send Proposal
        </Button>
      )}
      {onIssueInvoice && (
        <Button
          variant="outline"
          size="sm"
          onClick={onIssueInvoice}
          disabled={isCreatingInvoice}
          className="transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
        >
          <FileText className="h-4 w-4" />
          {isCreatingInvoice ? 'Creating...' : 'Issue Invoice'}
        </Button>
      )}
      {onRequestApproval && (
        <Button
          size="sm"
          onClick={onRequestApproval}
          className="transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
        >
          <CheckSquare className="h-4 w-4" />
          Request Approval
        </Button>
      )}
      {onCreateTask && (
        <Button
          variant="outline"
          size="sm"
          onClick={onCreateTask}
          className="transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
        >
          <CheckSquare className="h-4 w-4" />
          Create Task
        </Button>
      )}
      {onLinkMessage && (
        <Button
          variant="outline"
          size="sm"
          onClick={onLinkMessage}
          className="transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
        >
          <Link2 className="h-4 w-4" />
          Link Message
        </Button>
      )}
      {onAddNote && (
        <Button
          variant="outline"
          size="sm"
          onClick={onAddNote}
          className="transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
        >
          <StickyNote className="h-4 w-4" />
          Add Note
        </Button>
      )}
    </div>
  )
}
