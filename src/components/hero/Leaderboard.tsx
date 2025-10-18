'use client';

import { Medal, Trophy, Star, TrendingUp, Award } from 'lucide-react';
import type { Hero } from '@/lib/types';
import { LEVELS, LEVEL_ORDER } from '@/lib/constants';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface LeaderboardProps {
  heroes: Hero[];
  currentUserId?: string;
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="h-6 w-6 text-yellow-500" />;
    case 2:
      return <Medal className="h-6 w-6 text-gray-400" />;
    case 3:
      return <Medal className="h-6 w-6 text-amber-600" />;
    default:
      return <span className="text-lg font-bold text-gray-500">#{rank}</span>;
  }
};

const getRankBgColor = (rank: number) => {
  switch (rank) {
    case 1:
      return 'bg-gradient-to-br from-yellow-400 to-yellow-500';
    case 2:
      return 'bg-gradient-to-br from-gray-300 to-gray-400';
    case 3:
      return 'bg-gradient-to-br from-amber-500 to-amber-600';
    default:
      return 'bg-gradient-to-br from-gray-100 to-gray-200';
  }
};

export function Leaderboard({ heroes, currentUserId }: LeaderboardProps) {
  if (heroes.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No heroes yet. Be the first!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Top 3 Podium */}
      {heroes.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {/* 2nd Place */}
          <div className="flex flex-col items-center pt-8">
            <div className={`${getRankBgColor(2)} w-16 h-16 rounded-full flex items-center justify-center shadow-lg mb-2`}>
              <Medal className="h-8 w-8 text-white" />
            </div>
            <div className="text-center">
              <p className="font-bold text-sm truncate w-full">{heroes[1].name}</p>
              <p className="text-xs text-gray-600">{heroes[1].points.toLocaleString()} pts</p>
            </div>
          </div>

          {/* 1st Place */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className={`${getRankBgColor(1)} w-20 h-20 rounded-full flex items-center justify-center shadow-xl mb-2 ring-4 ring-yellow-200 animate-pulse`}>
                <Trophy className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full p-1">
                <Star className="h-4 w-4 text-white fill-white" />
              </div>
            </div>
            <div className="text-center">
              <p className="font-bold text-base truncate w-full">{heroes[0].name}</p>
              <p className="text-sm text-yellow-600 font-semibold">{heroes[0].points.toLocaleString()} pts</p>
              <Badge className="mt-1 bg-yellow-500 text-white text-xs">Champion</Badge>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center pt-8">
            <div className={`${getRankBgColor(3)} w-16 h-16 rounded-full flex items-center justify-center shadow-lg mb-2`}>
              <Medal className="h-8 w-8 text-white" />
            </div>
            <div className="text-center">
              <p className="font-bold text-sm truncate w-full">{heroes[2].name}</p>
              <p className="text-xs text-gray-600">{heroes[2].points.toLocaleString()} pts</p>
            </div>
          </div>
        </div>
      )}

      {/* Rest of the Leaderboard */}
      {heroes.slice(heroes.length >= 3 ? 3 : 0).map((hero, index) => {
        const rank = heroes.length >= 3 ? index + 4 : index + 1;
        const isCurrentUser = hero.id === currentUserId;
        const levelName = LEVEL_ORDER[hero.level] || 'Beginner';
        const levelInfo = LEVELS[levelName];

        return (
          <Card
            key={hero.id}
            className={`transition-all duration-200 hover:shadow-md ${
              isCurrentUser ? 'ring-2 ring-emerald-500 bg-emerald-50' : ''
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                  {getRankIcon(rank)}
                </div>

                {/* Hero Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-base truncate">
                      {hero.name}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs text-emerald-600 font-normal">(You)</span>
                      )}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      {hero.points.toLocaleString()} pts
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-blue-500" />
                      {hero.totalDeliveries} deliveries
                    </span>
                    {hero.averageRating > 0 && (
                      <span className="flex items-center gap-1">
                        ⭐ {hero.averageRating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Level Badge */}
                <div className="flex-shrink-0">
                  <Badge
                    variant="outline"
                    className="font-semibold"
                    style={{ borderColor: levelInfo.color, color: levelInfo.color }}
                  >
                    <Award className="h-3 w-3 mr-1" />
                    {levelInfo.name}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Empty state for insufficient heroes */}
      {heroes.length < 3 && heroes.length > 0 && (
        <Card className="border-dashed">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-gray-500">
              More heroes joining soon...
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
