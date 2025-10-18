'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { FoodRequest, FoodBank, FarmersMarket, Hero, FoodType, Quantity } from '@/lib/types';
import { FOOD_TYPE_LABELS, QUANTITY_LABELS } from '@/lib/constants';
import { RequestPopup } from './RequestPopup';
import { calculateDistance } from '@/lib/utils';
import { fetchVehiclePositions, type BusPosition } from '@/lib/gtfsRealtimeService';

// Modern, glass-morphism style markers - elegant and eye-catching
const createCustomIcon = (color: string, emoji: string, pulseColor: string) => {
  return L.divIcon({
    html: `
      <div style="position: relative; width: 70px; height: 70px; display: flex; align-items: center; justify-content: center;">
        <!-- Outer glow -->
        <div style="
          position: absolute;
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: radial-gradient(circle, ${pulseColor}88 0%, transparent 70%);
          filter: blur(8px);
          animation: glow 3s ease-in-out infinite;
        "></div>
        <!-- Pulse ring animation -->
        <div style="
          position: absolute;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          border: 3px solid ${pulseColor};
          opacity: 0.4;
          animation: pulse 2.5s ease-out infinite;
        "></div>
        <!-- Secondary pulse -->
        <div style="
          position: absolute;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          border: 2px solid ${pulseColor};
          opacity: 0.3;
          animation: pulse 2.5s ease-out 0.5s infinite;
        "></div>
        <!-- Main marker circle with glass effect -->
        <div style="
          position: relative;
          background: linear-gradient(145deg, ${color}f0 0%, ${color}cc 100%);
          backdrop-filter: blur(10px);
          width: 52px;
          height: 52px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow:
            0 8px 32px rgba(0,0,0,0.25),
            0 2px 8px rgba(0,0,0,0.15),
            inset 0 -2px 8px rgba(0,0,0,0.1),
            inset 0 2px 8px rgba(255,255,255,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        "
        onmouseover="this.style.transform='scale(1.2) translateY(-2px)'; this.style.boxShadow='0 12px 40px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2)'"
        onmouseout="this.style.transform='scale(1) translateY(0)'; this.style.boxShadow='0 8px 32px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.15)'">
          ${emoji}
          <!-- Shine effect -->
          <div style="
            position: absolute;
            top: 3px;
            left: 8px;
            width: 18px;
            height: 18px;
            background: radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
          "></div>
        </div>
      </div>
      <style>
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        @keyframes glow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.9; }
        }
      </style>
    `,
    className: 'custom-marker-modern',
    iconSize: [70, 70],
    iconAnchor: [35, 35],
    popupAnchor: [0, -35],
  });
};

const requestIcon = createCustomIcon('#EF4444', '🍎', '#EF4444'); // Red with apple
const foodBankIcon = createCustomIcon('#10B981', '🏪', '#10B981'); // Green with store
const marketIcon = createCustomIcon('#F59E0B', '🌾', '#F59E0B'); // Amber with wheat

