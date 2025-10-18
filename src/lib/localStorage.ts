/**
 * localStorage persistence layer for Community Food Connect
 * Handles all data storage and retrieval operations
 */

import { nanoid } from 'nanoid';
import type { User, Hero, Requester, FoodRequest, AppData } from './types';
import { STORAGE_KEYS } from './constants';
import { hashPassword } from './utils';

// Type guards
export function isHero(user: User): user is Hero {
  return user.type === 'hero';
}

export function isRequester(user: User): user is Requester {
  return user.type === 'requester';
}

// Initialize empty app data
function getEmptyAppData(): AppData {
  return {
    users: [],
    requests: [],
    currentUserId: null,
  };
}

// Storage utilities
function getStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;

  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage:`, error);
    return defaultValue;
  }
}

function setStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage:`, error);
  }
}

// User operations
export function getAllUsers(): User[] {
  return getStorage<User[]>(STORAGE_KEYS.USERS, []);
}

export function getUserById(id: string): User | null {
  const users = getAllUsers();
  return users.find((u) => u.id === id) || null;
}

export function getUserByEmail(email: string): User | null {
  const users = getAllUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export function createUser(userData: Omit<User, 'id' | 'createdAt'>): User {
  const users = getAllUsers();

  // Check if email already exists
  if (getUserByEmail(userData.email)) {
    throw new Error('Email already registered');
  }

  const newUser: User = {
    ...userData,
    id: nanoid(),
    password: hashPassword(userData.password),
    createdAt: new Date().toISOString(),
  } as User;

  // Add type-specific defaults
  if (newUser.type === 'hero') {
    (newUser as Hero).points = 0;
    (newUser as Hero).level = 0;
    (newUser as Hero).badges = [];
    (newUser as Hero).claimedCoupons = [];
    (newUser as Hero).averageRating = 0;
    (newUser as Hero).totalDeliveries = 0;
  } else {
    (newUser as Requester).deliveryHistory = [];
  }

  users.push(newUser);
  setStorage(STORAGE_KEYS.USERS, users);

  return newUser;
}

export function updateUser(id: string, updates: Partial<User>): User | null {
  const users = getAllUsers();
  const index = users.findIndex((u) => u.id === id);

  if (index === -1) return null;

  users[index] = { ...users[index], ...updates };
  setStorage(STORAGE_KEYS.USERS, users);

  return users[index];
}

export function deleteUser(id: string): boolean {
  const users = getAllUsers();
  const filtered = users.filter((u) => u.id !== id);

  if (filtered.length === users.length) return false;

  setStorage(STORAGE_KEYS.USERS, filtered);
  return true;
}

// Current user session
export function getCurrentUserId(): string | null {
  return getStorage<string | null>(STORAGE_KEYS.CURRENT_USER, null);
}

export function setCurrentUserId(id: string | null): void {
  setStorage(STORAGE_KEYS.CURRENT_USER, id);
}

export function getCurrentUser(): User | null {
  const id = getCurrentUserId();
  return id ? getUserById(id) : null;
}

export function logout(): void {
  setCurrentUserId(null);
}

// Request operations
export function getAllRequests(): FoodRequest[] {
  return getStorage<FoodRequest[]>(STORAGE_KEYS.REQUESTS, []);
}

export function getRequestById(id: string): FoodRequest | null {
  const requests = getAllRequests();
  return requests.find((r) => r.id === id) || null;
}

export function getRequestsByStatus(status: FoodRequest['status']): FoodRequest[] {
  const requests = getAllRequests();
  return requests.filter((r) => r.status === status);
}

export function getRequestsByUser(userId: string, asRequester: boolean): FoodRequest[] {
  const requests = getAllRequests();

  if (asRequester) {
    return requests.filter((r) => r.requesterId === userId);
  } else {
    return requests.filter((r) => r.heroId === userId);
  }
}

export function getPendingRequests(): FoodRequest[] {
  return getRequestsByStatus('pending');
}

export function getActiveRequestsForHero(heroId: string): FoodRequest[] {
  const requests = getAllRequests();
  return requests.filter(
    (r) => r.heroId === heroId && (r.status === 'accepted' || r.status === 'in_progress')
  );
}

export function createRequest(
  requestData: Omit<FoodRequest, 'id' | 'createdAt' | 'heroId' | 'status' | 'rating' | 'acceptedAt' | 'inProgressAt' | 'completedAt' | 'cancelledAt' | 'cancelReason'>
): FoodRequest {
  const requests = getAllRequests();

  const newRequest: FoodRequest = {
    ...requestData,
    id: nanoid(),
    heroId: null,
    status: 'pending',
    rating: null,
    createdAt: new Date().toISOString(),
    acceptedAt: null,
    inProgressAt: null,
    completedAt: null,
    cancelledAt: null,
    cancelReason: null,
  };

  requests.push(newRequest);
  setStorage(STORAGE_KEYS.REQUESTS, requests);

  return newRequest;
}

export function updateRequest(id: string, updates: Partial<FoodRequest>): FoodRequest | null {
  const requests = getAllRequests();
  const index = requests.findIndex((r) => r.id === id);

  if (index === -1) return null;

  requests[index] = { ...requests[index], ...updates };
  setStorage(STORAGE_KEYS.REQUESTS, requests);

  return requests[index];
}

export function acceptRequest(requestId: string, heroId: string): FoodRequest | null {
  // Check if hero has too many active requests
  const activeRequests = getActiveRequestsForHero(heroId);
  if (activeRequests.length >= 3) {
    throw new Error('Maximum 3 active requests allowed');
  }

  return updateRequest(requestId, {
    heroId,
    status: 'accepted',
    acceptedAt: new Date().toISOString(),
  });
}

export function markRequestInProgress(requestId: string): FoodRequest | null {
  return updateRequest(requestId, {
    status: 'in_progress',
    inProgressAt: new Date().toISOString(),
  });
}

export function completeRequest(
  requestId: string,
  rating?: FoodRequest['rating']
): FoodRequest | null {
  return updateRequest(requestId, {
    status: 'completed',
    completedAt: new Date().toISOString(),
    rating: rating || null,
  });
}

export function cancelRequest(requestId: string, reason: string): FoodRequest | null {
  return updateRequest(requestId, {
    status: 'cancelled',
    cancelledAt: new Date().toISOString(),
    cancelReason: reason,
  });
}

export function deleteRequest(id: string): boolean {
  const requests = getAllRequests();
  const filtered = requests.filter((r) => r.id !== id);

  if (filtered.length === requests.length) return false;

  setStorage(STORAGE_KEYS.REQUESTS, filtered);
  return true;
}

// Bulk operations
export function clearAllData(): void {
  if (typeof window === 'undefined') return;

  window.localStorage.removeItem(STORAGE_KEYS.USERS);
  window.localStorage.removeItem(STORAGE_KEYS.REQUESTS);
  window.localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

export function exportData(): AppData {
  return {
    users: getAllUsers(),
    requests: getAllRequests(),
    currentUserId: getCurrentUserId(),
  };
}

export function importData(data: AppData): void {
  setStorage(STORAGE_KEYS.USERS, data.users);
  setStorage(STORAGE_KEYS.REQUESTS, data.requests);
  if (data.currentUserId) {
    setStorage(STORAGE_KEYS.CURRENT_USER, data.currentUserId);
  }
}
