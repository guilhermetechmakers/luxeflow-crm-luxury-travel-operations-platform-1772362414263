import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Mail, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import * as Tabs from '@radix-ui/react-tabs'

export function ClientDetail() {
  const { id } = useParams()

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/dashboard/clients">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-serif text-3xl font-semibold">Client Profile</h1>
          <p className="text-muted-foreground">ID: {id}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <div className="h-16 w-16 rounded-full bg-secondary" />
              <div>
                <CardTitle className="text-2xl">Sarah Mitchell</CardTitle>
                <p className="text-muted-foreground">VIP Client</p>
                <div className="mt-2 flex gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Mail className="h-4 w-4" /> sarah@example.com
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="h-4 w-4" /> +1 555 123 4567
                  </span>
                </div>
              </div>
            </div>
            <Button asChild>
              <Link to={`/dashboard/bookings/new?client=${id}`}>New Booking</Link>
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs.Root defaultValue="overview" className="space-y-4">
        <Tabs.List className="flex gap-2 border-b border-border">
          <Tabs.Trigger
            value="overview"
            className="border-b-2 border-transparent px-4 py-2 data-[state=active]:border-accent data-[state=active]:text-accent"
          >
            Overview
          </Tabs.Trigger>
          <Tabs.Trigger
            value="bookings"
            className="border-b-2 border-transparent px-4 py-2 data-[state=active]:border-accent data-[state=active]:text-accent"
          >
            Bookings
          </Tabs.Trigger>
          <Tabs.Trigger
            value="documents"
            className="border-b-2 border-transparent px-4 py-2 data-[state=active]:border-accent data-[state=active]:text-accent"
          >
            Documents
          </Tabs.Trigger>
          <Tabs.Trigger
            value="preferences"
            className="border-b-2 border-transparent px-4 py-2 data-[state=active]:border-accent data-[state=active]:text-accent"
          >
            Preferences
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Client overview and key details. Document OCR, preferences, and communication history.
              </p>
            </CardContent>
          </Card>
        </Tabs.Content>
        <Tabs.Content value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Booking history for this client.</p>
            </CardContent>
          </Card>
        </Tabs.Content>
        <Tabs.Content value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Passports, contracts, and attachments.</p>
            </CardContent>
          </Card>
        </Tabs.Content>
        <Tabs.Content value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Travel preferences and special requests.</p>
            </CardContent>
          </Card>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  )
}
