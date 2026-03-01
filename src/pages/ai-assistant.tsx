import { useState } from 'react'
import { Send, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function AIAssistant() {
  const [prompt, setPrompt] = useState('')
  const [context, setContext] = useState<'resort' | 'client' | 'booking'>('resort')

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4 animate-fade-in">
      <Card className="w-72 shrink-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-luxe-accent" />
            Context
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant={context === 'resort' ? 'default' : 'outline'}
            className="w-full justify-start"
            onClick={() => setContext('resort')}
          >
            Resort Bible
          </Button>
          <Button
            variant={context === 'client' ? 'default' : 'outline'}
            className="w-full justify-start"
            onClick={() => setContext('client')}
          >
            Client
          </Button>
          <Button
            variant={context === 'booking' ? 'default' : 'outline'}
            className="w-full justify-start"
            onClick={() => setContext('booking')}
          >
            Booking
          </Button>
          <div className="mt-4 rounded-lg border border-border p-3">
            <p className="text-xs font-medium text-muted-foreground">Usage</p>
            <p className="mt-1 text-sm">12,450 / 50,000 tokens</p>
          </div>
        </CardContent>
      </Card>

      <Card className="flex flex-1 flex-col">
        <CardHeader className="border-b border-border">
          <CardTitle>AI Assistant</CardTitle>
          <p className="text-sm text-muted-foreground">
            Get resort recommendations, draft itineraries, create tasks. RAG-powered with citations.
          </p>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col justify-end p-4">
          <div className="mb-4 flex-1 overflow-auto">
            <p className="text-center text-sm text-muted-foreground">
              Try: &quot;Suggest 5 resorts for family with toddlers, &lt;30 min transfer, quiet luxury&quot;
            </p>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Ask about resorts, clients, or request a draft..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
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
