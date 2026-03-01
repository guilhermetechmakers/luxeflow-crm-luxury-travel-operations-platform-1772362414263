import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const steps = ['Client', 'Resort & Room', 'Rates', 'Payment Schedule', 'Itinerary', 'Review']

export function BookingWizard() {
  const [step, setStep] = useState(0)
  const navigate = useNavigate()

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
                <Input placeholder="Search or select client" className="mt-1" />
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
