import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { clientsApi } from '@/api/clients'
import type { Client } from '@/types/client'

const steps = ['Client', 'Resort & Room', 'Rates', 'Payment Schedule', 'Itinerary', 'Review']

function getClientName(client: Client): string {
  return `${client?.firstName ?? ''} ${client?.lastName ?? ''}`.trim() || 'Unknown'
}

export function BookingWizard() {
  const [step, setStep] = useState(0)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const clientIdFromUrl = searchParams.get('client') ?? undefined
  const [prefilledClient, setPrefilledClient] = useState<Client | null>(null)

  useEffect(() => {
    if (!clientIdFromUrl) {
      setPrefilledClient(null)
      return
    }
    clientsApi.getClient(clientIdFromUrl).then((c) => {
      setPrefilledClient(c ?? null)
    })
  }, [clientIdFromUrl])

  const handleNext = () => {
    if (step < steps.length - 1) setStep(step + 1)
    else {
      toast.success('Booking saved as draft')
      navigate('/dashboard/bookings')
    }
  }

  const handleBack = () => {
    if (step > 0) setStep(step - 1)
    else navigate('/dashboard/bookings')
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleBack} asChild>
          <Link to="/dashboard/bookings">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-serif text-3xl font-semibold">New Booking</h1>
          <p className="text-muted-foreground">Step {step + 1} of {steps.length}</p>
        </div>
      </div>

      <div className="flex gap-2">
        {steps.map((s, i) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full ${
              i <= step ? 'bg-accent' : 'bg-secondary'
            }`}
          />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{steps[step]}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 0 && (
            <>
              <div>
                <Label>Client</Label>
                {prefilledClient ? (
                  <div className="mt-1 flex items-center gap-2 rounded-md border border-border bg-secondary/30 px-3 py-2">
                    <span className="font-medium">{getClientName(prefilledClient)}</span>
                    {prefilledClient.email && (
                      <span className="text-sm text-muted-foreground">
                        {prefilledClient.email}
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPrefilledClient(null)}
                      className="ml-auto"
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <Input placeholder="Search or select client" className="mt-1" />
                )}
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <div>
                <Label>Resort</Label>
                <Input placeholder="Search Resort Bible" className="mt-1" />
              </div>
              <div>
                <Label>Room Type</Label>
                <Input placeholder="Select room" className="mt-1" />
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <div>
                <Label>Rate Plan</Label>
                <Input placeholder="Select rate" className="mt-1" />
              </div>
              <div>
                <Label>Commission Override (optional)</Label>
                <Input type="number" placeholder="0" className="mt-1" />
              </div>
            </>
          )}
          {step === 3 && (
            <p className="text-muted-foreground">Configure payment schedule and deadlines.</p>
          )}
          {step === 4 && (
            <p className="text-muted-foreground">Add itinerary and transfer details.</p>
          )}
          {step === 5 && (
            <p className="text-muted-foreground">Review and save as quote or draft.</p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          Back
        </Button>
        <Button onClick={handleNext}>
          {step === steps.length - 1 ? 'Save Draft' : 'Next'}
          {step === steps.length - 1 ? (
            <Check className="h-4 w-4" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )
}
