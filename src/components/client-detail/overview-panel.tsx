/**
 * OverviewPanel - Contact info, VIP flags, quick stats, last contact
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatShortDate } from '@/lib/format'
import type { ClientDetail } from '@/types/client-detail'

export interface OverviewPanelProps {
  profile: ClientDetail | null
  upcomingBookingsCount?: number
  outstandingBalance?: number
}

export function OverviewPanel({
  profile,
  upcomingBookingsCount = 0,
  outstandingBalance = 0,
}: OverviewPanelProps) {
  const vipFlags = (profile?.vipFlags ?? [])
  const prefs = profile?.preferences ?? null
  const billing = profile?.billingDetails ?? null

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Email
              </p>
              <p className="mt-1">{profile?.email ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Phone
              </p>
              <p className="mt-1">{profile?.phone ?? '—'}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Address
              </p>
              <p className="mt-1">{profile?.address ?? '—'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {vipFlags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>VIP Flags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(vipFlags ?? []).map((flag) => (
                <Badge
                  key={flag}
                  variant="secondary"
                  className="bg-luxe-supporting/20 text-luxe-supporting border-luxe-supporting/40"
                >
                  {flag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-border bg-secondary/30 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Upcoming Bookings
              </p>
              <p className="mt-1 font-serif text-2xl font-semibold">
                {upcomingBookingsCount}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-secondary/30 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Outstanding Balance
              </p>
              <p className="mt-1 font-serif text-2xl font-semibold">
                {formatCurrency(
                  outstandingBalance ?? profile?.outstandingBalance ?? 0,
                  profile?.currency ?? 'EUR'
                )}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-secondary/30 p-4 sm:col-span-2 lg:col-span-1">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Last Contact
              </p>
              <p className="mt-1 font-serif text-lg">
                {formatShortDate(profile?.lastContact ?? profile?.lastActive)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {(prefs || billing) && (
        <Card>
          <CardHeader>
            <CardTitle>Preferences & Billing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {prefs?.travel && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Travel Preferences
                </p>
                <ul className="mt-1 list-disc pl-4 text-sm">
                  {prefs.travel.maxBudget != null && (
                    <li>Max budget: {formatCurrency(prefs.travel.maxBudget)}</li>
                  )}
                  {prefs.travel.kidsPolicy && (
                    <li>Kids policy: {prefs.travel.kidsPolicy}</li>
                  )}
                  {Array.isArray(prefs.travel.mealPreferences) &&
                    prefs.travel.mealPreferences.length > 0 && (
                      <li>
                        Meals: {(prefs.travel.mealPreferences ?? []).join(', ')}
                      </li>
                    )}
                </ul>
              </div>
            )}
            {billing && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Billing Contact
                </p>
                <p className="mt-1">
                  {billing.billingContact ?? '—'} • {billing.paymentMethod ?? '—'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
