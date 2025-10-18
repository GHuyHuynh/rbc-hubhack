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
  const [showDirections, setShowDirections] = useState(false);
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
    <div className="min-w-[280px] max-w-[320px] p-1">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-sm">
          {FOOD_TYPE_LABELS[request.foodType]}
        </h3>
        <Badge variant={canAccept ? 'default' : 'secondary'} className="text-xs ml-2">
          {request.status}
        </Badge>
      </div>

      <div className="space-y-1 text-xs text-gray-600 mb-3">
        <p>📦 {QUANTITY_LABELS[request.quantity]}</p>
        <p>📍 {request.deliveryAddress.split(',')[0]}</p>
        <p>🕐 {format(new Date(request.preferredTimeStart), 'MMM d')} • {timeWindow}</p>
        {request.specialNotes && (
          <p className="text-xs italic">Note: {request.specialNotes.substring(0, 50)}...</p>
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
            className="text-xs text-blue-600 hover:underline font-medium mb-1 flex items-center gap-1"
          >
            🚌 {showDirections ? 'Hide' : 'Show'} Transit Directions
            <span className="text-gray-500">({directions.summary})</span>
          </button>

          {showDirections && (
            <div className="bg-gray-50 rounded p-2 space-y-2 max-h-60 overflow-y-auto">
              <p className="text-xs font-semibold text-gray-700 mb-1">
                From {nearestBank.name}
              </p>
              {directions.steps.map((step, idx) => (
                <div key={idx} className="flex gap-2 text-xs">
                  <span className="text-base leading-none">{step.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{step.instruction}</p>
                    <div className="flex gap-2 text-gray-500 mt-0.5">
                      {step.distance && <span>{formatDistance(step.distance)}</span>}
                      {step.duration && <span>• {formatDuration(step.duration)}</span>}
                      {step.routeNumber && (
                        <span className="bg-blue-100 text-blue-700 px-1 rounded font-medium">
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
        <p className="text-xs text-red-600 mb-2">{error}</p>
      )}

      <div className="flex gap-2">
        {canAccept && (
          <Button
            size="sm"
            className="flex-1 h-8 text-xs"
            onClick={handleAccept}
            disabled={isAccepting}
          >
            {isAccepting ? 'Accepting...' : 'Accept'}
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          className="flex-1 h-8 text-xs"
          onClick={handleViewDetails}
        >
          Details →
        </Button>
      </div>
    </div>
  );
}
