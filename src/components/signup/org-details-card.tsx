/**
 * OrgDetailsCard - Organization name input for signup
 */
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export interface OrgDetailsCardProps {
  value: string
  onChange: (value: string) => void
  error?: string | null
  disabled?: boolean
}

export function OrgDetailsCard({ value, onChange, error, disabled }: OrgDetailsCardProps) {
  return (
    <Card className="shadow-card transition-all duration-300 hover:shadow-card-hover">
      <CardHeader className="pb-3">
        <CardTitle className="font-serif text-lg">Organization</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="orgName">Organization name</Label>
          <Input
            id="orgName"
            type="text"
            placeholder="Acme Travel"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? 'orgName-error' : undefined}
            className="mt-1"
          />
          {error && (
            <p id="orgName-error" className="mt-1 text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
