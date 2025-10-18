'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, MapPin, Clock, User, Phone, Star, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BottomNav } from '@/components/shared/BottomNav';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useRequesterUser } from '@/store/authStore';
import { getRequestById, getUserById } from '@/lib/localStorage';
import { FOOD_TYPE_LABELS, QUANTITY_LABELS } from '@/lib/constants';
import type { FoodRequest, Hero } from '@/lib/types';
import { format } from 'date-fns';

export default function RequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const requester = useRequesterUser();
  const [request, setRequest] = useState<FoodRequest | null>(null);
  const [hero, setHero] = useState<Hero | null>(null);

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

    setRequest(foundRequest);

    // Get hero info if request has been accepted
    if (foundRequest.heroId) {
      const foundHero = getUserById(foundRequest.heroId) as Hero;
      setHero(foundHero);
    }
  }, [requester, params.id, router]);

  if (!requester || !request) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  const getStatusTimeline = () => {
    const timeline = [
      {
        label: 'Request Created',
        time: request.createdAt,
        completed: true,
        icon: Package,
      },
      {
        label: 'Hero Accepted',
        time: request.acceptedAt,
        completed: !!request.acceptedAt,
        icon: User,
      },
      {
        label: 'Delivery In Progress',
        time: request.inProgressAt,
        completed: !!request.inProgressAt,
        icon: MapPin,
      },
      {
        label: 'Delivered',
        time: request.completedAt,
        completed: !!request.completedAt,
        icon: CheckCircle,
      },
    ];

    return timeline;
  };

  const timeline = getStatusTimeline();

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
              <h1 className="text-xl font-bold">Request Details</h1>
              <p className="text-sm text-white/80">
                {format(new Date(request.createdAt), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-screen-xl p-4 space-y-4">
        {/* Status Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Status</h2>
              <StatusBadge status={request.status} />
            </div>

            {/* Timeline */}
            <div className="space-y-4">
              {timeline.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="flex items-start gap-3">
                    <div className={`
                      flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                      ${item.completed ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}
                    `}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 pt-1">
                      <div className={`font-medium ${item.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {item.label}
                      </div>
                      {item.time && (
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(item.time), 'MMM d, h:mm a')}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Request Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Food Type</div>
              <div className="font-semibold">{FOOD_TYPE_LABELS[request.foodType]}</div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-1">Quantity</div>
              <div className="font-semibold">{QUANTITY_LABELS[request.quantity]}</div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-1">Delivery Address</div>
              <div className="font-medium">{request.deliveryAddress}</div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-1">Preferred Time</div>
              <div className="font-medium">
                {format(new Date(request.preferredTimeStart), 'MMM d, h:mm a')} - {format(new Date(request.preferredTimeEnd), 'h:mm a')}
              </div>
            </div>

            {request.specialNotes && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Special Notes</div>
                <div className="font-medium text-sm bg-muted p-3 rounded-lg">
                  {request.specialNotes}
                </div>
              </div>
            )}

            <div>
              <div className="text-sm text-muted-foreground mb-1">Contact Method</div>
              <div className="font-medium">{request.contactMethod}</div>
            </div>
          </CardContent>
        </Card>

        {/* Hero Info */}
        {hero && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Community Hero</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-4 rounded-full">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{hero.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <MapPin className="h-4 w-4" />
                    <span>{hero.neighborhood}</span>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold">{hero.averageRating.toFixed(1)}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {hero.totalDeliveries} deliveries
                    </div>
                  </div>

                  {request.status !== 'completed' && (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                      <div className="text-sm font-medium text-primary mb-1">
                        {request.status === 'accepted' && '✓ Your request has been accepted'}
                        {request.status === 'in_progress' && '🚗 Your delivery is on the way!'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {hero.name} will contact you using your preferred method
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rating Section */}
        {request.status === 'completed' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Delivery Rating</CardTitle>
            </CardHeader>
            <CardContent>
              {request.rating ? (
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Your rating</div>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-6 w-6 ${
                            i < request.rating!.stars
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {request.rating.feedback && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Your feedback</div>
                      <div className="text-sm bg-muted p-3 rounded-lg">
                        {request.rating.feedback}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-muted-foreground mb-1">Timeliness</div>
                      <Badge variant="secondary" className="capitalize">
                        {request.rating.timeliness.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Food Quality</div>
                      <Badge variant="secondary" className="capitalize">
                        {request.rating.foodQuality}
                      </Badge>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">
                    How was your delivery experience?
                  </p>
                  <Button asChild>
                    <Link href={`/requester/my-requests/${request.id}/rate`}>
                      Rate This Delivery
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        {request.status === 'pending' && (
          <Card className="bg-muted">
            <CardContent className="pt-6 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Waiting for a Community Hero</h3>
              <p className="text-sm text-muted-foreground mb-4">
                We're looking for a volunteer to accept your request. You'll be notified when someone accepts!
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNav userType="requester" />
    </div>
  );
}
