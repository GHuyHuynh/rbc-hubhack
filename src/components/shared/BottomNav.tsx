'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, List, Map, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  activePattern: RegExp;
}

const HERO_NAV_ITEMS: NavItem[] = [
  {
    label: 'Home',
    href: '/hero/dashboard',
    icon: Home,
    activePattern: /^\/hero\/dashboard/,
  },
  {
    label: 'Requests',
    href: '/hero/requests',
    icon: List,
    activePattern: /^\/hero\/requests/,
  },
  {
    label: 'Map',
    href: '/hero/map',
    icon: Map,
    activePattern: /^\/hero\/map/,
  },
  {
    label: 'Profile',
    href: '/hero/profile',
    icon: User,
    activePattern: /^\/hero\/profile/,
  },
];

const REQUESTER_NAV_ITEMS: NavItem[] = [
  {
    label: 'Home',
    href: '/requester/dashboard',
    icon: Home,
    activePattern: /^\/requester\/dashboard/,
  },
  {
    label: 'Requests',
    href: '/requester/my-requests',
    icon: List,
    activePattern: /^\/requester\/my-requests/,
  },
  {
    label: 'Resources',
    href: '/resources',
    icon: Map,
    activePattern: /^\/resources/,
  },
  {
    label: 'Profile',
    href: '/requester/profile',
    icon: User,
    activePattern: /^\/requester\/profile/,
  },
];

interface BottomNavProps {
  userType: 'hero' | 'requester';
}

export function BottomNav({ userType }: BottomNavProps) {
  const pathname = usePathname();
  const navItems = userType === 'hero' ? HERO_NAV_ITEMS : REQUESTER_NAV_ITEMS;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-screen-xl mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.activePattern.test(pathname);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
