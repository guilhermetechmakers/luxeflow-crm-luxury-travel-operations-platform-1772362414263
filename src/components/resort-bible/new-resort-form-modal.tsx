/**
 * NewResortFormModal - Add new resort with standardized fields
 */
import { useCallback } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import type { ResortCreateInput } from '@/types/resort-bible'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
  region: z.string().optional(),
  transferTime: z.string().optional(),
  kidsPolicy: z.string().optional(),
  restrictions: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export interface NewResortFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: ResortCreateInput) => Promise<unknown>
  onSuccess?: () => void
}

export function NewResortFormModal({
  open,
  onOpenChange,
  onSubmit,
  onSuccess,
}: NewResortFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      city: '',
      country: '',
      region: '',
      transferTime: '',
      kidsPolicy: '',
      restrictions: '',
    },
  })

  const handleFormSubmit = useCallback(
    async (data: FormData) => {
      try {
        await onSubmit({
          name: data.name,
          location: {
            city: data.city,
            country: data.country,
            region: data.region || undefined,
          },
          transferTime: data.transferTime || undefined,
          kidsPolicy: data.kidsPolicy || undefined,
          restrictions: data.restrictions || undefined,
        })
        toast.success('Resort added successfully')
        reset()
        onOpenChange(false)
        onSuccess?.()
      } catch {
        toast.error('Failed to add resort')
      }
    },
    [onSubmit, onSuccess, reset, onOpenChange]
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add new resort</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Resort name *</Label>
            <Input
              id="name"
              {...register('name')}
              className="mt-1"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && (
              <p id="name-error" className="mt-1 text-sm text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                {...register('city')}
                className="mt-1"
                aria-invalid={!!errors.city}
              />
              {errors.city && (
                <p className="mt-1 text-sm text-destructive">{errors.city.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="country">Country *</Label>
              <Input
                id="country"
                {...register('country')}
                className="mt-1"
                aria-invalid={!!errors.country}
              />
              {errors.country && (
                <p className="mt-1 text-sm text-destructive">{errors.country.message}</p>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="region">Region</Label>
            <Input id="region" {...register('region')} className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="transferTime">Transfer time</Label>
              <Input
                id="transferTime"
                {...register('transferTime')}
                placeholder="e.g. 45 min"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="kidsPolicy">Kids policy</Label>
              <Input
                id="kidsPolicy"
                {...register('kidsPolicy')}
                placeholder="e.g. All ages welcome"
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="restrictions">Restrictions</Label>
            <Textarea
              id="restrictions"
              {...register('restrictions')}
              rows={2}
              className="mt-1"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Resort'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
