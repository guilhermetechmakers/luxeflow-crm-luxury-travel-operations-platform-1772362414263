/**
 * ApiTokensPanel - token list, create modal, revocation
 */
import { useState } from 'react'
import { Key, Plus, Copy, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmationDialog } from './confirmation-dialog'
import { TOKEN_SCOPES, type ApiToken } from '@/types/user-profile'

function maskToken(id: string): string {
  return `••••••••${id.slice(-4)}`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString()
}

export interface ApiTokensPanelProps {
  tokens: ApiToken[]
  isLoading?: boolean
  onCreateToken: (name: string, scopes: string[], expiresInDays?: number) => Promise<{ plainToken: string } | null>
  onRevokeToken: (tokenId: string) => Promise<boolean>
  isCreating?: boolean
  isRevoking?: boolean
}

export function ApiTokensPanel({
  tokens,
  isLoading = false,
  onCreateToken,
  onRevokeToken,
  isCreating = false,
  isRevoking = false,
}: ApiTokensPanelProps) {
  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [selectedScopes, setSelectedScopes] = useState<string[]>([])
  const [expiresInDays, setExpiresInDays] = useState(30)
  const [createdToken, setCreatedToken] = useState<string | null>(null)
  const [revokeTarget, setRevokeTarget] = useState<string | null>(null)

  const activeTokens = (tokens ?? []).filter((t) => !t.revoked)

  const toggleScope = (id: string) => {
    setSelectedScopes((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const handleCreate = async () => {
    if (!newName.trim() || selectedScopes.length === 0) return
    const result = await onCreateToken(newName.trim(), selectedScopes, expiresInDays)
    if (result?.plainToken) {
      setCreatedToken(result.plainToken)
    }
  }

  const handleCloseCreate = () => {
    setCreateOpen(false)
    setNewName('')
    setSelectedScopes([])
    setExpiresInDays(30)
    setCreatedToken(null)
  }

  const copyToken = () => {
    if (createdToken) {
      navigator.clipboard.writeText(createdToken)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Tokens
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Create and manage API tokens for integrations. Tokens are shown only once at creation.
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)} size="sm">
            <Plus className="h-4 w-4" />
            Create token
          </Button>
        </CardHeader>
        <CardContent>
          {activeTokens.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border py-12 text-center">
              <Key className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm font-medium text-foreground">No API tokens</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create a token to integrate with external services.
              </p>
              <Button className="mt-4" onClick={() => setCreateOpen(true)}>
                Create token
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {activeTokens.map((token) => (
                <div
                  key={token.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4"
                >
                  <div>
                    <p className="font-medium">{token.name}</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {maskToken(token.id)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Scopes: {(token.scopes ?? []).join(', ')} • Created {formatDate(token.createdAt)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRevokeTarget(token.id)}
                    disabled={isRevoking}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create token dialog */}
      <Dialog open={createOpen} onOpenChange={(o) => !o && handleCloseCreate()}>
        <DialogContent showClose={!createdToken}>
          <DialogHeader>
            <DialogTitle>{createdToken ? 'Token created' : 'Create API token'}</DialogTitle>
            <DialogDescription>
              {createdToken
                ? 'Copy this token now. You will not be able to see it again.'
                : 'Give your token a name and select the permissions it needs.'}
            </DialogDescription>
          </DialogHeader>
          {createdToken ? (
            <div className="space-y-2">
              <Label>Token</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={createdToken}
                  className="font-mono text-sm"
                />
                <Button variant="outline" size="icon" onClick={copyToken}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token-name">Token name</Label>
                <Input
                  id="token-name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. CI/CD"
                />
              </div>
              <div className="space-y-2">
                <Label>Scopes</Label>
                <div className="flex flex-wrap gap-3">
                  {TOKEN_SCOPES.map((s) => (
                    <div key={s.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`scope-${s.id}`}
                        checked={selectedScopes.includes(s.id)}
                        onCheckedChange={() => toggleScope(s.id)}
                      />
                      <Label htmlFor={`scope-${s.id}`} className="cursor-pointer font-normal text-sm">
                        {s.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expires">Expires in (days)</Label>
                <Input
                  id="expires"
                  type="number"
                  min={1}
                  max={365}
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(parseInt(e.target.value, 10) || 30)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            {createdToken ? (
              <Button onClick={handleCloseCreate}>Done</Button>
            ) : (
              <>
                <Button variant="outline" onClick={handleCloseCreate}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={!newName.trim() || selectedScopes.length === 0 || isCreating}
                >
                  {isCreating ? 'Creating...' : 'Create'}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke confirmation */}
      <ConfirmationDialog
        open={!!revokeTarget}
        onOpenChange={(o) => !o && setRevokeTarget(null)}
        title="Revoke token"
        description="This token will stop working immediately. This action cannot be undone."
        confirmLabel="Revoke"
        variant="destructive"
        onConfirm={async () => {
          if (revokeTarget) await onRevokeToken(revokeTarget)
        }}
        isLoading={isRevoking}
      />
    </>
  )
}
