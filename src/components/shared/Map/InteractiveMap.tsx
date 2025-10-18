'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { FoodRequest, FoodBank, FarmersMarket, Hero } from '@/lib/types';
import { FOOD_TYPE_LABELS, QUANTITY_LABELS } from '@/lib/constants';
import { RequestPopup } from './RequestPopup';
import { calculateDistance } from '@/lib/utils';
import { fetchVehiclePositions, type BusPosition } from '@/lib/gtfsRealtimeService';

// Pokemon Go style markers - large and prominent
const createCustomIcon = (color: string, emoji: string, pulseColor: string) => {
  return L.divIcon({
    html: `
      <div style="position: relative; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center;">
        <!-- Pulse ring animation -->
        <div style="
          position: absolute;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background-color: ${pulseColor};
          opacity: 0.3;
          animation: pulse 2s infinite;
        "></div>
        <!-- Main marker circle -->
        <div style="
          position: relative;
          background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%);
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 4px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4), 0 0 0 2px ${color}44;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          cursor: pointer;
          transition: transform 0.2s;
        " onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'">
          ${emoji}
        </div>
      </div>
      <style>
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.3); opacity: 0.1; }
        }
      </style>
    `,
    className: 'custom-marker-pogo',
    iconSize: [60, 60],
    iconAnchor: [30, 30],
    popupAnchor: [0, -30],
  });
};

const requestIcon = createCustomIcon('#EF4444', '🍎', '#EF4444'); // Red with apple
const foodBankIcon = createCustomIcon('#10B981', '🏪', '#10B981'); // Green with store
const marketIcon = createCustomIcon('#F59E0B', '🌾', '#F59E0B'); // Amber with wheat

// Bus icon with direction arrow - Pokemon Go style
const createBusIcon = (bearing?: number) => {
  const rotation = bearing !== undefined ? `rotate(${bearing}deg)` : '';
  return L.divIcon({
    html: `
      <div style="position: relative; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center;">
        <!-- Pulse for buses -->
        <div style="
          position: absolute;
          width: 50px;
          height: 50px;
          border-radius: 8px;
          background-color: #3B82F6;
          opacity: 0.2;
          animation: pulse 1.5s infinite;
        "></div>
        <!-- Main bus marker -->
        <div style="
          transform: ${rotation};
          position: relative;
          background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
          width: 40px;
          height: 40px;
          border-radius: 8px;
          border: 3px solid white;
          box-shadow: 0 3px 10px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        ">🚌</div>
      </div>
    `,
    className: 'bus-marker-pogo',
    iconSize: [50, 50],
    iconAnchor: [25, 25],
    popupAnchor: [0, -25],
  });
};

interface MapProps {
  center: [number, number];
  zoom: number;
  requests?: FoodRequest[];
  foodBanks?: FoodBank[];
  markets?: FarmersMarket[];
  showRequests?: boolean;
  showFoodBanks?: boolean;
  showMarkets?: boolean;
  showBuses?: boolean;
  hero?: Hero;
  selectedRequestId?: string | null;
  showRoutes?: boolean;
  onRequestAccepted?: () => void;
}

