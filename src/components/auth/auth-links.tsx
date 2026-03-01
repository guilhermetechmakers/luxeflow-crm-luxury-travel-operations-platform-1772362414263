/**
 * AuthLinks - Forgot Password and Sign Up links
 */
import { Link } from 'react-router-dom'

export function AuthLinks() {
  return (
    <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-between">
      <Link
        to="/forgot-password"
        className="text-sm text-muted-foreground transition-colors hover:text-accent hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
      >
        Forgot Password
      </Link>
      <span className="hidden text-muted-foreground sm:inline">·</span>
      <Link
        to="/signup"
        className="text-sm font-medium text-accent transition-colors hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
      >
        Sign Up
      </Link>
    </div>
  )
}
