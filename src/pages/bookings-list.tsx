import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, LayoutGrid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const mockBookings = [
  { id: '1', client: 'Sarah Mitchell', resort: 'Villa Serenity', status: 'confirmed', checkIn: '2025-03-15', total: '€12,400' },
  { id: '2', client: 'James Chen', resort: 'Ocean View Resort', status: 'quote', checkIn: '2025-04-01', total: '€8,200' },
  { id: '3', client: 'Emma Laurent', resort: 'Mountain Lodge', status: 'pre-arrival', checkIn: '2025-03-08', total: '€15,600' },
]

const statusColors: Record<string, string> = {
  quote: 'bg-gray-100 text-gray-700',
  confirmed: 'bg-green-100 text-green-700',
  'pre-arrival': 'bg-blue-100 text-blue-700',
  'in-stay': 'bg-amber-100 text-amber-700',
  'post-stay': 'bg-slate-100 text-slate-700',
}

export function BookingsList() {
  const [view, setView] = useState<'table' | 'board'>('table')

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Bookings</h1>
          <p className="mt-1 text-muted-foreground">Pipeline and booking management</p>
        </div>
        <div className="flex gap-2">
          <Button variant={view === 'table' ? 'default' : 'outline'} size="icon" onClick={() => setView('table')}>
            <List className="h-4 w-4" />
          </Button>
          <Button variant={view === 'board' ? 'default' : 'outline'} size="icon" onClick={() => setView('board')}>
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button asChild>
            <Link to="/dashboard/bookings/new">
              <Plus className="h-4 w-4" />
              New Booking
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {view === 'table' ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="px-4 py-3 text-left text-sm font-medium">Client</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Resort</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Check-in</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {mockBookings.map((b) => (
                    <tr key={b.id} className="border-b border-border hover:bg-secondary/30">
                      <td className="px-4 py-3">
                        <Link to={`/dashboard/bookings/${b.id}`} className="font-medium hover:text-accent">
                          {b.client}
                        </Link>
                      </td>
                      <td className="px-4 py-3">{b.resort}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[b.status] ?? 'bg-gray-100'}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">{b.checkIn}</td>
                      <td className="px-4 py-3 font-medium">{b.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid gap-4 p-6 md:grid-cols-2 lg:grid-cols-3">
              {['Quote', 'Confirmed', 'Pre-arrival'].map((col) => (
                <div key={col} className="space-y-2">
                  <h3 className="font-medium">{col}</h3>
                  {mockBookings
                    .filter((b) => b.status === col.toLowerCase().replace(' ', '-'))
                    .map((b) => (
                      <Link key={b.id} to={`/dashboard/bookings/${b.id}`}>
                        <div className="rounded-lg border border-border p-4 transition-all hover:border-accent/50">
                          <p className="font-medium">{b.client}</p>
                          <p className="text-sm text-muted-foreground">{b.resort}</p>
                          <p className="mt-2 font-medium">{b.total}</p>
                        </div>
                      </Link>
                    ))}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
