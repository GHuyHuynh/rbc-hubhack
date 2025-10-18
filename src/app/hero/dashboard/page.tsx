'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, MapPin, TrendingUp, Award, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BottomNav } from '@/components/shared/BottomNav';
import { PointsBadge } from '@/components/shared/PointsBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useAuthStore, useHero } from '@/store/authStore';
import { getActiveRequestsForHero, getPendingRequests, getAllRequests } from '@/lib/localStorage';
import { getLevelInfo } from '@/lib/gamification';
import { BADGES } from '@/lib/constants';
import type { FoodRequest } from '@/lib/types';
import { format } from 'date-fns';

export default function HeroDashboardPage() {
  const router = useRouter();
  const hero = useHero();
  const { logout } = useAuthStore();
  const [activeRequests, setActiveRequests] = useState<FoodRequest[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    // Redirect if not hero
    if (!hero) {
      router.push('/auth/login');
      return;
    }

    // Load active requests
    const active = getActiveRequestsForHero(hero.id);
    setActiveRequests(active);

    // Load pending requests count
    const pending = getPendingRequests();
    setPendingCount(pending.length);

    // Load recent completed deliveries
    const allRequests = getAllRequests();
    const completed = allRequests
      .filter((r) => r.heroId === hero.id && r.status === 'completed')
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
      .slice(0, 3);

    setRecentActivity(completed);
  }, [hero, router]);

  if (!hero) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  const levelInfo = getLevelInfo(hero);
  const earnedBadges = hero.badges.map((badgeId) => BADGES[badgeId]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background pb-bottom-nav">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 safe-top">
        <div className="container mx-auto max-w-screen-xl">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">Welcome back, {hero.name.split(' ')[0]}! 👋</h1>
              <p className="text-white/80 text-sm">Ready to make a difference today?</p>
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

          <PointsBadge hero={hero} className="bg-white/10 border-white/20" />
        </div>
      </div>

      <div className="container mx-auto max-w-screen-xl p-4 space-y-6">
        {/* Level Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Your Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Level {hero.level + 1}: {levelInfo.current.name}
                </span>
                {levelInfo.next && (
                  <span className="font-medium">
                    {levelInfo.pointsToNext} pts to {levelInfo.next.name}
                  </span>
                )}
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all"
                  style={{ width: `${levelInfo.progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {levelInfo.progress}% complete
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Package className="h-8 w-8 text-primary mb-2" />
                <div className="text-2xl font-bold">{activeRequests.length}</div>
                <div className="text-sm text-muted-foreground">Active Deliveries</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <MapPin className="h-8 w-8 text-secondary mb-2" />
                <div className="text-2xl font-bold">{pendingCount}</div>
                <div className="text-sm text-muted-foreground">Requests Available</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button asChild className="w-full justify-start h-auto p-4">
              <Link href="/hero/requests">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Package className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Browse Requests</div>
                    <div className="text-xs opacity-90">{pendingCount} people need help</div>
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
                    <div className="text-xs text-muted-foreground">Find food banks & markets</div>
                  </div>
                </div>
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Badges */}
        {earnedBadges.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="h-5 w-5 text-accent" />
                Your Badges ({earnedBadges.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {earnedBadges.slice(0, 6).map((badge) => (
                  <div
                    key={badge.id}
                    className="flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-lg px-3 py-2"
                  >
                    <span className="text-2xl">{badge.icon}</span>
                    <div>
                      <div className="font-medium text-sm">{badge.name}</div>
                    </div>
                  </div>
                ))}
              </div>
              {earnedBadges.length > 6 && (
                <Button asChild variant="link" className="w-full mt-2">
                  <Link href="/hero/profile">View all badges</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Deliveries</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivity.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {request.quantity.replace(/_/g, ' ')} - {request.foodType.replace(/_/g, ' ')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(request.completedAt!), 'MMM d, yyyy')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {request.rating && (
                      <div className="flex items-center gap-1">
                        <span className="text-sm">⭐</span>
                        <span className="text-sm font-medium">{request.rating.stars}</span>
                      </div>
                    )}
                    <StatusBadge status={request.status} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* First time user tip */}
        {hero.totalDeliveries === 0 && (
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Getting Started 🎉</CardTitle>
              <CardDescription>
                Ready for your first delivery? Browse available requests and start earning points!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/hero/requests">View Available Requests</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNav userType="hero" />
    </div>
  );
}
