/**
 * Payment Due List widget - table/list with due date, amount, client, status badges
 */
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Payment } from '@/types/dashboard'

interface PaymentDueListProps {
  payments: Payment[]
}

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })

const formatCurrency = (amount: number, currency = 'EUR') =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(amount)

const statusVariant = (status: Payment['status']) => {
  switch (status) {
    case 'paid':
      return 'success'
    case 'overdue':
      return 'destructive'
    case 'partial':
      return 'warning'
    default:
      return 'secondary'
  }
}

export function PaymentDueList({ payments = [] }: PaymentDueListProps) {
  const items = Array.isArray(payments) ? payments : []
  const sorted = [...items].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Due List</CardTitle>
        <CardDescription>Payments due by date</CardDescription>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-muted-foreground">No payments due</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-left font-medium">Due Date</th>
                  <th className="pb-3 text-left font-medium">Client</th>
                  <th className="pb-3 text-right font-medium">Amount</th>
                  <th className="pb-3 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {sorted.slice(0, 6).map((p) => (
                  <tr key={p.id} className="border-b border-border/50 last:border-0">
                    <td className="py-3">{formatDate(p.dueDate)}</td>
                    <td className="py-3">
                      <Link
                        to={`/dashboard/bookings/${p.bookingId}`}
                        className="font-medium text-accent hover:underline"
                      >
                        {p.clientName ?? 'Client'}
                      </Link>
                      {p.bookingRef && (
                        <span className="ml-1 text-xs text-muted-foreground">({p.bookingRef})</span>
                      )}
                    </td>
                    <td className="py-3 text-right">{formatCurrency(p.amount, p.currency)}</td>
                    <td className="py-3">
                      <Badge variant={statusVariant(p.status)}>{p.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {sorted.length > 6 && (
          <Link
            to="/dashboard/transactions"
            className="mt-4 block text-center text-sm font-medium text-accent hover:underline"
          >
            View all ({sorted.length})
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
