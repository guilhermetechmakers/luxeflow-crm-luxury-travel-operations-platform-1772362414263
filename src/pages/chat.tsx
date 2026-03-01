import { useState } from 'react'
import { Send, Paperclip } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function Chat() {
  const [message, setMessage] = useState('')

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4 animate-fade-in">
      <Card className="w-64 shrink-0">
        <CardHeader>
          <CardTitle className="text-lg">Channels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="rounded-lg bg-accent/10 px-3 py-2 text-sm font-medium text-accent">
              # General
            </div>
            <div className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary">
              # Bookings
            </div>
            <div className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary">
              # Ops
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="flex flex-1 flex-col">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-lg"># General</CardTitle>
          <p className="text-sm text-muted-foreground">Team chat with link-to-booking/client</p>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col justify-end p-4">
          <div className="mb-4 flex-1 overflow-auto">
            <p className="text-center text-sm text-muted-foreground">
              No messages yet. Start the conversation.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              placeholder="Type a message... Link to booking or client with @"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
