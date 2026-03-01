import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

const mockResorts = [
  { id: '1', name: 'Villa Serenity', location: 'Santorini', tags: ['Family', 'Beach'], transfer: '25 min' },
  { id: '2', name: 'Ocean View Resort', location: 'Maldives', tags: ['Luxury', 'Spa'], transfer: '15 min' },
  { id: '3', name: 'Mountain Lodge', location: 'Swiss Alps', tags: ['Ski', 'Wellness'], transfer: '45 min' },
]

export function ResortsList() {
  const [search, setSearch] = useState('')

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-serif text-3xl font-semibold">Resort Bible</h1>
        <p className="mt-1 text-muted-foreground">Centralized resort knowledgebase with faceted search</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search resorts by name, location, tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>
              <Button variant="outline" size="sm">Saved Filters</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockResorts.map((resort) => (
          <Link key={resort.id} to={`/dashboard/resorts/${resort.id}`}>
            <Card className="h-full transition-all hover:shadow-card-hover">
              <CardContent className="p-6">
                <div className="mb-4 h-32 rounded-lg bg-secondary" />
                <h3 className="font-serif text-xl font-semibold">{resort.name}</h3>
                <p className="text-muted-foreground">{resort.location}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {resort.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-luxe-accent/20 px-2 py-0.5 text-xs text-luxe-accent"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Transfer: {resort.transfer}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
