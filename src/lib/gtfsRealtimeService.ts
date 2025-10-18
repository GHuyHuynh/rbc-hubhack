import GtfsRealtimeBindings from 'gtfs-realtime-bindings';

export interface BusPosition {
  vehicleId: string;
  routeId: string;
  lat: number;
  lng: number;
  bearing?: number;
  speed?: number;
  timestamp: number;
  tripId?: string;
  label?: string;
}

/**
 * Fetch real-time vehicle positions from Halifax Transit GTFS-RT feed
 * Uses Next.js API route to proxy the request and avoid CORS issues
 */
export async function fetchVehiclePositions(): Promise<BusPosition[]> {
  try {
    const response = await fetch('/api/transit/vehicle-positions', {
      headers: {
        'Accept': 'application/octet-stream',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GTFS-RT API error:', response.status, errorText);
      throw new Error(`Failed to fetch vehicle positions: ${response.status} ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();

    if (buffer.byteLength === 0) {
      console.warn('Empty GTFS-RT response');
      return [];
    }

    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
      new Uint8Array(buffer)
    );

    const positions: BusPosition[] = [];

    for (const entity of feed.entity) {
      if (entity.vehicle && entity.vehicle.position) {
        const vehicle = entity.vehicle;
        const position = vehicle.position;

        // Handle timestamp - it can be a number or Long object
        let timestamp = Date.now() / 1000;
        if (vehicle.timestamp) {
          if (typeof vehicle.timestamp === 'number') {
            timestamp = vehicle.timestamp;
          } else if (typeof vehicle.timestamp === 'object' && 'toNumber' in vehicle.timestamp) {
            timestamp = (vehicle.timestamp as any).toNumber();
          } else if ('low' in vehicle.timestamp && typeof (vehicle.timestamp as any).low === 'number') {
            // Handle Long object from protobuf
            timestamp = (vehicle.timestamp as any).low;
          }
        }

        positions.push({
          vehicleId: entity.id || vehicle.vehicle?.id || 'unknown',
          routeId: vehicle.trip?.routeId || 'unknown',
          lat: position?.latitude ?? 0,
          lng: position?.longitude ?? 0,
          bearing: position?.bearing ?? undefined,
          speed: position?.speed ?? undefined,
          timestamp: timestamp,
          tripId: vehicle.trip?.tripId ?? undefined,
          label: vehicle.vehicle?.label ?? undefined,
        });
      }
    }

    return positions;
  } catch (error) {
    console.error('Error fetching GTFS-RT vehicle positions:', error);
    return [];
  }
}

/**
 * Fetch real-time trip updates from Halifax Transit GTFS-RT feed
 * Note: This would need a separate API route if needed in the future
 */
export async function fetchTripUpdates() {
  try {
    // For now, this would need an API route similar to vehicle-positions
    // Leaving as placeholder for future implementation
    const response = await fetch('https://gtfs.halifax.ca/realtime/TripUpdate/TripUpdates.pb', {
      headers: {
        'Accept': 'application/octet-stream',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch trip updates: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
      new Uint8Array(buffer)
    );

    return feed;
  } catch (error) {
    console.error('Error fetching GTFS-RT trip updates:', error);
    return null;
  }
}

/**
 * Filter buses near a specific location (within radius in meters)
 */
export function filterBusesNearLocation(
  buses: BusPosition[],
  lat: number,
  lng: number,
  radiusMeters: number = 5000
): BusPosition[] {
  return buses.filter((bus) => {
    const distance = calculateDistance(bus.lat, bus.lng, lat, lng);
    return distance <= radiusMeters;
  });
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}
