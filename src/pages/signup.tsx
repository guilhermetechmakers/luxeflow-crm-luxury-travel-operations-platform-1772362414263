import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

const schema = z.object({
  orgName: z.string().min(2, 'Organization name required'),
  name: z.string().min(2, 'Name required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  acceptTos: z.literal(true, { errorMap: () => ({ message: 'You must accept the terms' }) }),
})

type FormData = z.infer<typeof schema>

export function Signup() {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (_data: FormData) => {
    try {
      await new Promise((r) => setTimeout(r, 1000))
      toast.success('Organization created. Check your email to verify.')
      navigate('/dashboard')
    } catch {
      toast.error('Signup failed')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 px-4 py-12">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="text-center">
          <CardTitle className="font-serif text-2xl">Create your organization</CardTitle>
          <CardDescription>Start your LuxeFlow trial</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="orgName">Organization name</Label>
              <Input
                id="orgName"
                placeholder="Acme Travel"
                className="mt-1"
                {...register('orgName')}
              />
              {errors.orgName && (
                <p className="mt-1 text-sm text-destructive">{errors.orgName.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="name">Your name</Label>
              <Input id="name" placeholder="Jane Smith" className="mt-1" {...register('name')} />
              {errors.name && (
                <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@agency.com"
                className="mt-1"
                {...register('email')}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="mt-1"
                {...register('password')}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            <label className="flex items-start gap-2">
              <input type="checkbox" {...register('acceptTos')} className="mt-1 rounded" />
              <span className="text-sm">
                I agree to the <Link to="/terms" className="text-accent hover:underline">Terms of Service</Link> and{' '}
                <Link to="/privacy" className="text-accent hover:underline">Privacy Policy</Link>
              </span>
            </label>
            {errors.acceptTos && (
              <p className="text-sm text-destructive">{errors.acceptTos.message}</p>
            )}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Account'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-accent hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
