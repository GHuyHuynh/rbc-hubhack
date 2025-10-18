'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { MapPin, Package, Store, Bus, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BottomNav } from '@/components/shared/BottomNav';
import { RouteInstructions } from '@/components/shared/Map/RouteInstructions';
import { useHero } from '@/store/authStore';
import { getPendingRequests, getActiveRequestsForHero, getAllRequests } from '@/lib/localStorage';
import { HALIFAX_CENTER } from '@/lib/constants';
import { calculateDistance } from '@/lib/utils';
import type { FoodRequest, FoodBank, FarmersMarket } from '@/lib/types';
import foodBanksRaw from '@/data/foodBanks.json';
import farmersMarketsRaw from '@/data/farmersMarkets.json';

const foodBanksData = foodBanksRaw as FoodBank[];
const farmersMarketsData = farmersMarketsRaw as unknown as FarmersMarket[];

// Dynamically import the map component to avoid SSR issues
const InteractiveMap = dynamic(
  () => import('@/components/shared/Map/InteractiveMap').then((mod) => mod.InteractiveMap),
  { ssr: false, loading: () => <div className="w-full h-full bg-muted rounded-lg animate-pulse" /> }
);

export default function HeroMapPage() {
  const router = useRouter();
  const hero = useHero();
  const [requests, setRequests] = useState<FoodRequest[]>([]);
  const [activeRequests, setActiveRequests] = useState<FoodRequest[]>([]);
  const [showRequests, setShowRequests] = useState(true);
  const [showFoodBanks, setShowFoodBanks] = useState(true);
  const [showMarkets, setShowMarkets] = useState(false);
  const [showBuses, setShowBuses] = useState(true);
  const [showRoutePanel, setShowRoutePanel] = useState(false);
  const [selectedActiveRequest, setSelectedActiveRequest] = useState<FoodRequest | null>(null);
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    if (!hero) {
      router.push('/auth/login');
      return;
    }

    const pending = getPendingRequests();
    const active = getActiveRequestsForHero(hero.id);
    setRequests([...pending, ...active]); // Show both pending and active
    setActiveRequests(active);

    // Auto-select first active request if available
    if (active.length > 0 && !selectedActiveRequest) {
      setSelectedActiveRequest(active[0]);
      setShowRoutePanel(true);
    }
  }, [hero, router]);

  const handleRequestAccepted = () => {
    if (!hero) return;

    // Refresh requests list
    const pending = getPendingRequests();
    const active = getActiveRequestsForHero(hero.id);
    setRequests([...pending, ...active]);
    setActiveRequests(active);

    // Auto-select the newly accepted request
    if (active.length > 0) {
      setSelectedActiveRequest(active[active.length - 1]); // Last one is newest
      setShowRoutePanel(true);
    }

    // Force map to re-render
    setMapKey(k => k + 1);
  };

  // Find nearest food bank for selected active request
  const getNearestBank = (request: FoodRequest): FoodBank | null => {
    if (!request) return null;

    const sorted = foodBanksData
      .map(bank => ({
        bank,
        distance: calculateDistance(bank.lat, bank.lng, request.deliveryLat, request.deliveryLng)
      }))
      .sort((a, b) => a.distance - b.distance);

    return sorted[0]?.bank || null;
  };

  if (!hero) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  const nearestBank = selectedActiveRequest ? getNearestBank(selectedActiveRequest) : null;

  return (
    <div className="min-h-screen bg-background pb-bottom-nav">
      {/* Header */}
      <div className="bg-card border-b border-border p-4 safe-top sticky top-0 z-20">
        <div className="container mx-auto max-w-screen-xl">
          <h1 className="text-2xl font-bold mb-3">Map View</h1>

          {/* Active Requests Info */}
          {activeRequests.length > 0 && (
            <div className="mb-3 flex gap-2 items-center">
              <Button
                variant={showRoutePanel ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowRoutePanel(!showRoutePanel)}
                className="flex-shrink-0"
              >
                <Navigation className="h-4 w-4 mr-2" />
                Active Routes ({activeRequests.length})
              </Button>
              {activeRequests.length > 1 && (
                <select
                  className="text-sm border rounded px-2 py-1"
                  value={selectedActiveRequest?.id || ''}
                  onChange={(e) => {
                    const req = activeRequests.find(r => r.id === e.target.value);
                    setSelectedActiveRequest(req || null);
                  }}
                >
                  {activeRequests.map(req => (
                    <option key={req.id} value={req.id}>
                      {req.deliveryAddress.split(',')[0]}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Layer Toggle Buttons */}
          <div className="flex gap-2 mb-3 flex-wrap">
            <Button
              variant={showRequests ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowRequests(!showRequests)}
            >
              <Package className="h-4 w-4 mr-2" />
              Requests ({requests.length})
            </Button>
            <Button
              variant={showFoodBanks ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowFoodBanks(!showFoodBanks)}
            >
              <MapPin className="h-4 w-4 mr-2" />
              Food Banks ({foodBanksData.length})
            </Button>
            <Button
              variant={showMarkets ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowMarkets(!showMarkets)}
            >
              <Store className="h-4 w-4 mr-2" />
              Farmers Markets ({farmersMarketsData.length})
            </Button>
            <Button
              variant={showBuses ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowBuses(!showBuses)}
            >
              <Bus className="h-4 w-4 mr-2" />
              Live Buses
            </Button>
          </div>

          {/* Legend */}
          <div className="flex gap-3 text-xs flex-wrap">
            {showRequests && (
              <div className="flex items-center gap-1.5">
                <span className="text-lg">🍎</span>
                <span className="text-muted-foreground">Requests</span>
              </div>
            )}
            {showFoodBanks && (
              <div className="flex items-center gap-1.5">
                <span className="text-lg">🏪</span>
                <span className="text-muted-foreground">Food Banks</span>
              </div>
            )}
            {showMarkets && (
              <div className="flex items-center gap-1.5">
                <span className="text-lg">🌾</span>
                <span className="text-muted-foreground">Markets</span>
              </div>
            )}
            {showBuses && (
              <div className="flex items-center gap-1.5">
                <span className="text-lg">🚌</span>
                <span className="text-muted-foreground">Buses</span>
              </div>
            )}
            {activeRequests.length > 0 && (
              <>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-muted-foreground">Active Route</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">🏁</span>
                  <span className="text-muted-foreground">Start</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">🎯</span>
                  <span className="text-muted-foreground">Destination</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Map and Route Panel */}
      <div className="flex flex-col lg:flex-row gap-4 p-4 h-[calc(100vh-14rem)]">
        {/* Route Instructions Panel - Mobile Top, Desktop Left */}
        {showRoutePanel && selectedActiveRequest && nearestBank && (
          <div className="lg:w-96 flex-shrink-0 overflow-y-auto">
            <RouteInstructions
              request={selectedActiveRequest}
              nearestBank={nearestBank}
              onClose={() => setShowRoutePanel(false)}
            />
          </div>
        )}

        {/* Map Container */}
        <div className="flex-1 min-h-[400px]">
          <InteractiveMap
            key={mapKey}
            center={[HALIFAX_CENTER.lat, HALIFAX_CENTER.lng]}
            zoom={12}
            requests={requests}
            foodBanks={foodBanksData}
            markets={farmersMarketsData}
            showRequests={showRequests}
            showFoodBanks={showFoodBanks}
            showMarkets={showMarkets}
            showBuses={showBuses}
            hero={hero}
            showRoutes={true}
            onRequestAccepted={handleRequestAccepted}
          />
        </div>
      </div>

      <BottomNav userType="hero" />
    </div>
  );
}
