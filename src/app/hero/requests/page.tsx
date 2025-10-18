'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Clock, Package, Star, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BottomNav } from '@/components/shared/BottomNav';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useHero } from '@/store/authStore';
import { getPendingRequests } from '@/lib/localStorage';
import { FOOD_TYPE_LABELS, QUANTITY_LABELS } from '@/lib/constants';
import type { FoodRequest } from '@/lib/types';
import { formatDistance, calculateDistance } from '@/lib/utils';
import { format } from 'date-fns';

export default function BrowseRequestsPage() {
  const router = useRouter();
  const hero = useHero();
  const [requests, setRequests] = useState<FoodRequest[]>([]);
  const [sortedRequests, setSortedRequests] = useState<FoodRequest[]>([]);

  useEffect(() => {
    if (!hero) {
      router.push('/auth/login');
      return;
    }

    const pending = getPendingRequests();
    setRequests(pending);
    setSortedRequests(pending);
  }, [hero, router]);

  if (!hero) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  const getRequestDistance = (request: FoodRequest): number => {
    // Simplified: use Halifax center as hero location for demo
    // In production, would use hero's actual location
    return calculateDistance(44.6488, -63.5752, request.deliveryLat, request.deliveryLng);
  };

  const isFirstTimeRequester = (request: FoodRequest): boolean => {
    // Simplified check for demo
    return Math.random() > 0.7; // 30% chance for demo
  };

  return (
    <div className="min-h-screen bg-background pb-bottom-nav">
      {/* Header */}
      <div className="bg-card border-b border-border p-4 safe-top sticky top-0 z-10">
        <div className="container mx-auto max-w-screen-xl">
          <h1 className="text-2xl font-bold mb-1">Available Requests</h1>
          <p className="text-sm text-muted-foreground">
            {requests.length} {requests.length === 1 ? 'person' : 'people'} need your help
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-screen-xl p-4 space-y-4">
        {requests.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No requests available</h3>
              <p className="text-muted-foreground text-sm">
                Check back later for new food delivery requests
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {sortedRequests.map((request) => {
              const distance = getRequestDistance(request);
              const isFirstTime = isFirstTimeRequester(request);
              const timeWindow = `${format(new Date(request.preferredTimeStart), 'h:mm a')} - ${format(new Date(request.preferredTimeEnd), 'h:mm a')}`;

              return (
                <Link key={request.id} href={`/hero/requests/${request.id}`}>
                  <Card className="hover:border-primary transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">
                              {FOOD_TYPE_LABELS[request.foodType]}
                            </h3>
                            {isFirstTime && (
                              <Badge variant="secondary" className="text-xs">
                                <Star className="h-3 w-3 mr-1" />
                                First request
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {QUANTITY_LABELS[request.quantity]}
                          </p>
                        </div>
                        <StatusBadge status={request.status} />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {request.deliveryAddress.split(',')[0]} • {formatDistance(distance)} away
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {format(new Date(request.preferredTimeStart), 'MMM d')} • {timeWindow}
                          </span>
                        </div>

                        {request.specialNotes && (
                          <div className="mt-3 p-2 bg-muted rounded text-sm">
                            <span className="font-medium">Note:</span> {request.specialNotes}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-sm font-medium text-primary">
                          <span>Earn 100+ points</span>
                          {isFirstTime && <span className="text-accent">(+50 bonus)</span>}
                        </div>
                        <Button size="sm">View Details</Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </>
        )}
      </div>

      <BottomNav userType="hero" />
    </div>
  );
}
