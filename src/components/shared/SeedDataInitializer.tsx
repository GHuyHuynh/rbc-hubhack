'use client';

import { useEffect } from 'react';
import { initializeSeedData } from '@/lib/initSeedData';

export function SeedDataInitializer() {
  useEffect(() => {
    initializeSeedData();
  }, []);

  return null;
}
