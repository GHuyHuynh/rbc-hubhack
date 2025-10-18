import { Trophy } from 'lucide-react';
import type { Hero } from '@/lib/types';
import { LEVEL_ORDER } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface PointsBadgeProps {
  hero: Hero;
  className?: string;
  showLevel?: boolean;
}

export function PointsBadge({
  hero,
  className,
  showLevel = true,
}: PointsBadgeProps) {
  const levelName = LEVEL_ORDER[hero.level] || 'Beginner';
  const levelDots = '●'.repeat(hero.level + 1) + '○'.repeat(4 - hero.level);

  return (
    <div
      className={cn(
        'flex items-center gap-2 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-full px-4 py-2',
        className
      )}
    >
      <Trophy className="h-5 w-5 text-primary" />
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-bold text-foreground">{hero.points} pts</span>
          {showLevel && (
            <>
              <span className="text-muted-foreground text-sm">{levelDots}</span>
              <span className="font-medium text-sm text-primary">
                {levelName}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
