import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const chartData = [
  { month: 'Jan', revenue: 98000, bookings: 18 },
  { month: 'Feb', revenue: 112000, bookings: 22 },
  { month: 'Mar', revenue: 124500, bookings: 24 },
]

export function Reports() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Reporting & Performance</h1>
          <p className="mt-1 text-muted-foreground">Financial and operational analytics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Date Range</Button>
          <Button variant="outline">Export</Button>
          <Button>Schedule Report</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Revenue (MTD)', value: '€124,500', trend: '+12%' },
          { label: 'Bookings', value: '24', trend: '+8%' },
          { label: 'Conversion', value: '34%', trend: '-2%' },
          { label: 'Commission', value: '€12,450', trend: '+12%' },
        ].map((k) => (
          <Card key={k.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {k.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{k.value}</p>
              <p className="text-sm text-green-600">{k.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="rgb(138, 154, 91)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
