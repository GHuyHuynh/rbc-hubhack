'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { MapPin, Package, Store, Bus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BottomNav } from '@/components/shared/BottomNav';
import { useRequesterUser } from '@/store/authStore';
import { getRequestsByRequesterId } from '@/lib/localStorage';
import { HALIFAX_CENTER } from '@/lib/constants';
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

export default function RequesterMapPage() {
  const router = useRouter();
  const requester = useRequesterUser();
  const [myRequests, setMyRequests] = useState<FoodRequest[]>([]);
  const [showMyRequests, setShowMyRequests] = useState(true);
  const [showFoodBanks, setShowFoodBanks] = useState(true);
  const [showMarkets, setShowMarkets] = useState(true);
  const [showBuses, setShowBuses] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([HALIFAX_CENTER.lat, HALIFAX_CENTER.lng]);
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    if (!requester) {
      router.push('/auth/login');
      return;
    }

    const requests = getRequestsByRequesterId(requester.id);
    setMyRequests(requests);

    // Center map on most recent active request if available
    const activeRequest = requests.find(r => r.status === 'pending' || r.status === 'accepted' || r.status === 'in_progress');
    if (activeRequest) {
      setMapCenter([activeRequest.deliveryLat, activeRequest.deliveryLng]);
    }
  }, [requester, router]);

  // Refresh requests when component mounts
  const refreshRequests = () => {
    if (!requester) return;
    const requests = getRequestsByRequesterId(requester.id);
    setMyRequests(requests);
    setMapKey(k => k + 1);
  };

  if (!requester) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  // Separate requests by status for better visualization
  const activeRequests = myRequests.filter(r => r.status === 'pending' || r.status === 'accepted' || r.status === 'in_progress');
  const completedRequests = myRequests.filter(r => r.status === 'completed');

  return (
    <div className="min-h-screen bg-background pb-bottom-nav">
      {/* Header */}
      <div className="bg-card border-b border-border p-4 safe-top sticky top-0 z-20">
        <div className="container mx-auto max-w-screen-xl">
          <h1 className="text-2xl font-bold mb-3">Map View</h1>

          {/* Request Summary */}
          {myRequests.length > 0 && (
            <div className="mb-3 flex gap-2 items-center text-sm">
              <span className="font-medium">My Requests:</span>
              <span className="text-muted-foreground">
                {activeRequests.length} active • {completedRequests.length} completed
              </span>
            </div>
          )}

          {/* Layer Toggle Buttons */}
          <div className="flex gap-2 mb-3 flex-wrap">
            <Button
              variant={showMyRequests ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowMyRequests(!showMyRequests)}
            >
              <Package className="h-4 w-4 mr-2" />
              My Requests ({myRequests.length})
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
            {showMyRequests && (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">🍎</span>
                  <span className="text-muted-foreground">Active Requests</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg opacity-50">🍎</span>
                  <span className="text-muted-foreground">Completed</span>
                </div>
              </>
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

      {/* Main Content - Map */}
      <div className="p-4 h-[calc(100vh-12rem)]">
        {myRequests.length === 0 ? (
          <Card className="h-full flex items-center justify-center">
            <CardContent className="text-center p-6">
              <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No Requests Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first food assistance request to see it on the map
              </p>
              <Button onClick={() => router.push('/requester/new-request')}>
                Create Request
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="h-full">
            <InteractiveMap
              key={mapKey}
              center={mapCenter}
              zoom={13}
              requests={showMyRequests ? myRequests : []}
              foodBanks={foodBanksData}
              markets={farmersMarketsData}
              showRequests={showMyRequests}
              showFoodBanks={showFoodBanks}
              showMarkets={showMarkets}
              showBuses={showBuses}
              showRoutes={false}
            />
          </div>
        )}
      </div>

      <BottomNav userType="requester" />
    </div>
  );
}