// Route waypoint markers - smaller and simpler
const createWaypointIcon = (number: number, color: string) => {
  return L.divIcon({
    html: `
      <div style="
        background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%);
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: bold;
        color: white;
      ">${number}</div>
    `,
    className: 'waypoint-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

// Start and end markers for active routes
const createStartIcon = () => {
  return L.divIcon({
    html: `
      <div style="
        background: linear-gradient(135deg, #10B981 0%, #059669 100%);
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 3px 10px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
      ">🏁</div>
    `,
    className: 'start-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};

const createEndIcon = () => {
  return L.divIcon({
    html: `
      <div style="
        background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 3px 10px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
      ">🎯</div>
    `,
    className: 'end-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};

// Bus icon with direction arrow - modern animated style
const createBusIcon = (bearing?: number) => {
  const rotation = bearing !== undefined ? `rotate(${bearing}deg)` : '';
  return L.divIcon({
    html: `
      <div style="position: relative; width: 56px; height: 56px; display: flex; align-items: center; justify-content: center;">
        <!-- Animated pulse rings -->
        <div style="
          position: absolute;
          width: 56px;
          height: 56px;
          border-radius: 10px;
          border: 2px solid #3B82F6;
          opacity: 0.4;
          animation: squarePulse 2s ease-out infinite;
        "></div>
        <div style="
          position: absolute;
          width: 56px;
          height: 56px;
          border-radius: 10px;
          border: 2px solid #60A5FA;
          opacity: 0.3;
          animation: squarePulse 2s ease-out 0.5s infinite;
        "></div>
        <!-- Glow effect -->
        <div style="
          position: absolute;
          width: 56px;
          height: 56px;
          border-radius: 10px;
          background: radial-gradient(circle, #3B82F688 0%, transparent 70%);
          filter: blur(6px);
          animation: glow 2s ease-in-out infinite;
        "></div>
        <!-- Main bus marker -->
        <div style="
          transform: ${rotation};
          position: relative;
          background: linear-gradient(145deg, #3B82F6f0 0%, #2563EBdd 100%);
          backdrop-filter: blur(10px);
          width: 44px;
          height: 44px;
          border-radius: 10px;
          border: 3px solid white;
          box-shadow:
            0 6px 24px rgba(59,130,246,0.4),
            0 2px 8px rgba(0,0,0,0.2),
            inset 0 -2px 6px rgba(0,0,0,0.15),
            inset 0 2px 6px rgba(255,255,255,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          transition: all 0.3s ease;
        " onmouseover="this.style.transform='${rotation} scale(1.15)'" onmouseout="this.style.transform='${rotation} scale(1)'">
          🚌
          <!-- Shine -->
          <div style="
            position: absolute;
            top: 3px;
            left: 6px;
            width: 14px;
            height: 14px;
            background: radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
          "></div>
        </div>
      </div>
      <style>
        @keyframes squarePulse {
          0% { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(1.3); opacity: 0; }
        }
      </style>
    `,
    className: 'bus-marker-modern',
    iconSize: [56, 56],
    iconAnchor: [28, 28],
    popupAnchor: [0, -28],
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
      .filter(r => r.status === 'pending' || r.status === 'accepted' || r.status === 'in_progress' || (selectedRequestId && r.id === selectedRequestId))
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
            ],
            isActive: request.status === 'accepted' || request.status === 'in_progress'
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

      {/* Modern CartoDB Voyager tile layer - clean and aesthetic */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={20}
      />

      {/* Route Lines - Food Bank to Delivery with enhanced styling */}
      {showRoutes && routes.map((route: any, idx) => {
        // Active routes (accepted/in_progress) get solid line, pending get dashed
        const isActive = route.isActive;
        const routeColor = isActive ? '#10B981' : '#3B82F6';
        const routeWeight = isActive ? 6 : 4;
        const routeOpacity = isActive ? 0.95 : 0.7;
        const dashArray = isActive ? undefined : '15, 10';

        return (
          <React.Fragment key={`route-${idx}`}>
            {/* Shadow/glow layer */}
            <Polyline
              positions={route.positions}
              pathOptions={{
                color: routeColor,
                weight: routeWeight + 8,
                opacity: 0.15,
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />

            {/* Main route line */}
            <Polyline
              positions={route.positions}
              pathOptions={{
                color: routeColor,
                weight: routeWeight,
                opacity: routeOpacity,
                dashArray: dashArray,
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />

            {/* Animated flow effect for active routes */}
            {isActive && (
              <Polyline
                positions={route.positions}
                pathOptions={{
                  color: '#ffffff',
                  weight: 2,
                  opacity: 0.8,
                  dashArray: '0, 20, 12, 20',
                  lineCap: 'round'
                }}
              />
            )}

            {/* Enhanced distance circles around food bank for active routes */}
            {isActive && (
              <>
                <Circle
                  center={route.positions[0]}
                  radius={700}
                  pathOptions={{
                    color: '#10B981',
                    fillColor: '#10B981',
                    fillOpacity: 0.08,
                    weight: 0
                  }}
                />
                <Circle
                  center={route.positions[0]}
                  radius={500}
                  pathOptions={{
                    color: '#10B981',
                    fillColor: '#10B981',
                    fillOpacity: 0.12,
                    weight: 2,
                    opacity: 0.4,
                    dashArray: '8, 6'
                  }}
                />
              </>
            )}

            {/* Start and End waypoint markers for active routes */}
            {isActive && (
              <>
                <Marker
                  position={route.positions[0]}
                  icon={createStartIcon()}
                  zIndexOffset={1000}
                >
                  <Popup>
                    <div className="min-w-[220px] p-0">
                      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-2.5 rounded-t-lg">
                        <h3 className="font-bold text-sm text-white flex items-center gap-2">
                          🏁 Start Point
                        </h3>
                      </div>
                      <div className="p-2.5 bg-white rounded-b-lg">
                        <p className="font-semibold text-sm text-gray-800 mb-1.5">
                          {route.bank.name}
                        </p>
                        <p className="text-xs text-emerald-600 font-medium mb-2 bg-emerald-50 px-2 py-1 rounded">
                          📦 Pick up food items here
                        </p>
                        <p className="text-xs text-gray-500">
                          📍 {route.bank.address}
                        </p>
                      </div>
                    </div>
                  </Popup>
                </Marker>
                <Marker
                  position={route.positions[1]}
                  icon={createEndIcon()}
                  zIndexOffset={1000}
                >
                  <Popup>
                    <div className="min-w-[220px] p-0">
                      <div className="bg-gradient-to-br from-red-500 to-red-600 p-2.5 rounded-t-lg">
                        <h3 className="font-bold text-sm text-white flex items-center gap-2">
                          🎯 Destination
                        </h3>
                      </div>
                      <div className="p-2.5 bg-white rounded-b-lg">
                        <p className="font-semibold text-sm text-gray-800 mb-1.5">
                          {route.request.deliveryAddress.split(',')[0]}
                        </p>
                        <p className="text-xs text-red-600 font-medium mb-2 bg-red-50 px-2 py-1 rounded">
                          🚚 Deliver here
                        </p>
                        <div className="flex gap-1.5 text-xs">
                          <span className="bg-gray-100 px-2 py-0.5 rounded-full font-medium text-gray-700">
                            {FOOD_TYPE_LABELS[route.request.foodType as FoodType]}
                          </span>
                          <span className="bg-gray-100 px-2 py-0.5 rounded-full font-medium text-gray-700">
                            {QUANTITY_LABELS[route.request.quantity as Quantity]}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              </>
            )}
          </React.Fragment>
        );
      })}

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
            <div className="min-w-[240px] p-0">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-2.5 rounded-t-lg">
                <h3 className="font-bold text-sm text-white">🏪 {bank.name}</h3>
              </div>
              <div className="p-2.5 bg-white rounded-b-lg space-y-2">
                <p className="text-xs text-gray-600 flex items-start gap-1.5">
                  <span>📍</span>
                  <span>{bank.address}</span>
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={`tel:${bank.phone}`}
                    className="flex-1 text-xs font-semibold text-center bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2 px-3 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    📞 Call {bank.phone}
                  </a>
                </div>
              </div>
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
            <div className="min-w-[240px] p-0">
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-2.5 rounded-t-lg">
                <h3 className="font-bold text-sm text-white">🌾 {market.name}</h3>
              </div>
              <div className="p-2.5 bg-white rounded-b-lg space-y-2">
                <p className="text-xs text-gray-600 flex items-start gap-1.5">
                  <span>📍</span>
                  <span>{market.address}</span>
                </p>
                {market.seasonal && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5">
                    <p className="text-xs text-amber-800 font-medium">
                      🌾 Seasonal: {market.months}
                    </p>
                  </div>
                )}
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <span>📞</span>
                  <span>{market.phone}</span>
                </p>
              </div>
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
            <div className="min-w-[220px] p-0">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-t-lg">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  🚌 Bus {bus.label || bus.vehicleId}
                </h3>
              </div>
              <div className="p-2.5 bg-white rounded-b-lg space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500">Route:</span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded-full">
                    {bus.routeId}
                  </span>
                </div>
                {bus.speed !== undefined && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-500">Speed:</span>
                    <span className="text-xs text-gray-800 font-medium">
                      {Math.round(bus.speed * 3.6)} km/h
                    </span>
                  </div>
                )}
                <p className="text-xs text-gray-400 pt-1 border-t border-gray-200">
                  🕒 Updated: {new Date(bus.timestamp * 1000).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
