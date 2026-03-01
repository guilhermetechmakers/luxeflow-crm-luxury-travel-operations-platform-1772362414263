/**
 * ContactsList - Supplier/partner contacts with roles, emails, phones, notes
 * Supports both PartnerRef (contactInfo) and full Contact (email, phone, role)
 */
import { Mail, Phone, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ensureArray } from '@/lib/resort-bible-utils'
import type { Resort, PartnerRef, Contact } from '@/types/resort-bible'
import { cn } from '@/lib/utils'

export interface ContactsListProps {
  resort?: Resort | null
  className?: string
}

function hasContactDetails(c: PartnerRef | Contact): c is Contact {
  return 'email' in c || 'phone' in c
}

function getContactInfo(c: PartnerRef | Contact): string | undefined {
  return 'contactInfo' in c ? c.contactInfo : undefined
}

export function ContactsList({ resort, className }: ContactsListProps) {
  const supplierContacts = ensureArray(resort?.supplierContacts)
  const partners = ensureArray(resort?.partners)

  const contacts = supplierContacts.length > 0 ? supplierContacts : partners

  if (contacts.length === 0) {
    return (
      <Card className={cn(className)}>
        <CardHeader>
          <CardTitle>Supplier contacts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
            <User className="h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">No supplier contacts</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Add partner or supplier contact details for this resort
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>Supplier contacts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {contacts.map((c) => {
            const hasEmail = hasContactDetails(c) && c.email
            const hasPhone = hasContactDetails(c) && c.phone
            const contactInfo = getContactInfo(c)

            return (
              <div
                key={c.id}
                className="rounded-lg border border-border p-4 transition-shadow hover:shadow-card"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium">{c.name}</h4>
                    {'role' in c && c.role && (
                      <p className="text-sm text-muted-foreground">{c.role}</p>
                    )}
                    {contactInfo && (
                      <p className="mt-1 text-sm text-muted-foreground">{contactInfo}</p>
                    )}
                    {'notes' in c && c.notes && (
                      <p className="mt-2 text-sm text-muted-foreground">{c.notes}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {hasEmail && hasContactDetails(c) && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="transition-transform hover:scale-[1.02]"
                      >
                        <a href={`mailto:${c.email}`} aria-label={`Email ${c.name}`}>
                          <Mail className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {hasPhone && hasContactDetails(c) && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="transition-transform hover:scale-[1.02]"
                      >
                        <a href={`tel:${c.phone}`} aria-label={`Call ${c.name}`}>
                          <Phone className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
                {hasEmail && hasContactDetails(c) && (
                  <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4 shrink-0" />
                    {c.email}
                  </p>
                )}
                {hasPhone && hasContactDetails(c) && (
                  <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 shrink-0" />
                    {c.phone}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
