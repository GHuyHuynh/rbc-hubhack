'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BottomNav } from '@/components/shared/BottomNav';
import { useRequesterUser } from '@/store/authStore';
import { createRequest } from '@/lib/localStorage';
import type { FoodType, Quantity } from '@/lib/types';
import { HALIFAX_CENTER } from '@/lib/constants';

export default function NewRequestPage() {
  const router = useRouter();
  const requester = useRequesterUser();

  const [formData, setFormData] = useState({
    foodType: '' as FoodType,
    quantity: '' as Quantity,
    deliveryAddress: '',
    preferredDate: '',
    preferredStartTime: '',
    preferredEndTime: '',
    specialNotes: '',
    contactMethod: 'phone',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!requester) {
    router.push('/auth/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.foodType || !formData.quantity || !formData.deliveryAddress || !formData.preferredDate) {
        setError('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }

      // Create datetime objects for preferred time
      const preferredStart = new Date(`${formData.preferredDate}T${formData.preferredStartTime || '09:00'}`);
      const preferredEnd = new Date(`${formData.preferredDate}T${formData.preferredEndTime || '17:00'}`);

      // Simple geocoding - in production, use real geocoding API
      // For demo, use Halifax center with small random offset
      const deliveryLat = HALIFAX_CENTER.lat + (Math.random() - 0.5) * 0.02;
      const deliveryLng = HALIFAX_CENTER.lng + (Math.random() - 0.5) * 0.02;

      const newRequest = createRequest({
        requesterId: requester.id,
        foodType: formData.foodType,
        quantity: formData.quantity,
        deliveryAddress: formData.deliveryAddress,
        deliveryLat,
        deliveryLng,
        preferredTimeStart: preferredStart.toISOString(),
        preferredTimeEnd: preferredEnd.toISOString(),
        specialNotes: formData.specialNotes,
        contactMethod: formData.contactMethod,
      });

      if (newRequest) {
        router.push('/requester/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create request');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-background pb-bottom-nav">
      {/* Header */}
      <div className="bg-card border-b border-border p-4 safe-top sticky top-0 z-10">
        <div className="container mx-auto max-w-screen-xl">
          <Link
            href="/requester/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
          <h1 className="text-2xl font-bold">Request Food Delivery</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Fill out the form below and a Community Hero will help you
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-screen-xl p-4">
        <Card>
          <CardHeader>
            <CardTitle>Delivery Details</CardTitle>
            <CardDescription>
              Tell us what you need and when you need it
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Food Type */}
              <div className="space-y-2">
                <Label htmlFor="foodType">
                  What type of food do you need? <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.foodType}
                  onValueChange={(value: FoodType) =>
                    setFormData({ ...formData, foodType: value })
                  }
                  required
                >
                  <SelectTrigger id="foodType">
                    <SelectValue placeholder="Select food type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="produce">🥬 Fresh Produce</SelectItem>
                    <SelectItem value="canned_goods">🥫 Canned Goods</SelectItem>
                    <SelectItem value="bread">🍞 Bread & Bakery</SelectItem>
                    <SelectItem value="dairy">🥛 Dairy Products</SelectItem>
                    <SelectItem value="mixed">📦 Mixed Box</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <Label htmlFor="quantity">
                  How much do you need? <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.quantity}
                  onValueChange={(value: Quantity) =>
                    setFormData({ ...formData, quantity: value })
                  }
                  required
                >
                  <SelectTrigger id="quantity">
                    <SelectValue placeholder="Select quantity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single Person</SelectItem>
                    <SelectItem value="family_2_4">Family of 2-4</SelectItem>
                    <SelectItem value="family_5_plus">Family of 5+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Delivery Address */}
              <div className="space-y-2">
                <Label htmlFor="address">
                  Delivery Address <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="address"
                    type="text"
                    required
                    value={formData.deliveryAddress}
                    onChange={(e) =>
                      setFormData({ ...formData, deliveryAddress: e.target.value })
                    }
                    placeholder="123 Main Street, Halifax, NS"
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter your full address including street, city, and postal code
                </p>
              </div>

              {/* Preferred Date */}
              <div className="space-y-2">
                <Label htmlFor="date">
                  Preferred Delivery Date <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="date"
                    type="date"
                    required
                    min={today}
                    value={formData.preferredDate}
                    onChange={(e) =>
                      setFormData({ ...formData, preferredDate: e.target.value })
                    }
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Preferred Time Window */}
              <div className="space-y-2">
                <Label>Preferred Time Window (optional)</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime" className="text-xs text-muted-foreground">
                      From
                    </Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.preferredStartTime}
                      onChange={(e) =>
                        setFormData({ ...formData, preferredStartTime: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime" className="text-xs text-muted-foreground">
                      To
                    </Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.preferredEndTime}
                      onChange={(e) =>
                        setFormData({ ...formData, preferredEndTime: e.target.value })
                      }
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Leave blank for anytime between 9am - 5pm
                </p>
              </div>

              {/* Contact Method */}
              <div className="space-y-2">
                <Label htmlFor="contactMethod">Preferred Contact Method</Label>
                <Select
                  value={formData.contactMethod}
                  onValueChange={(value) =>
                    setFormData({ ...formData, contactMethod: value })
                  }
                >
                  <SelectTrigger id="contactMethod">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">Phone Call</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Special Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Special Notes or Dietary Restrictions (optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.specialNotes}
                  onChange={(e) =>
                    setFormData({ ...formData, specialNotes: e.target.value })
                  }
                  placeholder="e.g., Allergies, dietary preferences, special instructions..."
                  rows={4}
                />
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <Button type="submit" className="w-full h-12 text-lg" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting Request...' : 'Submit Request'}
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-3">
                  A Community Hero will be notified of your request
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <BottomNav userType="requester" />
    </div>
  );
}
