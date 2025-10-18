'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Clock, Phone, Globe, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BottomNav } from '@/components/shared/BottomNav';
import { useUser } from '@/store/authStore';
import foodBanksData from '@/data/foodBanks.json';
import farmersMarketsData from '@/data/farmersMarkets.json';

type Tab = 'food-banks' | 'farmers-markets';

export default function ResourcesPage() {
  const router = useRouter();
  const user = useUser();
  const [activeTab, setActiveTab] = useState<Tab>('food-banks');

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  const getDayName = (date: Date = new Date()): string => {
    return date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  };

  const currentDay = getDayName();

  return (
    <div className="min-h-screen bg-background pb-bottom-nav">
      {/* Header */}
      <div className="bg-card border-b border-border safe-top sticky top-0 z-10">
        <div className="container mx-auto max-w-screen-xl p-4">
          <h1 className="text-2xl font-bold mb-1">Food Resources</h1>
          <p className="text-sm text-muted-foreground">
            Find food banks and farmers markets in Halifax
          </p>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            <Button
              variant={activeTab === 'food-banks' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('food-banks')}
              className="flex-1"
            >
              Food Banks ({foodBanksData.length})
            </Button>
            <Button
              variant={activeTab === 'farmers-markets' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('farmers-markets')}
              className="flex-1"
            >
              Markets ({farmersMarketsData.length})
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-screen-xl p-4 space-y-4">
        {activeTab === 'food-banks' && (
          <>
            <div className="text-sm text-muted-foreground mb-4">
              {foodBanksData.length} food banks found in Halifax area
            </div>

            {foodBanksData.map((bank: any) => {
              const todayHours = (bank.hours as any)[currentDay] || 'Closed';
              const isOpen = todayHours !== 'Closed';

              return (
                <Card key={bank.id} className="hover:border-primary transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{bank.name}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={isOpen ? 'default' : 'secondary'} className="text-xs">
                            {isOpen ? `Open: ${todayHours}` : 'Closed today'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{bank.address}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <a
                          href={`tel:${bank.phone}`}
                          className="text-primary hover:underline"
                        >
                          {bank.phone}
                        </a>
                      </div>

                      {bank.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <a
                            href={bank.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Visit website
                          </a>
                        </div>
                      )}

                      {bank.requirements && (
                        <div className="p-2 bg-muted rounded text-xs mt-2">
                          <span className="font-medium">Requirements:</span> {bank.requirements}
                        </div>
                      )}

                      {bank.specialPrograms && bank.specialPrograms.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {bank.specialPrograms.map((program: string) => (
                            <Badge key={program} variant="outline" className="text-xs">
                              {program}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        asChild
                      >
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                            bank.address
                          )}&travelmode=transit`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MapPin className="h-4 w-4 mr-2" />
                          Get Directions
                        </a>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        asChild
                      >
                        <a href={`tel:${bank.phone}`}>
                          <Phone className="h-4 w-4 mr-2" />
                          Call
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </>
        )}

        {activeTab === 'farmers-markets' && (
          <>
            <div className="text-sm text-muted-foreground mb-4">
              {farmersMarketsData.length} farmers markets found
            </div>

            {farmersMarketsData.map((market: any) => {
              const todaySchedule = (market.schedule as any)[currentDay];
              const isOpenToday = !!todaySchedule;

              return (
                <Card key={market.id} className="hover:border-primary transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{market.name}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant={isOpenToday ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {isOpenToday ? `Open: ${todaySchedule}` : 'Closed today'}
                          </Badge>
                          {market.seasonal && (
                            <Badge variant="outline" className="text-xs">
                              Seasonal: {market.months}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{market.address}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <a
                          href={`tel:${market.phone}`}
                          className="text-primary hover:underline"
                        >
                          {market.phone}
                        </a>
                      </div>

                      {market.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <a
                            href={market.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Visit website
                          </a>
                        </div>
                      )}

                      {market.vendors && (
                        <div className="p-2 bg-muted rounded text-xs mt-2">
                          {market.vendors}
                        </div>
                      )}

                      {/* Weekly Schedule */}
                      <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                        <div className="text-xs font-medium mb-2">Weekly Schedule:</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {Object.entries(market.schedule).map(([day, time]) => (
                            <div key={day} className="flex justify-between">
                              <span className="capitalize text-muted-foreground">{day}:</span>
                              <span className="font-medium">{time as string}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Payment Methods */}
                      {market.acceptsPayment && market.acceptsPayment.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {market.acceptsPayment.map((method: string) => (
                            <Badge key={method} variant="outline" className="text-xs capitalize">
                              {method}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        asChild
                      >
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                            market.address
                          )}&travelmode=transit`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MapPin className="h-4 w-4 mr-2" />
                          Get Directions
                        </a>
                      </Button>
                      {market.website && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          asChild
                        >
                          <a
                            href={market.website}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Globe className="h-4 w-4 mr-2" />
                            Website
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </>
        )}
      </div>

      <BottomNav userType={user.type} />
    </div>
  );
}
