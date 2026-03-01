/**
 * ResetPageLayout - Card-based luxury UI container for auth pages
 * LuxeFlow CRM - Responsive, consistent with Login page layout
 */
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export interface ResetPageLayoutProps {
  children: React.ReactNode
  className?: string
}

export function ResetPageLayout({ children, className }: ResetPageLayoutProps) {
  return <ResetLayoutWrapper className={className}>{children}</ResetLayoutWrapper>
}

function ResetLayoutWrapper({ children, className }: ResetPageLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F6F6F6]">
      <header className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link
            to="/"
            className="font-serif text-xl font-semibold text-foreground transition-colors hover:text-accent"
          >
            LuxeFlow
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="text-sm font-medium text-accent transition-colors hover:underline"
            >
              Sign Up
            </Link>
          </nav>
        </div>
      </header>

      <main
        className={cn(
          'flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6',
          className
        )}
      >
        {children}
      </main>
    </div>
  )
}

export { ResetLayoutWrapper }
