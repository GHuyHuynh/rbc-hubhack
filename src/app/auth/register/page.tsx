'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import type { UserType, TransportMethod } from '@/lib/types';

export default function RegisterPage() {
  const router = useRouter();
  const { register, error, isLoading } = useAuthStore();

  const [step, setStep] = useState<'type' | 'details'>('type');
  const [userType, setUserType] = useState<UserType | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    neighborhood: '',
    transportMethod: 'walking' as TransportMethod,
  });

  const [formErrors, setFormErrors] = useState({
    password: '',
    confirmPassword: '',
    email: '',
  });

  const handleTypeSelect = (type: UserType) => {
    setUserType(type);
    setStep('details');
  };

  const validateForm = (): boolean => {
    const errors = {
      password: '',
      confirmPassword: '',
      email: '',
    };

    if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.email.includes('@')) {
      errors.email = 'Please enter a valid email';
    }

    setFormErrors(errors);
    return !errors.password && !errors.confirmPassword && !errors.email;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !userType) return;

    const userData: any = {
      type: userType,
      email: formData.email,
      password: formData.password,
      name: formData.name,
      phone: formData.phone,
      neighborhood: formData.neighborhood,
    };

    if (userType === 'hero') {
      userData.transportMethod = formData.transportMethod;
    }

    const success = await register(userData);

    if (success) {
      // Redirect based on user type
      if (userType === 'hero') {
        router.push('/hero/dashboard');
      } else {
        router.push('/requester/dashboard');
      }
    }
  };

  if (step === 'type') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-green-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Heart className="h-8 w-8 text-primary" fill="currentColor" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">Join Community Food Connect</h1>
            <p className="text-muted-foreground">How would you like to participate?</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => handleTypeSelect('hero')}>
              <CardHeader>
                <div className="bg-secondary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
                  <span className="text-2xl">🦸</span>
                </div>
                <CardTitle>Community Hero</CardTitle>
                <CardDescription>
                  Volunteer to deliver food to those in need
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>✓ Earn points for every delivery</li>
                  <li>✓ Unlock badges and rewards</li>
                  <li>✓ Make a difference in your community</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => handleTypeSelect('requester')}>
              <CardHeader>
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
                  <span className="text-2xl">🤝</span>
                </div>
                <CardTitle>Request Assistance</CardTitle>
                <CardDescription>
                  Get food delivered from local resources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>✓ Easy request process</li>
                  <li>✓ Track your delivery status</li>
                  <li>✓ Access to local food banks</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep('type')}
            className="w-fit mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <CardTitle>
            {userType === 'hero' ? 'Become a Community Hero' : 'Request Assistance'}
          </CardTitle>
          <CardDescription>
            Create your account to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
              />
              {formErrors.email && (
                <p className="text-sm text-destructive">{formErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(902) 555-1234"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="neighborhood">Neighborhood</Label>
              <Input
                id="neighborhood"
                type="text"
                required
                value={formData.neighborhood}
                onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                placeholder="North End, Halifax"
              />
            </div>

            {userType === 'hero' && (
              <div className="space-y-2">
                <Label htmlFor="transport">Transportation Method</Label>
                <Select
                  value={formData.transportMethod}
                  onValueChange={(value: TransportMethod) =>
                    setFormData({ ...formData, transportMethod: value })
                  }
                >
                  <SelectTrigger id="transport">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="walking">Walking</SelectItem>
                    <SelectItem value="bike">Bike</SelectItem>
                    <SelectItem value="transit">Public Transit</SelectItem>
                    <SelectItem value="car">Car</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
              />
              {formErrors.password && (
                <p className="text-sm text-destructive">{formErrors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="••••••••"
              />
              {formErrors.confirmPassword && (
                <p className="text-sm text-destructive">{formErrors.confirmPassword}</p>
              )}
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 p-3 rounded">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>

            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
