'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { MapPin, Package, Store, Bus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BottomNav } from '@/components/shared/BottomNav';
import { useHero } from '@/store/authStore';
import { getPendingRequests } from '@/lib/localStorage';
import { HALIFAX_CENTER } from '@/lib/constants';
import type { FoodRequest, FoodBank, FarmersMarket } from '@/lib/types';
import foodBanksData from '@/data/foodBanks.json';
import farmersMarketsData from '@/data/farmersMarkets.json';

// Dynamically import the map component to avoid SSR issues
const InteractiveMap = dynamic(
  () => import('@/components/shared/Map/InteractiveMap').then((mod) => mod.InteractiveMap),
  { ssr: false, loading: () => <div className="w-full h-full bg-muted rounded-lg animate-pulse" /> }
);

export default function HeroMapPage() {
  const router = useRouter();
  const hero = useHero();
  const [requests, setRequests] = useState<FoodRequest[]>([]);
  const [showRequests, setShowRequests] = useState(true);
  const [showFoodBanks, setShowFoodBanks] = useState(true);
  const [showMarkets, setShowMarkets] = useState(false);
  const [showBuses, setShowBuses] = useState(true);
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    if (!hero) {
      router.push('/auth/login');
      return;
    }

    const pending = getPendingRequests();
    setRequests(pending);
  }, [hero, router]);

  const handleRequestAccepted = () => {
    // Refresh requests list
    const pending = getPendingRequests();
    setRequests(pending);
    // Force map to re-render
    setMapKey(k => k + 1);
  };

  if (!hero) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-bottom-nav">
      {/* Header */}
      <div className="bg-card border-b border-border p-4 safe-top sticky top-0 z-20">
        <div className="container mx-auto max-w-screen-xl">
          <h1 className="text-2xl font-bold mb-3">Map View</h1>

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
              Banks ({foodBanksData.length})
            </Button>
            <Button
              variant={showMarkets ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowMarkets(!showMarkets)}
            >
              <Store className="h-4 w-4 mr-2" />
              Markets ({farmersMarketsData.length})
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
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="h-[calc(100vh-12rem)] w-full">
        <InteractiveMap
          key={mapKey}
          center={[HALIFAX_CENTER.lat, HALIFAX_CENTER.lng]}
          zoom={12}
          requests={requests}
          foodBanks={foodBanksData as FoodBank[]}
          markets={farmersMarketsData as FarmersMarket[]}
          showRequests={showRequests}
          showFoodBanks={showFoodBanks}
          showMarkets={showMarkets}
          showBuses={showBuses}
          hero={hero}
          showRoutes={true}
          onRequestAccepted={handleRequestAccepted}
        />
      </div>

      <BottomNav userType="hero" />
    </div>
  );
}
