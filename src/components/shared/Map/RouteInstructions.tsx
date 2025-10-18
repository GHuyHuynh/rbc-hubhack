'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { FoodRequest, FoodBank } from '@/lib/types';
import { calculateTransitDirections, formatDistance, formatDuration } from '@/lib/transitDirections';
import { FOOD_TYPE_LABELS, QUANTITY_LABELS } from '@/lib/constants';
import { MapPin, Navigation, Phone } from 'lucide-react';

interface RouteInstructionsProps {
  request: FoodRequest;
  nearestBank: FoodBank;
  onClose?: () => void;
}

export function RouteInstructions({ request, nearestBank, onClose }: RouteInstructionsProps) {
  const directions = calculateTransitDirections(
    nearestBank,
    request.deliveryLat,
    request.deliveryLng,
    request.deliveryAddress
  );

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Navigation className="h-5 w-5 text-green-600" />
              Route Directions
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {directions.summary}
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            >
              ×
            </button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Request Details Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-semibold text-sm">Delivery Details</h4>
            <Badge variant="default" className="text-xs">
              {request.status}
            </Badge>
          </div>
          <div className="space-y-1 text-xs text-gray-600">
            <p className="flex items-center gap-1">
              <span>📦</span>
              {FOOD_TYPE_LABELS[request.foodType]} • {QUANTITY_LABELS[request.quantity]}
            </p>
            <p className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {request.deliveryAddress}
            </p>
          </div>
        </div>

        {/* Step-by-step directions */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-gray-700">Step-by-Step</h4>

          {directions.steps.map((step, idx) => (
            <div key={idx} className="flex gap-3">
              {/* Step number/icon */}
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                  {idx + 1}
                </div>
              </div>

              {/* Step content */}
              <div className="flex-1 pb-3 border-l-2 border-gray-200 pl-4 -ml-4 last:border-l-0">
                <div className="flex items-start gap-2 mb-1">
                  <span className="text-xl leading-none">{step.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-800">
                      {step.instruction}
                    </p>

                    {/* Step details */}
                    <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500">
                      {step.distance && (
                        <span className="bg-gray-100 px-2 py-0.5 rounded">
                          {formatDistance(step.distance)}
                        </span>
                      )}
                      {step.duration && (
                        <span className="bg-gray-100 px-2 py-0.5 rounded">
                          ⏱ {formatDuration(step.duration)}
                        </span>
                      )}
                      {step.routeNumber && (
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">
                          🚌 Route {step.routeNumber}
                        </span>
                      )}
                    </div>

                    {/* From/To locations */}
                    {(step.from || step.to) && (
                      <div className="mt-1 text-xs text-gray-400">
                        {step.from && <span>From: {step.from}</span>}
                        {step.from && step.to && <span> → </span>}
                        {step.to && <span>To: {step.to}</span>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Info */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
            <Phone className="h-4 w-4" />
            Food Bank Contact
          </h4>
          <p className="text-xs text-gray-700 mb-1">{nearestBank.name}</p>
          <a
            href={`tel:${nearestBank.phone}`}
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            {nearestBank.phone}
          </a>
        </div>

        {/* Total Summary */}
        <div className="bg-gray-100 rounded-lg p-3 flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Total Journey</span>
          <div className="text-right">
            <p className="font-bold text-lg text-green-600">{directions.summary}</p>
            <p className="text-xs text-gray-500">Estimated time</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
