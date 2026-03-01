import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

const mockClients = [
  { id: '1', name: 'Sarah Mitchell', email: 'sarah@example.com', vip: true, bookings: 12 },
  { id: '2', name: 'James Chen', email: 'james@example.com', vip: false, bookings: 5 },
  { id: '3', name: 'Emma Laurent', email: 'emma@example.com', vip: true, bookings: 24 },
]

export function ClientsList() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<string | null>(null)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Clients</h1>
          <p className="mt-1 text-muted-foreground">Manage client records</p>
        </div>
        <Button asChild>
          <Link to="/dashboard/clients/new">
            <Plus className="h-4 w-4" />
            New Client
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === 'vip' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(filter === 'vip' ? null : 'vip')}
              >
                VIP
              </Button>
              <Button
                variant={filter === 'family' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(filter === 'family' ? null : 'family')}
              >
                Family
              </Button>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Bookings</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Tags</th>
                </tr>
              </thead>
              <tbody>
                {mockClients.map((client) => (
                  <tr
                    key={client.id}
                    className="border-b border-border transition-colors hover:bg-secondary/30"
                  >
                    <td className="px-4 py-3">
                      <Link
                        to={`/dashboard/clients/${client.id}`}
                        className="font-medium hover:text-accent"
                      >
                        {client.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{client.email}</td>
                    <td className="px-4 py-3">{client.bookings}</td>
                    <td className="px-4 py-3">
                      {client.vip && (
                        <span className="rounded-full bg-luxe-supporting/20 px-2 py-0.5 text-xs font-medium text-luxe-supporting">
                          VIP
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
