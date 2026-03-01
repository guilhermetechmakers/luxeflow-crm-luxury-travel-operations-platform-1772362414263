import { useNavigate } from 'react-router-dom'
import { Search, LogOut, User, ChevronDown, Building2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/contexts/auth-context'
import { useState, useCallback } from 'react'
import { useDebounce } from '@/hooks/use-debounce'

const ORGS = [
  { id: 'org1', name: 'LuxeFlow HQ' },
  { id: 'org2', name: 'LuxeFlow Europe' },
]

function getInitials(email: string | undefined): string {
  if (!email) return '?'
  const part = email.split('@')[0]
  if (part.length >= 2) return part.slice(0, 2).toUpperCase()
  return part.slice(0, 1).toUpperCase()
}

export function Header() {
  const navigate = useNavigate()
  const { signOut, user } = useAuth()
  const [orgId, setOrgId] = useState('org1')
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebounce(searchQuery, 300)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    const q = (debouncedSearch || searchQuery).toString().trim()
    if (q) {
      navigate(`/dashboard?q=${encodeURIComponent(q)}`)
    }
  }, [debouncedSearch, searchQuery, navigate])

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex flex-1 items-center gap-4">
        {/* Organization switcher */}
        <Select value={orgId} onValueChange={setOrgId}>
          <SelectTrigger
            className="w-[180px]"
            aria-label="Select organization"
          >
            <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
            <SelectValue placeholder="Select org" />
          </SelectTrigger>
          <SelectContent>
            {ORGS.map((org) => (
              <SelectItem key={org.id} value={org.id}>
                {org.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Quick search */}
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search clients, bookings, resorts..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Quick search"
          />
        </form>
      </div>

      <div className="flex items-center gap-2">
        {user && (
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {user.email}
          </span>
        )}
        <Button variant="outline" size="sm" asChild>
          <a href="/dashboard/bookings/new">Quick Actions</a>
        </Button>

        {/* User profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
              aria-label="Open user menu"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-accent/20 text-accent text-sm">
                  {getInitials(user?.email)}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.name ?? user?.email ?? 'Account'}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
              <User className="mr-2 h-4 w-4" />
              Profile & Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
