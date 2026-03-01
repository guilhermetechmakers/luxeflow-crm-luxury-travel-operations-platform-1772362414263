import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const hours = Array.from({ length: 14 }, (_, i) => i + 7)

export function Calendar() {
  const [, setWeekOffset] = useState(0)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Calendar</h1>
          <p className="mt-1 text-muted-foreground">Check-ins, check-outs, and deadlines</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => setWeekOffset((o) => o - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setWeekOffset((o) => o + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline">Week View</Button>
          <Button variant="outline">Google Sync</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Week View</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-8 border border-border">
                <div className="border-b border-r border-border p-2" />
                {days.map((d) => (
                  <div key={d} className="border-b border-r border-border p-2 text-center text-sm font-medium">
                    {d}
                  </div>
                ))}
              </div>
              {hours.map((h) => (
                <div key={h} className="grid grid-cols-8 border-b border-border">
                  <div className="border-r border-border p-2 text-sm text-muted-foreground">
                    {h}:00
                  </div>
                  {days.map((d) => (
                    <div
                      key={`${d}-${h}`}
                      className="min-h-[60px] border-r border-border p-1"
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
