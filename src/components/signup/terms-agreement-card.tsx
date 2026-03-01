/**
 * TermsAgreementCard - TOS/Privacy checkbox with link to policy
 */
import { Link } from 'react-router-dom'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

export interface TermsAgreementCardProps {
  checked: boolean
  onChange: (checked: boolean) => void
  error?: string | null
  disabled?: boolean
}

export function TermsAgreementCard({
  checked,
  onChange,
  error,
  disabled,
}: TermsAgreementCardProps) {
  return (
    <Card className="shadow-card transition-all duration-300 hover:shadow-card-hover">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <Checkbox
            id="termsAccepted"
            checked={checked}
            onCheckedChange={(c) => onChange(!!c)}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? 'terms-error' : undefined}
          />
          <div className="space-y-1">
            <Label
              htmlFor="termsAccepted"
              className="cursor-pointer text-sm font-normal leading-relaxed text-foreground"
            >
              I agree to the{' '}
              <Link
                to="/terms"
                className="font-medium text-accent underline-offset-4 hover:underline"
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                to="/privacy"
                className="font-medium text-accent underline-offset-4 hover:underline"
              >
                Privacy Policy
              </Link>
            </Label>
            {error && (
              <p id="terms-error" className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
