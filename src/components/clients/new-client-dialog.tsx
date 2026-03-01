/**
 * NewClientDialog - Form for creating a new client
 */
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { clientsApi } from '@/api/clients'
import { useQueryClient } from '@tanstack/react-query'
import type { ClientCreateInput } from '@/types/client'

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z
    .string()
    .optional()
    .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Invalid email'),
  phone: z.string().optional(),
  vip: z.boolean().optional(),
  family: z.boolean().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export interface NewClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (clientId: string) => void
}

export function NewClientDialog({
  open,
  onOpenChange,
  onSuccess,
}: NewClientDialogProps) {
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      vip: false,
      family: false,
      country: '',
      notes: '',
    },
  })

  const vip = watch('vip')
  const family = watch('family')

  const onSubmit = async (data: FormData) => {
    const hasContact = (data.email ?? '').trim() || (data.phone ?? '').trim()
    if (!hasContact) {
      toast.error('Please provide at least an email or phone number')
      return
    }

    try {
      const input: ClientCreateInput = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: (data.email ?? '').trim() || undefined,
        phone: (data.phone ?? '').trim() || undefined,
        vip: data.vip ?? false,
        family: data.family ?? false,
        country: (data.country ?? '').trim() || undefined,
        notes: (data.notes ?? '').trim() || undefined,
      }
      const client = await clientsApi.createClient(input)
      toast.success('Client created successfully')
      reset()
      onOpenChange(false)
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      onSuccess?.(client.id)
    } catch {
      toast.error('Failed to create client')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" aria-describedby="new-client-description">
        <DialogHeader>
          <DialogTitle>New Client</DialogTitle>
          <p id="new-client-description" className="text-sm text-muted-foreground">
            Add a new client to your CRM. At least one contact method (email or phone) is required.
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                {...register('firstName')}
                className="mt-1"
                autoComplete="given-name"
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-destructive">{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                {...register('lastName')}
                className="mt-1"
                autoComplete="family-name"
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              className="mt-1"
              autoComplete="email"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              {...register('phone')}
              className="mt-1"
              autoComplete="tel"
            />
          </div>
          <div>
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              {...register('country')}
              className="mt-1"
              autoComplete="country-name"
            />
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={vip}
                onCheckedChange={(c) => setValue('vip', c === true)}
              />
              <span className="text-sm">VIP</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={family}
                onCheckedChange={(c) => setValue('family', c === true)}
              />
              <span className="text-sm">Family</span>
            </label>
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              {...register('notes')}
              className="mt-1"
              placeholder="Optional notes"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating…' : 'Create Client'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
