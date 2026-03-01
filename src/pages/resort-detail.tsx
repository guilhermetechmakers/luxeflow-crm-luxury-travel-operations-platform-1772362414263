import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import * as Tabs from '@radix-ui/react-tabs'

export function ResortDetail() {
  const { id } = useParams()

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/dashboard/resorts">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-serif text-3xl font-semibold">Villa Serenity</h1>
          <p className="text-muted-foreground">Santorini, Greece {id && `· ID: ${id}`}</p>
        </div>
      </div>

      <div className="h-64 rounded-lg bg-secondary" />

      <Tabs.Root defaultValue="overview" className="space-y-4">
        <Tabs.List className="flex gap-2 border-b border-border">
          <Tabs.Trigger value="overview" className="border-b-2 border-transparent px-4 py-2 data-[state=active]:border-accent data-[state=active]:text-accent">
            Overview
          </Tabs.Trigger>
          <Tabs.Trigger value="rooms" className="border-b-2 border-transparent px-4 py-2 data-[state=active]:border-accent data-[state=active]:text-accent">
            Rooms
          </Tabs.Trigger>
          <Tabs.Trigger value="perks" className="border-b-2 border-transparent px-4 py-2 data-[state=active]:border-accent data-[state=active]:text-accent">
            Perks
          </Tabs.Trigger>
          <Tabs.Trigger value="contacts" className="border-b-2 border-transparent px-4 py-2 data-[state=active]:border-accent data-[state=active]:text-accent">
            Contacts
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Villa Serenity offers luxury accommodations with stunning caldera views.
                Transfer time: 25 min from airport. Family-friendly, beach access.
              </p>
            </CardContent>
          </Card>
        </Tabs.Content>
        <Tabs.Content value="rooms">
          <Card>
            <CardHeader>
              <CardTitle>Room Types</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Room types table with rates and availability.</p>
            </CardContent>
          </Card>
        </Tabs.Content>
        <Tabs.Content value="perks">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">Perks and amenities.</p>
            </CardContent>
          </Card>
        </Tabs.Content>
        <Tabs.Content value="contacts">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">Supplier contacts and internal notes.</p>
            </CardContent>
          </Card>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  )
}
