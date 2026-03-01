import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import * as Tabs from '@radix-ui/react-tabs'

export function BookingDetail() {
  const { id } = useParams()

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/dashboard/bookings">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-serif text-3xl font-semibold">Booking #{id}</h1>
            <p className="text-muted-foreground">Sarah Mitchell · Villa Serenity</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Send className="h-4 w-4" />
            Send Proposal
          </Button>
          <Button>Request Approval</Button>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto">
        {['Quote', 'Confirmed', 'Pre-arrival', 'In-stay', 'Post-stay'].map((stage, i) => (
          <div
            key={stage}
            className={`shrink-0 rounded-lg border px-4 py-2 text-sm font-medium ${
              i === 1 ? 'border-accent bg-accent/10 text-accent' : 'border-border'
            }`}
          >
            {stage}
          </div>
        ))}
      </div>

      <Tabs.Root defaultValue="summary" className="space-y-4">
        <Tabs.List className="flex gap-2 border-b border-border">
          <Tabs.Trigger value="summary" className="border-b-2 border-transparent px-4 py-2 data-[state=active]:border-accent data-[state=active]:text-accent">
            Summary
          </Tabs.Trigger>
          <Tabs.Trigger value="itinerary" className="border-b-2 border-transparent px-4 py-2 data-[state=active]:border-accent data-[state=active]:text-accent">
            Itinerary
          </Tabs.Trigger>
          <Tabs.Trigger value="payments" className="border-b-2 border-transparent px-4 py-2 data-[state=active]:border-accent data-[state=active]:text-accent">
            Payments
          </Tabs.Trigger>
          <Tabs.Trigger value="notes" className="border-b-2 border-transparent px-4 py-2 data-[state=active]:border-accent data-[state=active]:text-accent">
            Notes
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="summary">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Rates & Commission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Total: €12,400 · Commission: €1,240</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Supplier Info</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Villa Serenity · Contact details</p>
              </CardContent>
            </Card>
          </div>
        </Tabs.Content>
        <Tabs.Content value="itinerary">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">Itinerary and transfer details.</p>
            </CardContent>
          </Card>
        </Tabs.Content>
        <Tabs.Content value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Payment schedule and invoice status.</p>
            </CardContent>
          </Card>
        </Tabs.Content>
        <Tabs.Content value="notes">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">Internal notes and attachments.</p>
            </CardContent>
          </Card>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  )
}
