import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, BookOpen, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-luxe-accent/5 via-transparent to-luxe-supporting/5" />
        <div className="relative mx-auto max-w-6xl">
          <div className="animate-fade-in-up max-w-3xl">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-luxe-accent">
              Luxury Travel Operations
            </p>
            <h1 className="font-serif text-5xl font-bold leading-tight text-foreground md:text-6xl lg:text-7xl">
              The CRM that never misses a detail
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              LuxeFlow centralizes clients, bookings, resort knowledge, and operations
              in one platform. Reduce missed actions, shorten handoffs, and increase
              conversion for luxury travel advisors.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button asChild size="lg" className="group">
                <Link to="/signup">
                  Start Free Trial
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features - Bento-style grid */}
      <section className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-16 text-center font-serif text-4xl font-semibold text-foreground">
            Built for luxury travel operations
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="animate-fade-in rounded-lg border border-border bg-card p-8 shadow-card transition-all duration-300 hover:shadow-card-hover [animation-delay:100ms]">
              <LayoutDashboard className="mb-4 h-12 w-12 text-luxe-accent" />
              <h3 className="font-serif text-xl font-semibold">Command Center</h3>
              <p className="mt-2 text-muted-foreground">
                7-day check-ins/outs, due payments, overdue tasks, and approvals in one view.
              </p>
            </div>
            <div className="animate-fade-in rounded-lg border border-border bg-card p-8 shadow-card transition-all duration-300 hover:shadow-card-hover [animation-delay:200ms]">
              <BookOpen className="mb-4 h-12 w-12 text-luxe-accent" />
              <h3 className="font-serif text-xl font-semibold">Resort Bible</h3>
              <p className="mt-2 text-muted-foreground">
                Faceted search, filters, and structured resort knowledge for fast proposals.
              </p>
            </div>
            <div className="animate-fade-in rounded-lg border border-border bg-card p-8 shadow-card transition-all duration-300 hover:shadow-card-hover [animation-delay:300ms]">
              <Sparkles className="mb-4 h-12 w-12 text-luxe-accent" />
              <h3 className="font-serif text-xl font-semibold">AI Assistant</h3>
              <p className="mt-2 text-muted-foreground">
                RAG-powered recommendations, itinerary drafts, and task creation from chat.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-3xl font-semibold text-foreground">
            Ready to streamline your operations?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Join luxury travel agencies using LuxeFlow to deliver exceptional experiences.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link to="/signup">Get Started</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <span className="font-serif text-lg font-semibold">LuxeFlow</span>
          <div className="flex gap-8 text-sm text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground">Terms</Link>
            <Link to="/help" className="hover:text-foreground">Help</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
