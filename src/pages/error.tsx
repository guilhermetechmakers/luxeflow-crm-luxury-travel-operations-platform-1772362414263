import { Link } from 'react-router-dom'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="font-serif text-8xl font-bold text-muted-foreground">500</h1>
      <p className="mt-4 text-xl text-muted-foreground">Something went wrong</p>
      <Button asChild className="mt-8">
        <Link to="/">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Link>
      </Button>
    </div>
  )
}
