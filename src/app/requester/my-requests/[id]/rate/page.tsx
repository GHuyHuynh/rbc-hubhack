'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Star, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BottomNav } from '@/components/shared/BottomNav';
import { useRequesterUser, useAuthStore } from '@/store/authStore';
import { getRequestById, updateRequest, getUserById } from '@/lib/localStorage';
import { updateHeroRating } from '@/lib/gamification';
import { FOOD_TYPE_LABELS } from '@/lib/constants';
import type { FoodRequest, Hero, DeliveryTimeliness, FoodQuality } from '@/lib/types';
import { format } from 'date-fns';

export default function RateDeliveryPage() {
  const router = useRouter();
  const params = useParams();
  const requester = useRequesterUser();
  const { refreshUser } = useAuthStore();
  const [request, setRequest] = useState<FoodRequest | null>(null);
  const [hero, setHero] = useState<Hero | null>(null);
  const [stars, setStars] = useState(5);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [timeliness, setTimeliness] = useState<DeliveryTimeliness>('on_time');
  const [foodQuality, setFoodQuality] = useState<FoodQuality>('good');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!requester) {
      router.push('/auth/login');
      return;
    }

    const requestId = params.id as string;
    const foundRequest = getRequestById(requestId);

    if (!foundRequest) {
      router.push('/requester/my-requests');
      return;
    }

    // Verify this request belongs to the current requester
    if (foundRequest.requesterId !== requester.id) {
      router.push('/requester/my-requests');
      return;
    }

    // Verify request is completed
    if (foundRequest.status !== 'completed') {
      router.push(`/requester/my-requests/${requestId}`);
      return;
    }

    // Verify not already rated
    if (foundRequest.rating) {
      router.push(`/requester/my-requests/${requestId}`);
      return;
    }

    setRequest(foundRequest);

    // Get hero info
    if (foundRequest.heroId) {
      const foundHero = getUserById(foundRequest.heroId) as Hero;
      setHero(foundHero);
    }
  }, [requester, params.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!request || !hero || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Update request with rating
      const updated = updateRequest(request.id, {
        rating: {
          stars,
          feedback,
          timeliness,
          foodQuality,
          createdAt: new Date().toISOString(),
        },
      });

      if (updated) {
        // Update hero's average rating
        updateHeroRating(hero);
        refreshUser();

        setIsSuccess(true);

        // Redirect after showing success
        setTimeout(() => {
          router.push(`/requester/my-requests/${request.id}`);
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to submit rating:', error);
      alert('Failed to submit rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!requester || !request || !hero) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Thank You! 🎉</h2>
            <p className="text-muted-foreground">
              Your rating has been submitted. This helps us improve our service!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-bottom-nav">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white p-4 safe-top sticky top-0 z-10">
        <div className="container mx-auto max-w-screen-xl">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Rate Delivery</h1>
              <p className="text-sm text-white/80">
                {FOOD_TYPE_LABELS[request.foodType]}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-screen-xl p-4">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
          {/* Hero Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl">👤</span>
                </div>
                <h3 className="font-semibold text-lg mb-1">{hero.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Delivered on {format(new Date(request.completedAt!), 'MMM d, h:mm a')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Star Rating */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Overall Experience</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center gap-2 mb-2">
                {Array.from({ length: 5 }).map((_, i) => {
                  const starValue = i + 1;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setStars(starValue)}
                      onMouseEnter={() => setHoveredStar(starValue)}
                      onMouseLeave={() => setHoveredStar(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-10 w-10 ${
                          starValue <= (hoveredStar || stars)
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <div className="text-center text-sm text-muted-foreground">
                {stars === 5 && '⭐ Excellent!'}
                {stars === 4 && '👍 Good'}
                {stars === 3 && '😊 Okay'}
                {stars === 2 && '😕 Below Average'}
                {stars === 1 && '😞 Poor'}
              </div>
            </CardContent>
          </Card>

          {/* Timeliness */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Delivery Timeliness</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setTimeliness('on_time')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    timeliness === 'on_time'
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">⏰</div>
                  <div className="text-sm font-medium">On Time</div>
                </button>
                <button
                  type="button"
                  onClick={() => setTimeliness('slightly_late')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    timeliness === 'slightly_late'
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">🕐</div>
                  <div className="text-sm font-medium">Slightly Late</div>
                </button>
                <button
                  type="button"
                  onClick={() => setTimeliness('late')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    timeliness === 'late'
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">⏳</div>
                  <div className="text-sm font-medium">Late</div>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Food Quality */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Food Quality</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setFoodQuality('good')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    foodQuality === 'good'
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">😊</div>
                  <div className="text-sm font-medium">Good</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFoodQuality('acceptable')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    foodQuality === 'acceptable'
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">😐</div>
                  <div className="text-sm font-medium">Acceptable</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFoodQuality('poor')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    foodQuality === 'poor'
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">😞</div>
                  <div className="text-sm font-medium">Poor</div>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Feedback */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Feedback (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your experience with this delivery..."
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Your feedback helps us improve and encourages our Community Heroes
              </p>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Rating'}
          </Button>
        </form>
      </div>

      <BottomNav userType="requester" />
    </div>
  );
}
