/**
 * TeamInvitationCard - Repeater for adding invited emails with optional role dropdowns
 */
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface InviteItem {
  id: string
  email: string
  role: string
}

const ROLES = [
  { value: 'Admin', label: 'Admin' },
  { value: 'Agent', label: 'Agent' },
  { value: 'Ops', label: 'Ops' },
  { value: 'Finance', label: 'Finance' },
]

export interface TeamInvitationCardProps {
  invites: InviteItem[]
  onAdd: () => void
  onRemove: (id: string) => void
  onUpdate: (id: string, field: 'email' | 'role', value: string) => void
  errors?: Record<string, string | undefined>
  disabled?: boolean
}

export function TeamInvitationCard({
  invites,
  onAdd,
  onRemove,
  onUpdate,
  errors = {},
  disabled,
}: TeamInvitationCardProps) {
  const invitesList = Array.isArray(invites) ? invites : []

  return (
    <Card className="shadow-card transition-all duration-300 hover:shadow-card-hover">
      <CardHeader className="pb-3">
        <CardTitle className="font-serif text-lg">Team invitations</CardTitle>
        <p className="text-sm text-muted-foreground">Optional. Add teammates to invite after signup.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {invitesList.map((invite) => (
          <div
            key={invite.id}
            className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-end"
          >
            <div className="flex-1 space-y-1">
              <Label htmlFor={`invite-email-${invite.id}`}>Email</Label>
              <Input
                id={`invite-email-${invite.id}`}
                type="email"
                placeholder="teammate@agency.com"
                value={invite.email}
                onChange={(e) => onUpdate(invite.id, 'email', e.target.value)}
                disabled={disabled}
                aria-invalid={!!errors[`invite-${invite.id}-email`]}
                className="mt-1"
              />
              {errors[`invite-${invite.id}-email`] && (
                <p className="text-sm text-destructive">{errors[`invite-${invite.id}-email`]}</p>
              )}
            </div>
            <div className="w-full space-y-1 sm:w-32">
              <Label htmlFor={`invite-role-${invite.id}`}>Role</Label>
              <Select
                value={invite.role}
                onValueChange={(v) => onUpdate(invite.id, 'role', v)}
                disabled={disabled}
              >
                <SelectTrigger id={`invite-role-${invite.id}`} className="mt-1">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onRemove(invite.id)}
              disabled={disabled}
              aria-label="Remove invite"
              className="shrink-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={onAdd}
          disabled={disabled}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Add teammate
        </Button>
      </CardContent>
    </Card>
  )
}
