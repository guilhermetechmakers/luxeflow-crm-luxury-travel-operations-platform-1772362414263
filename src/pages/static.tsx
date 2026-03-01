import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface StaticPageProps {
  title: string
  content: string
}

export function StaticPage({ title, content }: StaticPageProps) {
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-16">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </Button>
      <h1 className="font-serif text-4xl font-semibold">{title}</h1>
      <div className="prose prose-neutral max-w-none">
        <p className="text-muted-foreground">{content}</p>
      </div>
    </div>
  )
}
