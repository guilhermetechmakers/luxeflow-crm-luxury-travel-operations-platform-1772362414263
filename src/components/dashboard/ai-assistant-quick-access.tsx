/**
 * AI Assistant Quick Access - floating or prominent button to open AI assistant
 */
import { Link } from 'react-router-dom'
import { Sparkles, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function AIAssistantQuickAccess() {
  return (
    <Card className="border-luxe-accent/30 bg-gradient-to-br from-luxe-accent/5 to-transparent transition-all duration-200 hover:shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-luxe-accent" aria-hidden />
          AI Assistant
        </CardTitle>
        <CardDescription>
          Get resort recommendations, draft itineraries, create tasks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild className="transition-all duration-200 hover:scale-[1.02]">
          <Link to="/dashboard/ai">
            Open AI Assistant
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
