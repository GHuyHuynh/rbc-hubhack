/**
 * Initialize localStorage with seed data on first app load
 */

import { STORAGE_KEYS } from './constants';
import { ALL_SEED_USERS, SEED_REQUESTS } from '@/data/seedData';
import type { User, FoodRequest } from './types';

const SEED_VERSION = '1.0.0';

export function initializeSeedData(): void {
  if (typeof window === 'undefined') return;

  const currentVersion = window.localStorage.getItem(STORAGE_KEYS.SEED_VERSION);

  // Only seed if not already seeded or version changed
  if (currentVersion === SEED_VERSION) {
    return;
  }

  console.log('🌱 Initializing seed data...');

  // Check if there's existing data
  const existingUsers = window.localStorage.getItem(STORAGE_KEYS.USERS);
  const existingRequests = window.localStorage.getItem(STORAGE_KEYS.REQUESTS);

  // Only seed if no existing data
  if (!existingUsers) {
    window.localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(ALL_SEED_USERS));
    console.log(`✅ Seeded ${ALL_SEED_USERS.length} users`);
  }

  if (!existingRequests) {
    window.localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(SEED_REQUESTS));
    console.log(`✅ Seeded ${SEED_REQUESTS.length} food requests`);
  }

  // Mark as seeded
  window.localStorage.setItem(STORAGE_KEYS.SEED_VERSION, SEED_VERSION);
  console.log('✅ Seed data initialization complete');
}

/**
 * Reset all data and re-seed (useful for development)
 */
export function resetAndReseed(): void {
  if (typeof window === 'undefined') return;

  console.log('🔄 Resetting all data...');

  window.localStorage.removeItem(STORAGE_KEYS.USERS);
  window.localStorage.removeItem(STORAGE_KEYS.REQUESTS);
  window.localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  window.localStorage.removeItem(STORAGE_KEYS.SEED_VERSION);

  initializeSeedData();
}
