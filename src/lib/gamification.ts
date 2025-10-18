/**
 * Gamification engine for Community Food Connect
 * Handles points, levels, badges, and rewards
 */

import type { Hero, FoodRequest, PointBonus, LevelName, BadgeId, Coupon } from './types';
import { POINTS, LEVELS, LEVEL_ORDER, BADGES, COUPON_TIERS } from './constants';
import { isWeekend, isMorning, generateQRCode } from './utils';
import { getAllRequests, updateUser } from './localStorage';

/**
 * Calculate points for a delivery with bonuses
 */
export function calculatePoints(bonuses: PointBonus = {}): number {
  let points = POINTS.DELIVERY_BASE;

  if (bonuses.firstOfDay) {
    points += POINTS.FIRST_OF_DAY_BONUS;
  }

  if (bonuses.onTime) {
    points += POINTS.ON_TIME_BONUS;
  }

  if (bonuses.fiveStarRating) {
    points += POINTS.FIVE_STAR_BONUS;
  }

  if (bonuses.weeklyStreak) {
    points += POINTS.WEEKLY_STREAK_BONUS;
  }

  return points;
}

/**
 * Determine bonuses for a completed delivery
 */
export function determineBonuses(hero: Hero, request: FoodRequest): PointBonus {
  const bonuses: PointBonus = {};

  // Check if this is first delivery of day
  const today = new Date().toDateString();
  const completedToday = getAllRequests().filter(
    (r) =>
      r.heroId === hero.id &&
      r.status === 'completed' &&
      r.completedAt &&
      new Date(r.completedAt).toDateString() === today
  );

  if (completedToday.length === 0) {
    bonuses.firstOfDay = true;
  }

  // Check if delivery was on time
  if (request.completedAt && request.preferredTimeEnd) {
    const completedTime = new Date(request.completedAt);
    const preferredEnd = new Date(request.preferredTimeEnd);

    if (completedTime <= preferredEnd) {
      bonuses.onTime = true;
    }
  }

  // Check if 5-star rating
  if (request.rating && request.rating.stars === 5) {
    bonuses.fiveStarRating = true;
  }

  // Weekly streak check (delivered every day for 7 days)
  const weeklyStreak = checkWeeklyStreak(hero);
  if (weeklyStreak) {
    bonuses.weeklyStreak = true;
  }

  return bonuses;
}

/**
 * Check if hero has delivered every day for the past 7 days
 */
function checkWeeklyStreak(hero: Hero): boolean {
  const requests = getAllRequests().filter(
    (r) => r.heroId === hero.id && r.status === 'completed' && r.completedAt
  );

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toDateString();
  });

  return last7Days.every((day) =>
    requests.some((r) => new Date(r.completedAt!).toDateString() === day)
  );
}

/**
 * Award points to hero and update level
 */
export function awardPoints(hero: Hero, points: number): Hero {
  const newPoints = hero.points + points;
  const newLevel = calculateLevel(newPoints);

  const updatedHero: Hero = {
    ...hero,
    points: newPoints,
    level: LEVEL_ORDER.indexOf(newLevel),
  };

  updateUser(hero.id, updatedHero);
  return updatedHero;
}

/**
 * Calculate level based on points
 */
export function calculateLevel(points: number): LevelName {
  for (const levelName of LEVEL_ORDER) {
    const level = LEVELS[levelName];
    if (points >= level.minPoints && points <= level.maxPoints) {
      return levelName;
    }
  }
  return 'Beginner';
}

/**
 * Get current level info for hero
 */
export function getLevelInfo(hero: Hero) {
  const levelName = LEVEL_ORDER[hero.level] || 'Beginner';
  const currentLevel = LEVELS[levelName];
  const nextLevelIndex = hero.level + 1;
  const nextLevel =
    nextLevelIndex < LEVEL_ORDER.length ? LEVELS[LEVEL_ORDER[nextLevelIndex]] : null;

  const pointsToNextLevel = nextLevel ? nextLevel.minPoints - hero.points : 0;
  const progressPercentage = nextLevel
    ? Math.round(
        ((hero.points - currentLevel.minPoints) /
          (nextLevel.minPoints - currentLevel.minPoints)) *
          100
      )
    : 100;

  return {
    current: currentLevel,
    next: nextLevel,
    pointsToNext: pointsToNextLevel,
    progress: progressPercentage,
  };
}

/**
 * Check and award badges based on hero's achievements
 */
