import { calculateDistance } from './utils';
import type { FoodBank } from './types';

export interface TransitStep {
  type: 'walk' | 'bus' | 'wait';
  instruction: string;
  distance?: number; // in meters
  duration?: number; // in minutes
  routeNumber?: string;
  routeName?: string;
  from?: string;
  to?: string;
  icon?: string;
}

export interface TransitDirections {
  steps: TransitStep[];
  totalDistance: number; // in meters
  totalDuration: number; // in minutes
  summary: string;
}

/**
 * Calculate transit directions from food bank to delivery location
 * This is a simplified version - in production, you'd use Google Maps Directions API
 * or Halifax Transit's route planning API
 */
export function calculateTransitDirections(
  foodBank: FoodBank,
  deliveryLat: number,
  deliveryLng: number,
  deliveryAddress: string
): TransitDirections {
  const distance = calculateDistance(
    foodBank.lat,
    foodBank.lng,
    deliveryLat,
    deliveryLng
  );

  const steps: TransitStep[] = [];

  // Step 1: Walk to food bank or nearest bus stop
  if (distance > 500) {
    // If more than 500m, suggest taking a bus
    steps.push({
      type: 'walk',
      instruction: `Walk to ${foodBank.name}`,
      distance: 50,
      duration: 1,
      from: 'Your location',
      to: foodBank.name,
      icon: '🚶',
    });

    // Step 2: Pick up food
    steps.push({
      type: 'wait',
      instruction: `Collect food items at ${foodBank.name}`,
      duration: 5,
      icon: '📦',
    });

    // Step 3: Walk to nearest bus stop
    steps.push({
      type: 'walk',
      instruction: 'Walk to nearest bus stop',
      distance: 100,
      duration: 2,
      from: foodBank.name,
      to: 'Bus stop',
      icon: '🚶',
    });

    // Step 4: Take bus (estimate based on distance)
    const busDistance = distance - 200;
    const busDuration = Math.ceil(busDistance / 400); // ~24 km/h average speed

    // Common Halifax Transit routes in the area
    const possibleRoutes = ['1', '7', '10', '52', '63', '80'];
    const suggestedRoute = possibleRoutes[Math.floor(Math.random() * possibleRoutes.length)];

    steps.push({
      type: 'bus',
      instruction: `Take bus route ${suggestedRoute} towards delivery location`,
      distance: busDistance,
      duration: busDuration,
      routeNumber: suggestedRoute,
      routeName: `Route ${suggestedRoute}`,
      from: 'Bus stop',
      to: 'Delivery area',
      icon: '🚌',
    });

    // Step 5: Walk to final destination
    steps.push({
      type: 'walk',
      instruction: `Walk to ${deliveryAddress.split(',')[0]}`,
      distance: 100,
      duration: 2,
      from: 'Bus stop',
      to: deliveryAddress.split(',')[0],
      icon: '🚶',
    });
  } else {
    // If less than 500m, just walk
    steps.push({
      type: 'walk',
      instruction: `Walk to ${foodBank.name}`,
      distance: Math.round(distance / 2),
      duration: Math.ceil(distance / 2 / 80), // 80m/min walking speed
      from: 'Your location',
      to: foodBank.name,
      icon: '🚶',
    });

    steps.push({
      type: 'wait',
      instruction: `Collect food items at ${foodBank.name}`,
      duration: 5,
      icon: '📦',
    });

    steps.push({
      type: 'walk',
      instruction: `Walk to ${deliveryAddress.split(',')[0]}`,
      distance: Math.round(distance / 2),
      duration: Math.ceil(distance / 2 / 80),
      from: foodBank.name,
      to: deliveryAddress.split(',')[0],
      icon: '🚶',
    });
  }

  const totalDistance = steps.reduce((sum, step) => sum + (step.distance || 0), 0);
  const totalDuration = steps.reduce((sum, step) => sum + (step.duration || 0), 0);

  const summary = `${Math.round(totalDistance / 1000 * 10) / 10} km • ${totalDuration} min`;

  return {
    steps,
    totalDistance,
    totalDuration,
    summary,
  };
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Format duration for display
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
