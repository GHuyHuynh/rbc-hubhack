'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, Award, Star, Gift, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BottomNav } from '@/components/shared/BottomNav';
import { PointsBadge } from '@/components/shared/PointsBadge';
import { useAuthStore, useHero } from '@/store/authStore';
import { getLevelInfo, getAvailableCoupons, claimCoupon } from '@/lib/gamification';
import { BADGES, LEVEL_ORDER, COUPON_TIERS } from '@/lib/constants';
import type { Coupon } from '@/lib/types';

export default function HeroProfilePage() {
  const router = useRouter();
  const hero = useHero();
  const { logout, refreshUser } = useAuthStore();
  const [claimedCoupons, setClaimedCoupons] = useState<any[]>([]);

  useEffect(() => {
    if (!hero) {
      router.push('/auth/login');
      return;
    }
  }, [hero, router]);

  if (!hero) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  const levelInfo = getLevelInfo(hero);
  const availableCoupons = getAvailableCoupons(hero);
  const earnedBadges = hero.badges.map((badgeId) => BADGES[badgeId]);
  const allBadges = Object.values(BADGES);
  const lockedBadges = allBadges.filter((badge) => !hero.badges.includes(badge.id));

  const handleClaimCoupon = (couponId: string) => {
    try {
      const coupon = claimCoupon(hero, couponId);
      if (coupon) {
        alert(`Coupon claimed! Your code: ${couponId.toUpperCase()}`);
        refreshUser();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background pb-bottom-nav">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 safe-top">
        <div className="container mx-auto max-w-screen-xl">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-4 rounded-full">
                <User className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{hero.name}</h1>
                <p className="text-white/80 text-sm">{hero.neighborhood}</p>
                <p className="text-white/80 text-sm">{hero.email}</p>
              </div>
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
        {/* Leaderboard Quick Link */}
        <Card
          className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200 cursor-pointer hover:shadow-lg transition-all duration-200"
          onClick={() => router.push('/hero/leaderboard')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 p-3 rounded-full">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">View Leaderboard</h3>
                  <p className="text-sm text-gray-600">See how you rank among heroes</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-yellow-700">
                View →
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Your Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{hero.totalDeliveries}</div>
                <div className="text-xs text-muted-foreground">Deliveries</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-secondary">
                  {hero.averageRating > 0 ? hero.averageRating.toFixed(1) : '-'}
                </div>
                <div className="text-xs text-muted-foreground">Avg Rating</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent">{hero.badges.length}</div>
                <div className="text-xs text-muted-foreground">Badges</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Level Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Level Progress</CardTitle>
            <CardDescription>
              {levelInfo.next
                ? `${levelInfo.pointsToNext} points until ${levelInfo.next.name}`
                : 'Maximum level reached!'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Level {hero.level + 1}: {levelInfo.current.name}</span>
                <span className="font-medium">{levelInfo.progress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all"
                  style={{ width: `${levelInfo.progress}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Earned Badges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-accent" />
              Your Badges ({earnedBadges.length}/{allBadges.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {earnedBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="p-4 bg-accent/10 border border-accent/20 rounded-lg"
                >
                  <div className="text-3xl mb-2">{badge.icon}</div>
                  <div className="font-semibold text-sm">{badge.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {badge.description}
                  </div>
                </div>
              ))}
            </div>

            {lockedBadges.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold text-sm mb-3 text-muted-foreground">
                  Locked Badges
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {lockedBadges.map((badge) => (
                    <div
                      key={badge.id}
                      className="p-4 bg-muted/50 border border-border rounded-lg opacity-50"
                    >
                      <div className="text-3xl mb-2 grayscale">{badge.icon}</div>
                      <div className="font-semibold text-sm">{badge.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {badge.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rewards */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              Rewards & Coupons
            </CardTitle>
            <CardDescription>
              Redeem your points for exclusive discounts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {COUPON_TIERS.map((coupon) => {
              const canClaim = hero.points >= coupon.pointsRequired;
              const alreadyClaimed = hero.claimedCoupons.includes(coupon.id);

              return (
                <div
                  key={coupon.id}
                  className={`p-4 rounded-lg border ${
                    alreadyClaimed
                      ? 'bg-primary/5 border-primary/20'
                      : canClaim
                      ? 'bg-accent/5 border-accent/20'
                      : 'bg-muted/50 border-border opacity-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">${coupon.value} {coupon.business}</h4>
                        {alreadyClaimed && (
                          <Badge variant="secondary" className="text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Claimed
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{coupon.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {coupon.pointsRequired} points required
                      </p>
                    </div>
                    <div className="ml-4">
                      {alreadyClaimed ? (
                        <Button size="sm" variant="outline" disabled>
                          Claimed
                        </Button>
                      ) : canClaim ? (
                        <Button
                          size="sm"
                          onClick={() => handleClaimCoupon(coupon.id)}
                        >
                          Claim
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" disabled>
                          Locked
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{hero.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone</span>
              <span className="font-medium">{hero.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Neighborhood</span>
              <span className="font-medium">{hero.neighborhood}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Transportation</span>
              <span className="font-medium capitalize">{hero.transportMethod}</span>
            </div>
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Button onClick={handleLogout} variant="outline" className="w-full">
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>

      <BottomNav userType="hero" />
    </div>
  );
}
