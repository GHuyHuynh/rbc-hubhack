import Link from 'next/link';
import { Heart, Users, MapPin, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="flex justify-center mb-6">
            <div className="bg-primary/10 p-4 rounded-full">
              <Heart className="h-12 w-12 text-primary" fill="currentColor" />
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Community Food Connect
          </h1>

          <p className="text-xl text-muted-foreground mb-8">
            Connecting neighbors in need with Community Heroes who deliver food
            from local food banks and farmers markets across Halifax.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg h-14">
              <Link href="/auth/register">Get Started</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-lg h-14"
            >
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="bg-secondary/10 p-3 rounded-full mb-4">
                  <Users className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  Become a Community Hero
                </h3>
                <p className="text-muted-foreground text-sm">
                  Volunteer to pick up and deliver food to those in need. Earn
                  points, badges, and rewards!
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="bg-primary/10 p-3 rounded-full mb-4">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  Request Food Assistance
                </h3>
                <p className="text-muted-foreground text-sm">
                  Easily request food delivery from local food banks and markets
                  with just a few taps.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="bg-accent/10 p-3 rounded-full mb-4">
                  <Trophy className="h-8 w-8 text-accent" />
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  Earn Rewards
                </h3>
                <p className="text-muted-foreground text-sm">
                  Community Heroes earn points for every delivery and unlock
                  coupons from local businesses.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="bg-card border border-border rounded-2xl p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            Making a Difference in Halifax
          </h2>
          <div className="grid grid-cols-3 gap-4 md:gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                50+
              </div>
              <div className="text-sm text-muted-foreground">
                Community Heroes
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-secondary mb-2">
                200+
              </div>
              <div className="text-sm text-muted-foreground">
                Deliveries Made
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-accent mb-2">
                10+
              </div>
              <div className="text-sm text-muted-foreground">
                Partner Locations
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-20 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>Community Food Connect - Halifax & Nova Scotia</p>
          <p className="mt-2">
            Connecting communities through food assistance
          </p>
        </div>
      </footer>
    </div>
  );
}
