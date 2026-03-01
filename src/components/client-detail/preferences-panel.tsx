/**
 * PreferencesPanel - Communication prefs, travel prefs, currency, language
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/format'
import type { ClientDetail } from '@/types/client-detail'

export interface PreferencesPanelProps {
  profile: ClientDetail | null
}

export function PreferencesPanel({
  profile,
}: PreferencesPanelProps) {
  const prefs = profile?.preferences ?? null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">
            Language & Currency
          </h4>
          <p className="mt-1">
            {profile?.language ?? '—'} • {profile?.currency ?? '—'}
          </p>
        </div>

        {prefs?.travel && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">
              Travel Preferences
            </h4>
            <ul className="mt-2 space-y-1 text-sm">
              {prefs.travel.maxBudget != null && (
                <li>
                  Max budget: {formatCurrency(prefs.travel.maxBudget, profile?.currency ?? 'EUR')}
                </li>
              )}
              {prefs.travel.kidsPolicy && (
                <li>Kids policy: {prefs.travel.kidsPolicy}</li>
              )}
              {Array.isArray(prefs.travel.mealPreferences) &&
                prefs.travel.mealPreferences.length > 0 && (
                  <li>
                    Meal preferences: {(prefs.travel.mealPreferences ?? []).join(', ')}
                  </li>
                )}
            </ul>
          </div>
        )}

        {prefs?.communication && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">
              Communication
            </h4>
            <p className="mt-1 text-sm">
              Preferred channel: {prefs.communication.channel ?? '—'}
            </p>
            {prefs.communication.optInNewsletter != null && (
              <p className="text-sm">
                Newsletter: {prefs.communication.optInNewsletter ? 'Yes' : 'No'}
              </p>
            )}
          </div>
        )}

        {!prefs?.travel && !prefs?.communication && (
          <p className="text-muted-foreground">No preferences set</p>
        )}
      </CardContent>
    </Card>
  )
}
