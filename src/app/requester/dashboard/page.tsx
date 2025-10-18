'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Package, Clock, CheckCircle, LogOut, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BottomNav } from '@/components/shared/BottomNav';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useAuthStore, useRequesterUser } from '@/store/authStore';
import { getRequestsByUser } from '@/lib/localStorage';
import { FOOD_TYPE_LABELS, QUANTITY_LABELS } from '@/lib/constants';
import type { FoodRequest } from '@/lib/types';
import { format } from 'date-fns';

export default function RequesterDashboardPage() {
  const router = useRouter();
  const requester = useRequesterUser();
  const { logout } = useAuthStore();
  const [requests, setRequests] = useState<FoodRequest[]>([]);
  const [activeRequests, setActiveRequests] = useState<FoodRequest[]>([]);

  useEffect(() => {
    if (!requester) {
      router.push('/auth/login');
      return;
    }

    const myRequests = getRequestsByUser(requester.id, true);
    setRequests(myRequests);

    const active = myRequests.filter(
      (r) => r.status === 'pending' || r.status === 'accepted' || r.status === 'in_progress'
    );
    setActiveRequests(active);
  }, [requester, router]);

  if (!requester) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const completedRequests = requests.filter((r) => r.status === 'completed');

  return (
    <div className="min-h-screen bg-background pb-bottom-nav">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 safe-top">
        <div className="container mx-auto max-w-screen-xl">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">Hello, {requester.name.split(' ')[0]}! 👋</h1>
              <p className="text-white/80 text-sm">We're here to help</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-white hover:bg-white/20"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-screen-xl p-4 space-y-6">
        {/* Primary CTA */}
        <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-primary/20 p-3 rounded-full">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold">Need Food Assistance?</h2>
                <p className="text-sm text-muted-foreground">
                  Request a delivery from local food banks
                </p>
              </div>
            </div>
            <Button asChild className="w-full h-12">
              <Link href="/requester/new-request">
                <Plus className="h-5 w-5 mr-2" />
                Request Food Delivery
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Clock className="h-8 w-8 text-secondary mb-2" />
                <div className="text-2xl font-bold">{activeRequests.length}</div>
                <div className="text-sm text-muted-foreground">Active Requests</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <CheckCircle className="h-8 w-8 text-primary mb-2" />
                <div className="text-2xl font-bold">{completedRequests.length}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Requests */}
        {activeRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Active Requests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeRequests.map((request) => (
                <Link key={request.id} href={`/requester/my-requests/${request.id}`}>
                  <div className="p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold">
                          {FOOD_TYPE_LABELS[request.foodType]}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {QUANTITY_LABELS[request.quantity]}
                        </p>
                      </div>
                      <StatusBadge status={request.status} />
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>
                        Requested {format(new Date(request.createdAt), 'MMM d, yyyy')}
                      </p>
                      {request.status === 'accepted' && (
                        <p className="text-primary font-medium">
                          A Community Hero has accepted your request!
                        </p>
                      )}
                      {request.status === 'in_progress' && (
                        <p className="text-secondary font-medium">
                          Your delivery is on the way!
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start h-auto p-4">
              <Link href="/requester/my-requests">
                <div className="flex items-center gap-3">
                  <div className="bg-secondary/10 p-2 rounded-lg">
                    <Package className="h-5 w-5 text-secondary" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">My Requests</div>
                    <div className="text-xs text-muted-foreground">
                      View all your food requests
                    </div>
                  </div>
                </div>
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full justify-start h-auto p-4">
              <Link href="/resources">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Food Resources</div>
                    <div className="text-xs text-muted-foreground">
                      Find food banks & farmers markets
                    </div>
                  </div>
                </div>
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Completed Deliveries */}
        {completedRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Deliveries</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {completedRequests.slice(0, 3).map((request) => (
                <div key={request.id} className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {FOOD_TYPE_LABELS[request.foodType]} • {QUANTITY_LABELS[request.quantity]}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Completed {format(new Date(request.completedAt!), 'MMM d, yyyy')}
                      </div>
                    </div>
                    <StatusBadge status={request.status} />
                  </div>
                  {!request.rating && (
                    <Link href={`/requester/my-requests/${request.id}/rate`}>
                      <Button variant="link" size="sm" className="p-0 h-auto mt-2 text-xs">
                        Rate this delivery →
                      </Button>
                    </Link>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* First time user help */}
        {requests.length === 0 && (
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Welcome! 🌟</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                We connect you with Community Heroes who will pick up and deliver food from
                local food banks and farmers markets directly to your door.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <div className="text-primary mt-0.5">✓</div>
                  <div>Easy request process</div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="text-primary mt-0.5">✓</div>
                  <div>Track your delivery in real-time</div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="text-primary mt-0.5">✓</div>
                  <div>Free service from caring volunteers</div>
                </div>
              </div>
              <Button asChild className="w-full">
                <Link href="/requester/new-request">Get Started</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNav userType="requester" />
    </div>
  );
}
