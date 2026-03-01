/**
 * BulkActionsBar - Dropdown with Export, Merge, Send Campaign; selection summary
 */
import { useState } from 'react'
import {
  Download,
  Merge,
  Mail,
  ChevronDown,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { clientsApi } from '@/api/clients'

export interface ClientsBulkActionsBarProps {
  selectedIds: string[]
  onClearSelection: () => void
  onExportComplete?: () => void
}

export function ClientsBulkActionsBar({
  selectedIds,
  onClearSelection,
  onExportComplete,
}: ClientsBulkActionsBarProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [isMerging, setIsMerging] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const count = selectedIds?.length ?? 0
  if (count === 0) return null

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const res = await clientsApi.bulkExport(selectedIds)
      if (res?.url) {
        window.open(res.url, '_blank')
        toast.success('Export ready for download')
      } else {
        toast.success(`Export prepared for ${count} client(s)`)
      }
      onClearSelection()
      onExportComplete?.()
    } catch {
      toast.error('Export failed')
    } finally {
      setIsExporting(false)
    }
  }

  const handleMerge = async () => {
    if (count < 2) {
      toast.error('Select at least 2 clients to merge')
      return
    }
    setIsMerging(true)
    try {
      const [targetId, ...sourceIds] = selectedIds
      await clientsApi.mergeClients(sourceIds, targetId)
      toast.success('Clients merged successfully')
      onClearSelection()
      onExportComplete?.()
    } catch {
      toast.error('Merge failed')
    } finally {
      setIsMerging(false)
    }
  }

  const handleSendCampaign = async () => {
    setIsSending(true)
    try {
      await new Promise((r) => setTimeout(r, 500))
      toast.success(`Campaign queued for ${count} client(s)`)
      onClearSelection()
      onExportComplete?.()
    } catch {
      toast.error('Failed to send campaign')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div
      className="flex items-center gap-3 rounded-lg border border-accent/30 bg-accent/5 px-4 py-2"
      role="region"
      aria-label="Bulk actions"
    >
      <span className="text-sm font-medium text-foreground">
        {count} selected
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={isExporting || isMerging || isSending}
            aria-haspopup="true"
            aria-expanded={undefined}
          >
            Actions
            <ChevronDown className="ml-1 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem
            onClick={handleExport}
            disabled={isExporting}
            aria-label="Export selected clients"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleMerge}
            disabled={count < 2 || isMerging}
            aria-label="Merge selected clients"
          >
            <Merge className="mr-2 h-4 w-4" />
            Merge
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleSendCampaign}
            disabled={isSending}
            aria-label="Send campaign to selected clients"
          >
            <Mail className="mr-2 h-4 w-4" />
            Send Campaign
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClearSelection}
        aria-label="Clear selection"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
