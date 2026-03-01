/**
 * ProfileHeader - Client photo, name, VIP badge, contact actions, status
 */
import { Link } from 'react-router-dom'
import { ArrowLeft, Mail, Phone, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { formatShortDate } from '@/lib/format'
import type { ClientDetail } from '@/types/client-detail'

function getClientName(profile: ClientDetail | null): string {
  if (!profile) return 'Loading...'
  return `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`.trim() || 'Unknown'
}

function getInitials(profile: ClientDetail | null): string {
  if (!profile) return '?'
  const f = (profile?.firstName ?? '').charAt(0)
  const l = (profile?.lastName ?? '').charAt(0)
  return (f + l).toUpperCase() || '?'
}

export interface ProfileHeaderProps {
  clientId: string
  profile: ClientDetail | null
  onCall?: () => void
  onEmail?: () => void
  onMessage?: () => void
}

export function ProfileHeader({
  clientId,
  profile,
  onCall,
  onEmail,
  onMessage,
}: ProfileHeaderProps) {
  const isVip = (profile?.vipFlags ?? []).length > 0
  const lastContact = profile?.lastContact ?? profile?.lastActive

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild aria-label="Back to clients">
          <Link to="/dashboard/clients">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-serif text-2xl font-semibold sm:text-3xl">
            Client Profile
          </h1>
          <p className="text-muted-foreground">
            {profile ? getClientName(profile) : 'Loading...'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-4">
              <Avatar className="h-16 w-16 shrink-0">
                <AvatarImage src={profile?.avatarUrl ?? undefined} alt="" />
                <AvatarFallback className="text-lg bg-secondary text-foreground">
                  {getInitials(profile)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-serif text-2xl font-semibold">
                    {getClientName(profile)}
                  </h2>
                  {isVip && (
                    <Badge
                      variant="secondary"
                      className="bg-luxe-supporting/20 text-luxe-supporting border-luxe-supporting/40"
                    >
                      VIP
                    </Badge>
                  )}
                  <Badge variant="outline" className="capitalize">
                    active
                  </Badge>
                </div>
                {lastContact && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Last contact: {formatShortDate(lastContact)}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap gap-4 text-sm">
                  {profile?.email && (
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={`mailto:${profile.email}`}
                        className="text-accent hover:underline"
                      >
                        {profile.email}
                      </a>
                    </span>
                  )}
                  {profile?.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={`tel:${profile.phone}`}
                        className="text-accent hover:underline"
                      >
                        {profile.phone}
                      </a>
                    </span>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onCall}
                    aria-label="Call client"
                  >
                    <Phone className="h-4 w-4" />
                    Call
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onEmail}
                    aria-label="Email client"
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onMessage}
                    aria-label="Message client"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Message
                  </Button>
                </div>
              </div>
            </div>
            <Button asChild className="shrink-0">
              <Link to={`/dashboard/bookings/new?client=${clientId}`}>
                New Booking
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>
    </div>
  )
}
