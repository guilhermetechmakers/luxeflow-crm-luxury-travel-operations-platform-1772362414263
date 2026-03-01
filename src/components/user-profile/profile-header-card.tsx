/**
 * ProfileHeaderCard - avatar, display name, status indicators (2FA, last login)
 */
import { useRef, useState } from 'react'
import { Camera, Shield, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { UserProfile } from '@/types/user-profile'

function getInitials(name: string | undefined, email: string): string {
  if (name && name.trim().length >= 2) {
    return name
      .trim()
      .split(/\s+/)
      .map((s) => s[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  const part = email.split('@')[0] ?? ''
  return part.length >= 2 ? part.slice(0, 2).toUpperCase() : part.slice(0, 1).toUpperCase()
}

function formatLastLogin(iso?: string): string {
  if (!iso) return 'Never'
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return d.toLocaleDateString()
}

export interface ProfileHeaderCardProps {
  profile: UserProfile | null
  isLoading?: boolean
  onAvatarChange?: (file: File) => void
}

export function ProfileHeaderCard({
  profile,
  isLoading = false,
  onAvatarChange,
}: ProfileHeaderCardProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleAvatarClick = () => {
    if (onAvatarChange) inputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !onAvatarChange) return
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg']
    if (!validTypes.includes(file.type)) return
    if (file.size > 5 * 1024 * 1024) return // 5MB max
    setIsUploading(true)
    onAvatarChange(file)
    setIsUploading(false)
    e.target.value = ''
  }

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="flex flex-col items-center gap-4 p-8 sm:flex-row sm:items-start sm:text-left">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-4 pt-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-28" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!profile) return null

  const initials = getInitials(profile.name, profile.email)

  return (
    <Card className="overflow-hidden">
      <CardContent className="flex flex-col items-center gap-4 p-8 sm:flex-row sm:items-start sm:text-left">
        <div className="relative group">
          <Avatar className="h-24 w-24 rounded-full border-2 border-border shadow-card">
            <AvatarImage src={profile.avatarUrl} alt={profile.name} />
            <AvatarFallback className="bg-accent/20 text-accent text-2xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          {onAvatarChange && (
            <>
              <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                className="sr-only"
                onChange={handleFileChange}
                aria-label="Upload avatar"
              />
              <button
                type="button"
                onClick={handleAvatarClick}
                disabled={isUploading}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-foreground/40 opacity-0 transition-opacity hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label="Change avatar"
              >
                <Camera className="h-8 w-8 text-background" />
              </button>
            </>
          )}
        </div>
        <div className="flex-1 space-y-1">
          <h2 className="font-serif text-2xl font-semibold text-foreground">
            {profile.name}
          </h2>
          <p className="text-muted-foreground">{profile.email}</p>
          <div className="flex flex-wrap gap-4 pt-2">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 text-sm',
                profile.is2faEnabled ? 'text-accent' : 'text-muted-foreground'
              )}
            >
              <Shield className="h-4 w-4" />
              {profile.is2faEnabled ? '2FA enabled' : '2FA disabled'}
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Last login: {formatLastLogin(profile.lastLoginAt)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