// Component to recenter map when center prop changes
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export function InteractiveMap({
  center,
  zoom,
  requests = [],
  foodBanks = [],
  markets = [],
  showRequests = true,
  showFoodBanks = true,
  showMarkets = true,
  showBuses = false,
  hero,
  selectedRequestId = null,
  showRoutes = false,
  onRequestAccepted,
}: MapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [buses, setBuses] = useState<BusPosition[]>([]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch and update bus positions
  useEffect(() => {
    if (!isMounted || !showBuses) return;

    const fetchBuses = async () => {
      const positions = await fetchVehiclePositions();
      setBuses(positions);
    };

    // Initial fetch
    fetchBuses();

    // Update every 10 seconds
    const interval = setInterval(fetchBuses, 10000);

    return () => clearInterval(interval);
  }, [isMounted, showBuses]);

  if (!isMounted) {
    return (
      <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  // Find nearest food bank for each request to show route
  const getRoutesForRequests = () => {
    if (!showRoutes) return [];

    return requests
      .filter(r => r.status === 'pending' || (selectedRequestId && r.id === selectedRequestId))
      .map(request => {
        // Find nearest food bank
        const nearestBank = foodBanks
          .map(bank => ({
            bank,
            distance: calculateDistance(bank.lat, bank.lng, request.deliveryLat, request.deliveryLng)
          }))
          .sort((a, b) => a.distance - b.distance)[0];

        if (nearestBank) {
          return {
            request,
            bank: nearestBank.bank,
            positions: [
              [nearestBank.bank.lat, nearestBank.bank.lng] as [number, number],
              [request.deliveryLat, request.deliveryLng] as [number, number]
            ]
          };
        }
        return null;
      })
      .filter(Boolean);
  };

  const routes = getRoutesForRequests();

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={true}
      className="w-full h-full rounded-lg"
      style={{ height: '100%', minHeight: '400px' }}
    >
      <ChangeView center={center} zoom={zoom} />

      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Route Lines - Food Bank to Delivery */}
      {showRoutes && routes.map((route: any, idx) => (
        <React.Fragment key={`route-${idx}`}>
          <Polyline
            positions={route.positions}
            pathOptions={{
              color: '#3B82F6',
              weight: 3,
              opacity: 0.7,
              dashArray: '10, 10'
            }}
          />
          {/* Distance circles around food bank */}
          <Circle
            center={route.positions[0]}
            radius={500}
            pathOptions={{
              color: '#10B981',
              fillColor: '#10B981',
              fillOpacity: 0.1,
              weight: 1
            }}
          />
        </React.Fragment>
      ))}

      {/* Food Requests */}
      {showRequests && requests.map((request) => (
        <Marker
          key={request.id}
          position={[request.deliveryLat, request.deliveryLng]}
          icon={requestIcon}
        >
          <Popup>
            {hero ? (
              <RequestPopup
                request={request}
                hero={hero}
                foodBanks={foodBanks}
                onAccepted={onRequestAccepted}
              />
            ) : (
              <div className="min-w-[200px]">
                <h3 className="font-semibold mb-1">
                  {FOOD_TYPE_LABELS[request.foodType]}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {QUANTITY_LABELS[request.quantity]}
                </p>
                <p className="text-xs text-gray-500 mb-2">
                  {request.deliveryAddress.split(',')[0]}
                </p>
              </div>
            )}
          </Popup>
        </Marker>
      ))}

      {/* Food Banks */}
      {showFoodBanks && foodBanks.map((bank) => (
        <Marker
          key={bank.id}
          position={[bank.lat, bank.lng]}
          icon={foodBankIcon}
        >
          <Popup>
            <div className="min-w-[200px]">
              <h3 className="font-semibold mb-1">{bank.name}</h3>
              <p className="text-xs text-gray-600 mb-2">{bank.address}</p>
              <p className="text-xs text-gray-500 mb-1">
                📞 {bank.phone}
              </p>
              <a
                href={`tel:${bank.phone}`}
                className="text-xs text-blue-600 hover:underline block"
              >
                Call Now
              </a>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Farmers Markets */}
      {showMarkets && markets.map((market) => (
        <Marker
          key={market.id}
          position={[market.lat, market.lng]}
          icon={marketIcon}
        >
          <Popup>
            <div className="min-w-[200px]">
              <h3 className="font-semibold mb-1">{market.name}</h3>
              <p className="text-xs text-gray-600 mb-2">{market.address}</p>
              {market.seasonal && (
                <p className="text-xs text-amber-600 mb-1">
                  🌾 Seasonal: {market.months}
                </p>
              )}
              <p className="text-xs text-gray-500">
                📞 {market.phone}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Live Buses */}
      {showBuses && buses.map((bus, idx) => (
        <Marker
          key={`bus-${bus.vehicleId}-${idx}`}
          position={[bus.lat, bus.lng]}
          icon={createBusIcon(bus.bearing)}
        >
          <Popup>
            <div className="min-w-[180px]">
              <h3 className="font-semibold mb-1 flex items-center gap-1">
                🚌 Bus {bus.label || bus.vehicleId}
              </h3>
              <p className="text-xs text-gray-600 mb-1">
                Route: {bus.routeId}
              </p>
              {bus.speed !== undefined && (
                <p className="text-xs text-gray-500">
                  Speed: {Math.round(bus.speed * 3.6)} km/h
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Updated: {new Date(bus.timestamp * 1000).toLocaleTimeString()}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
