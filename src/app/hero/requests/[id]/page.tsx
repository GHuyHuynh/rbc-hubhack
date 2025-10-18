'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Clock, Phone, Mail, CheckCircle, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BottomNav } from '@/components/shared/BottomNav';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useHero } from '@/store/authStore';
import { getRequestById, acceptRequest, getActiveRequestsForHero, markRequestInProgress, completeRequest } from '@/lib/localStorage';
import { FOOD_TYPE_LABELS, QUANTITY_LABELS } from '@/lib/constants';
import { awardPoints, determineBonuses, checkAndAwardBadges } from '@/lib/gamification';
import type { FoodRequest } from '@/lib/types';
import { calculateDistance, formatDistance } from '@/lib/utils';
import { format } from 'date-fns';
import foodBanksData from '@/data/foodBanks.json';

export default function RequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const hero = useHero();
  const [request, setRequest] = useState<FoodRequest | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestId = params.id as string;

  useEffect(() => {
    if (!hero) {
      router.push('/auth/login');
      return;
    }

    loadRequest();
  }, [hero, requestId, router]);

  const loadRequest = () => {
    const req = getRequestById(requestId);
    if (!req) {
      router.push('/hero/requests');
      return;
    }
    setRequest(req);
  };

  if (!hero || !request) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  const handleAcceptRequest = async () => {
    setIsAccepting(true);
    setError(null);

    try {
      const activeRequests = getActiveRequestsForHero(hero.id);
      if (activeRequests.length >= 3) {
        setError('You can only have 3 active requests at a time. Complete some deliveries first!');
        setIsAccepting(false);
        return;
      }

      const updatedRequest = acceptRequest(requestId, hero.id);
      if (updatedRequest) {
        setRequest(updatedRequest);
        // Show success and redirect
        setTimeout(() => {
          router.push('/hero/dashboard');
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAccepting(false);
    }
  };

  const handleMarkInProgress = () => {
    const updated = markRequestInProgress(requestId);
    if (updated) setRequest(updated);
  };

  const handleCompleteDelivery = () => {
    const updated = completeRequest(requestId);
    if (updated) {
      setRequest(updated);

      // Award points and badges
      const bonuses = determineBonuses(hero, updated);
      const pointsEarned = 100; // Base points
      const updatedHero = awardPoints(hero, pointsEarned);
      const newBadges = checkAndAwardBadges(updatedHero);

      // Show success message (in production, show a modal with points/badges earned)
      alert(`Delivery completed! You earned ${pointsEarned} points!`);
      router.push('/hero/dashboard');
    }
  };

  // Find nearby food banks
  const nearbyFoodBanks = foodBanksData
    .map((bank) => ({
      ...bank,
      distance: calculateDistance(bank.lat, bank.lng, request.deliveryLat, request.deliveryLng),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3);

  const timeWindow = `${format(new Date(request.preferredTimeStart), 'h:mm a')} - ${format(new Date(request.preferredTimeEnd), 'h:mm a')}`;

  const canAccept = request.status === 'pending';
  const canMarkInProgress = request.status === 'accepted' && request.heroId === hero.id;
  const canComplete = request.status === 'in_progress' && request.heroId === hero.id;
  const isMyRequest = request.heroId === hero.id;

  return (
    <div className="min-h-screen bg-background pb-bottom-nav">
      {/* Header */}
      <div className="bg-card border-b border-border p-4 safe-top sticky top-0 z-10">
        <div className="container mx-auto max-w-screen-xl">
          <Link
            href="/hero/requests"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to requests
          </Link>
          <h1 className="text-2xl font-bold">Request Details</h1>
        </div>
      </div>

      <div className="container mx-auto max-w-screen-xl p-4 space-y-4">
        {/* Request Info */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">
                  {FOOD_TYPE_LABELS[request.foodType]}
                </CardTitle>
                <p className="text-muted-foreground">
                  {QUANTITY_LABELS[request.quantity]}
                </p>
              </div>
              <StatusBadge status={request.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Delivery Address</p>
                <p className="text-sm text-muted-foreground">{request.deliveryAddress}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Preferred Time</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(request.preferredTimeStart), 'EEEE, MMM d, yyyy')} • {timeWindow}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Contact Method</p>
                <p className="text-sm text-muted-foreground capitalize">{request.contactMethod}</p>
              </div>
            </div>

            {request.specialNotes && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium mb-1">Special Notes</p>
                <p className="text-sm text-muted-foreground">{request.specialNotes}</p>
              </div>
            )}

            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">You'll earn</p>
                  <p className="text-xl font-bold text-primary">100+ points</p>
                </div>
                {canAccept && (
                  <Badge variant="secondary" className="text-sm">
                    +50 on-time bonus available
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Suggested Food Banks */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Suggested Food Banks Nearby</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {nearbyFoodBanks.map((bank) => (
              <div key={bank.id} className="p-3 bg-muted rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{bank.name}</h4>
                    <p className="text-xs text-muted-foreground">{bank.address}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {formatDistance(bank.distance)}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  <p>Open today: {bank.hours.monday}</p>
                  <p>Phone: {bank.phone}</p>
                </div>
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 h-auto mt-2 text-xs"
                  asChild
                >
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(bank.address)}&travelmode=transit`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Get transit directions →
                  </a>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
            {error}
          </div>
        )}

        {canAccept && (
          <Button
            className="w-full h-14 text-lg"
            onClick={handleAcceptRequest}
            disabled={isAccepting}
          >
            {isAccepting ? 'Accepting...' : 'Accept This Request'}
          </Button>
        )}

        {canMarkInProgress && (
          <Button
            className="w-full h-14 text-lg"
            onClick={handleMarkInProgress}
            variant="secondary"
          >
            <Package className="h-5 w-5 mr-2" />
            Mark as In Progress
          </Button>
        )}

        {canComplete && (
          <Button
            className="w-full h-14 text-lg"
            onClick={handleCompleteDelivery}
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            Complete Delivery
          </Button>
        )}

        {!isMyRequest && !canAccept && request.status !== 'pending' && (
          <div className="p-4 bg-muted rounded-lg text-center text-sm text-muted-foreground">
            This request has been accepted by another Community Hero
          </div>
        )}
      </div>

      <BottomNav userType="hero" />
    </div>
  );
}
