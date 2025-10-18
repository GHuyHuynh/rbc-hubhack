'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { FoodRequest, Hero, FoodBank } from '@/lib/types';
import { FOOD_TYPE_LABELS, QUANTITY_LABELS } from '@/lib/constants';
import { acceptRequest, getActiveRequestsForHero } from '@/lib/localStorage';
import { format } from 'date-fns';
import { calculateDistance } from '@/lib/utils';
import { calculateTransitDirections, formatDistance, formatDuration, type TransitStep } from '@/lib/transitDirections';

interface RequestPopupProps {
  request: FoodRequest;
  hero: Hero;
  foodBanks?: FoodBank[];
  onAccepted?: () => void;
}

export function RequestPopup({ request, hero, foodBanks = [], onAccepted }: RequestPopupProps) {
  const router = useRouter();
  const [isAccepting, setIsAccepting] = useState(false);
  // Auto-show directions if request is accepted or in progress
  const [showDirections, setShowDirections] = useState(request.status === 'accepted' || request.status === 'in_progress');
  const [error, setError] = useState<string | null>(null);

  // Find nearest food bank
  const nearestBank = foodBanks.length > 0
    ? foodBanks
        .map(bank => ({
          bank,
          distance: calculateDistance(bank.lat, bank.lng, request.deliveryLat, request.deliveryLng)
        }))
        .sort((a, b) => a.distance - b.distance)[0]?.bank
    : null;

  // Calculate transit directions if we have a nearest bank
  const directions = nearestBank
    ? calculateTransitDirections(nearestBank, request.deliveryLat, request.deliveryLng, request.deliveryAddress)
    : null;

  const handleAccept = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAccepting(true);
    setError(null);

    try {
      const activeRequests = getActiveRequestsForHero(hero.id);
      if (activeRequests.length >= 3) {
        setError('Max 3 active requests');
        setIsAccepting(false);
        return;
      }

      const updated = acceptRequest(request.id, hero.id);
      if (updated) {
        if (onAccepted) onAccepted();
        // Delay to show success state before closing popup
        setTimeout(() => {
          router.refresh();
        }, 500);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAccepting(false);
    }
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/hero/requests/${request.id}`);
  };

  const canAccept = request.status === 'pending';
  const timeWindow = `${format(new Date(request.preferredTimeStart), 'h:mm a')} - ${format(new Date(request.preferredTimeEnd), 'h:mm a')}`;

  return (
    <div className="min-w-[300px] max-w-[340px] p-0">
      {/* Gradient header */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-t-lg">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-bold text-base text-white drop-shadow-sm">
            {FOOD_TYPE_LABELS[request.foodType]}
          </h3>
          <Badge
            variant={canAccept ? 'default' : 'secondary'}
            className="text-xs ml-2 bg-white/20 backdrop-blur-sm border-white/30 text-white font-semibold"
          >
            {request.status}
          </Badge>
        </div>
        <p className="text-emerald-50 text-xs font-medium">
          📦 {QUANTITY_LABELS[request.quantity]}
        </p>
      </div>

      {/* Content section */}
      <div className="p-3 bg-white rounded-b-lg">
        <div className="space-y-2 mb-3">
          <div className="flex items-start gap-2">
            <span className="text-base mt-0.5">📍</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">{request.deliveryAddress.split(',')[0]}</p>
              <p className="text-xs text-gray-500">{request.deliveryAddress.split(',').slice(1).join(',').trim()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-base">🕐</span>
            <p className="text-gray-700">
              <span className="font-medium">{format(new Date(request.preferredTimeStart), 'MMM d')}</span>
              <span className="text-gray-500 mx-1">•</span>
              <span className="text-xs text-gray-600">{timeWindow}</span>
            </p>
          </div>
          {request.specialNotes && (
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-2">
              <p className="text-xs text-amber-800">
                <span className="font-semibold">Note:</span> {request.specialNotes.substring(0, 80)}{request.specialNotes.length > 80 ? '...' : ''}
              </p>
            </div>
          )}
        </div>

        {/* Transit Directions */}
        {nearestBank && directions && (
          <div className="mb-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDirections(!showDirections);
              }}
              className="w-full text-left px-3 py-2 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-200 rounded-lg transition-all duration-200 flex items-center justify-between group"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">🚌</span>
                <div>
                  <p className="text-xs font-semibold text-blue-900">Transit Directions</p>
                  <p className="text-xs text-blue-600">{directions.summary}</p>
                </div>
              </div>
              <span className="text-blue-400 group-hover:text-blue-600 transition-colors">
                {showDirections ? '▲' : '▼'}
              </span>
            </button>

            {showDirections && (
              <div className="mt-2 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 space-y-2.5 max-h-64 overflow-y-auto border border-gray-200">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-300">
                  <span className="text-base">🏪</span>
                  <p className="text-xs font-bold text-gray-800">From {nearestBank.name}</p>
                </div>
                {directions.steps.map((step, idx) => (
                  <div key={idx} className="flex gap-2.5 bg-white rounded-lg p-2.5 shadow-sm border border-gray-200">
                    <span className="text-xl leading-none mt-0.5">{step.icon}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-900 leading-snug">{step.instruction}</p>
                      <div className="flex flex-wrap gap-2 text-xs text-gray-600 mt-1.5">
                        {step.distance && (
                          <span className="bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                            {formatDistance(step.distance)}
                          </span>
                        )}
                        {step.duration && (
                          <span className="bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                            {formatDuration(step.duration)}
                          </span>
                        )}
                        {step.routeNumber && (
                          <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-2.5 py-0.5 rounded-full font-bold shadow-sm">
                            Route {step.routeNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-2">
            <p className="text-xs text-red-700 font-medium">{error}</p>
          </div>
        )}

        <div className="flex gap-2 pt-1">
          {canAccept && (
            <Button
              size="sm"
              className="flex-1 h-9 text-sm font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all duration-200"
              onClick={handleAccept}
              disabled={isAccepting}
            >
              {isAccepting ? '⏳ Accepting...' : '✓ Accept Request'}
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-9 text-sm font-semibold border-2 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
            onClick={handleViewDetails}
          >
            View Details →
          </Button>
        </div>
      </div>
    </div>
  );
}
