'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BottomNav } from '@/components/shared/BottomNav';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useRequesterUser } from '@/store/authStore';
import { getRequestsByUser } from '@/lib/localStorage';
import { FOOD_TYPE_LABELS, QUANTITY_LABELS } from '@/lib/constants';
import type { FoodRequest, RequestStatus } from '@/lib/types';
import { format } from 'date-fns';

export default function MyRequestsPage() {
  const router = useRouter();
  const requester = useRequesterUser();
  const [requests, setRequests] = useState<FoodRequest[]>([]);
  const [filter, setFilter] = useState<'all' | RequestStatus>('all');

  useEffect(() => {
    if (!requester) {
      router.push('/auth/login');
      return;
    }

    const myRequests = getRequestsByUser(requester.id, true);
    // Sort by created date, newest first
    const sorted = myRequests.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setRequests(sorted);
  }, [requester, router]);

  if (!requester) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  const filteredRequests = filter === 'all'
    ? requests
    : requests.filter(r => r.status === filter);

  const getStatusMessage = (request: FoodRequest) => {
    switch (request.status) {
      case 'pending':
        return 'Waiting for a Community Hero to accept';
      case 'accepted':
        return 'A Community Hero has accepted your request!';
      case 'in_progress':
        return 'Your delivery is on the way!';
      case 'completed':
        return `Completed ${format(new Date(request.completedAt!), 'MMM d, h:mm a')}`;
      case 'cancelled':
        return 'Request cancelled';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-bottom-nav">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white p-4 safe-top sticky top-0 z-10">
        <div className="container mx-auto max-w-screen-xl">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">My Requests</h1>
              <p className="text-sm text-white/80">{requests.length} total requests</p>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            <Button
              variant={filter === 'all' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setFilter('all')}
              className={filter === 'all' ? '' : 'text-white hover:bg-white/20'}
            >
              All ({requests.length})
            </Button>
            <Button
              variant={filter === 'pending' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setFilter('pending')}
              className={filter === 'pending' ? '' : 'text-white hover:bg-white/20'}
            >
              Pending ({requests.filter(r => r.status === 'pending').length})
            </Button>
            <Button
              variant={filter === 'accepted' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setFilter('accepted')}
              className={filter === 'accepted' ? '' : 'text-white hover:bg-white/20'}
            >
              Accepted ({requests.filter(r => r.status === 'accepted').length})
            </Button>
            <Button
              variant={filter === 'in_progress' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setFilter('in_progress')}
              className={filter === 'in_progress' ? '' : 'text-white hover:bg-white/20'}
            >
              In Progress ({requests.filter(r => r.status === 'in_progress').length})
            </Button>
            <Button
              variant={filter === 'completed' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setFilter('completed')}
              className={filter === 'completed' ? '' : 'text-white hover:bg-white/20'}
            >
              Completed ({requests.filter(r => r.status === 'completed').length})
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-screen-xl p-4 space-y-4">
        {/* Request List */}
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold mb-1">No requests found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {filter === 'all'
                  ? "You haven't made any food requests yet."
                  : `You don't have any ${filter} requests.`}
              </p>
              <Button asChild>
                <Link href="/requester/new-request">Request Food Delivery</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Link key={request.id} href={`/requester/my-requests/${request.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">
                        {FOOD_TYPE_LABELS[request.foodType]}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {QUANTITY_LABELS[request.quantity]}
                      </p>
                    </div>
                    <StatusBadge status={request.status} />
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-muted-foreground">📍</span>
                      <span className="text-muted-foreground">
                        {request.deliveryAddress.split(',')[0]}
                      </span>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="text-muted-foreground">🕐</span>
                      <span className="text-muted-foreground">
                        {format(new Date(request.preferredTimeStart), 'MMM d, h:mm a')} - {format(new Date(request.preferredTimeEnd), 'h:mm a')}
                      </span>
                    </div>

                    <div className={`font-medium mt-3 ${
                      request.status === 'accepted' || request.status === 'in_progress'
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    }`}>
                      {getStatusMessage(request)}
                    </div>
                  </div>

                  {request.status === 'completed' && !request.rating && (
                    <div className="mt-4 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={(e) => {
                          e.preventDefault();
                          router.push(`/requester/my-requests/${request.id}/rate`);
                        }}
                      >
                        Rate this delivery
                      </Button>
                    </div>
                  )}

                  {request.status === 'completed' && request.rating && (
                    <div className="mt-4 pt-4 border-t flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Your rating:</span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={i < request.rating!.stars ? 'text-yellow-500' : 'text-gray-300'}>
                            ⭐
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>

      <BottomNav userType="requester" />
    </div>
  );
}