export function checkAndAwardBadges(hero: Hero): BadgeId[] {
  const newBadges: BadgeId[] = [];
  const requests = getAllRequests().filter(
    (r) => r.heroId === hero.id && r.status === 'completed'
  );

  // Total deliveries badges
  const totalDeliveries = requests.length;
  if (totalDeliveries >= 1 && !hero.badges.includes('first_delivery')) {
    newBadges.push('first_delivery');
  }
  if (totalDeliveries >= 5 && !hero.badges.includes('reliable')) {
    newBadges.push('reliable');
  }
  if (totalDeliveries >= 10 && !hero.badges.includes('dedicated')) {
    newBadges.push('dedicated');
  }
  if (totalDeliveries >= 25 && !hero.badges.includes('champion')) {
    newBadges.push('champion');
  }

  // Morning deliveries (before 10am)
  const morningDeliveries = requests.filter(
    (r) => r.completedAt && isMorning(r.completedAt)
  ).length;
  if (morningDeliveries >= 3 && !hero.badges.includes('early_bird')) {
    newBadges.push('early_bird');
  }

  // Weekend deliveries
  const weekendDeliveries = requests.filter(
    (r) => r.completedAt && isWeekend(r.completedAt)
  ).length;
  if (weekendDeliveries >= 5 && !hero.badges.includes('weekend_warrior')) {
    newBadges.push('weekend_warrior');
  }

  // Family-size deliveries
  const familyDeliveries = requests.filter(
    (r) => r.quantity === 'family_5_plus' || r.quantity === 'family_2_4'
  ).length;
  if (familyDeliveries >= 5 && !hero.badges.includes('full_cart')) {
    newBadges.push('full_cart');
  }

  // Neighborhood deliveries (same neighborhood as hero)
  const neighborhoodDeliveries = requests.filter((r) => {
    // Simple check - in production would use actual neighborhood data
    return r.deliveryAddress.toLowerCase().includes(hero.neighborhood.toLowerCase());
  }).length;
  if (neighborhoodDeliveries >= 10 && !hero.badges.includes('neighborhood_hero')) {
    newBadges.push('neighborhood_hero');
  }

  // Update hero with new badges
  if (newBadges.length > 0) {
    updateUser(hero.id, {
      badges: [...hero.badges, ...newBadges],
    });
  }

  return newBadges;
}

/**
 * Get available coupons for hero based on points
 */
export function getAvailableCoupons(hero: Hero): typeof COUPON_TIERS {
  return COUPON_TIERS.filter((coupon) => hero.points >= coupon.pointsRequired);
}

/**
 * Claim a coupon for hero
 */
export function claimCoupon(hero: Hero, couponId: string): Coupon | null {
  const couponTier = COUPON_TIERS.find((c) => c.id === couponId);

  if (!couponTier) {
    throw new Error('Coupon not found');
  }

  if (hero.points < couponTier.pointsRequired) {
    throw new Error('Insufficient points');
  }

  if (hero.claimedCoupons.includes(couponId)) {
    throw new Error('Coupon already claimed');
  }

  // Deduct points
  const newPoints = hero.points - couponTier.pointsRequired;

  // Generate coupon with QR code
  const coupon: Coupon = {
    ...couponTier,
    qrCode: generateQRCode(
      `CFC-${couponId.toUpperCase()}-${hero.id.slice(0, 8)}`
    ),
    claimedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
  };

  // Update hero
  updateUser(hero.id, {
    points: newPoints,
    claimedCoupons: [...hero.claimedCoupons, couponId],
  });

  return coupon;
}

/**
 * Get leaderboard rankings
 */
export interface LeaderboardEntry {
  userId: string;
  name: string;
  points: number;
  totalDeliveries: number;
  averageRating: number;
  rank: number;
}

export function getLeaderboard(
  users: Hero[],
  sortBy: 'points' | 'deliveries' | 'rating' = 'points'
): LeaderboardEntry[] {
  const heroes = users.filter((u) => u.type === 'hero') as Hero[];

  const sorted = [...heroes].sort((a, b) => {
    if (sortBy === 'points') return b.points - a.points;
    if (sortBy === 'deliveries') return b.totalDeliveries - a.totalDeliveries;
    if (sortBy === 'rating') return b.averageRating - a.averageRating;
    return 0;
  });

  return sorted.map((hero, index) => ({
    userId: hero.id,
    name: hero.name,
    points: hero.points,
    totalDeliveries: hero.totalDeliveries,
    averageRating: hero.averageRating,
    rank: index + 1,
  }));
}

/**
 * Update hero's average rating
 */
export function updateHeroRating(hero: Hero): Hero {
  const requests = getAllRequests().filter(
    (r) => r.heroId === hero.id && r.status === 'completed' && r.rating
  );

  if (requests.length === 0) {
    return hero;
  }

  const totalStars = requests.reduce((sum, r) => sum + (r.rating?.stars || 0), 0);
  const averageRating = totalStars / requests.length;

  updateUser(hero.id, {
    averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
    totalDeliveries: requests.length,
  });

  return { ...hero, averageRating, totalDeliveries: requests.length };
}
