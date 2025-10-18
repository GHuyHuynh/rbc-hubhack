'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, TrendingUp, Users, Award, Target, Zap, Flame, ChevronUp } from 'lucide-react';
import { BottomNav } from '@/components/shared/BottomNav';
import { Leaderboard } from '@/components/hero/Leaderboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useHero } from '@/store/authStore';
import { getTopHeroes } from '@/lib/localStorage';
import type { Hero } from '@/lib/types';

export default function LeaderboardPage() {
  const router = useRouter();
  const hero = useHero();
  const [topHeroes, setTopHeroes] = useState<Hero[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    if (!hero) {
      router.push('/auth/login');
      return;
    }

    // Get top 10 heroes
    const heroes = getTopHeroes(10);
    setTopHeroes(heroes);

    // Find current user's rank
    const allHeroes = getTopHeroes(1000); // Get all heroes for ranking
    const rank = allHeroes.findIndex(h => h.id === hero.id) + 1;
    setUserRank(rank > 0 ? rank : null);
  }, [hero, router]);

  // Get the hero just ahead of current user
  const getHeroAhead = () => {
    if (!userRank || userRank <= 1) return null;
    const allHeroes = getTopHeroes(1000);
    return allHeroes[userRank - 2]; // userRank is 1-indexed, array is 0-indexed
  };

  // Get points needed to reach next rank
  const getPointsToNextRank = () => {
    const heroAhead = getHeroAhead();
    if (!heroAhead || !hero) return null;
    return heroAhead.points - hero.points + 1;
  };

  if (!hero) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  const totalHeroes = getTopHeroes(1000).length;
  const heroAhead = getHeroAhead();
  const pointsToNextRank = getPointsToNextRank();

  // Generate motivational message based on rank
  const getMotivationalMessage = () => {
    if (!userRank) return null;

    if (userRank === 1) {
      return {
        title: "You're #1! 👑",
        message: "Amazing work! You're leading the community. Keep it up to stay on top!",
        color: "from-yellow-500 to-amber-600",
        icon: Trophy
      };
    } else if (userRank === 2) {
      return {
        title: "So Close to #1! 🥈",
        message: `Just ${pointsToNextRank} points away from the top spot. One more delivery could do it!`,
        color: "from-gray-400 to-gray-500",
        icon: ChevronUp
      };
    } else if (userRank === 3) {
      return {
        title: "You're in the Top 3! 🥉",
        message: `${pointsToNextRank} points to rank #2. You're doing great!`,
        color: "from-amber-600 to-amber-700",
        icon: Flame
      };
    } else if (userRank <= 10) {
      return {
        title: "Top 10 Hero! 🌟",
        message: `You're in the top 10! ${pointsToNextRank} points to climb to rank #${userRank - 1}.`,
        color: "from-blue-500 to-indigo-600",
        icon: Target
      };
    } else if (userRank <= 20) {
      return {
        title: "Almost Top 10! ⚡",
        message: `Just ${userRank - 10} spots away from the top 10! ${pointsToNextRank} points to your next rank.`,
        color: "from-purple-500 to-purple-600",
        icon: Zap
      };
    } else {
      return {
        title: "Keep Climbing! 💪",
        message: `You're ranked #${userRank}. Complete more deliveries to climb the ranks!`,
        color: "from-emerald-500 to-emerald-600",
        icon: TrendingUp
      };
    }
  };

  const motivationalMessage = getMotivationalMessage();

  return (
    <div className="min-h-screen bg-background pb-bottom-nav">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 text-white p-6 safe-top">
        <div className="container mx-auto max-w-screen-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
              <Trophy className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Leaderboard</h1>
              <p className="text-emerald-100 text-sm">Top Community Heroes</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-3 text-center">
                <Users className="h-5 w-5 mx-auto mb-1 text-emerald-100" />
                <p className="text-2xl font-bold">{totalHeroes}</p>
                <p className="text-xs text-emerald-100">Total Heroes</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-3 text-center">
                <Award className="h-5 w-5 mx-auto mb-1 text-yellow-300" />
                <p className="text-2xl font-bold">{userRank || '-'}</p>
                <p className="text-xs text-emerald-100">Your Rank</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-3 text-center">
                <TrendingUp className="h-5 w-5 mx-auto mb-1 text-emerald-100" />
                <p className="text-2xl font-bold">{hero.points.toLocaleString()}</p>
                <p className="text-xs text-emerald-100">Your Points</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Leaderboard Content */}
      <div className="container mx-auto max-w-screen-xl p-4">
        {/* Personalized Motivational Card */}
        {motivationalMessage && (
          <Card className={`mb-4 bg-gradient-to-br ${motivationalMessage.color} text-white border-0 shadow-lg`}>
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                  <motivationalMessage.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-1">{motivationalMessage.title}</h3>
                  <p className="text-sm text-white/90 mb-3">{motivationalMessage.message}</p>

                  {/* Next Rank Progress */}
                  {heroAhead && pointsToNextRank && pointsToNextRank > 0 && (
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold">Next: {heroAhead.name}</span>
                          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                            Rank #{userRank! - 1}
                          </span>
                        </div>
                        <span className="text-xs font-bold">{pointsToNextRank} pts needed</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div
                          className="bg-white rounded-full h-2 transition-all duration-500"
                          style={{
                            width: `${Math.min(100, ((hero.points / heroAhead.points) * 100))}%`
                          }}
                        />
                      </div>
                      <p className="text-xs text-white/80 mt-2">
                        💡 Tip: Complete {Math.ceil(pointsToNextRank / 100)} more deliveries to pass them!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Top 10 Heroes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Leaderboard heroes={topHeroes} currentUserId={hero.id} />
          </CardContent>
        </Card>

        {/* Weekly Challenges */}
        <Card className="mt-4 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              Weekly Challenges
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-white rounded-lg p-3 border border-purple-100">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="font-semibold text-sm">Complete 5 Deliveries</p>
                    <p className="text-xs text-gray-600">Bonus: +150 pts</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-purple-600">{hero.totalDeliveries % 7}/5</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-full h-2 transition-all"
                  style={{ width: `${Math.min(100, ((hero.totalDeliveries % 7) / 5) * 100)}%` }}
                />
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 border border-purple-100">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="font-semibold text-sm">Earn 500 Points</p>
                    <p className="text-xs text-gray-600">Bonus: Exclusive badge</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-purple-600">{hero.points % 1000}/500</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full h-2 transition-all"
                  style={{ width: `${Math.min(100, ((hero.points % 1000) / 500) * 100)}%` }}
                />
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 border border-purple-100">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-emerald-500" />
                  <div>
                    <p className="font-semibold text-sm">Maintain 5⭐ Rating</p>
                    <p className="text-xs text-gray-600">Complete 3 deliveries with perfect rating</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-purple-600">
                  {hero.averageRating >= 5 ? '✓' : '0/3'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rank Milestones */}
        <Card className="mt-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-5 w-5 text-blue-600" />
              Rank Milestones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className={`flex items-center gap-3 p-2 rounded-lg ${userRank && userRank <= 10 ? 'bg-blue-100' : 'bg-white'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${userRank && userRank <= 10 ? 'bg-blue-500' : 'bg-gray-300'}`}>
                <Trophy className={`h-5 w-5 ${userRank && userRank <= 10 ? 'text-white' : 'text-gray-500'}`} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">Top 10 Hero</p>
                <p className="text-xs text-gray-600">Unlock exclusive rewards</p>
              </div>
              {userRank && userRank <= 10 && <span className="text-xl">✓</span>}
            </div>

            <div className={`flex items-center gap-3 p-2 rounded-lg ${userRank && userRank <= 5 ? 'bg-purple-100' : 'bg-white'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${userRank && userRank <= 5 ? 'bg-purple-500' : 'bg-gray-300'}`}>
                <Award className={`h-5 w-5 ${userRank && userRank <= 5 ? 'text-white' : 'text-gray-500'}`} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">Top 5 Champion</p>
                <p className="text-xs text-gray-600">2x points on bonuses</p>
              </div>
              {userRank && userRank <= 5 && <span className="text-xl">✓</span>}
            </div>

            <div className={`flex items-center gap-3 p-2 rounded-lg ${userRank === 1 ? 'bg-yellow-100' : 'bg-white'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${userRank === 1 ? 'bg-yellow-500' : 'bg-gray-300'}`}>
                <Trophy className={`h-5 w-5 ${userRank === 1 ? 'text-white' : 'text-gray-500'}`} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">#1 Community Leader</p>
                <p className="text-xs text-gray-600">Special recognition + $100 bonus</p>
              </div>
              {userRank === 1 && <span className="text-xl">👑</span>}
            </div>
          </CardContent>
        </Card>

        {/* How Points Work */}
        <Card className="mt-4 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-600" />
              How Points Work
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Base delivery:</span>
              <span className="font-semibold text-gray-900">+100 pts</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">On-time delivery:</span>
              <span className="font-semibold text-emerald-600">+50 pts</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">5-star rating:</span>
              <span className="font-semibold text-yellow-600">+25 pts</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">First delivery of day:</span>
              <span className="font-semibold text-blue-600">+25 pts</span>
            </div>
            <div className="flex justify-between items-center border-t pt-2">
              <span className="text-gray-700">Weekly streak (7 days):</span>
              <span className="font-bold text-purple-600">+200 pts</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNav userType="hero" />
    </div>
  );
}
